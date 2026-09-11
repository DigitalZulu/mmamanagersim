import type {
  Division,
  Fighter,
} from "./types"

import type {
  Matchup,
} from "./matchmakingSystem"

/*
 * ============================================================
 * EVENT SYSTEM
 * ============================================================
 *
 * Responsible for:
 *
 * - Creating MMA events
 * - Assigning matchups to events
 * - Scheduling fights
 * - Defining fight configuration
 * - Defining event type
 * - Building championship event cards
 *
 * This system does NOT own:
 *
 * - Matchmaking
 * - Fight simulation
 * - Rankings
 * - Championship ownership
 * - Contracts
 * - Fighter development
 *
 * Those systems remain separate.
 *
 * The Event System may READ championship state from
 * the Division objects, but it does not determine
 * who owns a championship.
 */

/*
 * ============================================================
 * EVENT TYPE
 * ============================================================
 */

export type EventType =
  | "Fight Night"
  | "Championship"

/*
 * ============================================================
 * FIGHT CONFIGURATION
 * ============================================================
 */

export type FightConfiguration = {
  rounds: 3 | 5
  titleFight: boolean
}

/*
 * ============================================================
 * SCHEDULED FIGHT
 * ============================================================
 */

export type ScheduledFight = {
  matchup: Matchup

  fightOrder: number

  configuration: FightConfiguration
}

/*
 * ============================================================
 * EVENT
 * ============================================================
 */

export type Event = {
  id: string

  promotionId: string

  name: string

  type: EventType

  date: string

  venue: string

  location: string

  fights: ScheduledFight[]
}

/*
 * ============================================================
 * MATCHUP KEY
 * ============================================================
 *
 * Creates a consistent key for a matchup.
 *
 * Fighter A vs Fighter B and Fighter B vs Fighter A
 * are treated as the same matchup.
 */

function getMatchupKey(
  fighterAId: string,
  fighterBId: string
): string {
  const ids = [
    fighterAId,
    fighterBId,
  ].sort()

  return `${ids[0]}::${ids[1]}`
}

/*
 * ============================================================
 * TITLE FIGHT MATCHUPS
 * ============================================================
 *
 * Reads championship state from the divisions.
 *
 * The Championship System is responsible for determining
 * championship ownership.
 *
 * The Event System simply uses that state to build a
 * championship fight.
 *
 * V1:
 *
 * Champion:
 *     division.championId
 *
 * Challenger:
 *     highest-ranked fighter who is not the champion
 *
 * Maximum:
 *     2 title fights per Championship Event
 *
 * Later this can become more sophisticated with:
 *
 * - Number one contenders
 * - Champion activity
 * - Mandatory defenses
 * - Rivalries
 * - Interim titles
 * - Vacant titles
 * - Promotion preferences
 * - Fighter availability
 */

function generateTitleFightMatchups(
  divisions: Division[],
  fighters: Fighter[],
  promotionId: string,
  maximumTitleFights: number = 2
): Matchup[] {
  const fighterLookup = new Map(
    fighters.map((fighter) => [
      fighter.id,
      fighter,
    ])
  )

  const titleFightMatchups: Matchup[] = []

  /*
   * Only divisions belonging to this promotion
   * can produce title fights for this event.
   */

  const promotionDivisions =
    divisions.filter(
      (division) =>
        division.promotionId ===
        promotionId
    )

  for (
    const division of promotionDivisions
  ) {
    if (
      titleFightMatchups.length >=
      maximumTitleFights
    ) {
      break
    }

    /*
     * The Championship System owns this value.
     */

    const championId =
      division.championId

    if (!championId) {
      continue
    }

    const champion =
      fighterLookup.get(
        championId
      )

    if (!champion) {
      continue
    }

    /*
     * Find the highest-ranked fighter
     * who is not the champion.
     *
     * This means the system still works if
     * championship ownership eventually differs
     * from ranking position #1.
     */

    const contenderId =
      division.rankings.find(
        (fighterId) =>
          fighterId !== championId
      )

    if (!contenderId) {
      continue
    }

    const contender =
      fighterLookup.get(
        contenderId
      )

    if (!contender) {
      continue
    }

    /*
     * Safety check:
     *
     * Champion and contender must actually
     * belong to the same division.
     */

    if (
      champion.weightClass !==
      division.weightClass ||
      contender.weightClass !==
      division.weightClass
    ) {
      continue
    }

    /*
     * Safety check:
     *
     * Never create a self-matchup.
     */

    if (
      championId === contenderId
    ) {
      continue
    }

    titleFightMatchups.push({
      promotionId,

      divisionId:
        division.id,

      fighterAId:
        championId,

      fighterBId:
        contenderId,
    })
  }

  return titleFightMatchups
}

/*
 * ============================================================
 * EVENT NAME GENERATION
 * ============================================================
 */

export function generateEventName(
  promotionName: string,
  eventNumber: number
): string {
  return `${promotionName} ${eventNumber}`
}

/*
 * ============================================================
 * CREATE EVENT
 * ============================================================
 */

export function createEvent(
  promotionId: string,
  promotionName: string,
  eventNumber: number,
  eventType: EventType,
  date: string,
  venue: string,
  location: string
): Event {
  return {
    id:
      `${promotionId}-event-${eventNumber}`,

    promotionId,

    name:
      generateEventName(
        promotionName,
        eventNumber
      ),

    type:
      eventType,

    date,

    venue,

    location,

    fights: [],
  }
}

/*
 * ============================================================
 * ASSIGN MATCHUPS TO EVENT
 * ============================================================
 *
 * Takes existing matchmaking results and places them
 * onto an event.
 *
 * V1:
 *
 * Fight Night:
 * - Regular matchups
 * - Last fight = Main Event
 * - Main Event = 5 rounds
 * - Other fights = 3 rounds
 *
 * Championship:
 * - Regular matchups
 * - Up to two title fights
 * - Title fights are the final two fights
 * - Final fight = Main Event
 * - Previous fight = Co-Main
 * - Title fights = 5 rounds
 *
 * Important:
 *
 * Fighters may fight again at later events.
 *
 * They simply cannot be booked twice on the
 * SAME event.
 */

export function assignMatchupsToEvent(
  event: Event,
  matchups: Matchup[],
  fighters: Fighter[],
  fightsPerEvent: number = 10,
  titleFightMatchups: Matchup[] = []
): Event {
  const fighterLookup = new Map(
    fighters.map((fighter) => [
      fighter.id,
      fighter,
    ])
  )

  const scheduledFights: ScheduledFight[] = []

  /*
   * Fighters already scheduled on THIS event.
   */

  const scheduledFighterIds =
    new Set<string>()

  /*
   * Matchups already scheduled on THIS event.
   */

  const scheduledMatchupKeys =
    new Set<string>()

  /*
   * Determine how many title fights we can
   * actually place on the event.
   */

  const validTitleFightMatchups =
    event.type === "Championship"
      ? titleFightMatchups.filter(
          (matchup) => {
            const fighterA =
              fighterLookup.get(
                matchup.fighterAId
              )

            const fighterB =
              fighterLookup.get(
                matchup.fighterBId
              )

            if (
              !fighterA ||
              !fighterB
            ) {
              return false
            }

            if (
              matchup.fighterAId ===
              matchup.fighterBId
            ) {
              return false
            }

            return true
          }
        )
      : []

  /*
   * Never allow more title fights than
   * the event can physically hold.
   */

  const selectedTitleFights =
    validTitleFightMatchups.slice(
      0,
      Math.min(
        2,
        fightsPerEvent
      )
    )

  /*
   * Reserve card slots for title fights.
   */

  const regularFightLimit =
    Math.max(
      0,
      fightsPerEvent -
        selectedTitleFights.length
    )

  /*
   * Title matchup keys are reserved so that
   * the same matchup cannot also appear as
   * a normal fight.
   */

  const titleFightKeys =
    new Set(
      selectedTitleFights.map(
        (matchup) =>
          getMatchupKey(
            matchup.fighterAId,
            matchup.fighterBId
          )
      )
    )

  /*
   * ==========================================================
   * REGULAR FIGHTS
   * ==========================================================
   *
   * Fill the available card slots with normal
   * matchmaking results.
   */

  for (
    let i = 0;
    i < matchups.length;
    i += 1
  ) {
    if (
      scheduledFights.length >=
      regularFightLimit
    ) {
      break
    }

    const matchup = matchups[i]

    const fighterA =
      fighterLookup.get(
        matchup.fighterAId
      )

    const fighterB =
      fighterLookup.get(
        matchup.fighterBId
      )

    if (!fighterA || !fighterB) {
      continue
    }

    /*
     * Prevent self-matchups.
     */

    if (
      matchup.fighterAId ===
      matchup.fighterBId
    ) {
      continue
    }

    /*
     * Prevent the same fighter from appearing
     * twice on this event.
     */

    if (
      scheduledFighterIds.has(
        matchup.fighterAId
      ) ||
      scheduledFighterIds.has(
        matchup.fighterBId
      )
    ) {
      continue
    }

    const matchupKey =
      getMatchupKey(
        matchup.fighterAId,
        matchup.fighterBId
      )

    /*
     * Do not schedule a title matchup as
     * a regular fight.
     */

    if (
      titleFightKeys.has(
        matchupKey
      )
    ) {
      continue
    }

    /*
     * Prevent duplicate matchups.
     */

    if (
      scheduledMatchupKeys.has(
        matchupKey
      )
    ) {
      continue
    }

    const fightOrder =
  scheduledFights.length + 1

const isMainEvent =
  fightOrder === fightsPerEvent

scheduledFights.push({
  matchup,

  fightOrder,

  configuration: {
    rounds: isMainEvent ? 5 : 3,

    titleFight: false,
  },
})

    scheduledFighterIds.add(
      matchup.fighterAId
    )

    scheduledFighterIds.add(
      matchup.fighterBId
    )

    scheduledMatchupKeys.add(
      matchupKey
    )
  }

  /*
   * ==========================================================
   * TITLE FIGHTS
   * ==========================================================
   *
   * Title fights are added AFTER the regular
   * fights so they occupy the final card positions.
   *
   * Therefore:
   *
   * Fight 9 → Co-Main
   * Fight 10 → Main Event
   *
   * for a normal 10-fight Championship Event.
   */

  for (
    const titleFight of selectedTitleFights
  ) {
    if (
      scheduledFights.length >=
      fightsPerEvent
    ) {
      break
    }

    const fighterA =
      fighterLookup.get(
        titleFight.fighterAId
      )

    const fighterB =
      fighterLookup.get(
        titleFight.fighterBId
      )

    if (!fighterA || !fighterB) {
      continue
    }

    /*
     * Prevent fighter double booking.
     *
     * This is especially important if two
     * divisions somehow attempt to use the
     * same fighter.
     */

    if (
      scheduledFighterIds.has(
        titleFight.fighterAId
      ) ||
      scheduledFighterIds.has(
        titleFight.fighterBId
      )
    ) {
      continue
    }

    const matchupKey =
      getMatchupKey(
        titleFight.fighterAId,
        titleFight.fighterBId
      )

    if (
      scheduledMatchupKeys.has(
        matchupKey
      )
    ) {
      continue
    }

    scheduledFights.push({
      matchup:
        titleFight,

      fightOrder:
        scheduledFights.length + 1,

      configuration: {
        rounds: 5,

        titleFight: true,
      },
    })

    scheduledFighterIds.add(
      titleFight.fighterAId
    )

    scheduledFighterIds.add(
      titleFight.fighterBId
    )

    scheduledMatchupKeys.add(
      matchupKey
    )
  }

  /*
   * ==========================================================
   * FINAL FIGHT ORDER
   * ==========================================================
   *
   * fightOrder is simply the position on the card.
   *
   * The LAST fight is the Main Event.
   *
   * The fight immediately before it is the Co-Main.
   */

  const finalFights =
    scheduledFights.map(
      (fight, index) => ({
        ...fight,

        fightOrder:
          index + 1,
      })
    )

  return {
    ...event,

    fights:
      finalFights,
  }
}

/*
 * ============================================================
 * GENERATE EVENTS
 * ============================================================
 *
 * Creates a series of events from existing matchups.
 *
 * V1:
 *
 * Each promotion receives:
 *
 * Event 1 → Fight Night
 * Event 2 → Championship
 *
 * Championship Events use the existing championship
 * state stored on the divisions.
 */

export function generateEvents(
  matchups: Matchup[],
  fighters: Fighter[],
  divisions: Division[],
  promotionNames: Record<string, string>,
  startDate: string,
  eventsPerPromotion: number = 2,
  fightsPerEvent: number = 10
): Event[] {
  const events: Event[] = []

  const matchupsByPromotion =
    new Map<string, Matchup[]>()

  /*
   * Group matchups by promotion.
   */

  for (const matchup of matchups) {
    const existing =
      matchupsByPromotion.get(
        matchup.promotionId
      ) ?? []

    existing.push(matchup)

    matchupsByPromotion.set(
      matchup.promotionId,
      existing
    )
  }

  let globalEventNumber = 1

  /*
   * Create events for each promotion.
   */

  for (const [
    promotionId,
    promotionMatchups,
  ] of matchupsByPromotion) {
    const promotionName =
      promotionNames[promotionId] ??
      "Unknown Promotion"

    /*
     * Ask the existing championship state
     * for the title-fight candidates for this
     * promotion.
     *
     * The Event System does not decide ownership.
     */

    const titleFightMatchups =
      generateTitleFightMatchups(
        divisions,
        fighters,
        promotionId,
        2
      )

    /*
     * Track which matchups have already been
     * used by previous events.
     *
     * This prevents the exact same fight from
     * appearing twice across the generated
     * schedule.
     */

    let remainingMatchups =
      [...promotionMatchups]

    /*
     * Create the requested number of events.
     */

    for (
      let eventIndex = 0;
      eventIndex < eventsPerPromotion;
      eventIndex += 1
    ) {
      const eventDate =
        new Date(startDate)

      eventDate.setDate(
        eventDate.getDate() +
          (globalEventNumber - 1) * 7
      )

      /*
       * V1 event type schedule:
       *
       * Event 1 → Fight Night
       * Event 2 → Championship
       *
       * Later this becomes a proper
       * scheduling decision.
       */

      const eventType: EventType =
        eventIndex === 1
          ? "Championship"
          : "Fight Night"

      const event =
        createEvent(
          promotionId,
          promotionName,
          eventIndex + 1,
          eventType,
          eventDate
            .toISOString()
            .split("T")[0],
          "MMA Arena",
          "Las Vegas, USA"
        )

      /*
       * Championship Events receive the
       * title-fight candidates.
       *
       * Fight Nights receive none.
       */

      const eventTitleFights =
        event.type === "Championship"
          ? titleFightMatchups
          : []

      /*
       * Prevent a Championship title matchup
       * from being used as a normal fight
       * on a Fight Night.
       *
       * This prevents:
       *
       * Fight Night:
       * Champion vs Contender
       *
       * followed by:
       *
       * Championship:
       * Champion vs Contender
       *
       * without a simulated fight between them.
       */

      const reservedTitleKeys =
        new Set(
          titleFightMatchups.map(
            (matchup) =>
              getMatchupKey(
                matchup.fighterAId,
                matchup.fighterBId
              )
          )
        )

      const availableMatchups =
        remainingMatchups.filter(
          (matchup) =>
            !reservedTitleKeys.has(
              getMatchupKey(
                matchup.fighterAId,
                matchup.fighterBId
              )
            )
        )

      /*
       * Build the event card.
       */

      const scheduledEvent =
        assignMatchupsToEvent(
          event,
          availableMatchups,
          fighters,
          fightsPerEvent,
          eventTitleFights
        )

      if (
        scheduledEvent.fights.length > 0
      ) {
        events.push(
          scheduledEvent
        )

        /*
         * Remove matchups that have now been
         * scheduled from the remaining pool.
         *
         * Fighters themselves are NOT removed,
         * because they can fight at a later event.
         */

        const scheduledKeys =
          new Set(
            scheduledEvent.fights.map(
              (fight) =>
                getMatchupKey(
                  fight.matchup.fighterAId,
                  fight.matchup.fighterBId
                )
            )
          )

        remainingMatchups =
          remainingMatchups.filter(
            (matchup) =>
              !scheduledKeys.has(
                getMatchupKey(
                  matchup.fighterAId,
                  matchup.fighterBId
                )
              )
          )
      }

      globalEventNumber += 1
    }
  }

  return events
}
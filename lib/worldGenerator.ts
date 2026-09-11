import type {
  Fighter,
  Division,
} from "./types"

import { generateFighters } from "./fighterGenerator"

import {
  aiPromotions,
  type Promotion,
} from "./promotions"

import {
  calculateDivisionRankings,
} from "./rankingSystem"

import {
  determineInitialChampion,
} from "./championshipSystem"

const INITIAL_FIGHTER_COUNT = 350

const CANDIDATE_POOL_SIZE = 1500

export type MMAWorld = {
  fighters: Fighter[]

  promotions: Promotion[]

  freeAgents: string[]

  divisions: Division[]
}

const DIVISION_TARGETS: Record<string, number> = {
  "Male-Flyweight": 30,
  "Male-Bantamweight": 32,
  "Male-Featherweight": 32,
  "Male-Lightweight": 34,
  "Male-Welterweight": 34,
  "Male-Middleweight": 30,
  "Male-Light Heavyweight": 27,
  "Male-Heavyweight": 26,

  "Female-Strawweight": 32,
  "Female-Flyweight": 27,
  "Female-Bantamweight": 30,
  "Female-Featherweight": 16,
}

export function generateWorld(): MMAWorld {
  /*
   * STEP 1
   * Generate the initial fighter pool.
   */
  const fighters = generateBalancedFighters()

  /*
   * STEP 2
   * Create fresh promotion objects.
   *
   * We keep the original promotion definitions,
   * but reset their rosters for the new world.
   */
  const promotions = aiPromotions.map(
    (promotion) => ({
      ...promotion,
      roster: [],
    })
  )

  /*
   * STEP 3
   * Free agents are stored by fighter ID.
   */
  const freeAgents: string[] = []

  /*
   * STEP 4
   * Group fighters by their natural division.
   *
   * Example:
   *
   * Male-Lightweight
   * Female-Strawweight
   */
  const divisionBuckets: Record<
    string,
    Fighter[]
  > = {}

  fighters.forEach((fighter) => {
    const divisionKey =
      fighter.gender +
      "-" +
      fighter.weightClass

    if (!divisionBuckets[divisionKey]) {
      divisionBuckets[divisionKey] = []
    }

    divisionBuckets[divisionKey].push(
      fighter
    )
  })

  /*
   * STEP 5
   * Distribute every division between
   * promotions and free agency.
   */
  Object.values(divisionBuckets).forEach(
    (divisionFighters) => {
      distributeDivision(
        divisionFighters,
        promotions,
        freeAgents
      )
    }
  )

  /*
   * STEP 6
   * Verify that every fighter has been
   * assigned exactly once.
   */
  const assignedIds = new Set<string>()

  promotions.forEach((promotion) => {
    promotion.roster.forEach(
      (fighterId) => {
        assignedIds.add(fighterId)
      }
    )
  })

  freeAgents.forEach((fighterId) => {
    assignedIds.add(fighterId)
  })

  if (
    assignedIds.size !== fighters.length
  ) {
    throw new Error(
      "World assignment error: " +
        assignedIds.size +
        " of " +
        fighters.length +
        " fighters were assigned."
    )
  }

  /*
   * STEP 7
   * Build the competitive division system
   * from the completed promotion rosters.
   */
  const divisions = generateDivisions(
    fighters,
    promotions
  )

  /*
   * STEP 8
   * Return the complete MMA world.
   */
  return {
    fighters,
    promotions,
    freeAgents,
    divisions,
  }
}

/*
 * ============================================================
 * DIVISION DISTRIBUTION
 * ============================================================
 *
 * Takes all fighters from one weight class
 * and distributes them between promotions
 * and free agency.
 */
function distributeDivision(
  divisionFighters: Fighter[],
  promotions: Promotion[],
  freeAgents: string[]
) {
  /*
   * Strongest fighters first.
   *
   * This is used only to influence which
   * promotions receive which fighters.
   *
   * It is NOT the ranking system.
   */
  const sortedFighters = [
    ...divisionFighters,
  ].sort(
    (a, b) =>
      getFighterStrength(b) -
      getFighterStrength(a)
  )

  /*
   * Approximately 12% of each division
   * begin as free agents.
   */
  const freeAgentCount = Math.max(
    1,
    Math.round(
      sortedFighters.length * 0.12
    )
  )

  /*
   * Randomize which fighters become
   * free agents.
   */
  const freeAgentCandidates = shuffle([
    ...sortedFighters,
  ])

  const freeAgentSet =
    new Set<string>()

  for (
    let i = 0;
    i < freeAgentCount;
    i++
  ) {
    freeAgentSet.add(
      freeAgentCandidates[i].id
    )
  }

  /*
   * Everyone else becomes signed
   * to a promotion.
   */
  const promotionFighters =
    sortedFighters.filter(
      (fighter) =>
        !freeAgentSet.has(fighter.id)
    )

  /*
   * Add free agents by ID.
   */
  freeAgentSet.forEach(
    (fighterId) => {
      freeAgents.push(fighterId)
    }
  )

  /*
   * Distribute signed fighters based
   * roughly on their strength.
   *
   * Stronger fighters are more likely
   * to end up in higher-tier promotions.
   */
  promotionFighters.forEach(
    (fighter, index) => {
      const position =
        index /
        promotionFighters.length

      /*
       * Top 22%
       */
      if (position < 0.22) {
        if (Math.random() < 0.85) {
          addToPromotion(
            promotions,
            0,
            fighter.id
          )
        } else {
          addToPromotion(
            promotions,
            Math.random() < 0.5
              ? 1
              : 2,
            fighter.id
          )
        }

        return
      }

      /*
       * 22% - 48%
       */
      if (position < 0.48) {
        addToPromotion(
          promotions,
          Math.random() < 0.5
            ? 1
            : 2,
          fighter.id
        )

        return
      }

      /*
       * 48% - 72%
       */
      if (position < 0.72) {
        if (Math.random() < 0.2) {
          addToPromotion(
            promotions,
            2,
            fighter.id
          )
        } else {
          addToPromotion(
            promotions,
            3,
            fighter.id
          )
        }

        return
      }

      /*
       * Bottom 28%
       */
      addToPromotion(
        promotions,
        Math.random() < 0.5
          ? 3
          : 4,
        fighter.id
      )
    }
  )
}

/*
 * ============================================================
 * DIVISION GENERATION
 * ============================================================
 *
 * Converts promotion rosters into actual
 * competitive divisions.
 *
 * Example:
 *
 * Titan MMA
 *   +
 * Fighter roster
 *   ↓
 * Titan MMA Men's Lightweight
 */
function generateDivisions(
  fighters: Fighter[],
  promotions: Promotion[]
): Division[] {
  /*
   * Create a quick fighter lookup.
   *
   * fighter ID → fighter object
   */
  const fighterLookup =
    new Map<string, Fighter>(
      fighters.map((fighter) => [
        fighter.id,
        fighter,
      ])
    )

  const divisions: Division[] = []

  /*
   * Process every promotion separately.
   */
  promotions.forEach(
    (promotion) => {
      /*
       * Convert promotion roster IDs
       * back into fighter objects.
       */
      const promotionFighters =
        promotion.roster
          .map((fighterId) =>
            fighterLookup.get(
              fighterId
            )
          )
          .filter(
            (
              fighter
            ): fighter is Fighter =>
              fighter !== undefined
          )

      /*
       * Group the promotion's fighters
       * by gender + weight class.
       */
      const divisionGroups =
        new Map<
          string,
          Fighter[]
        >()

      promotionFighters.forEach(
        (fighter) => {
          const key =
            fighter.gender +
            "-" +
            fighter.weightClass

          if (
            !divisionGroups.has(key)
          ) {
            divisionGroups.set(
              key,
              []
            )
          }

          divisionGroups
            .get(key)!
            .push(fighter)
        }
      )

      /*
       * Turn every group into an
       * actual Division object.
       */
      divisionGroups.forEach(
        (
          divisionFighters,
          divisionKey
        ) => {
          /*
           * Build the division identity.
           */
          const divisionId =
            promotion.id +
            "-" +
            divisionKey.toLowerCase()

          /*
           * Ask the ranking system to
           * calculate the initial rankings.
           */
          const rankingIds =
            calculateDivisionRankings(
              {
                id: divisionId,

                promotionId:
                  promotion.id,

                gender:
                  divisionKey.split(
                    "-"
                  )[0] as Fighter[
                    "gender"
                  ],

                weightClass:
                  divisionKey
                    .split("-")
                    .slice(1)
                    .join(
                      "-"
                    ) as Fighter[
                    "weightClass"
                  ],

                fighterIds:
                  divisionFighters.map(
                    (fighter) =>
                      fighter.id
                  ),

                championId:
                  null,

                rankings: [],
              },
              fighters
            )

          /*
           * Build the division object.
           *
           * Champion is initially null
           * because championship ownership
           * is handled by the Championship System.
           */
          const division: Division = {
            id: divisionId,

            promotionId:
              promotion.id,

            gender:
              divisionKey.split(
                "-"
              )[0] as Fighter[
                "gender"
              ],

            weightClass:
              divisionKey
                .split("-")
                .slice(1)
                .join(
                  "-"
                ) as Fighter[
                "weightClass"
              ],

            fighterIds:
              divisionFighters.map(
                (fighter) =>
                  fighter.id
              ),

            championId:
              null,

            rankings:
              rankingIds,
          }

          /*
           * Championship System determines
           * the initial champion.
           */
          division.championId =
            determineInitialChampion(
              division,
              fighters
            )

          /*
           * Add the completed division.
           */
          divisions.push(division)
        }
      )
    }
  )

  return divisions
}

/*
 * ============================================================
 * BALANCED FIGHTER GENERATION
 * ============================================================
 *
 * Generates a large candidate pool and then
 * selects the exact number of fighters
 * required for each division.
 */
function generateBalancedFighters(): Fighter[] {
  const candidates =
    generateFighters(
      CANDIDATE_POOL_SIZE
    )

  const divisionBuckets: Record<
    string,
    Fighter[]
  > = {}

  /*
   * Create an empty bucket for every
   * required division.
   */
  Object.keys(
    DIVISION_TARGETS
  ).forEach((division) => {
    divisionBuckets[
      division
    ] = []
  })

  /*
   * Put generated candidates into
   * their correct division bucket.
   */
  candidates.forEach((fighter) => {
    const divisionKey =
      fighter.gender +
      "-" +
      fighter.weightClass

    if (
      divisionBuckets[divisionKey]
    ) {
      divisionBuckets[
        divisionKey
      ].push(fighter)
    }
  })

  const selected: Fighter[] = []

  /*
   * Select the exact number required
   * for every division.
   */
  for (
    const [
      divisionKey,
      target,
    ] of Object.entries(
      DIVISION_TARGETS
    )
  ) {
    const available =
      divisionBuckets[
        divisionKey
      ]

    if (
      !available ||
      available.length < target
    ) {
      throw new Error(
        "Not enough fighters generated for " +
          divisionKey +
          ". Needed " +
          target +
          ", but only found " +
          (available?.length ??
            0) +
          "."
      )
    }

    const shuffled =
      shuffle([...available])

    selected.push(
      ...shuffled.slice(
        0,
        target
      )
    )
  }

  /*
   * Verify exact world size.
   */
  if (
    selected.length !==
    INITIAL_FIGHTER_COUNT
  ) {
    throw new Error(
      "Balanced world generated " +
        selected.length +
        " fighters instead of " +
        INITIAL_FIGHTER_COUNT +
        "."
    )
  }

  /*
   * Verify unique fighter IDs.
   */
  const ids = selected.map(
    (fighter) => fighter.id
  )

  const uniqueIds =
    new Set(ids)

  if (
    uniqueIds.size !==
    selected.length
  ) {
    throw new Error(
      "Duplicate fighter IDs detected while generating the MMA world."
    )
  }

  return selected
}

/*
 * ============================================================
 * SHUFFLE
 * ============================================================
 */
function shuffle<T>(
  items: T[]
): T[] {
  for (
    let i = items.length - 1;
    i > 0;
    i--
  ) {
    const randomIndex =
      Math.floor(
        Math.random() *
          (i + 1)
      )

    const temp =
      items[i]

    items[i] =
      items[randomIndex]

    items[randomIndex] =
      temp
  }

  return items
}

/*
 * ============================================================
 * ADD FIGHTER TO PROMOTION
 * ============================================================
 */
function addToPromotion(
  promotions: Promotion[],
  promotionIndex: number,
  fighterId: string
) {
  promotions[
    promotionIndex
  ].roster.push(
    fighterId
  )
}

/*
 * ============================================================
 * FIGHTER STRENGTH
 * ============================================================
 *
 * Used for initial world balancing
 * and promotion distribution.
 *
 * This is intentionally separate from
 * the ranking system.
 */
function getFighterStrength(
  fighter: Fighter
): number {
  const technical =
    fighter.striking +
    fighter.wrestling +
    fighter.bjj +
    fighter.takedownDefense +
    fighter.accuracy

  const physical =
    fighter.power +
    fighter.speed +
    fighter.cardio +
    fighter.chin +
    fighter.strength

  const mental =
    fighter.fightIQ +
    fighter.heart +
    fighter.aggression +
    fighter.composure

  return (
    technical +
    physical +
    mental
  ) / 14
}
import type {
  Division,
  Fighter,
} from "./types"

/*
 * ============================================================
 * MATCHMAKING SYSTEM
 * ============================================================
 *
 * Responsible for identifying potential fights.
 *
 * V1:
 *
 * - Fighters must belong to the same division
 * - Fighters must belong to the same promotion
 * - Fighters are paired according to their rankings
 * - A fighter can never be matched against themselves
 *
 * This system does NOT decide:
 *
 * - When the fight happens
 * - Whether it is a title fight
 * - Event placement
 * - Injuries
 * - Contracts
 * - Rivalries
 * - Rematches
 * - Fight outcomes
 *
 * Those systems will come later.
 */

/*
 * ============================================================
 * MATCHUP TYPE
 * ============================================================
 */

export type Matchup = {
  promotionId: string
  divisionId: string
  fighterAId: string
  fighterBId: string
}

/*
 * ============================================================
 * GENERATE DIVISION MATCHUPS
 * ============================================================
 *
 * Takes one division and creates simple matchup
 * candidates based on the current rankings.
 *
 * Example:
 *
 * #1 vs #2
 * #3 vs #4
 * #5 vs #6
 *
 * V1 INTEGRITY RULE:
 *
 * A fighter cannot fight themselves.
 *
 * If the rankings array somehow contains the same
 * fighter ID in two consecutive positions, that
 * pairing is rejected.
 */

export function generateDivisionMatchups(
  division: Division,
  fighters: Fighter[]
): Matchup[] {
  const fighterLookup = new Map(
    fighters.map((fighter) => [
      fighter.id,
      fighter,
    ])
  )

  const matchups: Matchup[] = []

  for (
    let i = 0;
    i < division.rankings.length - 1;
    i += 2
  ) {
    const fighterAId =
      division.rankings[i]

    const fighterBId =
      division.rankings[i + 1]

    /*
     * ========================================================
     * SELF-MATCH PROTECTION
     * ========================================================
     *
     * A fighter ID must never appear on both sides
     * of the same matchup.
     *
     * This protects the matchmaking system even if
     * corrupted or duplicate ranking data reaches it.
     */

    if (fighterAId === fighterBId) {
      continue
    }

    const fighterA =
      fighterLookup.get(fighterAId)

    const fighterB =
      fighterLookup.get(fighterBId)

    if (!fighterA || !fighterB) {
      continue
    }

    /*
     * Additional identity check.
     *
     * This ensures the actual fighter objects are
     * also different before creating the matchup.
     */

    if (fighterA.id === fighterB.id) {
      continue
    }

    matchups.push({
      promotionId:
        division.promotionId,

      divisionId:
        division.id,

      fighterAId,
      fighterBId,
    })
  }

  return matchups
}

/*
 * ============================================================
 * GENERATE ALL MATCHUPS
 * ============================================================
 *
 * Creates matchup candidates across every division
 * in the world.
 */

export function generateAllMatchups(
  divisions: Division[],
  fighters: Fighter[]
): Matchup[] {
  const matchups: Matchup[] = []

  for (const division of divisions) {
    const divisionMatchups =
      generateDivisionMatchups(
        division,
        fighters
      )

    matchups.push(
      ...divisionMatchups
    )
  }

  return matchups
}


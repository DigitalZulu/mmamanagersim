import type {
  Division,
  Fighter,
} from "./types"

import {
  calculateDivisionRankings,
} from "./rankingSystem"

/*
 * ============================================================
 * CHAMPIONSHIP SYSTEM
 * ============================================================
 *
 * Responsible for determining championship
 * ownership within a division.
 *
 * V1:
 *
 * The highest-ranked fighter becomes
 * the initial champion.
 *
 * This is only the starting state.
 *
 * Later this system will handle:
 *
 * - title fights
 * - title defenses
 * - title changes
 * - vacant championships
 * - stripped titles
 * - interim championships
 * - championship history
 */

/*
 * ============================================================
 * INITIAL CHAMPION
 * ============================================================
 *
 * Determines the initial champion for
 * a division.
 */
export function determineInitialChampion(
  division: Division,
  fighters: Fighter[]
): string | null {
  const rankings =
    calculateDivisionRankings(
      division,
      fighters
    )

  return rankings[0] ?? null
}

/*
 * ============================================================
 * UPDATE CHAMPIONSHIP
 * ============================================================
 *
 * Returns a new Division object with
 * the champion updated.
 *
 * We do not mutate the original division.
 */
export function assignInitialChampion(
  division: Division,
  fighters: Fighter[]
): Division {
  const rankings =
    calculateDivisionRankings(
      division,
      fighters
    )

  return {
    ...division,

    rankings,

    championId:
      rankings[0] ?? null,
  }
}
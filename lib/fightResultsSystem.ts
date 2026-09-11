import type { Fighter } from "./types"
import type { FightResult } from "./fightSimulation"

/*
 * ============================================================
 * FIGHT RESULTS SYSTEM V1
 * ============================================================
 *
 * Responsible for:
 *
 * - Applying a completed fight result
 * - Updating fighter win/loss records
 * - Returning updated fighter objects
 *
 * This system does NOT:
 *
 * - Simulate fights
 * - Change fighter ratings
 * - Change rankings
 * - Change championships
 * - Handle injuries
 * - Handle contracts
 * - Handle fatigue
 *
 * V1 has one job:
 *
 * Fight Result → Updated Fighter Records
 */

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

export type FightResultUpdate = {
  fighterA: Fighter
  fighterB: Fighter
}

/*
 * ============================================================
 * APPLY FIGHT RESULT
 * ============================================================
 *
 * Takes two fighters and a completed fight result.
 *
 * The original fighter objects are NOT modified.
 * New fighter objects are returned instead.
 */

export function applyFightResult(
  fighterA: Fighter,
  fighterB: Fighter,
  result: FightResult
): FightResultUpdate {
  /*
   * Prevent invalid self-matchups.
   */

  if (fighterA.id === fighterB.id) {
    throw new Error(
      "A fighter cannot fight themselves."
    )
  }

  /*
   * Make sure the result actually belongs
   * to these two fighters.
   */

  const validFighterIds =
    (
      result.fighterAId === fighterA.id &&
      result.fighterBId === fighterB.id
    ) ||
    (
      result.fighterAId === fighterB.id &&
      result.fighterBId === fighterA.id
    )

  if (!validFighterIds) {
    throw new Error(
      "Fight result does not match the supplied fighters."
    )
  }

  /*
   * Create copies.
   *
   * The original fighters remain unchanged.
   */

  const updatedFighterA = {
    ...fighterA,
  }

  const updatedFighterB = {
    ...fighterB,
  }

  /*
   * ==========================================================
   * FIGHTER A WINS
   * ==========================================================
   */

  if (result.winnerId === fighterA.id) {
    updatedFighterA.wins += 1
    updatedFighterB.losses += 1

    return {
      fighterA: updatedFighterA,
      fighterB: updatedFighterB,
    }
  }

  /*
   * ==========================================================
   * FIGHTER B WINS
   * ==========================================================
   */

  if (result.winnerId === fighterB.id) {
    updatedFighterB.wins += 1
    updatedFighterA.losses += 1

    return {
      fighterA: updatedFighterA,
      fighterB: updatedFighterB,
    }
  }

  /*
   * ==========================================================
   * INVALID RESULT
   * ==========================================================
   *
   * The winner must be either:
   *
   * - Fighter A
   * - Fighter B
   */

  throw new Error(
    "Fight result winner does not match either fighter."
  )
}
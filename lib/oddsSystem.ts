import type { Fighter } from "./types"

/*
 * ============================================================
 * ODDS SYSTEM V1
 * ============================================================
 *
 * Responsible for:
 *
 * - Estimating each fighter's win probability
 * - Converting probability into decimal odds
 *
 * This system does NOT:
 *
 * - Simulate the fight
 * - Decide the actual winner
 * - Modify fighter ratings
 * - Modify rankings
 * - Modify championships
 *
 * V1 intentionally uses a simple fighter-strength model.
 */

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

export type FighterOdds = {
  fighterId: string

  winProbability: number

  decimalOdds: number

  fightRating: number
}

export type FightOdds = {
  fighterA: FighterOdds
  fighterB: FighterOdds
}

/*
 * ============================================================
 * FIGHTER RATING
 * ============================================================
 *
 * Creates a single rating representing the fighter's
 * overall ability for odds purposes.
 *
 * This is NOT the fighter's overall game rating.
 *
 * It is only used by the Odds System.
 */

export function calculateFightRating(
  fighter: Fighter
): number {
  /*
   * Technical ability
   */

  const striking =
    fighter.striking * 0.15

  const wrestling =
    fighter.wrestling * 0.12

  const bjj =
    fighter.bjj * 0.10

  const takedownDefense =
    fighter.takedownDefense * 0.08

  const accuracy =
    fighter.accuracy * 0.08

  /*
   * Physical ability
   */

  const power =
    fighter.power * 0.08

  const speed =
    fighter.speed * 0.07

  const cardio =
    fighter.cardio * 0.06

  const chin =
    fighter.chin * 0.05

  const strength =
    fighter.strength * 0.05

  /*
   * Mental ability
   */

  const fightIQ =
    fighter.fightIQ * 0.08

  const heart =
    fighter.heart * 0.03

  const composure =
    fighter.composure * 0.03

  /*
   * Experience
   *
   * We deliberately keep this small.
   *
   * A fighter should not become heavily favored
   * simply because they have more fights.
   */

  const totalFights =
    fighter.wins +
    fighter.losses +
    fighter.draws

  const experience =
    Math.min(
      totalFights * 1.5,
      10
    )

  const experienceScore =
    experience * 0.02

  /*
   * Tier adjustment
   *
   * Gives the game's existing fighter tier
   * a small influence.
   */

  const tierValues: Record<
    Fighter["tier"],
    number
  > = {
    Prospect: 0,
    Regional: 2,
    Established: 4,
    Contender: 6,
    Elite: 8,
  }

  const tierScore =
    tierValues[fighter.tier] * 0.05

  /*
   * Final rating.
   */

  const rating =
    striking +
    wrestling +
    bjj +
    takedownDefense +
    accuracy +
    power +
    speed +
    cardio +
    chin +
    strength +
    fightIQ +
    heart +
    composure +
    experienceScore +
    tierScore

  return Number(
    rating.toFixed(2)
  )
}

/*
 * ============================================================
 * WIN PROBABILITY
 * ============================================================
 *
 * Converts two fighter ratings into probabilities.
 *
 * A small rating difference should create a competitive
 * fight.
 *
 * A large rating difference should create a stronger
 * favorite.
 */

export function calculateWinProbabilities(
  fighterARating: number,
  fighterBRating: number
): {
  fighterA: number
  fighterB: number
} {
  /*
   * Exponential weighting creates a natural favorite/
   * underdog relationship without making small rating
   * differences extreme.
   */

  const powerA =
    Math.exp(
      fighterARating / 20
    )

  const powerB =
    Math.exp(
      fighterBRating / 20
    )

  const total =
    powerA + powerB

  const fighterA =
    powerA / total

  const fighterB =
    powerB / total

  return {
    fighterA,
    fighterB,
  }
}

/*
 * ============================================================
 * DECIMAL ODDS
 * ============================================================
 *
 * Converts probability into decimal odds.
 *
 * Example:
 *
 * 50% → 2.00
 * 60% → 1.67
 * 40% → 2.50
 */

export function probabilityToDecimalOdds(
  probability: number
): number {
  if (
    probability <= 0 ||
    probability >= 1
  ) {
    throw new Error(
      "Probability must be between 0 and 1."
    )
  }

  return Number(
    (1 / probability).toFixed(2)
  )
}

/*
 * ============================================================
 * CALCULATE FIGHT ODDS
 * ============================================================
 *
 * Main public function.
 *
 * Takes two fighters and produces the estimated
 * betting market for the matchup.
 */

export function calculateFightOdds(
  fighterA: Fighter,
  fighterB: Fighter
): FightOdds {
  /*
   * Prevent invalid self-matchups.
   */

  if (
    fighterA.id === fighterB.id
  ) {
    throw new Error(
      "A fighter cannot fight themselves."
    )
  }

  /*
   * Calculate fighter strength.
   */

  const fighterARating =
    calculateFightRating(
      fighterA
    )

  const fighterBRating =
    calculateFightRating(
      fighterB
    )

  /*
   * Calculate probabilities.
   */

  const probabilities =
    calculateWinProbabilities(
      fighterARating,
      fighterBRating
    )

  /*
   * Convert probabilities into
   * decimal betting odds.
   */

  return {
    fighterA: {
      fighterId:
        fighterA.id,

      winProbability:
        Number(
          (
            probabilities.fighterA *
            100
          ).toFixed(1)
        ),

      decimalOdds:
        probabilityToDecimalOdds(
          probabilities.fighterA
        ),

      fightRating:
        fighterARating,
    },

    fighterB: {
      fighterId:
        fighterB.id,

      winProbability:
        Number(
          (
            probabilities.fighterB *
            100
          ).toFixed(1)
        ),

      decimalOdds:
        probabilityToDecimalOdds(
          probabilities.fighterB
        ),

      fightRating:
        fighterBRating,
    },
  }
}
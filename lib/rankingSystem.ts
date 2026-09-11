import type { Fighter, Division } from "./types"

export function calculateRankingScore(
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

export function calculateDivisionRankings(
  division: Division,
  fighters: Fighter[]
): string[] {
  const divisionFighters = fighters.filter(
    (fighter) =>
      division.fighterIds.includes(fighter.id)
  )

  const rankedFighters = [...divisionFighters].sort(
    (a, b) =>
      calculateRankingScore(b) -
      calculateRankingScore(a)
  )

  return rankedFighters.map(
    (fighter) => fighter.id
  )
}
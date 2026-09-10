import type { Fighter } from "./types"
import { generateFighters } from "./fighterGenerator"
import { aiPromotions, type Promotion } from "./promotions"

const INITIAL_FIGHTER_COUNT = 350

const CANDIDATE_POOL_SIZE = 1500

export type MMAWorld = {
  fighters: Fighter[]
  promotions: Promotion[]
  freeAgents: string[]
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
  const fighters = generateBalancedFighters()

  const promotions = aiPromotions.map((promotion) => ({
    ...promotion,
    roster: [],
  }))

  const freeAgents: string[] = []

  const divisionBuckets: Record<string, Fighter[]> = {}

  fighters.forEach((fighter) => {
    const divisionKey =
      fighter.gender + "-" + fighter.weightClass

    if (!divisionBuckets[divisionKey]) {
      divisionBuckets[divisionKey] = []
    }

    divisionBuckets[divisionKey].push(fighter)
  })

  Object.values(divisionBuckets).forEach(
    (divisionFighters) => {
      distributeDivision(
        divisionFighters,
        promotions,
        freeAgents
      )
    }
  )

  const assignedIds = new Set<string>()

  promotions.forEach((promotion) => {
    promotion.roster.forEach((fighterId) => {
      assignedIds.add(fighterId)
    })
  })

  freeAgents.forEach((fighterId) => {
    assignedIds.add(fighterId)
  })

  if (assignedIds.size !== fighters.length) {
    throw new Error(
      "World assignment error: " +
        assignedIds.size +
        " of " +
        fighters.length +
        " fighters were assigned."
    )
  }

  return {
    fighters,
    promotions,
    freeAgents,
  }
}

function distributeDivision(
  divisionFighters: Fighter[],
  promotions: Promotion[],
  freeAgents: string[]
) {
  const sortedFighters = [...divisionFighters].sort(
    (a, b) => getFighterStrength(b) - getFighterStrength(a)
  )

  const freeAgentCount = Math.max(
    1,
    Math.round(sortedFighters.length * 0.12)
  )

  const freeAgentCandidates = shuffle([
    ...sortedFighters,
  ])

  const freeAgentSet = new Set<string>()

  for (let i = 0; i < freeAgentCount; i++) {
    freeAgentSet.add(
      freeAgentCandidates[i].id
    )
  }

  const promotionFighters = sortedFighters.filter(
    (fighter) => !freeAgentSet.has(fighter.id)
  )

  freeAgentSet.forEach((fighterId) => {
    freeAgents.push(fighterId)
  })

  promotionFighters.forEach(
    (fighter, index) => {
      const position =
        index / promotionFighters.length

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
            Math.random() < 0.5 ? 1 : 2,
            fighter.id
          )
        }

        return
      }

      if (position < 0.48) {
        addToPromotion(
          promotions,
          Math.random() < 0.5 ? 1 : 2,
          fighter.id
        )

        return
      }

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

      addToPromotion(
        promotions,
        Math.random() < 0.5 ? 3 : 4,
        fighter.id
      )
    }
  )
}

function generateBalancedFighters(): Fighter[] {
  const candidates = generateFighters(
    CANDIDATE_POOL_SIZE
  )

  const divisionBuckets: Record<string, Fighter[]> = {}

  Object.keys(DIVISION_TARGETS).forEach(
    (division) => {
      divisionBuckets[division] = []
    }
  )

  candidates.forEach((fighter) => {
    const divisionKey =
      fighter.gender + "-" + fighter.weightClass

    if (divisionBuckets[divisionKey]) {
      divisionBuckets[divisionKey].push(fighter)
    }
  })

  const selected: Fighter[] = []

  for (const [divisionKey, target] of Object.entries(
    DIVISION_TARGETS
  )) {
    const available = divisionBuckets[divisionKey]

    if (!available || available.length < target) {
      throw new Error(
        "Not enough fighters generated for " +
          divisionKey +
          ". Needed " +
          target +
          ", but only found " +
          (available?.length ?? 0) +
          "."
      )
    }

    const shuffled = shuffle([...available])

    selected.push(
      ...shuffled.slice(0, target)
    )
  }

  if (
    selected.length !== INITIAL_FIGHTER_COUNT
  ) {
    throw new Error(
      "Balanced world generated " +
        selected.length +
        " fighters instead of " +
        INITIAL_FIGHTER_COUNT +
        "."
    )
  }

  const ids = selected.map(
    (fighter) => fighter.id
  )

  const uniqueIds = new Set(ids)

  if (uniqueIds.size !== selected.length) {
    throw new Error(
      "Duplicate fighter IDs detected while generating the MMA world."
    )
  }

  return selected
}

function shuffle<T>(items: T[]): T[] {
  for (
    let i = items.length - 1;
    i > 0;
    i--
  ) {
    const randomIndex = Math.floor(
      Math.random() * (i + 1)
    )

    const temp = items[i]
    items[i] = items[randomIndex]
    items[randomIndex] = temp
  }

  return items
}

function addToPromotion(
  promotions: Promotion[],
  promotionIndex: number,
  fighterId: string
) {
  promotions[promotionIndex].roster.push(
    fighterId
  )
}

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
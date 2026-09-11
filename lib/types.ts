export type MaleWeightClass =
  | "Flyweight"
  | "Bantamweight"
  | "Featherweight"
  | "Lightweight"
  | "Welterweight"
  | "Middleweight"
  | "Light Heavyweight"
  | "Heavyweight"

export type FemaleWeightClass =
  | "Strawweight"
  | "Flyweight"
  | "Bantamweight"
  | "Featherweight"

export type Gender =
  | "Male"
  | "Female"

export type Stance =
  | "Orthodox"
  | "Southpaw"

export type FighterStyle =
  | "Boxer"
  | "Kickboxer"
  | "Wrestler"
  | "BJJ Specialist"
  | "Pressure Fighter"
  | "Counter Striker"
  | "Balanced"

export type FighterTier =
  | "Prospect"
  | "Regional"
  | "Established"
  | "Contender"
  | "Elite"

export type Fighter = {
  id: string

  firstName: string
  lastName: string
  nickname?: string

  nationality: string

  gender: Gender

  weightClass:
    | MaleWeightClass
    | FemaleWeightClass

  age: number
  height: number
  reach: number

  stance: Stance
  style: FighterStyle
  tier: FighterTier

  striking: number
  wrestling: number
  bjj: number
  takedownDefense: number
  accuracy: number

  power: number
  speed: number
  cardio: number
  chin: number
  strength: number

  fightIQ: number
  heart: number
  aggression: number
  composure: number

  potential: number

  wins: number
  losses: number
  draws: number

  popularity: number

  personality: string[]
}

export type Division = {
  id: string

  promotionId: string

  gender: Gender

  weightClass:
    | MaleWeightClass
    | FemaleWeightClass

  fighterIds: string[]

  championId: string | null

  rankings: string[]
}
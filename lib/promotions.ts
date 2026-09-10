export type PromotionTier =
  | "Regional"
  | "National"
  | "Major"
  | "Elite"

export type PromotionStyle =
  | "Star Driven"
  | "Prospect Focused"
  | "Sporting"
  | "Entertainment"
  | "Regional"

export type Promotion = {
  id: string
  name: string

  tier: PromotionTier
  style: PromotionStyle

  reputation: number
  popularity: number
  cash: number

  roster: string[]

  championCount: number
}
export const aiPromotions: Promotion[] = [
  {
    id: "titan-mma",
    name: "Titan MMA",

    tier: "Elite",
    style: "Star Driven",

    reputation: 94,
    popularity: 96,
    cash: 5000000,

    roster: [],

    championCount: 4,
  },

  {
    id: "apex-combat",
    name: "Apex Combat",

    tier: "Major",
    style: "Entertainment",

    reputation: 82,
    popularity: 84,
    cash: 2500000,

    roster: [],

    championCount: 3,
  },

  {
    id: "warrior-fc",
    name: "Warrior FC",

    tier: "Major",
    style: "Sporting",

    reputation: 76,
    popularity: 72,
    cash: 1800000,

    roster: [],

    championCount: 2,
  },

  {
    id: "rising-combat",
    name: "Rising Combat",

    tier: "National",
    style: "Prospect Focused",

    reputation: 61,
    popularity: 58,
    cash: 750000,

    roster: [],

    championCount: 2,
  },

  {
    id: "pacific-fight-league",
    name: "Pacific Fight League",

    tier: "National",
    style: "Regional",

    reputation: 55,
    popularity: 52,
    cash: 600000,

    roster: [],

    championCount: 1,
  },
]
import type {
  Fighter,
  FighterStyle,
  FighterTier,
  FemaleWeightClass,
  Gender,
  MaleWeightClass,
} from "./types"

type Archetype =
  | "Phenomenal Prospect"
  | "Veteran Gatekeeper"
  | "Late Bloomer"
  | "Aging Elite"
  | "Dangerous Specialist"
  | "Grappling Specialist"
  | "Striking Specialist"
  | "Well Rounded"
  | "Rising Contender"
  | "Journeyman"

type ArchetypeConfig = {
  preferredTiers: FighterTier[]
  ageRange: [number, number]
  potentialRange: [number, number]
  totalFightsRange: [number, number]
  winRateRange: [number, number]
}

type StyleProfile = {
  primary: Array<keyof Fighter>
  secondary: Array<keyof Fighter>
  weaknesses: Array<keyof Fighter>
}

const maleWeightClasses: MaleWeightClass[] = [
  "Flyweight",
  "Bantamweight",
  "Featherweight",
  "Lightweight",
  "Welterweight",
  "Middleweight",
  "Light Heavyweight",
  "Heavyweight",
]

const femaleWeightClasses: FemaleWeightClass[] = [
  "Strawweight",
  "Flyweight",
  "Bantamweight",
  "Featherweight",
]

const styles: FighterStyle[] = [
  "Boxer",
  "Kickboxer",
  "Wrestler",
  "BJJ Specialist",
  "Pressure Fighter",
  "Counter Striker",
  "Balanced",
]

const personalities = [
  "Ambitious",
  "Loyal",
  "Money-focused",
  "Quiet",
  "Confident",
  "Hot-headed",
  "Professional",
  "Trash-talker",
  "Competitive",
  "Jealous",
  "Unpredictable",
  "Disciplined",
  "Patient",
  "Proud",
]

/* -------------------------------------------------------------------------- */
/* NATIONALITY NAME POOLS                                                     */
/* -------------------------------------------------------------------------- */

const namesByNationality: Record<
  string,
  {
    male: [string, string][]
    female: [string, string][]
  }
> = {
  China: {
    male: [
      ["Wei", "Zhang"],
      ["Jun", "Li"],
      ["Hao", "Wang"],
      ["Ming", "Chen"],
      ["Lei", "Liu"],
      ["Bo", "Yang"],
      ["Tao", "Huang"],
      ["Jian", "Wu"],
    ],
    female: [
      ["Mei", "Zhang"],
      ["Lin", "Wang"],
      ["Xia", "Chen"],
      ["Jing", "Liu"],
      ["Yue", "Li"],
      ["Na", "Yang"],
      ["Fang", "Wu"],
      ["Hui", "Zhou"],
    ],
  },

  Japan: {
    male: [
      ["Haruto", "Sato"],
      ["Kaito", "Tanaka"],
      ["Ren", "Yamamoto"],
      ["Daiki", "Suzuki"],
      ["Takumi", "Nakamura"],
      ["Riku", "Watanabe"],
      ["Yuto", "Kobayashi"],
    ],
    female: [
      ["Aoi", "Sato"],
      ["Yui", "Tanaka"],
      ["Hana", "Yamamoto"],
      ["Mio", "Suzuki"],
      ["Rina", "Nakamura"],
      ["Akari", "Watanabe"],
      ["Sakura", "Kobayashi"],
    ],
  },

  Brazil: {
    male: [
      ["Mateus", "Silva"],
      ["Lucas", "Santos"],
      ["Rafael", "Oliveira"],
      ["Thiago", "Souza"],
      ["Gabriel", "Costa"],
      ["Bruno", "Almeida"],
      ["Caio", "Ferreira"],
    ],
    female: [
      ["Mariana", "Silva"],
      ["Larissa", "Santos"],
      ["Camila", "Oliveira"],
      ["Beatriz", "Souza"],
      ["Gabriela", "Costa"],
      ["Isabela", "Almeida"],
      ["Julia", "Ferreira"],
    ],
  },

  Mexico: {
    male: [
      ["Diego", "Garcia"],
      ["Carlos", "Hernandez"],
      ["Miguel", "Lopez"],
      ["Alejandro", "Martinez"],
      ["Luis", "Gonzalez"],
      ["Javier", "Ramirez"],
      ["Mateo", "Torres"],
    ],
    female: [
      ["Sofia", "Garcia"],
      ["Valeria", "Hernandez"],
      ["Camila", "Lopez"],
      ["Fernanda", "Martinez"],
      ["Daniela", "Gonzalez"],
      ["Natalia", "Ramirez"],
      ["Mariana", "Torres"],
    ],
  },

  "South Korea": {
    male: [
      ["Min-Jun", "Kim"],
      ["Ji-Hoon", "Lee"],
      ["Hyun-Woo", "Park"],
      ["Joon-Ho", "Choi"],
      ["Dong-Hyun", "Jung"],
      ["Seung-Min", "Kang"],
    ],
    female: [
      ["Seo-Yeon", "Kim"],
      ["Ji-Woo", "Lee"],
      ["Min-Seo", "Park"],
      ["Ha-Eun", "Choi"],
      ["Ye-Jin", "Jung"],
      ["Soo-Min", "Kang"],
    ],
  },

  Thailand: {
    male: [
      ["Nattapong", "Srisuk"],
      ["Preecha", "Somsak"],
      ["Wichai", "Rattanakul"],
      ["Thanawat", "Kittisak"],
      ["Anurak", "Chaiyasit"],
      ["Krit", "Sukjai"],
    ],
    female: [
      ["Siriporn", "Srisuk"],
      ["Nok", "Somsak"],
      ["Malee", "Rattanakul"],
      ["Pim", "Kittisak"],
      ["Suda", "Chaiyasit"],
      ["Kanya", "Sukjai"],
    ],
  },

  Philippines: {
    male: [
      ["Miguel", "Santos"],
      ["Jose", "Reyes"],
      ["Carlo", "Garcia"],
      ["Angelo", "Cruz"],
      ["Ramon", "Dela Cruz"],
      ["Paolo", "Mendoza"],
    ],
    female: [
      ["Maria", "Santos"],
      ["Angela", "Reyes"],
      ["Sofia", "Mendoza"],
      ["Andrea", "Garcia"],
      ["Nicole", "Cruz"],
      ["Isabel", "Dela Cruz"],
    ],
  },

  "South Africa": {
    male: [
      ["Liam", "Mokoena"],
      ["Thabo", "Nkosi"],
      ["Siyabonga", "Dlamini"],
      ["Kagiso", "Molefe"],
      ["Aiden", "Jacobs"],
      ["Sipho", "Mthembu"],
    ],
    female: [
      ["Amahle", "Mokoena"],
      ["Thandi", "Nkosi"],
      ["Nandi", "Dlamini"],
      ["Lerato", "Molefe"],
      ["Zoe", "Jacobs"],
      ["Ayanda", "Mthembu"],
    ],
  },

  Nigeria: {
    male: [
      ["Chinedu", "Okafor"],
      ["Emeka", "Nwosu"],
      ["Ibrahim", "Musa"],
      ["Tunde", "Adeyemi"],
      ["Kelechi", "Eze"],
      ["Obinna", "Okoro"],
    ],
    female: [
      ["Amara", "Okafor"],
      ["Chiamaka", "Nwosu"],
      ["Aisha", "Musa"],
      ["Ada", "Eze"],
      ["Ngozi", "Okoro"],
      ["Ifeoma", "Adeyemi"],
    ],
  },

  Ghana: {
    male: [
      ["Kwame", "Mensah"],
      ["Kofi", "Owusu"],
      ["Yaw", "Asante"],
      ["Kojo", "Boateng"],
      ["Daniel", "Amoah"],
      ["Samuel", "Addo"],
    ],
    female: [
      ["Ama", "Mensah"],
      ["Akosua", "Owusu"],
      ["Abena", "Asante"],
      ["Adwoa", "Boateng"],
      ["Efua", "Amoah"],
      ["Yaa", "Addo"],
    ],
  },

  Senegal: {
    male: [
      ["Mamadou", "Diop"],
      ["Ibrahima", "Ndiaye"],
      ["Ousmane", "Fall"],
      ["Cheikh", "Ba"],
      ["Abdoulaye", "Sow"],
      ["Moussa", "Gueye"],
    ],
    female: [
      ["Awa", "Diop"],
      ["Fatou", "Ndiaye"],
      ["Mariama", "Fall"],
      ["Ndeye", "Ba"],
      ["Aminata", "Sow"],
      ["Coumba", "Gueye"],
    ],
  },

  France: {
    male: [
      ["Lucas", "Martin"],
      ["Hugo", "Bernard"],
      ["Antoine", "Dubois"],
      ["Louis", "Moreau"],
      ["Julien", "Laurent"],
      ["Mathis", "Simon"],
    ],
    female: [
      ["Emma", "Martin"],
      ["Chloe", "Bernard"],
      ["Lea", "Dubois"],
      ["Camille", "Moreau"],
      ["Manon", "Laurent"],
      ["Amelie", "Simon"],
    ],
  },

  "United Kingdom": {
    male: [
      ["Jack", "Williams"],
      ["Oliver", "Smith"],
      ["Harry", "Taylor"],
      ["George", "Brown"],
      ["Charlie", "Wilson"],
      ["Liam", "Davies"],
    ],
    female: [
      ["Amelia", "Williams"],
      ["Olivia", "Smith"],
      ["Isla", "Taylor"],
      ["Emily", "Brown"],
      ["Sophie", "Wilson"],
      ["Grace", "Davies"],
    ],
  },

  Ireland: {
    male: [
      ["Conor", "Murphy"],
      ["Cian", "Kelly"],
      ["Sean", "Byrne"],
      ["Liam", "Doyle"],
      ["Oisin", "Ryan"],
      ["Darragh", "O'Brien"],
    ],
    female: [
      ["Aoife", "Murphy"],
      ["Saoirse", "Kelly"],
      ["Niamh", "Byrne"],
      ["Ciara", "Doyle"],
      ["Clodagh", "Ryan"],
      ["Orla", "O'Brien"],
    ],
  },

  USA: {
    male: [
      ["Marcus", "Johnson"],
      ["Ryan", "Miller"],
      ["Jason", "Williams"],
      ["Derek", "Brown"],
      ["Tyler", "Davis"],
      ["Ethan", "Wilson"],
    ],
    female: [
      ["Madison", "Johnson"],
      ["Taylor", "Miller"],
      ["Jessica", "Williams"],
      ["Avery", "Brown"],
      ["Chloe", "Davis"],
      ["Mia", "Wilson"],
    ],
  },

  Canada: {
    male: [
      ["Liam", "Thompson"],
      ["Noah", "Martin"],
      ["Evan", "Campbell"],
      ["Logan", "MacDonald"],
      ["Ryan", "Anderson"],
      ["Cole", "Mitchell"],
    ],
    female: [
      ["Emma", "Thompson"],
      ["Olivia", "Martin"],
      ["Chloe", "Campbell"],
      ["Maya", "MacDonald"],
      ["Ava", "Anderson"],
      ["Sophie", "Mitchell"],
    ],
  },

  Russia: {
    male: [
      ["Dmitri", "Volkov"],
      ["Ivan", "Petrov"],
      ["Alexei", "Sokolov"],
      ["Nikolai", "Morozov"],
      ["Viktor", "Kuznetsov"],
      ["Sergei", "Orlov"],
    ],
    female: [
      ["Anastasia", "Volkova"],
      ["Irina", "Petrova"],
      ["Elena", "Sokolova"],
      ["Nadia", "Morozova"],
      ["Katya", "Kuznetsova"],
      ["Sofia", "Orlova"],
    ],
  },
}

const nationalities = Object.keys(namesByNationality)

/* -------------------------------------------------------------------------- */
/* ARCHETYPES                                                                  */
/* -------------------------------------------------------------------------- */

const archetypeConfigs: Record<Archetype, ArchetypeConfig> = {
  "Phenomenal Prospect": {
    preferredTiers: ["Prospect", "Regional"],
    ageRange: [20, 24],
    potentialRange: [90, 99],
    totalFightsRange: [4, 12],
    winRateRange: [0.72, 0.92],
  },

  "Veteran Gatekeeper": {
    preferredTiers: ["Regional", "Established"],
    ageRange: [32, 38],
    potentialRange: [40, 58],
    totalFightsRange: [25, 45],
    winRateRange: [0.45, 0.65],
  },

  "Late Bloomer": {
    preferredTiers: ["Established", "Contender"],
    ageRange: [27, 32],
    potentialRange: [82, 94],
    totalFightsRange: [12, 22],
    winRateRange: [0.55, 0.75],
  },

  "Aging Elite": {
    preferredTiers: ["Elite", "Contender"],
    ageRange: [34, 40],
    potentialRange: [45, 70],
    totalFightsRange: [25, 40],
    winRateRange: [0.75, 0.9],
  },

  "Dangerous Specialist": {
    preferredTiers: ["Regional", "Established", "Contender"],
    ageRange: [23, 32],
    potentialRange: [55, 92],
    totalFightsRange: [8, 20],
    winRateRange: [0.6, 0.8],
  },

  "Grappling Specialist": {
    preferredTiers: ["Regional", "Established", "Contender"],
    ageRange: [22, 31],
    potentialRange: [55, 90],
    totalFightsRange: [8, 22],
    winRateRange: [0.58, 0.8],
  },

  "Striking Specialist": {
    preferredTiers: ["Regional", "Established", "Contender"],
    ageRange: [22, 31],
    potentialRange: [55, 90],
    totalFightsRange: [8, 22],
    winRateRange: [0.58, 0.8],
  },

  "Well Rounded": {
    preferredTiers: ["Established", "Contender"],
    ageRange: [24, 32],
    potentialRange: [55, 90],
    totalFightsRange: [10, 25],
    winRateRange: [0.6, 0.82],
  },

  "Rising Contender": {
    preferredTiers: ["Established", "Contender"],
    ageRange: [23, 29],
    potentialRange: [65, 94],
    totalFightsRange: [12, 24],
    winRateRange: [0.65, 0.85],
  },

  Journeyman: {
    preferredTiers: ["Regional", "Established"],
    ageRange: [25, 35],
    potentialRange: [40, 70],
    totalFightsRange: [12, 30],
    winRateRange: [0.4, 0.6],
  },
}

const archetypes: Archetype[] = [
  "Phenomenal Prospect",
  "Veteran Gatekeeper",
  "Late Bloomer",
  "Aging Elite",
  "Dangerous Specialist",
  "Grappling Specialist",
  "Striking Specialist",
  "Well Rounded",
  "Rising Contender",
  "Journeyman",
]

/* -------------------------------------------------------------------------- */
/* WEIGHT CLASS PHYSICAL RANGES                                                */
/* -------------------------------------------------------------------------- */

const malePhysicalRanges: Record<
  MaleWeightClass,
  {
    height: [number, number]
    reach: [number, number]
  }
> = {
  Flyweight: {
    height: [160, 173],
    reach: [163, 177],
  },
  Bantamweight: {
    height: [163, 178],
    reach: [166, 182],
  },
  Featherweight: {
    height: [165, 181],
    reach: [168, 185],
  },
  Lightweight: {
    height: [168, 183],
    reach: [171, 188],
  },
  Welterweight: {
    height: [173, 188],
    reach: [176, 193],
  },
  Middleweight: {
    height: [178, 193],
    reach: [181, 198],
  },
  "Light Heavyweight": {
    height: [183, 198],
    reach: [186, 203],
  },
  Heavyweight: {
    height: [188, 203],
    reach: [191, 208],
  },
}

const femalePhysicalRanges: Record<
  FemaleWeightClass,
  {
    height: [number, number]
    reach: [number, number]
  }
> = {
  Strawweight: {
    height: [150, 165],
    reach: [153, 168],
  },
  Flyweight: {
    height: [155, 170],
    reach: [158, 174],
  },
  Bantamweight: {
    height: [158, 175],
    reach: [161, 179],
  },
  Featherweight: {
    height: [163, 180],
    reach: [166, 184],
  },
}

/* -------------------------------------------------------------------------- */
/* STYLE PROFILES                                                              */
/* -------------------------------------------------------------------------- */

const styleProfiles: Record<FighterStyle, StyleProfile> = {
  Boxer: {
    primary: ["striking", "accuracy", "power"],
    secondary: ["chin", "composure", "fightIQ"],
    weaknesses: ["wrestling", "bjj"],
  },

  Kickboxer: {
    primary: ["striking", "accuracy", "speed"],
    secondary: ["power", "cardio", "composure"],
    weaknesses: ["wrestling", "takedownDefense"],
  },

  Wrestler: {
    primary: ["wrestling", "takedownDefense", "strength"],
    secondary: ["cardio", "aggression", "heart"],
    weaknesses: ["accuracy", "speed"],
  },

  "BJJ Specialist": {
    primary: ["bjj", "wrestling", "composure"],
    secondary: ["fightIQ", "cardio", "heart"],
    weaknesses: ["power", "accuracy"],
  },

  "Pressure Fighter": {
    primary: ["aggression", "cardio", "heart"],
    secondary: ["power", "strength", "chin"],
    weaknesses: ["composure", "accuracy"],
  },

  "Counter Striker": {
    primary: ["accuracy", "fightIQ", "composure"],
    secondary: ["speed", "striking", "chin"],
    weaknesses: ["aggression", "wrestling"],
  },

  Balanced: {
    primary: [],
    secondary: [],
    weaknesses: [],
  },
}

/* -------------------------------------------------------------------------- */
/* STYLE ATTRIBUTE FLOORS                                                     */
/* -------------------------------------------------------------------------- */

const styleFloors: Record<
  FighterStyle,
  Partial<Record<keyof Fighter, number>>
> = {
  Boxer: {
    striking: 70,
    accuracy: 68,
  },

  Kickboxer: {
    striking: 72,
    accuracy: 68,
    speed: 68,
  },

  Wrestler: {
    wrestling: 70,
    takedownDefense: 66,
    strength: 65,
  },

  "BJJ Specialist": {
    bjj: 72,
    wrestling: 65,
    composure: 66,
  },

  "Pressure Fighter": {
    aggression: 70,
    cardio: 68,
    heart: 66,
  },

  "Counter Striker": {
    accuracy: 70,
    fightIQ: 66,
    composure: 66,
  },

  Balanced: {},
}

/* -------------------------------------------------------------------------- */
/* NICKNAMES                                                                   */
/* -------------------------------------------------------------------------- */

const nicknames = [
  "The Hammer",
  "The Machine",
  "The Predator",
  "The Assassin",
  "The Wolf",
  "The Bull",
  "The Phantom",
  "The Surgeon",
  "The Reaper",
  "The Problem",
  "The Pitbull",
  "The Sniper",
  "The Tank",
  "The Technician",
  "The Storm",
  "The Cobra",
  "The Lion",
  "The Ghost",
]

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                     */
/* -------------------------------------------------------------------------- */

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function chance(probability: number): boolean {
  return Math.random() < probability
}

function clamp(value: number, min = 1, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce(
    (sum, weight) => sum + weight,
    0,
  )

  let roll = Math.random() * total

  for (let i = 0; i < items.length; i++) {
    roll -= weights[i]

    if (roll <= 0) {
      return items[i]
    }
  }

  return items[items.length - 1]
}

/* -------------------------------------------------------------------------- */
/* ARCHETYPE SELECTION                                                         */
/* -------------------------------------------------------------------------- */

function generateArchetype(): Archetype {
  return weightedPick(
    archetypes,
    [
      10, // Phenomenal Prospect
      9,  // Veteran Gatekeeper
      8,  // Late Bloomer
      7,  // Aging Elite
      10, // Dangerous Specialist
      10, // Grappling Specialist
      10, // Striking Specialist
      14, // Well Rounded
      12, // Rising Contender
      10, // Journeyman
    ],
  )
}

/* -------------------------------------------------------------------------- */
/* TIER                                                                         */
/* -------------------------------------------------------------------------- */

function generateTier(archetype: Archetype): FighterTier {
  const config = archetypeConfigs[archetype]

  /*
   * 80% of fighters follow their archetype's natural career stage.
   * 20% are allowed to become unusual cases.
   */
  if (chance(0.8)) {
    return pick(config.preferredTiers)
  }

  return pick([
    "Prospect",
    "Regional",
    "Established",
    "Contender",
    "Elite",
  ])
}

/* -------------------------------------------------------------------------- */
/* AGE                                                                          */
/* -------------------------------------------------------------------------- */

function generateAge(archetype: Archetype): number {
  const config = archetypeConfigs[archetype]

  return randomInt(
    config.ageRange[0],
    config.ageRange[1],
  )
}

/* -------------------------------------------------------------------------- */
/* POTENTIAL                                                                    */
/* -------------------------------------------------------------------------- */

function generatePotential(archetype: Archetype): number {
  const config = archetypeConfigs[archetype]

  return randomInt(
    config.potentialRange[0],
    config.potentialRange[1],
  )
}

/* -------------------------------------------------------------------------- */
/* RECORD                                                                       */
/* -------------------------------------------------------------------------- */

function generateRecord(
  archetype: Archetype,
  age: number,
  tier: FighterTier,
): {
  wins: number
  losses: number
  draws: number
} {
  const config = archetypeConfigs[archetype]

  let totalFights = randomInt(
    config.totalFightsRange[0],
    config.totalFightsRange[1],
  )

  /* Young fighters should have shorter careers. */
  if (age <= 21) {
    totalFights = Math.min(
      totalFights,
      randomInt(3, 8),
    )
  } else if (age <= 24) {
    totalFights = Math.min(
      totalFights,
      randomInt(5, 13),
    )
  }

  /* Tier-based career expectations. */
  if (tier === "Prospect") {
    totalFights = Math.min(
      totalFights,
      randomInt(3, 12),
    )
  }

  if (tier === "Regional") {
    totalFights = Math.max(
      totalFights,
      randomInt(5, 12),
    )
  }

  if (tier === "Established") {
    totalFights = Math.max(
      totalFights,
      randomInt(10, 18),
    )
  }

  if (tier === "Contender") {
    totalFights = Math.max(
      totalFights,
      randomInt(14, 22),
    )
  }

  if (tier === "Elite") {
    totalFights = Math.max(
      totalFights,
      randomInt(20, 28),
    )
  }

  const winRate = randomFloat(
    config.winRateRange[0],
    config.winRateRange[1],
  )

  let wins = Math.round(
    totalFights * winRate,
  )

  let losses = totalFights - wins

  let draws = chance(0.06) ? 1 : 0

  if (draws > 0 && totalFights > 2) {
    totalFights -= draws

    wins = Math.min(
      wins,
      totalFights,
    )

    losses = totalFights - wins
  }

  /* Phenomenal prospects should usually be winning. */
  if (archetype === "Phenomenal Prospect") {
    losses = Math.min(losses, 2)

    wins = Math.max(
      wins,
      Math.max(2, totalFights - losses),
    )
  }

  /* Aging elites should generally have strong records. */
  if (archetype === "Aging Elite") {
    losses = Math.max(1, losses)

    wins = Math.max(
      wins,
      totalFights - losses,
    )
  }

  /* Journeymen should have genuinely mixed records. */
  if (archetype === "Journeyman") {
    const targetLosses = randomInt(
      Math.max(
        4,
        Math.floor(totalFights * 0.35),
      ),
      Math.max(
        5,
        Math.floor(totalFights * 0.55),
      ),
    )

    losses = Math.min(
      targetLosses,
      totalFights - 2,
    )

    wins = totalFights - losses
  }

  /* Veteran gatekeepers need experience and losses. */
  if (archetype === "Veteran Gatekeeper") {
    losses = Math.max(
      losses,
      randomInt(
        8,
        Math.max(
          8,
          Math.floor(totalFights * 0.4),
        ),
      ),
    )

    losses = Math.min(
      losses,
      totalFights - 5,
    )

    wins = totalFights - losses
  }

  /*
   * Contenders should normally have winning records.
   * We still allow exceptions.
   */
  if (
    tier === "Contender" &&
    archetype !== "Journeyman" &&
    archetype !== "Veteran Gatekeeper"
  ) {
    const minimumWins = Math.max(
      8,
      Math.floor(totalFights * 0.55),
    )

    wins = Math.max(wins, minimumWins)

    losses = totalFights - wins
  }

  /*
   * Elite fighters should normally have strong winning records.
   */
  if (
    tier === "Elite" &&
    archetype !== "Veteran Gatekeeper" &&
    archetype !== "Journeyman"
  ) {
    const minimumWins = Math.max(
      12,
      Math.floor(totalFights * 0.65),
    )

    wins = Math.max(wins, minimumWins)

    losses = totalFights - wins
  }

  wins = Math.max(0, wins)
  losses = Math.max(0, losses)
  draws = Math.max(0, draws)

  if (wins + losses + draws === 0) {
    wins = 1
  }

  return {
    wins,
    losses,
    draws,
  }
}

/* -------------------------------------------------------------------------- */
/* PHYSICALS                                                                    */
/* -------------------------------------------------------------------------- */

function generatePhysicals(
  gender: Gender,
  weightClass: MaleWeightClass | FemaleWeightClass,
): {
  height: number
  reach: number
} {
  if (gender === "Male") {
    const range =
      malePhysicalRanges[
        weightClass as MaleWeightClass
      ]

    const height = randomInt(
      range.height[0],
      range.height[1],
    )

    const reachFromHeight =
      height + randomInt(-2, 8)

    const reach = clamp(
      reachFromHeight,
      range.reach[0],
      range.reach[1],
    )

    return {
      height,
      reach,
    }
  }

  const range =
    femalePhysicalRanges[
      weightClass as FemaleWeightClass
    ]

  const height = randomInt(
    range.height[0],
    range.height[1],
  )

  const reachFromHeight =
    height + randomInt(-2, 7)

  const reach = clamp(
    reachFromHeight,
    range.reach[0],
    range.reach[1],
  )

  return {
    height,
    reach,
  }
}

/* -------------------------------------------------------------------------- */
/* BASE ABILITY                                                                 */
/* -------------------------------------------------------------------------- */

function generateBaseAbility(
  tier: FighterTier,
  archetype: Archetype,
): number {
  const tierBase: Record<FighterTier, number> = {
    Prospect: 55,
    Regional: 61,
    Established: 68,
    Contender: 77,
    Elite: 86,
  }

  let base = tierBase[tier]

  if (archetype === "Phenomenal Prospect") {
    base += randomInt(1, 5)
  }

  if (archetype === "Veteran Gatekeeper") {
    base += randomInt(-2, 2)
  }

  if (archetype === "Late Bloomer") {
    base += randomInt(0, 5)
  }

  if (archetype === "Aging Elite") {
    base += randomInt(0, 4)
  }

  if (archetype === "Dangerous Specialist") {
    base += randomInt(-1, 3)
  }

  if (archetype === "Journeyman") {
    base -= randomInt(0, 4)
  }

  return clamp(
    base + randomInt(-5, 5),
    40,
    92,
  )
}

/* -------------------------------------------------------------------------- */
/* ATTRIBUTES                                                                  */
/* -------------------------------------------------------------------------- */

function generateAttributes(
  style: FighterStyle,
  archetype: Archetype,
  tier: FighterTier,
): Record<
  | "striking"
  | "wrestling"
  | "bjj"
  | "takedownDefense"
  | "accuracy"
  | "power"
  | "speed"
  | "cardio"
  | "chin"
  | "strength"
  | "fightIQ"
  | "heart"
  | "aggression"
  | "composure",
  number
> {
  const base = generateBaseAbility(
    tier,
    archetype,
  )

  const attributes = {
    striking: clamp(
      base + randomInt(-5, 5),
    ),
    wrestling: clamp(
      base + randomInt(-5, 5),
    ),
    bjj: clamp(
      base + randomInt(-5, 5),
    ),
    takedownDefense: clamp(
      base + randomInt(-5, 5),
    ),
    accuracy: clamp(
      base + randomInt(-5, 5),
    ),

    power: clamp(
      base + randomInt(-5, 5),
    ),
    speed: clamp(
      base + randomInt(-5, 5),
    ),
    cardio: clamp(
      base + randomInt(-5, 5),
    ),
    chin: clamp(
      base + randomInt(-5, 5),
    ),
    strength: clamp(
      base + randomInt(-5, 5),
    ),

    fightIQ: clamp(
      base + randomInt(-5, 5),
    ),
    heart: clamp(
      base + randomInt(-5, 5),
    ),
    aggression: clamp(
      base + randomInt(-5, 5),
    ),
    composure: clamp(
      base + randomInt(-5, 5),
    ),
  }

  const profile = styleProfiles[style]

  /* ---------------------------------------------------------------------- */
  /* STYLE MODIFIERS                                                         */
  /* ---------------------------------------------------------------------- */

  for (const stat of profile.primary) {
    attributes[
      stat as keyof typeof attributes
    ] = clamp(
      attributes[
        stat as keyof typeof attributes
      ] + randomInt(7, 14),
    )
  }

  for (const stat of profile.secondary) {
    attributes[
      stat as keyof typeof attributes
    ] = clamp(
      attributes[
        stat as keyof typeof attributes
      ] + randomInt(2, 7),
    )
  }

  for (const stat of profile.weaknesses) {
    attributes[
      stat as keyof typeof attributes
    ] = clamp(
      attributes[
        stat as keyof typeof attributes
      ] - randomInt(5, 11),
    )
  }

  /* ---------------------------------------------------------------------- */
  /* ARCHETYPE MODIFIERS                                                     */
  /* ---------------------------------------------------------------------- */

  if (archetype === "Dangerous Specialist") {
    const specialist = pick([
      "striking",
      "power",
      "wrestling",
      "bjj",
    ] as const)

    attributes[specialist] = clamp(
      attributes[specialist] +
        randomInt(12, 20),
    )

    const weakness = pick([
      "accuracy",
      "cardio",
      "composure",
      "takedownDefense",
    ] as const)

    attributes[weakness] = clamp(
      attributes[weakness] -
        randomInt(8, 16),
    )
  }

  if (archetype === "Grappling Specialist") {
    attributes.wrestling = clamp(
      attributes.wrestling +
        randomInt(8, 15),
    )

    attributes.bjj = clamp(
      attributes.bjj +
        randomInt(8, 15),
    )

    attributes.striking = clamp(
      attributes.striking -
        randomInt(5, 11),
    )

    attributes.power = clamp(
      attributes.power -
        randomInt(2, 7),
    )
  }

  if (archetype === "Striking Specialist") {
    attributes.striking = clamp(
      attributes.striking +
        randomInt(8, 15),
    )

    attributes.accuracy = clamp(
      attributes.accuracy +
        randomInt(7, 13),
    )

    attributes.power = clamp(
      attributes.power +
        randomInt(5, 12),
    )

    attributes.wrestling = clamp(
      attributes.wrestling -
        randomInt(5, 11),
    )
  }

  /*
   * BALANCED
   *
   * Balanced fighters do not receive large style bonuses.
   * Instead, their attributes stay relatively close together.
   */
  if (style === "Balanced") {
    const strengths = [
      "striking",
      "wrestling",
      "bjj",
      "accuracy",
      "fightIQ",
      "cardio",
      "composure",
    ] as const

    const first = pick(strengths)

    let second = pick(strengths)

    while (second === first) {
      second = pick(strengths)
    }

    attributes[first] = clamp(
      attributes[first] +
        randomInt(3, 6),
    )

    attributes[second] = clamp(
      attributes[second] +
        randomInt(2, 5),
    )

    if (chance(0.3)) {
      let third = pick(strengths)

      while (
        third === first ||
        third === second
      ) {
        third = pick(strengths)
      }

      attributes[third] = clamp(
        attributes[third] +
          randomInt(2, 4),
      )
    }
  }

  /* ---------------------------------------------------------------------- */
  /* EXPERIENCE ARCHETYPES                                                   */
  /* ---------------------------------------------------------------------- */

  if (archetype === "Veteran Gatekeeper") {
    attributes.fightIQ = clamp(
      attributes.fightIQ +
        randomInt(6, 12),
    )

    attributes.composure = clamp(
      attributes.composure +
        randomInt(5, 10),
    )

    attributes.speed = clamp(
      attributes.speed -
        randomInt(4, 9),
    )
  }

  if (archetype === "Aging Elite") {
    attributes.fightIQ = clamp(
      attributes.fightIQ +
        randomInt(7, 13),
    )

    attributes.composure = clamp(
      attributes.composure +
        randomInt(6, 12),
    )

    attributes.speed = clamp(
      attributes.speed -
        randomInt(5, 10),
    )

    attributes.cardio = clamp(
      attributes.cardio -
        randomInt(3, 8),
    )
  }

  if (archetype === "Late Bloomer") {
    attributes.fightIQ = clamp(
      attributes.fightIQ +
        randomInt(4, 9),
    )

    attributes.composure = clamp(
      attributes.composure +
        randomInt(4, 9),
    )
  }

  /*
   * Phenomenal prospects have huge upside,
   * but their current ability remains imperfect.
   */
  if (archetype === "Phenomenal Prospect") {
    const maxCurrentAbility =
      randomInt(72, 82)

    for (const key of Object.keys(
      attributes,
    ) as Array<keyof typeof attributes>) {
      attributes[key] = Math.min(
        attributes[key],
        maxCurrentAbility,
      )
    }

    attributes.speed = clamp(
      attributes.speed +
        randomInt(4, 9),
    )

    attributes.cardio = clamp(
      attributes.cardio +
        randomInt(3, 8),
    )
  }

  /* ---------------------------------------------------------------------- */
  /* STYLE FLOORS                                                             */
  /* ---------------------------------------------------------------------- */

  /*
   * This is the important fix from the last test.
   *
   * A Wrestler must actually be good at wrestling.
   * A BJJ Specialist must actually be good at BJJ.
   * A Counter Striker must actually be good at counter striking.
   */
  const floors = styleFloors[style]

  for (const [
    stat,
    minimum,
  ] of Object.entries(floors)) {
    const key =
      stat as keyof typeof attributes

    attributes[key] = Math.max(
      attributes[key],
      minimum as number,
    )
  }

  /* ---------------------------------------------------------------------- */
  /* FINAL ATTRIBUTE SANITY                                                  */
  /* ---------------------------------------------------------------------- */

  for (const key of Object.keys(
    attributes,
  ) as Array<keyof typeof attributes>) {
    let value = attributes[key]

    /*
     * Non-Elite fighters shouldn't commonly
     * have 95+ attributes.
     */
    if (
      value > 94 &&
      tier !== "Elite"
    ) {
      value = randomInt(88, 94)
    }

    /*
     * Even Elite fighters should rarely
     * have 98–100 across multiple categories.
     */
    if (value > 97) {
      value = randomInt(93, 97)
    }

    attributes[key] = clamp(value)
  }

  return attributes
}

/* -------------------------------------------------------------------------- */
/* POPULARITY                                                                  */
/* -------------------------------------------------------------------------- */

function generatePopularity(
  tier: FighterTier,
  wins: number,
  losses: number,
  archetype: Archetype,
): number {
  const tierBase: Record<
    FighterTier,
    [number, number]
  > = {
    Prospect: [3, 15],
    Regional: [6, 22],
    Established: [12, 40],
    Contender: [25, 60],
    Elite: [45, 85],
  }

  let popularity = randomInt(
    tierBase[tier][0],
    tierBase[tier][1],
  )

  popularity += Math.min(
    wins * 1.2,
    15,
  )

  popularity -= Math.min(
    losses * 0.7,
    8,
  )

  if (
    archetype === "Phenomenal Prospect"
  ) {
    popularity += randomInt(0, 5)
  }

  if (
    archetype === "Aging Elite"
  ) {
    popularity += randomInt(0, 5)
  }

  return clamp(
    popularity,
    1,
    100,
  )
}

/* -------------------------------------------------------------------------- */
/* PERSONALITY                                                                 */
/* -------------------------------------------------------------------------- */

function generatePersonality(): string[] {
  const count = chance(0.5) ? 2 : 3

  const selected: string[] = []

  while (selected.length < count) {
    const trait = pick(personalities)

    if (!selected.includes(trait)) {
      selected.push(trait)
    }
  }

  return selected
}

/* -------------------------------------------------------------------------- */
/* FIGHTER GENERATOR                                                           */
/* -------------------------------------------------------------------------- */

export function generateFighter(
  id: string,
): Fighter {
  const gender: Gender = chance(0.5)
    ? "Male"
    : "Female"

  const nationality =
    pick(nationalities)

  const names =
    namesByNationality[nationality][
      gender === "Male"
        ? "male"
        : "female"
    ]

  const [
    firstName,
    lastName,
  ] = pick(names)

  const weightClass =
    gender === "Male"
      ? pick(maleWeightClasses)
      : pick(femaleWeightClasses)

  const archetype =
    generateArchetype()

  const tier =
    generateTier(archetype)

  const age =
    generateAge(archetype)

  const potential =
    generatePotential(archetype)

  const record =
    generateRecord(
      archetype,
      age,
      tier,
    )

  const style =
    pick(styles)

  const physicals =
    generatePhysicals(
      gender,
      weightClass,
    )

  const attributes =
    generateAttributes(
      style,
      archetype,
      tier,
    )

  const popularity =
    generatePopularity(
      tier,
      record.wins,
      record.losses,
      archetype,
    )

  const nickname =
    chance(0.38)
      ? pick(nicknames)
      : undefined

  return {
    id,

    firstName,
    lastName,
    nickname,

    nationality,
    gender,
    weightClass,

    age,
    height: physicals.height,
    reach: physicals.reach,

    stance: chance(0.78)
      ? "Orthodox"
      : "Southpaw",

    style,
    tier,

    striking: attributes.striking,
    wrestling: attributes.wrestling,
    bjj: attributes.bjj,
    takedownDefense:
      attributes.takedownDefense,
    accuracy: attributes.accuracy,

    power: attributes.power,
    speed: attributes.speed,
    cardio: attributes.cardio,
    chin: attributes.chin,
    strength: attributes.strength,

    fightIQ: attributes.fightIQ,
    heart: attributes.heart,
    aggression: attributes.aggression,
    composure: attributes.composure,

    potential,

    wins: record.wins,
    losses: record.losses,
    draws: record.draws,

    popularity,

    personality:
      generatePersonality(),
  }
}

/* -------------------------------------------------------------------------- */
/* MULTIPLE FIGHTERS                                                           */
/* -------------------------------------------------------------------------- */

export function generateFighters(
  count: number,
): Fighter[] {
  return Array.from(
    { length: count },
    (_, index) =>
      generateFighter(
        `fighter-${String(
          index + 1,
        ).padStart(3, "0")}`,
      ),
  )
}
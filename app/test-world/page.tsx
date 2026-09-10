"use client"

import { useMemo } from "react"
import { generateWorld } from "@/lib/worldGenerator"
import type { Fighter } from "@/lib/types"

export default function TestWorldPage() {
const world = useMemo(() => generateWorld(), [])

const fighterLookup = useMemo(() => {
return new Map(
world.fighters.map((fighter) => [
fighter.id,
fighter,
])
)
}, [world.fighters])

const averageStrength = useMemo(() => {
if (world.fighters.length === 0) {
return 0
}


const total = world.fighters.reduce(
  (sum, fighter) =>
    sum + getFighterStrength(fighter),
  0
)

return total / world.fighters.length


}, [world.fighters])

const promotionStats = useMemo(() => {
return world.promotions.map((promotion) => {
const promotionFighters = promotion.roster
.map((fighterId) =>
fighterLookup.get(fighterId)
)
.filter(
(
fighter
): fighter is NonNullable<
typeof fighter
> => Boolean(fighter)
)


  const avgStrength =
    promotionFighters.length > 0
      ? promotionFighters.reduce(
          (sum, fighter) =>
            sum + getFighterStrength(fighter),
          0
        ) / promotionFighters.length
      : 0

  const divisionMap = new Map<
    string,
    {
      gender: string
      weightClass: string
      fighters: typeof promotionFighters
    }
  >()

  promotionFighters.forEach((fighter) => {
    const key =
      fighter.gender +
      "-" +
      fighter.weightClass

    if (!divisionMap.has(key)) {
      divisionMap.set(key, {
        gender: fighter.gender,
        weightClass: fighter.weightClass,
        fighters: [],
      })
    }

    divisionMap
      .get(key)!
      .fighters.push(fighter)
  })

  const divisions = Array.from(
    divisionMap.values()
  )
    .map((division) => {
      const divisionAverage =
        division.fighters.length > 0
          ? division.fighters.reduce(
              (sum, fighter) =>
                sum +
                getFighterStrength(fighter),
              0
            ) /
            division.fighters.length
          : 0

      return {
        gender: division.gender,
        weightClass:
          division.weightClass,
        fighters: division.fighters,
        averageStrength:
          divisionAverage,
      }
    })
    .sort((a, b) => {
      if (a.gender !== b.gender) {
        return a.gender === "Male" ? -1 : 1
      }

      return (
        getDivisionOrder(
          a.weightClass
        ) -
        getDivisionOrder(
          b.weightClass
        )
      )
    })

  return {
    promotion,
    fighterCount:
      promotionFighters.length,
    avgStrength,
    divisions,
  }
})


}, [world.promotions, fighterLookup])

const weightClassStats = useMemo(() => {
const stats = new Map<
string,
{
gender: string
weightClass: string
count: number
}
>()


world.fighters.forEach((fighter) => {
  const key =
    fighter.gender +
    "-" +
    fighter.weightClass

  if (!stats.has(key)) {
    stats.set(key, {
      gender: fighter.gender,
      weightClass:
        fighter.weightClass,
      count: 0,
    })
  }

  stats.get(key)!.count++
})

return Array.from(stats.values()).sort(
  (a, b) => {
    if (a.gender !== b.gender) {
      return a.gender === "Male" ? -1 : 1
    }

    return (
      getDivisionOrder(
        a.weightClass
      ) -
      getDivisionOrder(
        b.weightClass
      )
    )
  }
)


}, [world.fighters])

const nationalityStats = useMemo(() => {
const stats = new Map<
string,
number
>()


world.fighters.forEach((fighter) => {
  stats.set(
    fighter.nationality,
    (stats.get(
      fighter.nationality
    ) ?? 0) + 1
  )
})

return Array.from(stats.entries()).sort(
  (a, b) => b[1] - a[1]
)


}, [world.fighters])

const freeAgentFighters = useMemo(() => {
return world.freeAgents
.map((fighterId) =>
fighterLookup.get(fighterId)
)
.filter(
(
fighter
): fighter is NonNullable<
typeof fighter
> => Boolean(fighter)
)
}, [world.freeAgents, fighterLookup])

const strongestFighters = useMemo(() => {
return [...world.fighters]
.sort(
(a, b) =>
getFighterStrength(b) -
getFighterStrength(a)
)
.slice(0, 10)
}, [world.fighters])

return ( <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8"> <div className="mx-auto max-w-7xl">


    <div className="mb-8">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-red-500">
        Fight Manager Developer Tools
      </p>

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        🌎 MMA World Inspector
      </h1>

      <p className="mt-2 max-w-3xl text-sm text-zinc-400">
        Temporary development page used to
        inspect the generated MMA universe
        before we connect it to the actual
        game.
      </p>
    </div>

    <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Fighters"
        value={world.fighters.length}
      />

      <StatCard
        label="AI Promotions"
        value={world.promotions.length}
      />

      <StatCard
        label="Free Agents"
        value={world.freeAgents.length}
      />

      <StatCard
        label="Avg. Strength"
        value={averageStrength.toFixed(1)}
      />
    </section>

    <section className="mb-10">
      <SectionHeading>
        🏢 AI Promotions
      </SectionHeading>

      <div className="space-y-6">
        {promotionStats.map(
          ({
            promotion,
            fighterCount,
            avgStrength,
            divisions,
          }) => (
            <div
              key={promotion.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {promotion.name}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    {promotion.tier}
                    {" · "}
                    {promotion.style}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MiniStat
                    label="Fighters"
                    value={fighterCount}
                  />

                  <MiniStat
                    label="Rep"
                    value={promotion.reputation}
                  />

                  <MiniStat
                    label="Popularity"
                    value={promotion.popularity}
                  />

                  <MiniStat
                    label="Avg Strength"
                    value={avgStrength.toFixed(1)}
                  />
                </div>
              </div>

              <div className="mt-6 border-t border-zinc-800 pt-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
                    Division Breakdown
                  </h3>

                  <span className="text-xs text-zinc-600">
                    {divisions.length} active divisions
                  </span>
                </div>

                {divisions.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    No fighters assigned.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-zinc-800">
                    <div className="grid grid-cols-[1fr_auto_auto] gap-4 bg-zinc-900 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      <span>Division</span>
                      <span>Fighters</span>
                      <span>Avg Strength</span>
                    </div>

                    <div className="divide-y divide-zinc-800">
                      {divisions.map(
                        (division) => (
                          <div
                            key={
                              division.gender +
                              "-" +
                              division.weightClass
                            }
                            className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-medium text-zinc-200">
                                {formatDivisionName(
                                  division.gender,
                                  division.weightClass
                                )}
                              </p>
                            </div>

                            <span className="text-sm font-semibold text-zinc-300">
                              {
                                division
                                  .fighters
                                  .length
                              }
                            </span>

                            <span className="text-sm font-semibold text-zinc-300">
                              {division.averageStrength.toFixed(
                                1
                              )}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </section>

    <section className="mb-10">
      <SectionHeading>
        🥊 Weight Class Distribution
      </SectionHeading>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {weightClassStats.map(
          (division) => (
            <div
              key={
                division.gender +
                "-" +
                division.weightClass
              }
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {formatDivisionName(
                      division.gender,
                      division.weightClass
                    )}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {division.gender ===
                    "Male"
                      ? "Men's division"
                      : "Women's division"}
                  </p>
                </div>

                <span className="text-xl font-bold text-white">
                  {division.count}
                </span>
              </div>
            </div>
          )
        )}
      </div>
    </section>

    <section className="mb-10">
      <SectionHeading>
        🌍 Nationality Distribution
      </SectionHeading>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {nationalityStats.map(
          ([nationality, count]) => (
            <div
              key={nationality}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3"
            >
              <span className="text-sm text-zinc-300">
                {nationality}
              </span>

              <span className="font-semibold text-white">
                {count}
              </span>
            </div>
          )
        )}
      </div>
    </section>

    <section className="mb-10">
      <SectionHeading>
        🆓 Free Agents
      </SectionHeading>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {freeAgentFighters
          .slice(0, 18)
          .map((fighter) => (
            <FighterCard
              key={fighter.id}
              fighter={fighter}
            />
          ))}
      </div>

      {freeAgentFighters.length > 18 && (
        <p className="mt-4 text-center text-xs text-zinc-500">
          Showing 18 of{" "}
          {freeAgentFighters.length}{" "}
          free agents
        </p>
      )}
    </section>

    <section>
      <SectionHeading>
        ⭐ Strongest Fighters Generated
      </SectionHeading>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {strongestFighters.map(
          (fighter, index) => (
            <div
              key={fighter.id}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-red-500">
                  #{index + 1}
                </span>

                <span className="text-lg font-bold text-white">
                  {getFighterStrength(
                    fighter
                  ).toFixed(1)}
                </span>
              </div>

              <h3 className="font-semibold text-zinc-100">
                {fighter.firstName}{" "}
                {fighter.lastName}
              </h3>

              <p className="mt-1 font-mono text-[10px] text-zinc-600">
                ID: {fighter.id}
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                {fighter.tier}
                {" · "}
                {fighter.weightClass}
                {" · "}
                {fighter.style}
              </p>

              <p className="mt-3 text-[10px] uppercase tracking-wider text-zinc-600">
                Strength
              </p>
            </div>
          )
        )}
      </div>
    </section>
  </div>
</main>


)
}

function StatCard({
label,
value,
}: {
label: string
value: string | number
}) {
return ( <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"> <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
{label} </p>


  <p className="mt-2 text-3xl font-bold text-white">
    {value}
  </p>
</div>


)
}

function MiniStat({
label,
value,
}: {
label: string
value: string | number
}) {
return ( <div className="rounded-lg border border-zinc-800 bg-black px-3 py-2"> <p className="text-[10px] uppercase tracking-wider text-zinc-600">
{label} </p>


  <p className="mt-1 text-sm font-bold text-zinc-200">
    {value}
  </p>
</div>


)
}

function SectionHeading({
children,
}: {
children: React.ReactNode
}) {
return ( <h2 className="mb-4 text-lg font-bold text-white">
{children} </h2>
)
}

function FighterCard({
fighter,
}: {
fighter: Fighter
}) {
return ( <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"> <div className="flex items-start justify-between gap-3"> <div> <h3 className="font-semibold text-zinc-100">
{fighter.firstName}{" "}
{fighter.lastName} </h3>


      <p className="mt-1 font-mono text-[10px] text-zinc-600">
        ID: {fighter.id}
      </p>

      <p className="mt-2 text-xs text-zinc-500">
        {fighter.nationality}
        {" · "}
        {fighter.weightClass}
      </p>
    </div>

    <span className="rounded-full border border-zinc-800 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
      {fighter.tier}
    </span>
  </div>

  <div className="mt-4 flex items-center justify-between">
    <span className="text-sm text-zinc-400">
      {fighter.wins}-{fighter.losses}
      {fighter.draws > 0
        ? "-" + fighter.draws
        : ""}
    </span>

    <span className="text-sm font-semibold text-zinc-300">
      {getFighterStrength(
        fighter
      ).toFixed(1)}
    </span>
  </div>
</div>

)
}

function formatDivisionName(
gender: string,
weightClass: string
) {
if (gender === "Female") {
return "Women's " + weightClass
}

return "Men's " + weightClass
}

function getDivisionOrder(
weightClass: string
): number {
const order: Record<string, number> = {
Strawweight: 1,
Flyweight: 2,
Bantamweight: 3,
Featherweight: 4,
Lightweight: 5,
Welterweight: 6,
Middleweight: 7,
"Light Heavyweight": 8,
Heavyweight: 9,
}

return order[weightClass] ?? 99
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

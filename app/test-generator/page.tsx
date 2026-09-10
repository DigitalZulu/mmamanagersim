"use client"

import { useMemo } from "react"
import { generateFighters } from "@/lib/fighterGenerator"

export default function TestGeneratorPage() {
  const fighters = useMemo(() => generateFighters(20), [])

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
            MMA Manager
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Fighter Generator Test
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Generated {fighters.length} fictional fighters.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {fighters.map((fighter) => (
            <div
              key={fighter.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {fighter.firstName} {fighter.lastName}
                  </h2>

                  <p className="text-sm text-zinc-400">
                    {fighter.nationality}
                  </p>
                </div>

                <span className="rounded-full border border-red-900 bg-red-950 px-3 py-1 text-xs font-semibold text-red-400">
                  {fighter.tier}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-zinc-500">Gender</p>
                  <p className="font-medium">{fighter.gender}</p>
                </div>

                <div>
                  <p className="text-zinc-500">Weight</p>
                  <p className="font-medium">
                    {fighter.weightClass}
                  </p>
                </div>

                <div>
                  <p className="text-zinc-500">Age</p>
                  <p className="font-medium">{fighter.age}</p>
                </div>

                <div>
                  <p className="text-zinc-500">Style</p>
                  <p className="font-medium">{fighter.style}</p>
                </div>

                <div>
                  <p className="text-zinc-500">Record</p>
                  <p className="font-medium">
                    {fighter.wins}-{fighter.losses}-{fighter.draws}
                  </p>
                </div>

                <div>
                  <p className="text-zinc-500">Potential</p>
                  <p className="font-medium">
                    {fighter.potential}/100
                  </p>
                </div>

                <div>
                  <p className="text-zinc-500">Popularity</p>
                  <p className="font-medium">
                    {fighter.popularity}/100
                  </p>
                </div>

                <div>
                  <p className="text-zinc-500">Stance</p>
                  <p className="font-medium">
                    {fighter.stance}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-zinc-800 pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Attributes
                </p>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <Stat
                    label="Striking"
                    value={fighter.striking}
                  />

                  <Stat
                    label="Wrestling"
                    value={fighter.wrestling}
                  />

                  <Stat
                    label="BJJ"
                    value={fighter.bjj}
                  />

                  <Stat
                    label="TD Defense"
                    value={fighter.takedownDefense}
                  />

                  <Stat
                    label="Accuracy"
                    value={fighter.accuracy}
                  />

                  <Stat
                    label="Power"
                    value={fighter.power}
                  />

                  <Stat
                    label="Speed"
                    value={fighter.speed}
                  />

                  <Stat
                    label="Cardio"
                    value={fighter.cardio}
                  />

                  <Stat
                    label="Chin"
                    value={fighter.chin}
                  />

                  <Stat
                    label="Strength"
                    value={fighter.strength}
                  />

                  <Stat
                    label="Fight IQ"
                    value={fighter.fightIQ}
                  />

                  <Stat
                    label="Heart"
                    value={fighter.heart}
                  />

                  <Stat
                    label="Aggression"
                    value={fighter.aggression}
                  />

                  <Stat
                    label="Composure"
                    value={fighter.composure}
                  />
                </div>
              </div>

              <div className="mt-5 border-t border-zinc-800 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Personality
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {fighter.personality.map((trait) => (
                    <span
                      key={trait}
                      className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

function Stat({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-zinc-500">{label}</span>

      <span className="font-semibold">
        {value}
      </span>
    </div>
  )
}
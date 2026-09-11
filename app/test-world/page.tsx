
"use client"

import { useMemo } from "react"

import {
  generateWorld,
} from "@/lib/worldGenerator"

import {
  generateAllMatchups,
} from "@/lib/matchmakingSystem"

import {
  generateEvents,
  type Event,
} from "@/lib/eventSystem"

import {
  simulateFight,
} from "@/lib/fightSimulation"

import {
  calculateRankingScore,
  calculateDivisionRankings,
} from "@/lib/rankingSystem"

export default function TestWorldPage() {
  const world = useMemo(() => {
    return generateWorld()
  }, [])

  const fighters = world.fighters
  const divisions = world.divisions
  const promotions = world.promotions

  const promotionNames = useMemo(() => {
    return promotions.reduce(
      (map, promotion) => {
        map[promotion.id] = promotion.name
        return map
      },
      {} as Record<string, string>
    )
  }, [promotions])

  // --------------------------------------------------
  // MATCHMAKING
  // --------------------------------------------------

  const matchups = useMemo(() => {
    if (
      fighters.length === 0 ||
      divisions.length === 0
    ) {
      return []
    }

    return generateAllMatchups(
      divisions,
      fighters
    )
  }, [fighters, divisions])

  // --------------------------------------------------
  // EVENTS
  // --------------------------------------------------

  const events = useMemo(() => {
    if (
      matchups.length === 0 ||
      fighters.length === 0 ||
      promotions.length === 0
    ) {
      return []
    }

    return generateEvents(
      matchups,
      fighters,
      divisions,
      promotionNames,
      "2026-09-12",
      2,
      10
    )
  }, [
    matchups,
    fighters,
    divisions,
    promotions,
    promotionNames,
  ])

  // --------------------------------------------------
  // EVENT VERIFICATION
  // --------------------------------------------------

  const eventVerification = useMemo(() => {
    let duplicateFights = 0
    let duplicateFighters = 0
    let invalidPromotions = 0
    let invalidDates = 0
    let invalidOrder = 0
    let invalidRounds = 0
    let invalidFighters = 0

    const fighterLookup = new Map(
      fighters.map((fighter) => [
        fighter.id,
        fighter,
      ])
    )

    const matchupKeys = new Set<string>()

    for (const event of events) {
      // IMPORTANT:
      // This set resets for every event.
      //
      // A fighter appearing on two DIFFERENT events
      // is completely normal.
      //
      // We only want to detect a fighter being booked
      // twice on the SAME event.
      const eventFighterIds = new Set<string>()

      for (
        let i = 0;
        i < event.fights.length;
        i += 1
      ) {
        const scheduledFight =
          event.fights[i]

        const matchup =
          scheduledFight.matchup

        const fighterA =
          fighterLookup.get(
            matchup.fighterAId
          )

        const fighterB =
          fighterLookup.get(
            matchup.fighterBId
          )

        // ------------------------------------------
        // Fighter existence
        // ------------------------------------------

        if (!fighterA || !fighterB) {
          invalidFighters += 1
          continue
        }

        // ------------------------------------------
        // Promotion
        // ------------------------------------------

        if (
          matchup.promotionId !==
          event.promotionId
        ) {
          invalidPromotions += 1
        }

        // ------------------------------------------
        // Date
        // ------------------------------------------

        if (!event.date) {
          invalidDates += 1
        }

        // ------------------------------------------
        // Fight order
        // ------------------------------------------

        if (
          scheduledFight.fightOrder !==
          i + 1
        ) {
          invalidOrder += 1
        }

        // ------------------------------------------
        // Rounds
        // ------------------------------------------

        if (
          scheduledFight.configuration
            .rounds !== 3 &&
          scheduledFight.configuration
            .rounds !== 5
        ) {
          invalidRounds += 1
        }

        // ------------------------------------------
        // Same-event fighter duplication
        // ------------------------------------------

        if (
          eventFighterIds.has(
            fighterA.id
          )
        ) {
          duplicateFighters += 1
        }

        if (
          eventFighterIds.has(
            fighterB.id
          )
        ) {
          duplicateFighters += 1
        }

        eventFighterIds.add(
          fighterA.id
        )

        eventFighterIds.add(
          fighterB.id
        )

        // ------------------------------------------
        // Exact/reverse matchup duplication
        // ------------------------------------------

        const fighterIds = [
          fighterA.id,
          fighterB.id,
        ].sort()

        const matchupKey =
          fighterIds.join("::")

        if (
          matchupKeys.has(matchupKey)
        ) {
          duplicateFights += 1
        }

        matchupKeys.add(matchupKey)
      }
    }

    return {
      duplicateFights,
      duplicateFighters,
      invalidPromotions,
      invalidDates,
      invalidOrder,
      invalidRounds,
      invalidFighters,
    }
  }, [events, fighters])

  const allChecksPassed =
    eventVerification
      .duplicateFights === 0 &&
    eventVerification
      .duplicateFighters === 0 &&
    eventVerification
      .invalidPromotions === 0 &&
    eventVerification
      .invalidDates === 0 &&
    eventVerification
      .invalidOrder === 0 &&
    eventVerification
      .invalidRounds === 0 &&
    eventVerification
      .invalidFighters === 0

  // --------------------------------------------------
  // EVENT TOTALS
  // --------------------------------------------------

  const scheduledFights =
    events.reduce(
      (total, event) =>
        total + event.fights.length,
      0
    )

  const scheduledFighterSlots =
    scheduledFights * 2

  // --------------------------------------------------
  // FIGHTER LOOKUP
  // --------------------------------------------------

  const fighterLookup = useMemo(() => {
    return new Map(
      fighters.map((fighter) => [
        fighter.id,
        fighter,
      ])
    )
  }, [fighters])

  // --------------------------------------------------
  // MATCHMAKING VERIFICATION
  // --------------------------------------------------

  const matchmakingVerification =
    useMemo(() => {
      let selfMatchups = 0
      let invalidFighterReferences = 0
      let invalidDivisionReferences = 0
      let invalidPromotionReferences = 0

      for (const matchup of matchups) {
        // ------------------------------------------
        // Self-match protection
        // ------------------------------------------

        if (
          matchup.fighterAId ===
          matchup.fighterBId
        ) {
          selfMatchups += 1
        }

        // ------------------------------------------
        // Fighter references
        // ------------------------------------------

        const fighterA =
          fighterLookup.get(
            matchup.fighterAId
          )

        const fighterB =
          fighterLookup.get(
            matchup.fighterBId
          )

        if (!fighterA || !fighterB) {
          invalidFighterReferences += 1
        }

        // ------------------------------------------
        // Division reference
        // ------------------------------------------

        const division =
          divisions.find(
            (division) =>
              division.id ===
              matchup.divisionId
          )

        if (!division) {
          invalidDivisionReferences += 1
          continue
        }

        // ------------------------------------------
        // Promotion reference
        // ------------------------------------------

        if (
          matchup.promotionId !==
          division.promotionId
        ) {
          invalidPromotionReferences += 1
        }
      }

      return {
        totalMatchups:
          matchups.length,

        selfMatchups,

        invalidFighterReferences,

        invalidDivisionReferences,

        invalidPromotionReferences,
      }
    }, [
      matchups,
      divisions,
      fighterLookup,
    ])

  const matchmakingAllChecksPassed =
    matchmakingVerification
      .totalMatchups > 0 &&
    matchmakingVerification
      .selfMatchups === 0 &&
    matchmakingVerification
      .invalidFighterReferences === 0 &&
    matchmakingVerification
      .invalidDivisionReferences === 0 &&
    matchmakingVerification
      .invalidPromotionReferences === 0

  // --------------------------------------------------
  // RANKINGS SYSTEM
  // --------------------------------------------------

  const calculatedRankings = useMemo(() => {
    return divisions.map((division) => {
      try {
        const rankings =
          calculateDivisionRankings(
            division,
            fighters
          )

        return {
          division,
          rankings,
          error: false,
        }
      } catch {
        return {
          division,
          rankings: [],
          error: true,
        }
      }
    })
  }, [divisions, fighters])

  // --------------------------------------------------
  // RANKINGS VERIFICATION
  // --------------------------------------------------

  const rankingsVerification = useMemo(() => {
    let emptyDivisions = 0
    let invalidFighterReferences = 0
    let invalidDivisionMembership = 0
    let duplicateFighters = 0
    let invalidScores = 0
    let invalidRankingOrder = 0
    let rankingErrors = 0
    let storedRankingMismatches = 0

    let totalRankedFighters = 0

    for (const result of calculatedRankings) {
      const {
        division,
        rankings,
        error,
      } = result

      if (error) {
        rankingErrors += 1
        continue
      }

      if (division.fighterIds.length === 0) {
        emptyDivisions += 1
      }

      totalRankedFighters += rankings.length

      const seenFighters = new Set<string>()

      for (
        let i = 0;
        i < rankings.length;
        i += 1
      ) {
        const fighterId = rankings[i]
        const fighter =
          fighterLookup.get(fighterId)

        if (!fighter) {
          invalidFighterReferences += 1
          continue
        }

        if (
          !division.fighterIds.includes(
            fighterId
          )
        ) {
          invalidDivisionMembership += 1
        }

        if (
          seenFighters.has(fighterId)
        ) {
          duplicateFighters += 1
        }

        seenFighters.add(fighterId)

        const currentScore =
          calculateRankingScore(
            fighter
          )

        if (
          !Number.isFinite(
            currentScore
          ) ||
          currentScore <= 0
        ) {
          invalidScores += 1
        }

        if (i > 0) {
          const previousFighter =
            fighterLookup.get(
              rankings[i - 1]
            )

          if (previousFighter) {
            const previousScore =
              calculateRankingScore(
                previousFighter
              )

            if (
              currentScore >
              previousScore
            ) {
              invalidRankingOrder += 1
            }
          }
        }
      }

      if (
        rankings.length !==
        division.rankings.length
      ) {
        storedRankingMismatches += 1
      } else {
        for (
          let i = 0;
          i < rankings.length;
          i += 1
        ) {
          if (
            rankings[i] !==
            division.rankings[i]
          ) {
            storedRankingMismatches += 1
            break
          }
        }
      }
    }

    return {
      divisionsRanked:
        calculatedRankings.length,
      totalRankedFighters,
      emptyDivisions,
      invalidFighterReferences,
      invalidDivisionMembership,
      duplicateFighters,
      invalidScores,
      invalidRankingOrder,
      rankingErrors,
      storedRankingMismatches,
    }
  }, [
    calculatedRankings,
    fighterLookup,
  ])

  const rankingsAllChecksPassed =
    rankingsVerification.divisionsRanked ===
      divisions.length &&
    rankingsVerification.emptyDivisions ===
      0 &&
    rankingsVerification.invalidFighterReferences ===
      0 &&
    rankingsVerification.invalidDivisionMembership ===
      0 &&
    rankingsVerification.duplicateFighters ===
      0 &&
    rankingsVerification.invalidScores ===
      0 &&
    rankingsVerification.invalidRankingOrder ===
      0 &&
    rankingsVerification.rankingErrors ===
      0 &&
    rankingsVerification.storedRankingMismatches ===
      0

  // --------------------------------------------------
  // FIGHT SIMULATION INSPECTOR
  // --------------------------------------------------

  const simulatedFights = useMemo(() => {
    if (matchups.length === 0) {
      return []
    }

    return matchups
      .map((matchup) => {
        const fighterA =
          fighterLookup.get(
            matchup.fighterAId
          )

        const fighterB =
          fighterLookup.get(
            matchup.fighterBId
          )

        if (!fighterA || !fighterB) {
          return null
        }

        return simulateFight(
          fighterA,
          fighterB
        )
      })
      .filter(Boolean)
  }, [
    matchups,
    fighterLookup,
  ])

  const simulationResults =
    simulatedFights.filter(
      (result) => result !== null
    )

  const fighterAWins =
    simulationResults.filter(
      (result) =>
        result.winnerId ===
        result.fighterAId
    ).length

  const fighterBWins =
    simulationResults.filter(
      (result) =>
        result.winnerId ===
        result.fighterBId
    ).length

  const koCount =
    simulationResults.filter(
      (result) =>
        result.method === "KO"
    ).length

  const tkoCount =
    simulationResults.filter(
      (result) =>
        result.method === "TKO"
    ).length

  const submissionCount =
    simulationResults.filter(
      (result) =>
        result.method ===
        "Submission"
    ).length

  const decisionCount =
    simulationResults.filter(
      (result) =>
        result.method ===
        "Decision"
    ).length

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  function getFighterName(
    fighterId: string
  ) {
    const fighter =
      fighterLookup.get(fighterId)

    if (!fighter) {
      return "Unknown Fighter"
    }

    return `${fighter.firstName} ${fighter.lastName}`
  }

  function getPromotionName(
    promotionId: string
  ) {
    return (
      promotionNames[promotionId] ??
      "Unknown Promotion"
    )
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-10">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <section>
          <div className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-red-500">
            MMA Manager
          </div>

          <h1 className="text-4xl font-black tracking-tight">
            Event / Calendar Inspector
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Inspecting the current world generation,
            matchmaking, championship state, rankings,
            event scheduling, fight simulation, fight
            results and odds systems.
          </p>
        </section>

        {/* ================================================== */}
        {/* EVENT SUMMARY */}
        {/* ================================================== */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="text-xs uppercase tracking-wider text-zinc-500">
              Events Generated
            </div>

            <div className="mt-2 text-3xl font-black">
              {events.length}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="text-xs uppercase tracking-wider text-zinc-500">
              Scheduled Fights
            </div>

            <div className="mt-2 text-3xl font-black">
              {scheduledFights}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="text-xs uppercase tracking-wider text-zinc-500">
              Fighter Slots
            </div>

            <div className="mt-2 text-3xl font-black">
              {scheduledFighterSlots}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="text-xs uppercase tracking-wider text-zinc-500">
              Promotions
            </div>

            <div className="mt-2 text-3xl font-black">
              {promotions.length}
            </div>
          </div>

        </section>

        {/* ================================================== */}
        {/* MATCHMAKING VERIFICATION */}
        {/* ================================================== */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold">
                Matchmaking System V1 Verification
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Verifying that generated matchup candidates
                reference valid fighters and never create
                self-matchups.
              </p>
            </div>

            <div
              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                matchmakingAllChecksPassed
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              {matchmakingAllChecksPassed
                ? "✓ All checks passed"
                : "✕ Verification failed"}
            </div>

          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

            <VerificationItem
              label="Matchups Generated"
              passed={
                matchmakingVerification
                  .totalMatchups > 0
              }
              value={`${matchmakingVerification.totalMatchups}`}
            />

            <VerificationItem
              label="Self-Matchups"
              passed={
                matchmakingVerification
                  .selfMatchups === 0
              }
              value={`${matchmakingVerification.selfMatchups}`}
            />

            <VerificationItem
              label="Fighter References"
              passed={
                matchmakingVerification
                  .invalidFighterReferences === 0
              }
              value={
                matchmakingVerification
                  .invalidFighterReferences === 0
                  ? "Valid"
                  : `${matchmakingVerification.invalidFighterReferences} invalid`
              }
            />

            <VerificationItem
              label="Division References"
              passed={
                matchmakingVerification
                  .invalidDivisionReferences === 0
              }
              value={
                matchmakingVerification
                  .invalidDivisionReferences === 0
                  ? "Valid"
                  : `${matchmakingVerification.invalidDivisionReferences} invalid`
              }
            />

            <VerificationItem
              label="Promotion References"
              passed={
                matchmakingVerification
                  .invalidPromotionReferences === 0
              }
              value={
                matchmakingVerification
                  .invalidPromotionReferences === 0
                  ? "Valid"
                  : `${matchmakingVerification.invalidPromotionReferences} invalid`
              }
            />

          </div>

        </section>

        {/* ================================================== */}
        {/* EVENT VERIFICATION */}
        {/* ================================================== */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold">
                Event System V1 Verification
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Basic structural checks for generated
                events and fight cards.
              </p>
            </div>

            <div
              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                allChecksPassed
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              {allChecksPassed
                ? "✓ All basic checks passed"
                : "✕ Verification failed"}
            </div>

          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            <VerificationItem
              label="Promotion"
              passed={
                eventVerification
                  .invalidPromotions === 0
              }
              value={
                eventVerification
                  .invalidPromotions === 0
                  ? "Valid"
                  : `${eventVerification.invalidPromotions} invalid`
              }
            />

            <VerificationItem
              label="Dates"
              passed={
                eventVerification
                  .invalidDates === 0
              }
              value={
                eventVerification
                  .invalidDates === 0
                  ? "Valid"
                  : `${eventVerification.invalidDates} invalid`
              }
            />

            <VerificationItem
              label="Order"
              passed={
                eventVerification
                  .invalidOrder === 0
              }
              value={
                eventVerification
                  .invalidOrder === 0
                  ? "Valid"
                  : `${eventVerification.invalidOrder} invalid`
              }
            />

            <VerificationItem
              label="Rounds"
              passed={
                eventVerification
                  .invalidRounds === 0
              }
              value={
                eventVerification
                  .invalidRounds === 0
                  ? "Valid"
                  : `${eventVerification.invalidRounds} invalid`
              }
            />

            <VerificationItem
              label="Duplicate Fights"
              passed={
                eventVerification
                  .duplicateFights === 0
              }
              value={
                eventVerification
                  .duplicateFights === 0
                  ? "0"
                  : `${eventVerification.duplicateFights} found`
              }
            />

            <VerificationItem
              label="Same-Event Fighters"
              passed={
                eventVerification
                  .duplicateFighters === 0
              }
              value={
                eventVerification
                  .duplicateFighters === 0
                  ? "0"
                  : `${eventVerification.duplicateFighters} found`
              }
            />

            <VerificationItem
              label="Fighter References"
              passed={
                eventVerification
                  .invalidFighters === 0
              }
              value={
                eventVerification
                  .invalidFighters === 0
                  ? "Valid"
                  : `${eventVerification.invalidFighters} invalid`
              }
            />

          </div>
        </section>

        {/* ================================================== */}
        {/* EVENTS */}
        {/* ================================================== */}

        <section className="space-y-6">

          <div>
            <h2 className="text-2xl font-black">
              Generated Events
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Event 1 is currently generated as a Fight
              Night and Event 2 as a Championship Event.
              Championship title-fight selection is the next
              layer.
            </p>
          </div>

          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              getFighterName={getFighterName}
              getPromotionName={getPromotionName}
            />
          ))}

        </section>

        {/* ================================================== */}
        {/* RANKINGS SYSTEM */}
        {/* ================================================== */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black">
                Rankings System V1 Verification
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Calculating fresh fighter rankings for every division
                and comparing them against the rankings currently
                stored on each division.
              </p>
            </div>

            <div
              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                rankingsAllChecksPassed
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              {rankingsAllChecksPassed
                ? "✓ All checks passed"
                : "✕ Verification failed"}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            <VerificationItem
              label="Divisions Ranked"
              passed={
                rankingsVerification
                  .divisionsRanked ===
                divisions.length
              }
              value={
                rankingsVerification
                  .divisionsRanked ===
                divisions.length
                  ? `${rankingsVerification.divisionsRanked} divisions`
                  : `${rankingsVerification.divisionsRanked}/${divisions.length}`
              }
            />

            <VerificationItem
              label="Fighters Ranked"
              passed={
                rankingsVerification
                  .totalRankedFighters > 0
              }
              value={`${rankingsVerification.totalRankedFighters}`}
            />

            <VerificationItem
              label="Fighter References"
              passed={
                rankingsVerification
                  .invalidFighterReferences === 0
              }
              value={
                rankingsVerification
                  .invalidFighterReferences === 0
                  ? "Valid"
                  : `${rankingsVerification.invalidFighterReferences} invalid`
              }
            />

            <VerificationItem
              label="Division Membership"
              passed={
                rankingsVerification
                  .invalidDivisionMembership === 0
              }
              value={
                rankingsVerification
                  .invalidDivisionMembership === 0
                  ? "Valid"
                  : `${rankingsVerification.invalidDivisionMembership} invalid`
              }
            />

            <VerificationItem
              label="Duplicate Fighters"
              passed={
                rankingsVerification
                  .duplicateFighters === 0
              }
              value={
                rankingsVerification
                  .duplicateFighters === 0
                  ? "0"
                  : `${rankingsVerification.duplicateFighters} found`
              }
            />

            <VerificationItem
              label="Ranking Scores"
              passed={
                rankingsVerification
                  .invalidScores === 0
              }
              value={
                rankingsVerification
                  .invalidScores === 0
                  ? "Valid"
                  : `${rankingsVerification.invalidScores} invalid`
              }
            />

            <VerificationItem
              label="Ranking Order"
              passed={
                rankingsVerification
                  .invalidRankingOrder === 0
              }
              value={
                rankingsVerification
                  .invalidRankingOrder === 0
                  ? "Valid"
                  : `${rankingsVerification.invalidRankingOrder} invalid`
              }
            />

            <VerificationItem
              label="Stored Rankings"
              passed={
                rankingsVerification
                  .storedRankingMismatches === 0
              }
              value={
                rankingsVerification
                  .storedRankingMismatches === 0
                  ? "Matches"
                  : `${rankingsVerification.storedRankingMismatches} mismatches`
              }
            />

            <VerificationItem
              label="Ranking Errors"
              passed={
                rankingsVerification
                  .rankingErrors === 0
              }
              value={
                rankingsVerification
                  .rankingErrors === 0
                  ? "0"
                  : `${rankingsVerification.rankingErrors} errors`
              }
            />

          </div>

          <div className="mt-8">

            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
              Division Rankings
            </h3>

            <p className="mt-1 text-xs text-zinc-600">
              Showing the top 5 ranked fighters in each division.
            </p>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">

              {calculatedRankings.map(
                ({ division, rankings }) => {
                  const champion =
                    division.championId
                      ? fighterLookup.get(
                          division.championId
                        )
                      : undefined

                  return (
                    <div
                      key={division.id}
                      className="rounded-xl border border-zinc-800 bg-black p-5"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                            {division.id}
                          </div>

                          <div className="mt-1 text-lg font-black">
                            {division.weightClass}
                          </div>

                          <div className="mt-1 text-xs text-zinc-600">
                            {division.gender}
                          </div>

                        </div>

                        {champion && (
                          <div className="text-right">

                            <div className="text-[9px] font-bold uppercase tracking-wider text-yellow-500">
                              Champion
                            </div>

                            <div className="mt-1 text-xs font-bold text-yellow-400">
                              {champion.firstName}{" "}
                              {champion.lastName}
                            </div>

                          </div>
                        )}

                      </div>

                      <div className="mt-5 space-y-2">

                        {rankings
                          .slice(0, 5)
                          .map(
                            (
                              fighterId,
                              index
                            ) => {
                              const fighter =
                                fighterLookup.get(
                                  fighterId
                                )

                              if (!fighter) {
                                return null
                              }

                              const score =
                                calculateRankingScore(
                                  fighter
                                )

                              const isChampion =
                                fighter.id ===
                                division.championId

                              return (
                                <div
                                  key={
                                    fighter.id
                                  }
                                  className={`flex items-center justify-between rounded-lg border p-3 ${
                                    isChampion
                                      ? "border-yellow-500/30 bg-yellow-500/[0.03]"
                                      : "border-zinc-800 bg-zinc-950"
                                  }`}
                                >

                                  <div className="flex items-center gap-3">

                                    <div
                                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${
                                        isChampion
                                          ? "bg-yellow-500/10 text-yellow-400"
                                          : "bg-zinc-900 text-zinc-500"
                                      }`}
                                    >
                                      {index + 1}
                                    </div>

                                    <div>

                                      <div
                                        className={`text-sm font-bold ${
                                          isChampion
                                            ? "text-yellow-400"
                                            : "text-zinc-200"
                                        }`}
                                      >
                                        {
                                          fighter.firstName
                                        }{" "}
                                        {
                                          fighter.lastName
                                        }
                                      </div>

                                      <div className="mt-1 text-[10px] text-zinc-600">
                                        {fighter.tier} •{" "}
                                        {fighter.wins}-
                                        {fighter.losses}-
                                        {fighter.draws}
                                      </div>

                                    </div>

                                  </div>

                                  <div className="text-right">

                                    <div className="text-[9px] uppercase tracking-wider text-zinc-600">
                                      Score
                                    </div>

                                    <div className="mt-1 text-sm font-black text-white">
                                      {score.toFixed(2)}
                                    </div>

                                  </div>

                                </div>
                              )
                            }
                          )}

                      </div>

                    </div>
                  )
                }
              )}

            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* FIGHT SIMULATION */}
        {/* ================================================== */}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-2xl font-black">
                Fight Simulation Inspector
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Running the current Fight Simulation V1
                against the raw matchmaking candidates.
              </p>

            </div>

            <div className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
              {simulationResults.length} simulated
            </div>

          </div>

          {/* Simulation totals */}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">

            <SimulationStat
              label="Fights"
              value={simulationResults.length}
            />

            <SimulationStat
              label="A Wins"
              value={fighterAWins}
            />

            <SimulationStat
              label="B Wins"
              value={fighterBWins}
            />

            <SimulationStat
              label="KO"
              value={koCount}
            />

            <SimulationStat
              label="TKO"
              value={tkoCount}
            />

            <SimulationStat
              label="Decision"
              value={decisionCount}
            />

          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">

            <SimulationStat
              label="Submission"
              value={submissionCount}
            />

            <SimulationStat
              label="Invalid Results"
              value={
                matchups.length -
                simulationResults.length
              }
            />

          </div>

          {/* Simulation sample */}

          <div className="mt-8">

            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
              Sample Results
            </h3>

            <div className="mt-3 space-y-2">

              {simulationResults
                .slice(0, 10)
                .map(
                  (result, index) => (
                    <div
                      key={`${result.fighterAId}-${result.fighterBId}-${index}`}
                      className="rounded-lg border border-zinc-800 bg-black p-4"
                    >

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                        <div className="text-sm font-semibold">

                          <span
                            className={
                              result.winnerId ===
                              result.fighterAId
                                ? "text-green-400"
                                : "text-zinc-400"
                            }
                          >
                            {getFighterName(
                              result.fighterAId
                            )}
                          </span>

                          <span className="mx-2 text-zinc-700">
                            vs
                          </span>

                          <span
                            className={
                              result.winnerId ===
                              result.fighterBId
                                ? "text-green-400"
                                : "text-zinc-400"
                            }
                          >
                            {getFighterName(
                              result.fighterBId
                            )}
                          </span>

                        </div>

                        <div className="flex items-center gap-3 text-xs">

                          <span className="font-bold uppercase text-green-400">
                            Winner
                          </span>

                          <span className="text-zinc-500">
                            {result.method}
                          </span>

                          <span className="text-zinc-600">
                            R{result.round}
                          </span>

                        </div>

                      </div>

                    </div>
                  )
                )}

            </div>

          </div>

        </section>

      </div>
    </main>
  )
}

// ======================================================
// VERIFICATION ITEM
// ======================================================

function VerificationItem({
  label,
  passed,
  value,
}: {
  label: string
  passed: boolean
  value: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black p-4">

      <div className="flex items-center gap-3">

        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
            passed
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {passed ? "✓" : "!"}
        </span>

        <span className="text-sm font-medium text-zinc-300">
          {label}
        </span>

      </div>

      <span
        className={`text-xs font-bold ${
          passed
            ? "text-green-400"
            : "text-red-400"
        }`}
      >
        {value}
      </span>

    </div>
  )
}

// ======================================================
// SIMULATION STAT
// ======================================================

function SimulationStat({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-black p-4">

      <div className="text-xs uppercase tracking-wider text-zinc-600">
        {label}
      </div>

      <div className="mt-2 text-2xl font-black">
        {value}
      </div>

    </div>
  )
}

// ======================================================
// EVENT CARD
// ======================================================

function EventCard({
  event,
  getFighterName,
  getPromotionName,
}: {
  event: Event
  getFighterName: (
    fighterId: string
  ) => string
  getPromotionName: (
    promotionId: string
  ) => string
}) {
  const isChampionship =
    event.type === "Championship"

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">

      {/* Event Header */}

      <div className="border-b border-zinc-800 p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                  isChampionship
                    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                    : "border-red-500/30 bg-red-500/10 text-red-400"
                }`}
              >
                {event.type}
              </span>

              <span className="text-xs text-zinc-600">
                {event.id}
              </span>

            </div>

            <h3 className="mt-4 text-2xl font-black">
              {event.name}
            </h3>

            <div className="mt-3 text-sm text-zinc-400">
              {getPromotionName(
                event.promotionId
              )}
            </div>

          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

            <EventStat
              label="Date"
              value={event.date}
            />

            <EventStat
              label="Type"
              value={event.type}
            />

            <EventStat
              label="Fights"
              value={event.fights.length.toString()}
            />

            <EventStat
              label="Status"
              value="Scheduled"
            />

          </div>

        </div>

        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">

          <div className="rounded-lg border border-zinc-800 bg-black p-4">

            <div className="text-xs uppercase tracking-wider text-zinc-600">
              Venue
            </div>

            <div className="mt-1 font-semibold text-zinc-300">
              {event.venue}
            </div>

          </div>

          <div className="rounded-lg border border-zinc-800 bg-black p-4">

            <div className="text-xs uppercase tracking-wider text-zinc-600">
              Location
            </div>

            <div className="mt-1 font-semibold text-zinc-300">
              {event.location}
            </div>

          </div>

        </div>

      </div>

      {/* Fight Card */}

      <div className="p-6">

        <div className="mb-5 flex items-center justify-between">

          <div>

            <h4 className="text-lg font-bold">
              Fight Card
            </h4>

            <p className="mt-1 text-xs text-zinc-600">
              {event.fights.length} scheduled fights
            </p>

          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-zinc-600">
            Main Event → Prelims
          </div>

        </div>

        <div className="space-y-2">

          {event.fights.map(
            (
              scheduledFight,
              index
            ) => {
              const fighterA =
                getFighterName(
                  scheduledFight.matchup
                    .fighterAId
                )

              const fighterB =
                getFighterName(
                  scheduledFight.matchup
                    .fighterBId
                )

              // Fight cards are displayed in order:
              //
              // First fights     = Prelims
              // Second-last      = Co-Main Event
              // Last fight       = Main Event
              //
              // We use the actual array position rather
              // than a fixed fight count because some
              // Championship events may contain fewer
              // than 10 fights.

              const isMainEvent =
                index ===
                event.fights.length - 1

              const isCoMainEvent =
                event.fights.length >= 2 &&
                index ===
                  event.fights.length - 2

              const isTitleFight =
                scheduledFight.configuration
                  .titleFight

              return (
                <div
                  key={`${event.id}-${scheduledFight.fightOrder}`}
                  className="rounded-xl border border-zinc-800 bg-black p-4"
                >

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-sm font-black text-zinc-500">
                        {scheduledFight.fightOrder}
                      </div>

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          {isMainEvent && (
                            <span className="rounded bg-red-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-red-400">
                              Main Event
                            </span>
                          )}

                          {isCoMainEvent && (
                            <span className="rounded bg-orange-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-orange-400">
                              Co-Main Event
                            </span>
                          )}

                          {isTitleFight && (
                            <span className="rounded bg-yellow-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-yellow-400">
                              Title Fight
                            </span>
                          )}

                        </div>

                        <div className="mt-2 text-base font-bold">

                          {fighterA}

                          <span className="mx-2 text-zinc-700">
                            vs
                          </span>

                          {fighterB}

                        </div>

                        <div className="mt-1 text-xs text-zinc-600">
                          {scheduledFight.matchup.divisionId}
                        </div>

                      </div>

                    </div>

                    <div className="flex items-center gap-4 text-xs">

                      <span
                        className={
                          scheduledFight
                            .configuration
                            .rounds === 5
                            ? "font-bold text-red-400"
                            : "text-zinc-500"
                        }
                      >
                        {
                          scheduledFight
                            .configuration
                            .rounds
                        }{" "}
                        Rounds
                      </span>

                      <span
                        className={
                          isTitleFight
                            ? "font-bold text-yellow-400"
                            : "text-zinc-600"
                        }
                      >
                        {isTitleFight
                          ? "Title"
                          : "Non-Title"}
                      </span>

                    </div>

                  </div>

                </div>
              )
            }
          )}

        </div>

      </div>

    </div>
  )
}

// ======================================================
// EVENT STAT
// ======================================================

function EventStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-black px-4 py-3">

      <div className="text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </div>

      <div className="mt-1 truncate text-xs font-bold text-zinc-300">
        {value}
      </div>

    </div>
  )
}


import { type NextRequest, NextResponse } from "next/server"
import { getLeaderboard, submitScore, getLeaderboardStats } from "@/lib/database"
import { z } from "zod"

const submitScoreSchema = z.object({
  username: z.string().min(1, "Username is required").max(50, "Username too long"),
  score: z.number().int().min(0, "Score must be non-negative"),
})

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/leaderboard - Fetching leaderboard data")

    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get("stats") === "true"

    const leaderboard = await getLeaderboard()
    console.log(`Successfully fetched ${leaderboard.length} leaderboard entries`)

    if (includeStats) {
      const stats = await getLeaderboardStats()
      return NextResponse.json({
        leaderboard,
        stats,
      })
    }

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error("GET /api/leaderboard - Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch leaderboard",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/leaderboard - Submitting new score")

    const body = await request.json()
    console.log("Request body:", body)

    const { username, score } = submitScoreSchema.parse(body)
    console.log(`Validated input - Username: ${username}, Score: ${score}`)

    const newEntry = await submitScore(username, score)
    console.log("Score submitted successfully:", newEntry)

    return NextResponse.json({
      message: "Score submitted successfully",
      entry: newEntry,
    })
  } catch (error) {
    console.error("POST /api/leaderboard - Error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid input data",
          details: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to submit score",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

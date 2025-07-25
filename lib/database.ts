// Database schema and operations for Neon PostgreSQL
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface LeaderboardEntry {
  id: number
  username: string
  score: number
  date: Date
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const result = await sql`
      SELECT id, username, score, date 
      FROM leaderboard 
      ORDER BY score DESC, date ASC
      LIMIT 10
    `

    console.log("Database query result:", result)
    return result as LeaderboardEntry[]
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    throw error
  }
}

export async function submitScore(username: string, score: number): Promise<LeaderboardEntry> {
  try {
    // Validate input
    if (!username || username.trim().length === 0) {
      throw new Error("Username is required")
    }

    if (score < 0) {
      throw new Error("Score must be non-negative")
    }

    const trimmedUsername = username.trim().slice(0, 50) // Ensure max length

    const result = await sql`
      INSERT INTO leaderboard (username, score, date)
      VALUES (${trimmedUsername}, ${score}, NOW())
      RETURNING id, username, score, date
    `

    console.log("Score submitted successfully:", result[0])
    return result[0] as LeaderboardEntry
  } catch (error) {
    console.error("Error submitting score:", error)
    throw error
  }
}

export async function getLeaderboardStats(): Promise<{
  totalEntries: number
  highestScore: number
  averageScore: number
  recentEntries: number
}> {
  try {
    const stats = await sql`
      SELECT 
        COUNT(*) as total_entries,
        MAX(score) as highest_score,
        AVG(score)::INTEGER as average_score,
        COUNT(CASE WHEN date > NOW() - INTERVAL '24 hours' THEN 1 END) as recent_entries
      FROM leaderboard
    `

    return {
      totalEntries: Number(stats[0].total_entries),
      highestScore: Number(stats[0].highest_score || 0),
      averageScore: Number(stats[0].average_score || 0),
      recentEntries: Number(stats[0].recent_entries),
    }
  } catch (error) {
    console.error("Error fetching leaderboard stats:", error)
    throw error
  }
}

export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        date TIMESTAMP DEFAULT NOW(),
        
        -- Add constraints
        CONSTRAINT score_non_negative CHECK (score >= 0),
        CONSTRAINT username_not_empty CHECK (LENGTH(TRIM(username)) > 0)
      )
    `

    // Create index for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_leaderboard_score_date 
      ON leaderboard(score DESC, date ASC)
    `

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}

// Utility function to clean up old entries (keep only top 100)
export async function cleanupLeaderboard(): Promise<number> {
  try {
    const result = await sql`
      DELETE FROM leaderboard 
      WHERE id NOT IN (
        SELECT id FROM leaderboard 
        ORDER BY score DESC, date ASC 
        LIMIT 100
      )
    `

    const deletedCount = result.count || 0
    console.log(`Cleaned up ${deletedCount} old leaderboard entries`)
    return deletedCount
  } catch (error) {
    console.error("Error cleaning up leaderboard:", error)
    throw error
  }
}

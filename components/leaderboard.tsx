"use client"

import { useState, useEffect } from "react"
import RetroButton from "./retro-button"

interface LeaderboardEntry {
  id: number
  username: string
  score: number
  date: string
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [username, setUsername] = useState("")
  const [playerScore, setPlayerScore] = useState(0)
  const [showSubmit, setShowSubmit] = useState(false)
  const [highlightNewEntry, setHighlightNewEntry] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLeaderboard()
    loadPlayerScore()

    // Highlight neuen Eintrag wenn gerade hinzugefügt
    const urlParams = new URLSearchParams(window.location.search)
    const newEntryId = urlParams.get("highlight")
    if (newEntryId) {
      setHighlightNewEntry(Number.parseInt(newEntryId))
      // Entferne Highlight nach 3 Sekunden
      setTimeout(() => setHighlightNewEntry(null), 3000)
    }
  }, [])

  const loadLeaderboard = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/leaderboard")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Loaded leaderboard from database:", data)

      // Konvertiere date strings zu lokalen Datumsstrings
      const formattedEntries = data.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date).toLocaleDateString(),
      }))

      setEntries(formattedEntries)
    } catch (error) {
      console.error("Error loading leaderboard:", error)
      setError("Failed to load leaderboard")

      // Fallback zu localStorage wenn Database nicht verfügbar
      const saved = localStorage.getItem("leaderboard")
      if (saved) {
        const localData = JSON.parse(saved)
        console.log("Using localStorage fallback:", localData)
        setEntries(localData)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadPlayerScore = () => {
    const saved = localStorage.getItem("battleScore")
    if (saved) {
      setPlayerScore(Number.parseInt(saved))
    }
  }

  const submitScore = async () => {
    if (!username.trim()) {
      alert("Please enter a username!")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/leaderboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          score: playerScore,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Score submitted to database:", result)

      // Reload leaderboard to show new entry
      await loadLeaderboard()

      setShowSubmit(false)
      setUsername("")
      alert("Score submitted successfully!")
    } catch (error) {
      console.error("Error submitting score:", error)

      // Fallback zu localStorage wenn Database nicht verfügbar
      const newEntry: LeaderboardEntry = {
        id: Date.now(),
        username: username.trim(),
        score: playerScore,
        date: new Date().toLocaleDateString(),
      }

      const updatedEntries = [...entries, newEntry].sort((a, b) => b.score - a.score).slice(0, 10)
      setEntries(updatedEntries)
      localStorage.setItem("leaderboard", JSON.stringify(updatedEntries))

      setShowSubmit(false)
      setUsername("")
      alert("Score submitted (saved locally due to connection error)")
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return `#${rank}`
    }
  }

  return (
    <div className="space-y-4">
      {/* Current Score */}
      <div className="bg-white border-4 border-black p-4 text-center">
        <h2 className="pixel-font font-bold text-[#306230] mb-2">YOUR CURRENT SCORE</h2>
        <div className="pixel-font text-2xl font-bold text-[#FFD700] mb-4">{playerScore}</div>
        {!showSubmit ? (
          <RetroButton onClick={() => setShowSubmit(true)} disabled={loading}>
            {loading ? "LOADING..." : "SUBMIT SCORE"}
          </RetroButton>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pixel-font bg-white border-2 border-black px-3 py-2 w-full max-w-xs"
              maxLength={20}
              disabled={loading}
            />
            <div className="flex justify-center gap-2">
              <RetroButton onClick={submitScore} disabled={loading}>
                {loading ? "SUBMITTING..." : "SUBMIT"}
              </RetroButton>
              <RetroButton variant="secondary" onClick={() => setShowSubmit(false)} disabled={loading}>
                CANCEL
              </RetroButton>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border-4 border-red-500 p-4 text-center">
          <p className="pixel-font text-red-700 mb-2">⚠️ {error}</p>
          <RetroButton onClick={loadLeaderboard} variant="secondary" className="text-xs">
            RETRY
          </RetroButton>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white border-4 border-black p-4">
        <h2 className="pixel-font font-bold text-[#306230] mb-4">TOP TRAINERS {loading && "(LOADING...)"}</h2>

        {loading ? (
          <div className="text-center pixel-font text-gray-600">Loading leaderboard...</div>
        ) : entries.length === 0 ? (
          <div className="text-center pixel-font text-gray-600">No scores yet. Be the first!</div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`
                  flex items-center justify-between p-3 border-2 border-black transition-all duration-500
                  ${
                    highlightNewEntry === entry.id
                      ? "bg-yellow-300 animate-pulse"
                      : index === 0
                        ? "bg-[#FFD700]"
                        : index === 1
                          ? "bg-gray-300"
                          : index === 2
                            ? "bg-orange-300"
                            : "bg-[#9BBB3C]"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="pixel-font text-sm font-bold w-8">{getRankIcon(index + 1)}</span>
                  <span className="pixel-font text-sm font-bold">{entry.username}</span>
                  {highlightNewEntry === entry.id && (
                    <span className="pixel-font text-xs text-red-600 animate-bounce">NEW!</span>
                  )}
                </div>
                <div className="text-right">
                  <div className="pixel-font text-sm font-bold">{entry.score}</div>
                  <div className="pixel-font text-xs text-gray-600">{entry.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Database Status Info */}
      <div className="bg-white border-4 border-black p-4">
        <h3 className="pixel-font font-bold text-[#306230] mb-2">DATABASE STATUS</h3>
        <div className="pixel-font text-xs text-gray-600 space-y-1">
          <div>Connection: {error ? "❌ Error" : "✅ Connected"}</div>
          <div>Entries loaded: {entries.length}</div>
          <div>Current player score: {playerScore}</div>
          <div>Data source: {error ? "localStorage (fallback)" : "Neon Database"}</div>
          <div>Last updated: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white border-4 border-black p-4">
        <h3 className="pixel-font font-bold text-[#306230] mb-2">HOW TO SCORE</h3>
        <div className="pixel-font text-xs text-gray-600 space-y-1">
          <div>• Win battles: +100 × round points</div>
          <div>• Pokemon defeated: +20 × round points</div>
          <div>• Trainer bonus: +50 × round points</div>
          <div>• Build a strong team and battle trainers!</div>
        </div>
      </div>
    </div>
  )
}

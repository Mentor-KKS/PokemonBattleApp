import Leaderboard from "@/components/leaderboard"
import GameBoyScreen from "@/components/game-boy-screen"
import Link from "next/link"
import RetroButton from "@/components/retro-button"

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gameboy-light p-4">
      <GameBoyScreen>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <RetroButton>← HOME</RetroButton>
            </Link>
            <h1 className="pixel-font text-xl font-bold text-[#306230]">LEADERBOARD</h1>
            <Link href="/battle">
              <RetroButton>BATTLE</RetroButton>
            </Link>
          </div>

          <Leaderboard />
        </div>
      </GameBoyScreen>
    </div>
  )
}

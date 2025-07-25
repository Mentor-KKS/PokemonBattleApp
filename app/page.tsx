import { Suspense } from "react";
import PokemonGrid from "@/components/pokemon-grid";
import GameBoyScreen from "@/components/game-boy-screen";
import RetroButton from "@/components/retro-button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gameboy-light p-4">
      <GameBoyScreen>
        <div className="space-y-6">
          {/* Header with Logo */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <img
                src="/images/pokemon-battle-logo.png"
                alt="Pokemon Battle Logo"
                width={164}
                height={164}
              />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/team">
                <RetroButton>MY TEAM</RetroButton>
              </Link>
              <Link href="/battle">
                <RetroButton>BATTLE</RetroButton>
              </Link>
              <Link href="/leaderboard">
                <RetroButton>LEADERBOARD</RetroButton>
              </Link>
              <Link href="/rules">
                <RetroButton variant="secondary">RULES</RetroButton>
              </Link>
            </div>
          </div>

          {/* Pokemon Grid */}
          <Suspense
            fallback={
              <div className="text-center text-gameboy-darkest pixel-font">
                LOADING POKÉMON...
              </div>
            }
          >
            <PokemonGrid />
          </Suspense>
        </div>
      </GameBoyScreen>
    </div>
  );
}

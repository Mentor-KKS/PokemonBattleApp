import { Suspense } from "react"
import GameBoyScreen from "@/components/game-boy-screen"
import Link from "next/link"
import RetroButton from "@/components/retro-button"
import PokemonDetails from "@/components/pokemon-details"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PokemonPage({ params }: PageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-gameboy-light p-4">
      <GameBoyScreen>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <RetroButton>← BACK</RetroButton>
            </Link>
            <h1 className="pixel-font text-xl font-bold text-[#306230]">POKÉMON DETAILS</h1>
          </div>

          <Suspense fallback={<div className="text-center text-[#306230] pixel-font">LOADING POKÉMON DATA...</div>}>
            <PokemonDetails id={id} />
          </Suspense>
        </div>
      </GameBoyScreen>
    </div>
  )
}

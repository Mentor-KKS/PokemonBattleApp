"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import RetroButton from "./retro-button"

interface Pokemon {
  id: number
  name: string
  sprites: {
    front_default: string
  }
  types: Array<{
    type: {
      name: string
    }
  }>
  stats: Array<{
    base_stat: number
    stat: {
      name: string
    }
  }>
}

interface PokeCardProps {
  pokemon: Pokemon
  onAddToTeam?: () => void
  isInTeam?: boolean
  canAdd?: boolean
  strength?: number
}

const typeColors: Record<string, string> = {
  fire: "bg-red-500",
  water: "bg-blue-500",
  grass: "bg-green-500",
  electric: "bg-yellow-500",
  psychic: "bg-pink-500",
  ice: "bg-cyan-500",
  dragon: "bg-purple-500",
  dark: "bg-gray-800",
  fairy: "bg-pink-300",
  normal: "bg-gray-400",
  fighting: "bg-red-700",
  poison: "bg-purple-600",
  ground: "bg-yellow-600",
  flying: "bg-indigo-400",
  bug: "bg-green-400",
  rock: "bg-yellow-800",
  ghost: "bg-purple-700",
  steel: "bg-gray-500",
}

export default function PokeCard({
  pokemon,
  onAddToTeam,
  isInTeam = false,
  canAdd = true,
  strength = 0,
}: PokeCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="bg-white border-4 border-black p-4">
      <div className="text-center space-y-2">
        {/* Pokemon Image */}
        <Link href={`/pokemon/${pokemon.id}`}>
          <div className="bg-gray-100 p-3 mx-auto w-32 h-32 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer rounded-lg">
            {!imageError && pokemon.sprites.front_default ? (
              <Image
                src={pokemon.sprites.front_default || "/placeholder.svg"}
                alt={pokemon.name}
                width={96}
                height={96}
                className="pixelated drop-shadow-lg"
              />
            ) : (
              <div className="text-gameboy-darkest pixel-font text-xs">NO IMG</div>
            )}
          </div>
        </Link>

        {/* Pokemon Info */}
        <div>
          <h3 className="pixel-font text-sm font-bold text-[#306230] uppercase">
            {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
          </h3>
          <p className="pixel-font text-xs text-gray-600">#{pokemon.id.toString().padStart(3, "0")}</p>
          <p className="pixel-font text-xs text-gameboy-dark">Stärke: {strength}</p>
        </div>

        {/* Types */}
        <div className="flex justify-center gap-1">
          {pokemon.types.map((type, index) => (
            <span
              key={index}
              className={`
                pixel-font text-xs px-2 py-1 text-white border border-black
                ${typeColors[type.type.name] || "bg-gray-400"}
              `}
            >
              {type.type.name.toUpperCase()}
            </span>
          ))}
        </div>

        {/* Add to Team Button */}
        {onAddToTeam && (
          <RetroButton
            onClick={onAddToTeam}
            disabled={isInTeam || !canAdd}
            variant={isInTeam ? "secondary" : "primary"}
            className="w-full text-xs"
          >
            {isInTeam ? "IM TEAM" : !canAdd ? "ZU STARK" : "ZUM TEAM"}
          </RetroButton>
        )}
      </div>
    </div>
  )
}

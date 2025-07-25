"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import RetroButton from "./retro-button"
import Link from "next/link"

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

export default function TeamManager() {
  const [team, setTeam] = useState<Pokemon[]>([])

  useEffect(() => {
    loadTeam()
  }, [])

  const loadTeam = () => {
    const savedTeam = localStorage.getItem("pokemonTeam")
    if (savedTeam) {
      setTeam(JSON.parse(savedTeam))
    }
  }

  const removePokemon = (id: number) => {
    const newTeam = team.filter((p) => p.id !== id)
    setTeam(newTeam)
    localStorage.setItem("pokemonTeam", JSON.stringify(newTeam))
  }

  const clearTeam = () => {
    if (confirm("Are you sure you want to clear your entire team?")) {
      setTeam([])
      localStorage.removeItem("pokemonTeam")
    }
  }

  if (team.length === 0) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-white border-4 border-black p-8">
          <p className="pixel-font text-[#306230] mb-4">YOUR TEAM IS EMPTY</p>
          <p className="pixel-font text-sm text-gray-600 mb-4">Add Pokémon to your team from the home page</p>
          <Link href="/">
            <RetroButton>FIND POKÉMON</RetroButton>
          </Link>
        </div>
      </div>
    )
  }

  const totalStats = team.reduce(
    (acc, pokemon) => {
      const hp = pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat || 0
      const attack = pokemon.stats.find((s) => s.stat.name === "attack")?.base_stat || 0
      const defense = pokemon.stats.find((s) => s.stat.name === "defense")?.base_stat || 0
      return {
        hp: acc.hp + hp,
        attack: acc.attack + attack,
        defense: acc.defense + defense,
      }
    },
    { hp: 0, attack: 0, defense: 0 },
  )

  return (
    <div className="space-y-6">
      {/* Team Stats Summary */}
      <div className="bg-white border-4 border-black p-4">
        <h2 className="pixel-font font-bold text-[#306230] mb-4">TEAM SUMMARY ({team.length}/6)</h2>
        <div className="grid grid-cols-3 gap-4 text-center pixel-font text-sm">
          <div>
            <div className="text-gray-600">TOTAL HP</div>
            <div className="font-bold text-lg">{totalStats.hp}</div>
          </div>
          <div>
            <div className="text-gray-600">TOTAL ATK</div>
            <div className="font-bold text-lg">{totalStats.attack}</div>
          </div>
          <div>
            <div className="text-gray-600">TOTAL DEF</div>
            <div className="font-bold text-lg">{totalStats.defense}</div>
          </div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((pokemon, index) => (
          <div key={pokemon.id} className="bg-white border-4 border-black p-4">
            <div className="text-center space-y-3">
              <div className="bg-gray-100 p-3 mx-auto w-32 h-32 flex items-center justify-center rounded-lg">
                <Image
                  src={pokemon.sprites.front_default || "/placeholder.svg?height=96&width=96"}
                  alt={pokemon.name}
                  width={96}
                  height={96}
                  className="pixelated drop-shadow-lg"
                />
              </div>

              <h3 className="pixel-font text-sm font-bold text-[#306230]">
                {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
              </h3>

              <div className="flex justify-center gap-1">
                {pokemon.types.map((type, typeIndex) => (
                  <span
                    key={typeIndex}
                    className={`
                      pixel-font text-xs px-2 py-1 text-white border border-black
                      ${typeColors[type.type.name] || "bg-gray-400"}
                    `}
                  >
                    {type.type.name.toUpperCase()}
                  </span>
                ))}
              </div>

              <div className="space-y-1">
                <Link href={`/pokemon/${pokemon.id}`}>
                  <RetroButton variant="secondary" className="w-full text-xs">
                    VIEW
                  </RetroButton>
                </Link>
                <RetroButton variant="danger" onClick={() => removePokemon(pokemon.id)} className="w-full text-xs">
                  REMOVE
                </RetroButton>
              </div>
            </div>
          </div>
        ))}

        {/* Empty Slots */}
        {Array.from({ length: 6 - team.length }).map((_, index) => (
          <div key={`empty-${index}`} className="bg-gray-200 border-4 border-black p-4">
            <div className="text-center space-y-3">
              <div className="pixel-font text-xs text-gray-600">SLOT {team.length + index + 1}</div>
              <div className="bg-gray-300 p-3 mx-auto w-32 h-32 flex items-center justify-center rounded-lg">
                <span className="pixel-font text-xs text-gray-500">EMPTY</span>
              </div>
              <div className="h-6"></div> {/* Spacer to match pokemon name height */}
              <div className="h-6"></div> {/* Spacer to match types height */}
              <Link href="/">
                <RetroButton variant="secondary" className="text-xs">
                  ADD POKÉMON
                </RetroButton>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      {team.length > 0 && (
        <div className="flex justify-center gap-4">
          <RetroButton variant="danger" onClick={clearTeam}>
            CLEAR TEAM
          </RetroButton>
        </div>
      )}
    </div>
  )
}

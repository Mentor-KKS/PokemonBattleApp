"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import StatBar from "./stat-bar"
import RetroButton from "./retro-button"

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

interface PokemonDetail {
  id: number
  name: string
  height: number
  weight: number
  sprites: {
    front_default: string
    back_default: string
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
  abilities: Array<{
    ability: {
      name: string
    }
  }>
}

interface PokemonDetailsProps {
  id: string
}

export default function PokemonDetails({ id }: PokemonDetailsProps) {
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [team, setTeam] = useState<PokemonDetail[]>([])
  const [teamStrength, setTeamStrength] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPokemon = async () => {
      if (!id) return

      setLoading(true)
      setError(null)

      try {
        // Check cache first
        const cacheKey = `pokemon_${id}`
        let cachedData = null

        try {
          cachedData = localStorage.getItem(cacheKey)
        } catch (e) {
          // localStorage might not be available in some environments
          console.warn("localStorage not available:", e)
        }

        if (cachedData) {
          const parsedData = JSON.parse(cachedData)
          setPokemon(parsedData)
          setLoading(false)
          return
        }

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)

        if (!response.ok) {
          throw new Error(`Pokemon not found: ${response.status}`)
        }

        const data = await response.json()

        // Cache the result
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data))
        } catch (e) {
          console.warn("Could not cache data:", e)
        }

        setPokemon(data)
      } catch (error) {
        console.error("Error fetching Pokemon:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch Pokemon")
      } finally {
        setLoading(false)
      }
    }

    fetchPokemon()
  }, [id])

  useEffect(() => {
    const loadTeam = () => {
      try {
        const savedTeam = localStorage.getItem("pokemonTeam")
        if (savedTeam) {
          const teamData = JSON.parse(savedTeam)
          setTeam(teamData)

          // Calculate team strength
          const strength = teamData.reduce((total: number, pokemon: any) => {
            const totalStats = pokemon.stats.reduce((sum: number, stat: any) => sum + stat.base_stat, 0)
            return total + Math.floor(totalStats / 6)
          }, 0)
          setTeamStrength(strength)
        }
      } catch (error) {
        console.error("Error loading team:", error)
        setTeam([])
        setTeamStrength(0)
      }
    }

    // Only run on client side
    if (typeof window !== "undefined") {
      loadTeam()
    }
  }, [])

  const getPokemonStrength = (pokemon: PokemonDetail) => {
    const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)
    return Math.floor(totalStats / 6)
  }

  const addToTeam = () => {
    if (!pokemon) return

    if (team.length >= 6) {
      alert("Team ist voll! Maximum 6 Pokémon erlaubt.")
      return
    }

    if (team.some((p) => p.id === pokemon.id)) {
      alert("Dieses Pokémon ist bereits in deinem Team!")
      return
    }

    const pokemonStrength = getPokemonStrength(pokemon)
    const newTotalStrength = teamStrength + pokemonStrength

    if (newTotalStrength > 400) {
      alert(
        `Team zu stark! Maximale Stärke: 400\n` +
          `Aktuelle Team-Stärke: ${teamStrength}\n` +
          `${pokemon.name} Stärke: ${pokemonStrength}\n` +
          `Neue Gesamt-Stärke würde: ${newTotalStrength} betragen`,
      )
      return
    }

    const newTeam = [...team, pokemon]
    setTeam(newTeam)
    setTeamStrength(newTotalStrength)

    try {
      localStorage.setItem("pokemonTeam", JSON.stringify(newTeam))
    } catch (e) {
      console.warn("Could not save team:", e)
    }

    alert(`${pokemon.name} wurde zum Team hinzugefügt!\nNeue Team-Stärke: ${newTotalStrength}/400`)
  }

  const retryFetch = async () => {
    // Clear cache and retry
    const cacheKey = `pokemon_${id}`
    try {
      localStorage.removeItem(cacheKey)
    } catch (e) {
      console.warn("Could not clear cache:", e)
    }

    setError(null)
    setPokemon(null)
    setLoading(true)

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)

      if (!response.ok) {
        throw new Error(`Pokemon not found: ${response.status}`)
      }

      const data = await response.json()

      try {
        localStorage.setItem(cacheKey, JSON.stringify(data))
      } catch (e) {
        console.warn("Could not cache data:", e)
      }

      setPokemon(data)
    } catch (error) {
      console.error("Error fetching Pokemon:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch Pokemon")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center text-[#306230] pixel-font">LOADING POKÉMON DATA...</div>
  }

  if (error) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-white border-4 border-black p-8">
          <div className="text-center text-red-600 pixel-font mb-4">ERROR: {error}</div>
          <RetroButton onClick={retryFetch}>RETRY</RetroButton>
        </div>
      </div>
    )
  }

  if (!pokemon) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-white border-4 border-black p-8">
          <div className="text-center text-[#306230] pixel-font">POKÉMON NOT FOUND</div>
        </div>
      </div>
    )
  }

  const isInTeam = team.some((p) => p.id === pokemon.id)
  const pokemonStrength = getPokemonStrength(pokemon)
  const wouldExceedLimit = teamStrength + pokemonStrength > 400
  const canAddToTeam = !isInTeam && team.length < 6 && !wouldExceedLimit

  return (
    <div className="space-y-6">
      {/* Team Status */}
      <div className="bg-white border-4 border-black p-4">
        <div className="flex justify-between items-center pixel-font text-sm mb-2">
          <span className="text-gameboy-darkest">AKTUELLES TEAM: {team.length}/6</span>
          <span className="text-gameboy-darkest">STÄRKE: {teamStrength}/400</span>
        </div>
        <div className="bg-gray-300 border border-black h-3">
          <div
            className="bg-gameboy-medium h-full transition-all duration-300"
            style={{ width: `${(teamStrength / 400) * 100}%` }}
          />
        </div>
        <div className="pixel-font text-xs text-gray-600 mt-1">
          {pokemon &&
            `${pokemon.name} Stärke: ${pokemonStrength} | Nach Hinzufügung: ${teamStrength + pokemonStrength}/400`}
        </div>
      </div>

      {/* Main Info */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Image and Basic Info */}
        <div className="space-y-4">
          <div className="bg-white border-4 border-black p-6 text-center">
            <div className="bg-gray-100 p-4 mx-auto w-40 h-40 flex items-center justify-center mb-4 rounded-lg">
              <Image
                src={pokemon.sprites.front_default || "/placeholder.svg?height=128&width=128"}
                alt={pokemon.name}
                width={128}
                height={128}
                className="pixelated drop-shadow-lg"
              />
            </div>

            <h2 className="pixel-font text-xl font-bold text-[#306230] mb-2">
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </h2>

            <p className="pixel-font text-sm text-gray-600 mb-4">#{pokemon.id.toString().padStart(3, "0")}</p>

            {/* Pokemon Strength */}
            <div
              className={`border-2 border-black p-2 mb-4 ${typeColors[pokemon.types[0]?.type.name] || "bg-gameboy-light"}`}
            >
              <span className="pixel-font text-sm font-bold text-white">STÄRKE: {pokemonStrength}</span>
            </div>

            {/* Types */}
            <div className="flex justify-center gap-2 mb-4">
              {pokemon.types.map((type, index) => (
                <span
                  key={index}
                  className={`
        pixel-font text-xs px-3 py-1 text-white border-2 border-black
        ${typeColors[type.type.name] || "bg-gray-400"}
      `}
                >
                  {type.type.name.toUpperCase()}
                </span>
              ))}
            </div>

            {/* Physical Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm pixel-font">
              <div>
                <span className="text-gray-600">HEIGHT:</span>
                <br />
                <span className="font-bold">{pokemon.height / 10}m</span>
              </div>
              <div>
                <span className="text-gray-600">WEIGHT:</span>
                <br />
                <span className="font-bold">{pokemon.weight / 10}kg</span>
              </div>
            </div>
          </div>

          {/* Add to Team Button with detailed feedback */}
          <div className="space-y-2">
            <RetroButton
              onClick={addToTeam}
              disabled={!canAddToTeam}
              className="w-full"
              variant={canAddToTeam ? "primary" : "secondary"}
            >
              {isInTeam
                ? "BEREITS IM TEAM"
                : team.length >= 6
                  ? "TEAM VOLL (6/6)"
                  : wouldExceedLimit
                    ? `ZU STARK (${teamStrength + pokemonStrength}/400)`
                    : "ZUM TEAM HINZUFÜGEN"}
            </RetroButton>

            {wouldExceedLimit && !isInTeam && team.length < 6 && (
              <div className="bg-red-100 border-2 border-red-500 p-2 pixel-font text-xs text-red-700">
                ⚠️ Dieses Pokémon würde die maximale Team-Stärke von 400 überschreiten!
                <br />
                Benötigt: {pokemonStrength} | Verfügbar: {400 - teamStrength}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats and Abilities */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-white border-4 border-black p-4">
            <h3 className="pixel-font font-bold text-[#306230] mb-4">BASE STATS</h3>
            <div className="space-y-3">
              {pokemon.stats.map((stat, index) => (
                <StatBar
                  key={index}
                  label={stat.stat.name.replace("-", " ").toUpperCase()}
                  value={stat.base_stat}
                  maxValue={255}
                  color={typeColors[pokemon.types[0]?.type.name] || "bg-[#8BAC0F]"}
                />
              ))}
            </div>
            <div className="mt-3 pixel-font text-xs text-gray-600">
              Gesamt-Stats: {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
              <br />
              Durchschnitt: {Math.floor(pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0) / 6)} (Stärke)
            </div>
          </div>

          {/* Abilities */}
          <div className="bg-white border-4 border-black p-4">
            <h3 className="pixel-font font-bold text-[#306230] mb-4">ABILITIES</h3>
            <div className="space-y-2">
              {pokemon.abilities.map((ability, index) => (
                <div key={index} className="bg-[#9BBB3C] border-2 border-black p-2 pixel-font text-sm">
                  {ability.ability.name.replace("-", " ").toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

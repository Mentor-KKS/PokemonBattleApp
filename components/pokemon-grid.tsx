"use client"

import { useState, useEffect, useCallback } from "react"
import PokeCard from "./poke-card"
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

interface SearchFilters {
  name: string
  type: string
  minStrength: number
  maxStrength: number
  minHp: number
  maxHp: number
  minAttack: number
  maxAttack: number
  minDefense: number
  maxDefense: number
}

const pokemonTypes = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
]

// Pre-defined Pokemon data to avoid API calls
const POPULAR_POKEMON = [
  { id: 1, name: "bulbasaur" },
  { id: 4, name: "charmander" },
  { id: 7, name: "squirtle" },
  { id: 25, name: "pikachu" },
  { id: 39, name: "jigglypuff" },
  { id: 52, name: "meowth" },
  { id: 54, name: "psyduck" },
  { id: 104, name: "cubone" },
  { id: 113, name: "chansey" },
  { id: 131, name: "lapras" },
  { id: 133, name: "eevee" },
  { id: 143, name: "snorlax" },
  { id: 150, name: "mewtwo" },
  { id: 151, name: "mew" },
]

export default function PokemonGrid() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [team, setTeam] = useState<Pokemon[]>([])
  const [teamStrength, setTeamStrength] = useState(0)
  const [searchMode, setSearchMode] = useState<"normal" | "advanced">("normal")
  const [advancedPokemon, setAdvancedPokemon] = useState<Pokemon[]>([])

  const [filters, setFilters] = useState<SearchFilters>({
    name: "",
    type: "",
    minStrength: 0,
    maxStrength: 200,
    minHp: 0,
    maxHp: 200,
    minAttack: 0,
    maxAttack: 200,
    minDefense: 0,
    maxDefense: 200,
  })

  const fetchPokemon = useCallback(async () => {
    setLoading(true)
    try {
      const limit = 20
      const offset = (page - 1) * limit
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }

      const data = await response.json()

      const pokemonPromises = data.results.map(async (p: any) => {
        try {
          const detailResponse = await fetch(p.url)
          if (!detailResponse.ok) {
            throw new Error(`Failed to fetch ${p.name}`)
          }
          return await detailResponse.json()
        } catch (error) {
          console.error(`Error fetching ${p.name}:`, error)
          return null
        }
      })

      const pokemonDetails = await Promise.all(pokemonPromises)
      const validPokemon = pokemonDetails.filter((p): p is Pokemon => p !== null)

      setPokemon(validPokemon)
    } catch (error) {
      console.error("Error fetching Pokemon:", error)
      setPokemon([])
    } finally {
      setLoading(false)
    }
  }, [page])

  const loadPopularPokemon = useCallback(async () => {
    setLoading(true)
    try {
      // Check cache first
      const cachedData = sessionStorage.getItem("popularPokemonData")
      const cacheTimestamp = sessionStorage.getItem("popularPokemonTimestamp")
      const now = Date.now()
      const cacheAge = cacheTimestamp ? now - Number.parseInt(cacheTimestamp) : Number.POSITIVE_INFINITY

      // Use cache if it's less than 1 hour old
      if (cachedData && cacheAge < 3600000) {
        const parsedData = JSON.parse(cachedData)
        setAdvancedPokemon(parsedData)
        setPokemon(parsedData)
        setLoading(false)
        return
      }

      // Fetch only popular Pokemon to avoid rate limits
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
      const pokemonData: Pokemon[] = []

      for (let i = 0; i < POPULAR_POKEMON.length; i++) {
        try {
          const pokemon = POPULAR_POKEMON[i]
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`)

          if (response.ok) {
            const data = await response.json()
            pokemonData.push(data)
          }

          // Add delay between requests
          if (i < POPULAR_POKEMON.length - 1) {
            await delay(200) // 200ms delay between requests
          }
        } catch (error) {
          console.error(`Error fetching Pokemon ${POPULAR_POKEMON[i].name}:`, error)
        }
      }

      if (pokemonData.length === 0) {
        throw new Error("No Pokemon data could be fetched")
      }

      // Cache the results
      sessionStorage.setItem("popularPokemonData", JSON.stringify(pokemonData))
      sessionStorage.setItem("popularPokemonTimestamp", now.toString())

      setAdvancedPokemon(pokemonData)
      setPokemon(pokemonData)
    } catch (error) {
      console.error("Error loading popular Pokemon:", error)

      // Fallback to cached data if available
      const fallbackData = sessionStorage.getItem("popularPokemonData")
      if (fallbackData) {
        const parsedData = JSON.parse(fallbackData)
        setAdvancedPokemon(parsedData)
        setPokemon(parsedData)
        alert("Using cached Pokemon data due to API limitations.")
      } else {
        // Ultimate fallback: switch back to normal mode
        alert("Advanced search is currently unavailable due to API limitations. Please use normal search.")
        setSearchMode("normal")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const loadTeam = useCallback(() => {
    try {
      const savedTeam = localStorage.getItem("pokemonTeam")
      if (savedTeam) {
        setTeam(JSON.parse(savedTeam))
      }
    } catch (error) {
      console.error("Error loading team:", error)
      setTeam([])
    }
  }, [])

  const calculateTeamStrength = useCallback(() => {
    const strength = team.reduce((total, pokemon) => {
      const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)
      return total + Math.floor(totalStats / 6)
    }, 0)
    setTeamStrength(strength)
  }, [team])

  useEffect(() => {
    if (searchMode === "normal") {
      fetchPokemon()
    } else if (searchMode === "advanced") {
      loadPopularPokemon()
    }
  }, [searchMode, fetchPokemon, loadPopularPokemon])

  useEffect(() => {
    loadTeam()
  }, [loadTeam])

  useEffect(() => {
    calculateTeamStrength()
  }, [calculateTeamStrength])

  const getPokemonStrength = useCallback((pokemon: Pokemon) => {
    const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)
    return Math.floor(totalStats / 6)
  }, [])

  const getPokemonStat = useCallback((pokemon: Pokemon, statName: string) => {
    return pokemon.stats.find((s) => s.stat.name === statName)?.base_stat || 0
  }, [])

  const addToTeam = useCallback(
    (pokemon: Pokemon) => {
      if (team.length >= 6) {
        alert("Team ist voll! Maximum 6 Pokémon erlaubt.")
        return
      }

      if (team.some((p) => p.id === pokemon.id)) {
        alert("Dieses Pokémon ist bereits in deinem Team!")
        return
      }

      const pokemonStrength = getPokemonStrength(pokemon)
      if (teamStrength + pokemonStrength > 400) {
        alert(
          `Team zu stark! Maximale Stärke: 400. Aktuelle Stärke: ${teamStrength}. Pokémon Stärke: ${pokemonStrength}`,
        )
        return
      }

      const newTeam = [...team, pokemon]
      setTeam(newTeam)
      localStorage.setItem("pokemonTeam", JSON.stringify(newTeam))
      alert(`${pokemon.name} wurde zum Team hinzugefügt!`)
    },
    [team, teamStrength, getPokemonStrength],
  )

  const applyAdvancedFilters = useCallback(() => {
    if (searchMode !== "advanced" || advancedPokemon.length === 0) return

    let filtered = [...advancedPokemon]

    // Name Filter
    if (filters.name.trim()) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(filters.name.toLowerCase()))
    }

    // Type Filter
    if (filters.type) {
      filtered = filtered.filter((p) => p.types.some((t) => t.type.name === filters.type))
    }

    // Strength Filter
    filtered = filtered.filter((p) => {
      const strength = getPokemonStrength(p)
      return strength >= filters.minStrength && strength <= filters.maxStrength
    })

    // HP Filter
    filtered = filtered.filter((p) => {
      const hp = getPokemonStat(p, "hp")
      return hp >= filters.minHp && hp <= filters.maxHp
    })

    // Attack Filter
    filtered = filtered.filter((p) => {
      const attack = getPokemonStat(p, "attack")
      return attack >= filters.minAttack && attack <= filters.maxAttack
    })

    // Defense Filter
    filtered = filtered.filter((p) => {
      const defense = getPokemonStat(p, "defense")
      return defense >= filters.minDefense && defense <= filters.maxDefense
    })

    setPokemon(filtered)
  }, [searchMode, advancedPokemon, filters, getPokemonStrength, getPokemonStat])

  const resetFilters = useCallback(() => {
    setFilters({
      name: "",
      type: "",
      minStrength: 0,
      maxStrength: 200,
      minHp: 0,
      maxHp: 200,
      minAttack: 0,
      maxAttack: 200,
      minDefense: 0,
      maxDefense: 200,
    })
    if (searchMode === "advanced") {
      setPokemon(advancedPokemon)
    }
  }, [searchMode, advancedPokemon])

  const switchSearchMode = useCallback(
    (mode: "normal" | "advanced") => {
      setSearchMode(mode)
      setPage(1)
      resetFilters()
    },
    [resetFilters],
  )

  // Normal search (nur Name)
  const filteredPokemon =
    searchMode === "normal" ? pokemon.filter((p) => p.name.toLowerCase().includes(filters.name.toLowerCase())) : pokemon

  if (loading) {
    return <div className="text-center text-gameboy-darkest pixel-font">LOADING POKÉMON...</div>
  }

  return (
    <div className="space-y-4">
      {/* Team Status */}
      <div className="bg-white border-4 border-black p-4">
        <div className="flex justify-between items-center pixel-font text-sm">
          <span className="text-gameboy-darkest">TEAM: {team.length}/6</span>
          <span className="text-gameboy-darkest">STÄRKE: {teamStrength}/400</span>
        </div>
        <div className="mt-2 bg-gray-300 border border-black h-3">
          <div
            className="bg-gameboy-medium h-full transition-all duration-300"
            style={{ width: `${(teamStrength / 400) * 100}%` }}
          />
        </div>
      </div>

      {/* Search Mode Toggle */}
      <div className="bg-white border-4 border-black p-4">
        <div className="flex justify-center gap-2 mb-4">
          <RetroButton
            onClick={() => switchSearchMode("normal")}
            variant={searchMode === "normal" ? "primary" : "secondary"}
            className="text-xs"
          >
            🔍 NORMALE SUCHE
          </RetroButton>
          <RetroButton
            onClick={() => switchSearchMode("advanced")}
            variant={searchMode === "advanced" ? "primary" : "secondary"}
            className="text-xs"
          >
            🎯 BELIEBTE POKÉMON
          </RetroButton>
        </div>

        {/* Info about advanced search */}
        {searchMode === "advanced" && (
          <div className="bg-gameboy-light border-2 border-black p-3 mb-4 text-center">
            <div className="pixel-font text-xs text-gameboy-darkest">
              ⭐ Zeigt beliebte Pokémon mit erweiterten Filteroptionen
            </div>
          </div>
        )}

        {/* Normal Search */}
        {searchMode === "normal" && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Pokémon Name suchen..."
              value={filters.name}
              onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
              className="pixel-font bg-white border-2 border-black px-3 py-2 w-full"
            />
          </div>
        )}

        {/* Advanced Search */}
        {searchMode === "advanced" && (
          <div className="space-y-4">
            {/* Name and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="pixel-font text-xs text-gameboy-darkest block mb-1">NAME:</label>
                <input
                  type="text"
                  placeholder="Pokémon Name..."
                  value={filters.name}
                  onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
                  className="pixel-font bg-white border-2 border-black px-3 py-2 w-full text-xs"
                />
              </div>
              <div>
                <label className="pixel-font text-xs text-gameboy-darkest block mb-1">TYP:</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                  className="pixel-font bg-white border-2 border-black px-3 py-2 w-full text-xs"
                >
                  <option value="">Alle Typen</option>
                  {pokemonTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Strength Range */}
            <div>
              <label className="pixel-font text-xs text-gameboy-darkest block mb-1">
                STÄRKE: {filters.minStrength} - {filters.maxStrength}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.minStrength}
                  onChange={(e) => setFilters((prev) => ({ ...prev, minStrength: Number(e.target.value) }))}
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.maxStrength}
                  onChange={(e) => setFilters((prev) => ({ ...prev, maxStrength: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Stats Ranges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* HP */}
              <div>
                <label className="pixel-font text-xs text-gameboy-darkest block mb-1">
                  HP: {filters.minHp} - {filters.maxHp}
                </label>
                <div className="space-y-1">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.minHp}
                    onChange={(e) => setFilters((prev) => ({ ...prev, minHp: Number(e.target.value) }))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.maxHp}
                    onChange={(e) => setFilters((prev) => ({ ...prev, maxHp: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Attack */}
              <div>
                <label className="pixel-font text-xs text-gameboy-darkest block mb-1">
                  ANGRIFF: {filters.minAttack} - {filters.maxAttack}
                </label>
                <div className="space-y-1">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.minAttack}
                    onChange={(e) => setFilters((prev) => ({ ...prev, minAttack: Number(e.target.value) }))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.maxAttack}
                    onChange={(e) => setFilters((prev) => ({ ...prev, maxAttack: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Defense */}
              <div>
                <label className="pixel-font text-xs text-gameboy-darkest block mb-1">
                  VERTEIDIGUNG: {filters.minDefense} - {filters.maxDefense}
                </label>
                <div className="space-y-1">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.minDefense}
                    onChange={(e) => setFilters((prev) => ({ ...prev, minDefense: Number(e.target.value) }))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.maxDefense}
                    onChange={(e) => setFilters((prev) => ({ ...prev, maxDefense: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-center gap-2">
              <RetroButton onClick={applyAdvancedFilters} className="text-xs">
                🔍 FILTER ANWENDEN
              </RetroButton>
              <RetroButton onClick={resetFilters} variant="secondary" className="text-xs">
                🔄 ZURÜCKSETZEN
              </RetroButton>
            </div>

            {/* Results Info */}
            <div className="text-center pixel-font text-xs text-gray-600">{pokemon.length} Pokémon gefunden</div>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPokemon.map((p) => (
          <PokeCard
            key={p.id}
            pokemon={p}
            onAddToTeam={() => addToTeam(p)}
            isInTeam={team.some((tp) => tp.id === p.id)}
            canAdd={team.length < 6 && teamStrength + getPokemonStrength(p) <= 400}
            strength={getPokemonStrength(p)}
          />
        ))}
      </div>

      {/* Pagination - nur bei normaler Suche */}
      {searchMode === "normal" && (
        <div className="flex justify-center gap-2">
          <RetroButton onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
            ZURÜCK
          </RetroButton>
          <span className="pixel-font text-gameboy-darkest px-4 py-2">SEITE {page}</span>
          <RetroButton onClick={() => setPage(page + 1)}>WEITER</RetroButton>
        </div>
      )}

      {/* No Results */}
      {filteredPokemon.length === 0 && !loading && (
        <div className="bg-white border-4 border-black p-8 text-center">
          <p className="pixel-font text-gameboy-darkest mb-2">KEINE POKÉMON GEFUNDEN</p>
          <p className="pixel-font text-xs text-gray-600 mb-4">
            Versuche andere Suchkriterien oder setze die Filter zurück
          </p>
          <RetroButton onClick={resetFilters} variant="secondary">
            FILTER ZURÜCKSETZEN
          </RetroButton>
        </div>
      )}
    </div>
  )
}

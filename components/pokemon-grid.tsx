"use client";

import { useState, useEffect } from "react";
import { Pokemon } from "@/types/pokemon";
import PokemonCard from "./PokemonCard";
import RetroButton from "./retro-button";
import { ToastContainer } from "./Toast";
import { useToast } from "@/hooks/useToast";
import { usePokemonTeam, usePokemonAPI } from "@/hooks/usePokemonData";
import { useSearchFilters, type SearchFilters } from "@/hooks/useSearchFilters";
import {
  POKEMON_TYPES,
  POPULAR_POKEMON,
  PAGINATION,
} from "@/constants/pokemon";

type SearchMode = "normal" | "advanced";

export default function PokemonGrid() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [page, setPage] = useState(1);
  const [searchMode, setSearchMode] = useState<SearchMode>("normal");
  const [advancedPokemon, setAdvancedPokemon] = useState<Pokemon[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Toast System
  const { toasts, removeToast, showSuccess, showError, showWarning, showInfo } =
    useToast();

  // Custom Hooks with Toast integration
  const { team, teamStrength, addToTeam, getPokemonStrength } = usePokemonTeam(
    (message, type) => {
      switch (type) {
        case "success":
          showSuccess(message);
          break;
        case "error":
          showError(message);
          break;
        case "warning":
          showWarning(message);
          break;
        case "info":
          showInfo(message);
          break;
      }
    }
  );

  const {
    loading,
    error,
    fetchPokemonBatch,
    fetchPopularPokemon,
    searchPokemonByName,
  } = usePokemonAPI((message, type) => {
    switch (type) {
      case "success":
        showSuccess(message);
        break;
      case "error":
        showError(message);
        break;
      case "warning":
        showWarning(message);
        break;
      case "info":
        showInfo(message);
        break;
    }
  });

  const { filters, updateFilter, resetFilters, applyFilters, applyNameFilter } =
    useSearchFilters();

  useEffect(() => {
    let isMounted = true;

    const loadPokemon = async () => {
      if (searchMode === "normal") {
        if (filters.name.trim()) {
          return;
        }

        const pokemonData = await fetchPokemonBatch(
          page,
          PAGINATION.DEFAULT_LIMIT
        );
        if (isMounted) {
          setPokemon(pokemonData);
        }
      } else {
        const popularData = await fetchPopularPokemon(POPULAR_POKEMON);
        if (isMounted) {
          setAdvancedPokemon(popularData);
          setPokemon(popularData);
        }
      }
    };

    loadPokemon();

    return () => {
      isMounted = false;
    };
  }, [searchMode, page, fetchPokemonBatch, fetchPopularPokemon, filters.name]);

  useEffect(() => {
    let isMounted = true;

    const performSearch = async () => {
      if (searchMode === "normal" && filters.name.trim()) {
        setIsSearching(true);
        try {
          const results = await searchPokemonByName(filters.name);
          if (isMounted) {
            setPokemon(results);
          }
        } catch (error) {
          console.error("Search error:", error);
          if (isMounted) {
            setPokemon([]);
          }
        } finally {
          if (isMounted) {
            setIsSearching(false);
          }
        }
      }
    };

    const timeoutId = setTimeout(performSearch, 500);

    return () => {
      clearTimeout(timeoutId);
      isMounted = false;
    };
  }, [searchMode, filters.name, searchPokemonByName]);

  const switchSearchMode = (mode: SearchMode) => {
    setSearchMode(mode);
    setPage(1);
    resetFilters();
    setPokemon([]);
    showInfo(
      `Wechsle zu ${mode === "normal" ? "normaler" : "erweiterter"} Suche`
    );
  };

  const handleApplyFilters = () => {
    if (searchMode === "advanced") {
      const filtered = applyFilters(advancedPokemon);
      setPokemon(filtered);
      showInfo(`${filtered.length} Pokémon gefunden`);
    }
  };

  const handleResetFilters = () => {
    resetFilters();
    if (searchMode === "advanced") {
      setPokemon(advancedPokemon);
      showInfo("Filter zurückgesetzt");
    } else {
      setPokemon([]);
    }
  };

  const filteredPokemon =
    searchMode === "normal"
      ? pokemon // Normal mode: Verwende pokemon direkt (entweder Suche oder Pagination)
      : pokemon; // Advanced mode: Verwende gefilterte pokemon

  if ((loading || isSearching) && pokemon.length === 0) {
    return (
      <>
        <div className="text-center text-gameboy-darkest pixel-font">
          {isSearching
            ? `SUCHE NACH "${filters.name}"...`
            : "LOADING POKÉMON..."}
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  if (error && pokemon.length === 0) {
    return (
      <>
        <div className="text-center text-red-600 pixel-font">
          FEHLER: {error}
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Team Status */}
        <TeamStatus team={team} teamStrength={teamStrength} />

        {/* Search Controls */}
        <SearchControls
          searchMode={searchMode}
          filters={filters}
          onModeSwitch={switchSearchMode}
          onFilterUpdate={updateFilter}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          resultsCount={pokemon.length}
          isSearching={isSearching}
        />

        {/* Pokemon Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPokemon.map((p, index) => (
            <PokemonCard
              key={p.id}
              pokemon={p}
              index={index}
              variant="pokedex"
              showTeamButton={true}
              showDetailsLink={true}
              onAddToTeam={() => addToTeam(p)}
              isInTeam={team.some((tp) => tp.id === p.id)}
              canAdd={
                team.length < 6 && teamStrength + getPokemonStrength(p) <= 400
              }
              strength={getPokemonStrength(p)}
            />
          ))}
        </div>

        {/* Pagination - nur anzeigen wenn keine Suche aktiv */}
        {searchMode === "normal" && !filters.name.trim() && (
          <PaginationControls
            page={page}
            onPageChange={setPage}
            loading={loading}
          />
        )}

        {/* No Results */}
        {filteredPokemon.length === 0 && !loading && !isSearching && (
          <NoResults onReset={handleResetFilters} searchTerm={filters.name} />
        )}
      </div>

      {/* Toast Container - Fixed Position */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

interface TeamStatusProps {
  team: Pokemon[];
  teamStrength: number;
}

interface SearchControlsProps {
  searchMode: SearchMode;
  filters: SearchFilters;
  onModeSwitch: (mode: SearchMode) => void;
  onFilterUpdate: <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  resultsCount: number;
  isSearching?: boolean;
}

interface NormalSearchProps {
  filters: SearchFilters;
  onFilterUpdate: <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => void;
}

interface AdvancedSearchProps {
  filters: SearchFilters;
  onFilterUpdate: <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  resultsCount: number;
}

interface RangeFiltersProps {
  filters: SearchFilters;
  onFilterUpdate: <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => void;
}

interface PaginationControlsProps {
  page: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}

interface NoResultsProps {
  onReset: () => void;
  searchTerm?: string;
}

function TeamStatus({ team, teamStrength }: TeamStatusProps) {
  return (
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
  );
}

function SearchControls({
  searchMode,
  filters,
  onModeSwitch,
  onFilterUpdate,
  onApplyFilters,
  onResetFilters,
  resultsCount,
  isSearching = false,
}: SearchControlsProps) {
  return (
    <div className="bg-white border-4 border-black p-4">
      <div className="flex justify-center gap-2 mb-4">
        <RetroButton
          onClick={() => onModeSwitch("normal")}
          variant={searchMode === "normal" ? "primary" : "secondary"}
          className="text-xs"
        >
          🔍 NORMALE SUCHE
        </RetroButton>
        <RetroButton
          onClick={() => onModeSwitch("advanced")}
          variant={searchMode === "advanced" ? "primary" : "secondary"}
          className="text-xs"
        >
          🎯 ERWEITERTE SUCHE
        </RetroButton>
      </div>

      {searchMode === "normal" ? (
        <NormalSearch
          filters={filters}
          onFilterUpdate={onFilterUpdate}
          isSearching={isSearching}
        />
      ) : (
        <AdvancedSearch
          filters={filters}
          onFilterUpdate={onFilterUpdate}
          onApplyFilters={onApplyFilters}
          onResetFilters={onResetFilters}
          resultsCount={resultsCount}
        />
      )}
    </div>
  );
}

interface NormalSearchProps {
  filters: SearchFilters;
  onFilterUpdate: <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => void;
  isSearching?: boolean;
}

function NormalSearch({
  filters,
  onFilterUpdate,
  isSearching = false,
}: NormalSearchProps) {
  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Pokémon Name suchen... (z.B. mew, pikachu, charizard)"
        value={filters.name}
        onChange={(e) => onFilterUpdate("name", e.target.value)}
        className="pixel-font bg-white border-2 border-black px-3 py-2 w-full"
      />
      {isSearching && (
        <div className="text-center pixel-font text-xs text-gray-600">
          Suche nach "{filters.name}"...
        </div>
      )}
      {filters.name.trim() && (
        <div className="text-center pixel-font text-xs text-gray-500">
          💡 Tipp: Versuche bekannte Namen wie "mew", "mewtwo", "pikachu",
          "charizard"
        </div>
      )}
    </div>
  );
}

function AdvancedSearch({
  filters,
  onFilterUpdate,
  onApplyFilters,
  onResetFilters,
  resultsCount,
}: AdvancedSearchProps) {
  return (
    <div className="space-y-4">
      <div className="bg-gameboy-light border-2 border-black p-3 text-center">
        <div className="pixel-font text-xs text-gameboy-darkest">
          ⭐ Zeigt beliebte Pokémon mit erweiterten Filteroptionen
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="pixel-font text-xs text-gameboy-darkest block mb-1">
            NAME:
          </label>
          <input
            type="text"
            placeholder="Pokémon Name..."
            value={filters.name}
            onChange={(e) => onFilterUpdate("name", e.target.value)}
            className="pixel-font bg-white border-2 border-black px-3 py-2 w-full text-xs"
          />
        </div>
        <div>
          <label className="pixel-font text-xs text-gameboy-darkest block mb-1">
            TYP:
          </label>
          <select
            value={filters.type}
            onChange={(e) => onFilterUpdate("type", e.target.value)}
            className="pixel-font bg-white border-2 border-black px-3 py-2 w-full text-xs"
          >
            <option value="">Alle Typen</option>
            {POKEMON_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <RangeFilters filters={filters} onFilterUpdate={onFilterUpdate} />

      <div className="flex justify-center gap-2">
        <RetroButton onClick={onApplyFilters} className="text-xs">
          🔍 FILTER ANWENDEN
        </RetroButton>
        <RetroButton
          onClick={onResetFilters}
          variant="secondary"
          className="text-xs"
        >
          🔄 ZURÜCKSETZEN
        </RetroButton>
      </div>

      <div className="text-center pixel-font text-xs text-gray-600">
        {resultsCount} Pokémon gefunden
      </div>
    </div>
  );
}

function RangeFilters({ filters, onFilterUpdate }: RangeFiltersProps) {
  const ranges = [
    {
      key: "Strength",
      min: "minStrength" as keyof SearchFilters,
      max: "maxStrength" as keyof SearchFilters,
      label: "STÄRKE",
    },
    {
      key: "Hp",
      min: "minHp" as keyof SearchFilters,
      max: "maxHp" as keyof SearchFilters,
      label: "HP",
    },
    {
      key: "Attack",
      min: "minAttack" as keyof SearchFilters,
      max: "maxAttack" as keyof SearchFilters,
      label: "ANGRIFF",
    },
    {
      key: "Defense",
      min: "minDefense" as keyof SearchFilters,
      max: "maxDefense" as keyof SearchFilters,
      label: "VERTEIDIGUNG",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {ranges.map(({ min, max, label }) => (
        <div key={min}>
          <label className="pixel-font text-xs text-gameboy-darkest block mb-1">
            {label}: {filters[min]} - {filters[max]}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="range"
              min="0"
              max="200"
              value={filters[min]}
              onChange={(e) => onFilterUpdate(min, Number(e.target.value))}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="200"
              value={filters[max]}
              onChange={(e) => onFilterUpdate(max, Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function PaginationControls({
  page,
  onPageChange,
  loading,
}: PaginationControlsProps) {
  return (
    <div className="flex justify-center gap-2">
      <RetroButton
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1 || loading}
      >
        ZURÜCK
      </RetroButton>
      <span className="pixel-font text-gameboy-darkest px-4 py-2">
        SEITE {page}
      </span>
      <RetroButton onClick={() => onPageChange(page + 1)} disabled={loading}>
        WEITER
      </RetroButton>
    </div>
  );
}

function NoResults({ onReset, searchTerm }: NoResultsProps) {
  return (
    <div className="bg-white border-4 border-black p-8 text-center">
      <p className="pixel-font text-gameboy-darkest mb-2">
        KEINE POKÉMON GEFUNDEN
      </p>
      {searchTerm ? (
        <p className="pixel-font text-xs text-gray-600 mb-4">
          Keine Ergebnisse für "{searchTerm}". Versuche bekannte Namen wie
          "mew", "pikachu", "charizard"
        </p>
      ) : (
        <p className="pixel-font text-xs text-gray-600 mb-4">
          Versuche andere Suchkriterien oder setze die Filter zurück
        </p>
      )}
      <RetroButton onClick={onReset} variant="secondary">
        {searchTerm ? "SUCHE ZURÜCKSETZEN" : "FILTER ZURÜCKSETZEN"}
      </RetroButton>
    </div>
  );
}

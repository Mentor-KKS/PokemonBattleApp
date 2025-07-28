import { useState, useCallback, useMemo } from "react";
import { Pokemon } from "../types/pokemon";

export interface SearchFilters {
  name: string;
  type: string;
  minStrength: number;
  maxStrength: number;
  minHp: number;
  maxHp: number;
  minAttack: number;
  maxAttack: number;
  minDefense: number;
  maxDefense: number;
}

const DEFAULT_FILTERS: SearchFilters = {
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
};

export function useSearchFilters() {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

  const updateFilter = useCallback(
    <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const getPokemonStat = (pokemon: Pokemon, statName: string) => {
    return pokemon.stats.find((s) => s.stat.name === statName)?.base_stat || 0;
  };

  const getPokemonStrength = (pokemon: Pokemon) => {
    const totalStats = pokemon.stats.reduce(
      (sum, stat) => sum + stat.base_stat,
      0
    );
    return Math.floor(totalStats / 6);
  };

  const applyFilters = useCallback(
    (pokemonList: Pokemon[]) => {
      return pokemonList.filter((pokemon) => {
        // Name filter
        if (
          filters.name.trim() &&
          !pokemon.name.toLowerCase().includes(filters.name.toLowerCase())
        ) {
          return false;
        }

        // Type filter
        if (
          filters.type &&
          !pokemon.types.some((t) => t.type.name === filters.type)
        ) {
          return false;
        }

        // Strength filter
        const strength = getPokemonStrength(pokemon);
        if (strength < filters.minStrength || strength > filters.maxStrength) {
          return false;
        }

        // HP filter
        const hp = getPokemonStat(pokemon, "hp");
        if (hp < filters.minHp || hp > filters.maxHp) {
          return false;
        }

        // Attack filter
        const attack = getPokemonStat(pokemon, "attack");
        if (attack < filters.minAttack || attack > filters.maxAttack) {
          return false;
        }

        // Defense filter
        const defense = getPokemonStat(pokemon, "defense");
        if (defense < filters.minDefense || defense > filters.maxDefense) {
          return false;
        }

        return true;
      });
    },
    [filters]
  );

  const applyNameFilter = useMemo(() => {
    return (pokemonList: Pokemon[]) => {
      if (!filters.name.trim()) return pokemonList;
      return pokemonList.filter((p) =>
        p.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    };
  }, [filters.name]);

  return {
    filters,
    updateFilter,
    resetFilters,
    applyFilters,
    applyNameFilter,
    setFilters,
  };
}

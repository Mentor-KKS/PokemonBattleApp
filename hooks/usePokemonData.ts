import { useState, useEffect, useCallback } from "react";
import { Pokemon } from "@/types/pokemon";

// Hook für Team Management
export function usePokemonTeam(
  onToast?: (
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) => void
) {
  const [team, setTeam] = useState<Pokemon[]>([]);
  const [teamStrength, setTeamStrength] = useState(0);

  const getPokemonStrength = useCallback((pokemon: Pokemon) => {
    const totalStats = pokemon.stats.reduce(
      (sum, stat) => sum + stat.base_stat,
      0
    );
    return Math.floor(totalStats / 6);
  }, []);

  useEffect(() => {
    const loadTeam = () => {
      try {
        const savedTeam = localStorage.getItem("pokemonTeam");
        if (savedTeam) {
          const parsedTeam = JSON.parse(savedTeam);
          setTeam(parsedTeam);
        }
      } catch (error) {
        console.error("Error loading team:", error);
        setTeam([]);
        onToast?.("Fehler beim Laden des Teams", "error");
      }
    };

    loadTeam();
  }, []);

  useEffect(() => {
    const strength = team.reduce((total, pokemon) => {
      return total + getPokemonStrength(pokemon);
    }, 0);
    setTeamStrength(strength);
  }, [team, getPokemonStrength]);

  const addToTeam = useCallback(
    (pokemon: Pokemon) => {
      if (team.length >= 6) {
        onToast?.("Team ist voll! Maximum 6 Pokémon erlaubt.", "warning");
        return false;
      }

      if (team.some((p) => p.id === pokemon.id)) {
        onToast?.("Dieses Pokémon ist bereits in deinem Team!", "warning");
        return false;
      }

      const pokemonStrength = getPokemonStrength(pokemon);
      if (teamStrength + pokemonStrength > 400) {
        onToast?.(
          `Team zu stark! Maximale Stärke: 400. Aktuelle: ${teamStrength}. ${pokemon.name}: ${pokemonStrength}`,
          "error"
        );
        return false;
      }

      const newTeam = [...team, pokemon];
      setTeam(newTeam);
      localStorage.setItem("pokemonTeam", JSON.stringify(newTeam));
      onToast?.(
        `${
          pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
        } wurde zum Team hinzugefügt! 🎉`,
        "success"
      );
      return true;
    },
    [team, teamStrength, getPokemonStrength, onToast]
  );

  const loadTeam = useCallback(() => {
    try {
      const savedTeam = localStorage.getItem("pokemonTeam");
      if (savedTeam) {
        setTeam(JSON.parse(savedTeam));
      }
    } catch (error) {
      console.error("Error loading team:", error);
      setTeam([]);
      onToast?.("Fehler beim Laden des Teams", "error");
    }
  }, [onToast]);

  return {
    team,
    teamStrength,
    addToTeam,
    getPokemonStrength,
    loadTeam,
  };
}

export function usePokemonAPI(
  onToast?: (
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) => void
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPokemonBatch = useCallback(
    async (page: number, limit: number = 20) => {
      setLoading(true);
      setError(null);

      try {
        const offset = (page - 1) * limit;
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();
        const pokemonPromises = data.results.map(async (p: any) => {
          try {
            const detailResponse = await fetch(p.url);
            if (!detailResponse.ok)
              throw new Error(`Failed to fetch ${p.name}`);
            return await detailResponse.json();
          } catch (error) {
            console.error(`Error fetching ${p.name}:`, error);
            return null;
          }
        });

        const pokemonDetails = await Promise.all(pokemonPromises);
        const validPokemon = pokemonDetails.filter(
          (p): p is Pokemon => p !== null
        );

        if (validPokemon.length === 0) {
          onToast?.("Keine Pokémon gefunden", "warning");
        }

        return validPokemon;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setError(errorMessage);
        onToast?.(`Fehler beim Laden der Pokémon: ${errorMessage}`, "error");
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const searchPokemonByName = useCallback(
    async (searchTerm: string): Promise<Pokemon[]> => {
      if (!searchTerm.trim()) return [];

      setLoading(true);
      setError(null);

      try {
        const searchLower = searchTerm.toLowerCase().trim();

        const commonPokemon = [
          { name: "pikachu", id: 25 },
          { name: "charizard", id: 6 },
          { name: "blastoise", id: 9 },
          { name: "venusaur", id: 3 },
          { name: "mew", id: 151 },
          { name: "mewtwo", id: 150 },
          { name: "lucario", id: 448 },
          { name: "garchomp", id: 445 },
          { name: "rayquaza", id: 384 },
          { name: "arceus", id: 493 },
          { name: "eevee", id: 133 },
          { name: "snorlax", id: 143 },
          { name: "gengar", id: 94 },
          { name: "alakazam", id: 65 },
        ];

        const matches = commonPokemon.filter((p) =>
          p.name.includes(searchLower)
        );

        if (matches.length === 0) {
          try {
            const response = await fetch(
              `https://pokeapi.co/api/v2/pokemon/${searchLower}`
            );
            if (response.ok) {
              const pokemon = await response.json();
              return [pokemon];
            }
          } catch (error) {}

          onToast?.(
            `Keine Pokémon gefunden für "${searchTerm}". Versuche bekannte Namen wie "pikachu", "mew", "charizard"`,
            "info"
          );
          return [];
        }

        const pokemonPromises = matches.map(async (match) => {
          try {
            const response = await fetch(
              `https://pokeapi.co/api/v2/pokemon/${match.id}`
            );
            if (response.ok) {
              return await response.json();
            }
            return null;
          } catch (error) {
            console.error(`Error fetching ${match.name}:`, error);
            return null;
          }
        });

        const pokemonData = await Promise.all(pokemonPromises);
        const validPokemon = pokemonData.filter(
          (p): p is Pokemon => p !== null
        );

        if (validPokemon.length > 0) {
          onToast?.(
            `${validPokemon.length} Pokémon gefunden für "${searchTerm}"`,
            "success"
          );
        }

        return validPokemon;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setError(errorMessage);
        onToast?.(`Fehler beim Suchen: ${errorMessage}`, "error");
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchPopularPokemon = useCallback(
    async (pokemonList: Array<{ id: number; name: string }>) => {
      setLoading(true);
      setError(null);

      try {
        // Check cache first
        const cachedData = sessionStorage.getItem("popularPokemonData");
        const cacheTimestamp = sessionStorage.getItem(
          "popularPokemonTimestamp"
        );
        const now = Date.now();
        const cacheAge = cacheTimestamp
          ? now - parseInt(cacheTimestamp)
          : Infinity;

        if (cachedData && cacheAge < 3600000) {
          const parsedData = JSON.parse(cachedData);
          onToast?.("Beliebte Pokémon aus Cache geladen", "info");
          return parsedData;
        }

        onToast?.("Lade beliebte Pokémon...", "info");

        const delay = (ms: number) =>
          new Promise((resolve) => setTimeout(resolve, ms));
        const pokemonData: Pokemon[] = [];

        for (let i = 0; i < pokemonList.length; i++) {
          try {
            const pokemon = pokemonList[i];
            const response = await fetch(
              `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`
            );

            if (response.ok) {
              const data = await response.json();
              pokemonData.push(data);
            }

            if (i < pokemonList.length - 1) {
              await delay(200);
            }
          } catch (error) {
            console.error(
              `Error fetching Pokemon ${pokemonList[i].name}:`,
              error
            );
          }
        }

        if (pokemonData.length === 0) {
          throw new Error("No Pokemon data could be fetched");
        }

        sessionStorage.setItem(
          "popularPokemonData",
          JSON.stringify(pokemonData)
        );
        sessionStorage.setItem("popularPokemonTimestamp", now.toString());

        onToast?.(
          `${pokemonData.length} beliebte Pokémon geladen! 🎉`,
          "success"
        );
        return pokemonData;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setError(errorMessage);

        const fallbackData = sessionStorage.getItem("popularPokemonData");
        if (fallbackData) {
          onToast?.(
            "Verwende gecachte Daten aufgrund von API-Problemen",
            "warning"
          );
          return JSON.parse(fallbackData);
        }

        onToast?.(
          `Fehler beim Laden beliebter Pokémon: ${errorMessage}`,
          "error"
        );
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    fetchPokemonBatch,
    fetchPopularPokemon,
    searchPokemonByName,
  };
}

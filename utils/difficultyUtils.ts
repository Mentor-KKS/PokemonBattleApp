// utils/difficultyUtils.ts
import { BattlePokemon } from "@/types/pokemon";

export interface DifficultyStats {
  hpMultiplier: number;
  statMultiplier: number;
  levelBonus: number;
  round: number;
  aiStrategy: "random" | "balanced" | "aggressive";
  specialEffects: string[];
}

/**
 * Pokémon nach Stärkekategorien organisiert (basierend auf Base Stat Total)
 * Quelle: Pokémon Gen 1 Base Stats
 */
const POKEMON_BY_STRENGTH = {
  // Schwache Pokémon (BST: 200-350) - Frühe Entwicklungsstufen & schwache Pokémon
  weak: [
    10, 11, 13, 14, 16, 17, 19, 20, 21, 23, 27, 29, 32, 35, 39, 41, 43, 46, 48,
    50, 52, 54, 56, 60, 69, 72, 74, 77, 79, 81, 84, 86, 90, 92, 96, 98, 100,
    102, 104, 108, 109, 111, 113, 114, 116, 118, 120, 129, 132, 138, 140, 147,
  ],

  // Mittlere Pokémon (BST: 350-450) - Entwickelte Formen & solide Pokémon
  medium: [
    1, 4, 7, 12, 15, 18, 22, 24, 25, 28, 30, 33, 36, 37, 40, 42, 44, 47, 49, 51,
    53, 55, 57, 58, 61, 62, 70, 73, 75, 78, 80, 82, 83, 85, 87, 89, 91, 93, 95,
    97, 99, 101, 103, 105, 110, 112, 115, 117, 119, 121, 122, 124, 125, 126,
    127, 128, 130, 137, 139, 141, 142, 148,
  ],

  // Starke Pokémon (BST: 450-520) - Vollentwickelte starke Pokémon
  strong: [
    2, 3, 5, 6, 8, 9, 26, 31, 34, 38, 45, 59, 63, 64, 65, 66, 67, 68, 71, 76,
    88, 94, 106, 107, 131, 133, 134, 135, 136, 143, 149,
  ],

  // Legendäre & Pseudo-Legendäre (BST: 520+)
  legendary: [
    144, // Articuno
    145, // Zapdos
    146, // Moltres
    150, // Mewtwo
    151, // Mew
  ],
};

/**
 * Berechnet die Schwierigkeits-Multiplikatoren für eine bestimmte Runde
 */
export const calculateDifficultyStats = (round: number): DifficultyStats => {
  // Exponentielles Wachstum statt linear
  const baseMultiplier = Math.pow(1.25, round - 1); // 25% pro Runde
  const hpMultiplier = Math.min(baseMultiplier * 0.8, 4.0); // HP wächst langsamer
  const statMultiplier = Math.min(baseMultiplier, 5.0); // Stats können höher werden
  const levelBonus = Math.min((round - 1) * 5, 50); // +5 Level pro Runde, max +50

  // KI-Strategie basierend auf Runde
  let aiStrategy: "random" | "balanced" | "aggressive" = "random";
  if (round >= 8) {
    aiStrategy = "aggressive"; // Bevorzugt starke Attacken
  } else if (round >= 5) {
    aiStrategy = "balanced"; // Mix aus Offensive/Defensive
  }

  // Spezial-Effekte sammeln
  const specialEffects: string[] = [];
  if (round >= 10) {
    specialEffects.push("Perfect IVs");
  }
  if (round >= 15) {
    specialEffects.push("Held Items");
  }
  if (round >= 20) {
    specialEffects.push("Mega Evolution Boost");
  }

  return {
    hpMultiplier,
    statMultiplier,
    levelBonus,
    round,
    aiStrategy,
    specialEffects,
  };
};

/**
 * Gibt verfügbare Pokémon basierend auf Runden-Schwierigkeit zurück
 */
export const getPokemonByStrength = (round: number): number[] => {
  const { weak, medium, strong, legendary } = POKEMON_BY_STRENGTH;

  if (round <= 2) {
    // Runde 1-2: Nur schwache Pokémon
    return [...weak];
  } else if (round <= 4) {
    // Runde 3-4: Schwache + 30% mittlere
    const mediumCount = Math.floor(medium.length * 0.3);
    return [...weak, ...medium.slice(0, mediumCount)];
  } else if (round <= 6) {
    // Runde 5-6: Alle schwachen + mittleren + 30% starke
    const strongCount = Math.floor(strong.length * 0.3);
    return [...weak, ...medium, ...strong.slice(0, strongCount)];
  } else if (round <= 8) {
    // Runde 7-8: 50% schwache + alle mittleren + alle starken
    const weakCount = Math.floor(weak.length * 0.5);
    return [...weak.slice(0, weakCount), ...medium, ...strong];
  } else if (round <= 12) {
    // Runde 9-12: 20% schwache + alle mittleren + starken + Vögel (ohne Mewtwo/Mew)
    const weakCount = Math.floor(weak.length * 0.2);
    const legendaryBirds = legendary.slice(0, 3); // Articuno, Zapdos, Moltres
    return [
      ...weak.slice(0, weakCount),
      ...medium,
      ...strong,
      ...legendaryBirds,
    ];
  } else if (round <= 18) {
    // Runde 13-18: Nur mittlere + starke + alle Legendäre (ohne Mewtwo)
    const legendaryNoMewtwo = legendary.filter((id) => id !== 150);
    return [...medium, ...strong, ...legendaryNoMewtwo];
  } else {
    // Runde 19+: Nur starke + alle Legendäre (inklusive Mewtwo)
    return [...strong, ...legendary];
  }
};

/**
 * Gewichtete Zufallsauswahl - bevorzugt stärkere Pokémon in höheren Runden
 */
export const getWeightedPokemonSelection = (round: number): number => {
  const availablePokemon = getPokemonByStrength(round);

  if (round >= 10) {
    // Späte Runden: 70% Chance auf starke/legendäre Pokémon
    const strongAndLegendary = availablePokemon.filter(
      (id) =>
        POKEMON_BY_STRENGTH.strong.includes(id) ||
        POKEMON_BY_STRENGTH.legendary.includes(id)
    );
    const others = availablePokemon.filter(
      (id) => !strongAndLegendary.includes(id)
    );

    const useStrong = Math.random() < 0.7;
    const pool =
      useStrong && strongAndLegendary.length > 0 ? strongAndLegendary : others;

    return pool[Math.floor(Math.random() * pool.length)];
  } else if (round >= 6) {
    // Mittlere Runden: 50% Chance auf stärkere Pokémon
    const strongerPokemon = availablePokemon.filter(
      (id) =>
        POKEMON_BY_STRENGTH.medium.includes(id) ||
        POKEMON_BY_STRENGTH.strong.includes(id)
    );
    const weaker = availablePokemon.filter(
      (id) => !strongerPokemon.includes(id)
    );

    const useStronger = Math.random() < 0.5;
    const pool =
      useStronger && strongerPokemon.length > 0 ? strongerPokemon : weaker;

    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Frühe Runden: Normale Zufallsauswahl
  return availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
};

/**
 * Berechnet dynamische Belohnungen basierend auf Schwierigkeit
 */
export const calculateRewards = (
  round: number,
  isTrainerDefeated = false
): number => {
  const baseReward = isTrainerDefeated ? 50 : 20;
  const difficultyBonus = Math.floor(baseReward * Math.pow(1.2, round - 1));
  return Math.min(difficultyBonus, baseReward * 10); // Max 10x Bonus
};

/**
 * Wendet Spezial-Effekte auf das Enemy-Team an basierend auf der Runde
 */
export const applyRoundEffects = (
  round: number,
  enemyTeam: BattlePokemon[]
): BattlePokemon[] => {
  const modifiedTeam = [...enemyTeam];

  // Runde 10+: Perfekte IVs simulieren (+30% Stats)
  if (round >= 10) {
    modifiedTeam.forEach((pokemon) => {
      pokemon.stats = pokemon.stats.map((stat) => ({
        ...stat,
        base_stat: Math.floor(stat.base_stat * 1.3),
      }));
    });
  }

  // Runde 15+: Held Items simulieren
  if (round >= 15) {
    modifiedTeam.forEach((pokemon) => {
      const randomEffect = Math.random();
      if (randomEffect < 0.3) {
        // 30% Chance auf Choice Band (Angriff +50%)
        const attackStat = pokemon.stats.find((s) => s.stat.name === "attack");
        if (attackStat)
          attackStat.base_stat = Math.floor(attackStat.base_stat * 1.5);
      } else if (randomEffect < 0.6) {
        // 30% Chance auf Leftovers (HP +20%)
        pokemon.maxHp = Math.floor(pokemon.maxHp * 1.2);
        pokemon.currentHp = pokemon.maxHp;
      } else if (randomEffect < 0.8) {
        // 20% Chance auf Choice Specs (Sp. Attack +50%)
        const spAttackStat = pokemon.stats.find(
          (s) => s.stat.name === "special-attack"
        );
        if (spAttackStat)
          spAttackStat.base_stat = Math.floor(spAttackStat.base_stat * 1.5);
      }
    });
  }

  // Runde 20+: Mega Evolution Boost (+40% alle Stats)
  if (round >= 20) {
    modifiedTeam.forEach((pokemon) => {
      pokemon.stats = pokemon.stats.map((stat) => ({
        ...stat,
        base_stat: Math.floor(stat.base_stat * 1.4),
      }));
      // Mega-Pokémon bekommen auch mehr HP
      pokemon.maxHp = Math.floor(pokemon.maxHp * 1.3);
      pokemon.currentHp = pokemon.maxHp;
    });
  }

  return modifiedTeam;
};

/**
 * Generiert Trainer-Namen basierend auf der Runde
 */
export const getTrainerName = (round: number): string => {
  const trainerNames = [
    "Käfer-Sammler", // Runde 1
    "Youngster", // Runde 2
    "Lass", // Runde 3
    "Gentleman", // Runde 4
    "Ass-Trainer", // Runde 5
    "Veteran", // Runde 6
    "Arenaleiter", // Runde 7
    "Gym Leader", // Runde 8
    "Elite Vier Member", // Runde 9
    "Elite Vier", // Runde 10
    "Vize-Champion", // Runde 11
    "Champion", // Runde 12
    "Meister-Champion", // Runde 13
    "Pokémon-Professor", // Runde 14
    "Legende", // Runde 15
    "Großmeister", // Runde 16
    "Pokémon-Meister", // Runde 17
    "Ultimativer Trainer", // Runde 18
    "Gott-Trainer", // Runde 19
    "Arceus-Erwählter", // Runde 20+
  ];

  return trainerNames[Math.min(round - 1, trainerNames.length - 1)];
};

/**
 * Erstellt eine Schwierigkeits-Beschreibung für das Battle-Log
 */
export const getDifficultyDescription = (
  difficulty: DifficultyStats
): string[] => {
  const descriptions: string[] = [];

  const percentage = Math.round(difficulty.statMultiplier * 100);
  descriptions.push(
    `Schwierigkeit: Runde ${difficulty.round} (${percentage}% Stats)`
  );

  if (difficulty.levelBonus > 0) {
    descriptions.push(`Level-Bonus: +${difficulty.levelBonus}`);
  }

  if (difficulty.aiStrategy !== "random") {
    descriptions.push(`KI-Strategie: ${difficulty.aiStrategy.toUpperCase()}`);
  }

  if (difficulty.specialEffects.length > 0) {
    descriptions.push(
      `Spezial-Effekte: ${difficulty.specialEffects.join(", ")}`
    );
  }

  return descriptions;
};

/**
 * Bestimmt ob ein Gegner eine spezielle Attacken-Strategie verwenden soll
 */
export const shouldUseSpecialStrategy = (
  round: number,
  aiStrategy: string
): boolean => {
  if (aiStrategy === "aggressive" && round >= 8) {
    return Math.random() < 0.7; // 70% Chance auf aggressive Moves
  }
  if (aiStrategy === "balanced" && round >= 5) {
    return Math.random() < 0.5; // 50% Chance auf strategische Moves
  }
  return false;
};

/**
 * Berechnet Enemy-Level für Anzeige basierend auf Runde und Pokémon-Stärke
 */
export const calculateEnemyLevel = (
  round: number,
  pokemonId: number
): number => {
  let baseLevel = 5; // Minimum Level

  // Level basierend auf Pokémon-Stärke
  if (POKEMON_BY_STRENGTH.legendary.includes(pokemonId)) {
    baseLevel = 50; // Legendäre starten höher
  } else if (POKEMON_BY_STRENGTH.strong.includes(pokemonId)) {
    baseLevel = 35; // Starke Pokémon
  } else if (POKEMON_BY_STRENGTH.medium.includes(pokemonId)) {
    baseLevel = 20; // Mittlere Pokémon
  } else {
    baseLevel = 10; // Schwache Pokémon
  }

  // Level-Bonus durch Runde
  const difficulty = calculateDifficultyStats(round);
  const finalLevel = Math.min(baseLevel + difficulty.levelBonus, 100);

  return finalLevel;
};

/**
 * Debug-Funktion: Zeigt Pokémon-Verteilung für eine Runde
 */
export const debugPokemonDistribution = (round: number): void => {
  const available = getPokemonByStrength(round);
  const { weak, medium, strong, legendary } = POKEMON_BY_STRENGTH;

  const weakCount = available.filter((id) => weak.includes(id)).length;
  const mediumCount = available.filter((id) => medium.includes(id)).length;
  const strongCount = available.filter((id) => strong.includes(id)).length;
  const legendaryCount = available.filter((id) =>
    legendary.includes(id)
  ).length;

  console.log(`Runde ${round} Pokémon-Verteilung:`);
  console.log(
    `Schwach: ${weakCount}, Mittel: ${mediumCount}, Stark: ${strongCount}, Legendär: ${legendaryCount}`
  );
  console.log(`Gesamt verfügbar: ${available.length}`);
};

import { BattlePokemon, Move, typeChart, Pokemon } from "../types/pokemon";

export const calculateMoveCost = (power: number): number => {
  if (power === 0) return 1;
  if (power <= 40) return 2;
  if (power <= 60) return 3;
  if (power <= 80) return 4;
  if (power <= 100) return 5;
  return 6;
};

export const calculateCooldown = (power: number): number => {
  if (power === 0) return 0;
  if (power <= 40) return 0;
  if (power <= 60) return 1;
  if (power <= 80) return 2;
  if (power <= 100) return 3;
  return 4;
};

export const getTypeEffectiveness = (
  attackType: string,
  defenseTypes: string[]
): number => {
  let effectiveness = 1;
  defenseTypes.forEach((defenseType) => {
    if (
      typeChart[attackType] &&
      typeChart[attackType][defenseType] !== undefined
    ) {
      effectiveness *= typeChart[attackType][defenseType];
    }
  });
  return effectiveness;
};

export const calculateDamage = (
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: Move
): { damage: number; effectiveness: number; isCritical: boolean } => {
  const attackStat =
    attacker.stats.find((s) => s.stat.name === "attack")?.base_stat || 50;
  const defenseStat =
    defender.stats.find((s) => s.stat.name === "defense")?.base_stat || 50;
  const speedStat =
    attacker.stats.find((s) => s.stat.name === "speed")?.base_stat || 50;

  const defenderTypes = defender.types.map((t) => t.type.name);
  const effectiveness = getTypeEffectiveness(move.type, defenderTypes);

  const critChance = Math.min(speedStat / 512 + 0.0625, 0.25);
  const isCritical = Math.random() < critChance;

  const baseDamage = Math.floor(
    (attackStat / defenseStat) * move.power * 0.4 + 5
  );
  const critMultiplier = isCritical ? 1.5 : 1;
  const randomFactor = Math.random() * 0.4 + 0.8;
  const finalDamage = Math.max(
    1,
    Math.floor(baseDamage * effectiveness * critMultiplier * randomFactor)
  );

  return { damage: finalDamage, effectiveness, isCritical };
};

export const getAllPokemonMoves = async (
  pokemonId: number
): Promise<Move[]> => {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
    );
    const pokemon = await response.json();

    // Get all moves that can be learned
    const movePromises = pokemon.moves
      .slice(0, 20)
      .map(async (moveData: any) => {
        try {
          const moveResponse = await fetch(moveData.move.url);
          const moveDetail = await moveResponse.json();
          const power = moveDetail.power || 40;
          return {
            name: moveDetail.name.replace("-", " ").toUpperCase(),
            type: moveDetail.type.name,
            power: power,
            pp: moveDetail.pp || 10,
            accuracy: moveDetail.accuracy || 100,
            cooldown: 0,
            maxCooldown: calculateCooldown(power),
            cost: calculateMoveCost(power),
          };
        } catch {
          return null;
        }
      });

    const moves = (await Promise.all(movePromises)).filter(
      (move): move is Move => move !== null
    );

    return moves.length > 0 ? moves : getDefaultMoves();
  } catch (error) {
    return getDefaultMoves();
  }
};

export const getDefaultMoves = (): Move[] => {
  return [
    {
      name: "TACKLE",
      type: "normal",
      power: 40,
      pp: 35,
      accuracy: 100,
      cooldown: 0,
      maxCooldown: 0,
      cost: 2,
    },
    {
      name: "SCRATCH",
      type: "normal",
      power: 40,
      pp: 35,
      accuracy: 100,
      cooldown: 0,
      maxCooldown: 0,
      cost: 2,
    },
    {
      name: "GROWL",
      type: "normal",
      power: 0,
      pp: 40,
      accuracy: 100,
      cooldown: 0,
      maxCooldown: 0,
      cost: 1,
    },
    {
      name: "LEER",
      type: "normal",
      power: 0,
      pp: 30,
      accuracy: 100,
      cooldown: 0,
      maxCooldown: 0,
      cost: 1,
    },
  ];
};

export const convertToBattlePokemon = async (
  pokemon: Pokemon
): Promise<BattlePokemon> => {
  const hp = pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat || 50;
  const availableMoves = await getAllPokemonMoves(pokemon.id);

  // Load saved moves or use first 4 available moves
  const savedMoves = localStorage.getItem(`pokemon_${pokemon.id}_moves`);
  let selectedMoves: Move[];

  if (savedMoves) {
    selectedMoves = JSON.parse(savedMoves);
  } else {
    selectedMoves = availableMoves.slice(0, 4);
  }

  return {
    ...pokemon,
    currentHp: hp,
    maxHp: hp,
    isActive: false,
    moves: selectedMoves,
    availableMoves: availableMoves,
    originalMoves: pokemon.moves,
  };
};

export const savePokemonMoves = (pokemonId: number, moves: Move[]) => {
  localStorage.setItem(`pokemon_${pokemonId}_moves`, JSON.stringify(moves));
};

export const saveProgress = (score: number, round: number) => {
  localStorage.setItem("battleScore", score.toString());
  localStorage.setItem("currentRound", round.toString());
};

export const loadProgress = (): { score: number; round: number } => {
  const savedScore = localStorage.getItem("battleScore");
  const savedRound = localStorage.getItem("currentRound");
  return {
    score: savedScore ? parseInt(savedScore) : 0,
    round: savedRound ? parseInt(savedRound) : 1,
  };
};

export const formatEffectivenessText = (effectiveness: number): string => {
  if (effectiveness > 1) return " Es ist sehr effektiv!";
  else if (effectiveness < 1) return " Es ist nicht sehr effektiv...";
  else if (effectiveness === 0) return " Es hat keine Wirkung...";
  return "";
};

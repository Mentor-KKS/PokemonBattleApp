export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    back_default: string;
  };
  types: Array<{
    type: {
      name: string;
      url: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  moves: Array<{
    move: {
      name: string;
      url: string;
    };
  }>;
}

export interface Move {
  name: string;
  type: string;
  power: number;
  pp: number;
  accuracy: number;
  cooldown: number;
  maxCooldown: number;
  cost: number;
}
export interface BattlePokemon extends Omit<Pokemon, "moves"> {
  currentHp: number;
  maxHp: number;
  isActive: boolean;
  moves: Move[];
  availableMoves: Move[];
  originalMoves: Array<{
    move: {
      name: string;
      url: string;
    };
  }>;
}

export interface Trainer {
  name: string;
  team: BattlePokemon[];
}

export interface BattleState {
  playerTeam: BattlePokemon[];
  enemyTrainer: Trainer | null;
  battleLog: string[];
  phase:
    | "select"
    | "pokemon-choice"
    | "move-selection"
    | "battle"
    | "victory"
    | "defeat"
    | "pokemon-select"
    | "move-select"
    | "pokemon-fainted";
  playerScore: number;
  currentRound: number;
  playerActivePokemon: number;
  enemyActivePokemon: number;
  showPokemonMenu: boolean;
  showMoveMenu: boolean;
  battleAnimation: {
    type: string;
    attacker: "player" | "enemy" | "";
    target: "player" | "enemy" | "";
  };
  isPlayerTurn: boolean;
  selectedPokemonForMoves: number;
  selectedMoves: Move[];
  showScoreSave: boolean;
  finalScore: number;
}

export interface BattleBackground {
  name: string;
  gradient: string;
  image?: string;
  style?: "gradient" | "image" | "combined";
}

export const typeChart: Record<string, Record<string, number>> = {
  fire: {
    grass: 2,
    ice: 2,
    bug: 2,
    steel: 2,
    water: 0.5,
    fire: 0.5,
    rock: 0.5,
    dragon: 0.5,
  },
  water: { fire: 2, ground: 2, rock: 2, grass: 0.5, water: 0.5, dragon: 0.5 },
  grass: {
    water: 2,
    ground: 2,
    rock: 2,
    fire: 0.5,
    grass: 0.5,
    poison: 0.5,
    flying: 0.5,
    bug: 0.5,
    dragon: 0.5,
    steel: 0.5,
  },
  electric: {
    water: 2,
    flying: 2,
    ground: 0,
    grass: 0.5,
    electric: 0.5,
    dragon: 0.5,
  },
  psychic: { fighting: 2, poison: 2, dark: 0, steel: 0.5, psychic: 0.5 },
  ice: {
    grass: 2,
    ground: 2,
    flying: 2,
    dragon: 2,
    fire: 0.5,
    water: 0.5,
    ice: 0.5,
    steel: 0.5,
  },
  dragon: { dragon: 2, steel: 0.5 },
  dark: { psychic: 2, ghost: 2, fighting: 0.5, dark: 0.5, steel: 0.5 },
  fairy: {
    fighting: 2,
    dragon: 2,
    dark: 2,
    fire: 0.5,
    poison: 0.5,
    steel: 0.5,
  },
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fighting: {
    normal: 2,
    ice: 2,
    rock: 2,
    dark: 2,
    steel: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    ghost: 0,
    fairy: 0.5,
  },
  poison: {
    grass: 2,
    fairy: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0,
  },
  ground: {
    fire: 2,
    electric: 2,
    poison: 2,
    rock: 2,
    steel: 2,
    grass: 0.5,
    bug: 0.5,
    flying: 0,
  },
  flying: {
    electric: 2,
    ice: 2,
    rock: 2,
    grass: 2,
    fighting: 2,
    bug: 2,
    steel: 0.5,
  },
  bug: {
    grass: 2,
    psychic: 2,
    dark: 2,
    fire: 0.5,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    ghost: 0.5,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: {
    fire: 2,
    ice: 2,
    flying: 2,
    bug: 2,
    fighting: 0.5,
    ground: 0.5,
    steel: 0.5,
  },
  ghost: { psychic: 2, ghost: 2, dark: 0.5, normal: 0 },
  steel: {
    ice: 2,
    rock: 2,
    fairy: 2,
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    steel: 0.5,
  },
};

export const typeColors: Record<string, string> = {
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
};

export const battleBackgrounds: BattleBackground[] = [
  {
    name: "Arena",
    gradient: "linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)",
    image: "/images/pixelBattleArena_arena.png",
    style: "image",
  },
  {
    name: "Desert",
    gradient: "linear-gradient(135deg, #FF9800 0%, #FFC107 100%)",
    image: "/images/pixelBattleArena_desert_1.png",
    style: "image",
  },
  {
    name: "Iceland",
    gradient: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
    image: "/images/pixelBattleArena_iceland.png",
    style: "image",
  },
  {
    name: "Volcano",
    gradient: "linear-gradient(135deg, #F44336 0%, #FF9800 100%)",
    image: "/images/pixelBattleArena_vulcano.png",
    style: "image",
  },
  {
    name: "Forest",
    gradient: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
    image: "/images/pixelBattleArena_forest.png",
    style: "image",
  },
  {
    name: "Cave",
    gradient: "linear-gradient(135deg, #424242 0%, #616161 100%)",
    image: "/images/pixelBattleArena_cave.png",
    style: "image",
  },
  {
    name: "Lake",
    gradient: "linear-gradient(135deg, #03A9F4 0%, #FFEB3B 100%)",
    image: "/images/pixelBattleArena_lake.png",
    style: "image",
  },
];

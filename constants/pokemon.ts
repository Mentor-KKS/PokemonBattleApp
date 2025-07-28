export const POKEMON_TYPES = [
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
] as const;

export const POPULAR_POKEMON = [
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
];

export const TEAM_LIMITS = {
  MAX_SIZE: 6,
  MAX_STRENGTH: 400,
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
} as const;

export const CACHE_DURATION = {
  POPULAR_POKEMON: 3600000, // 1 hour in milliseconds
} as const;

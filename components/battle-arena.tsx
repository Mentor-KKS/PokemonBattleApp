"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import RetroButton from "./retro-button";

interface Pokemon {
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

interface Move {
  name: string;
  type: string;
  power: number;
  pp: number;
  accuracy: number;
  cooldown: number; // Wie viele Runden die Attacke gesperrt ist
  maxCooldown: number; // Ursprünglicher Cooldown basierend auf Power
  cost: number; // Kosten für das Balancing-System
}

interface BattlePokemon extends Pokemon {
  currentHp: number;
  maxHp: number;
  isActive: boolean;
  moves: Move[];
  availableMoves: Move[];
}

interface Trainer {
  name: string;
  team: BattlePokemon[];
}

// Type effectiveness chart
const typeChart: Record<string, Record<string, number>> = {
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

// Battle backgrounds for different rounds - using CSS gradients instead of missing images
const battleBackgrounds = [
  {
    name: "Stadium",
    gradient: "linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)",
  },
  {
    name: "Forest",
    gradient: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
  },
  {
    name: "Cave",
    gradient: "linear-gradient(135deg, #424242 0%, #616161 100%)",
  },
  {
    name: "Beach",
    gradient: "linear-gradient(135deg, #03A9F4 0%, #FFEB3B 100%)",
  },
  {
    name: "Volcano",
    gradient: "linear-gradient(135deg, #F44336 0%, #FF9800 100%)",
  },
  {
    name: "Desert",
    gradient: "linear-gradient(135deg, #FF9800 0%, #FFC107 100%)",
  },
  {
    name: "Iceland",
    gradient: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
  },
];

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
};

const calculateMoveCost = (power: number): number => {
  if (power === 0) return 1; // Status-Attacken
  if (power <= 40) return 2;
  if (power <= 60) return 3;
  if (power <= 80) return 4;
  if (power <= 100) return 5;
  return 6; // Sehr starke Attacken
};

const calculateCooldown = (power: number): number => {
  if (power === 0) return 0; // Status-Attacken haben keinen Cooldown
  if (power <= 40) return 0;
  if (power <= 60) return 1;
  if (power <= 80) return 2;
  if (power <= 100) return 3;
  return 4; // Sehr starke Attacken
};

export default function BattleArena() {
  const [playerTeam, setPlayerTeam] = useState<BattlePokemon[]>([]);
  const [enemyTrainer, setEnemyTrainer] = useState<Trainer | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [battleState, setBattleState] = useState<
    | "select"
    | "pokemon-choice"
    | "move-selection"
    | "battle"
    | "victory"
    | "defeat"
    | "pokemon-select"
    | "move-select"
    | "pokemon-fainted"
  >("select");
  const [playerScore, setPlayerScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [playerActivePokemon, setPlayerActivePokemon] = useState<number>(0);
  const [enemyActivePokemon, setEnemyActivePokemon] = useState<number>(0);
  const [showPokemonMenu, setShowPokemonMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [battleAnimation, setBattleAnimation] = useState<{
    type: string;
    attacker: "player" | "enemy" | "";
    target: "player" | "enemy" | "";
  }>({ type: "", attacker: "", target: "" });
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [selectedPokemonForMoves, setSelectedPokemonForMoves] =
    useState<number>(-1);
  const [selectedMoves, setSelectedMoves] = useState<Move[]>([]);
  const [showScoreSave, setShowScoreSave] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [previousPlayerTurn, setPreviousPlayerTurn] = useState(true);

  useEffect(() => {
    loadTeam();
    loadScore();
  }, []);

  const getCurrentBackground = () => {
    const backgroundIndex = (currentRound - 1) % battleBackgrounds.length;
    return battleBackgrounds[backgroundIndex];
  };

  const loadTeam = async () => {
    const savedTeam = localStorage.getItem("pokemonTeam");
    if (savedTeam) {
      const team: Pokemon[] = JSON.parse(savedTeam);
      const battleTeam = await Promise.all(
        team.map(async (pokemon) => {
          const hp =
            pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat || 50;
          const availableMoves = await getAllPokemonMoves(pokemon.id);

          // Load saved moves or use first 4 available moves
          const savedMoves = localStorage.getItem(
            `pokemon_${pokemon.id}_moves`
          );
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
          };
        })
      );

      setPlayerTeam(battleTeam);
    }
  };

  const getAllPokemonMoves = async (pokemonId: number): Promise<Move[]> => {
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

      return moves.length > 0
        ? moves
        : [
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
    } catch (error) {
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
    }
  };

  const loadScore = () => {
    const savedScore = localStorage.getItem("battleScore");
    const savedRound = localStorage.getItem("currentRound");
    if (savedScore) {
      setPlayerScore(Number.parseInt(savedScore));
    }
    if (savedRound) {
      setCurrentRound(Number.parseInt(savedRound));
    }
  };

  const saveProgress = (newScore: number, newRound: number) => {
    setPlayerScore(newScore);
    setCurrentRound(newRound);
    localStorage.setItem("battleScore", newScore.toString());
    localStorage.setItem("currentRound", newRound.toString());
  };

  const savePokemonMoves = (pokemonId: number, moves: Move[]) => {
    localStorage.setItem(`pokemon_${pokemonId}_moves`, JSON.stringify(moves));
  };

  const selectMovesForPokemon = (pokemonIndex: number) => {
    setSelectedPokemonForMoves(pokemonIndex);
    setBattleState("move-selection");
    setSelectedMoves(playerTeam[pokemonIndex].moves);
  };

  const updatePokemonMoves = (newMoves: Move[]) => {
    // Balancing Check: Maximal 12 Kostenpunkte
    let totalCost = 0;
    newMoves.forEach((move) => {
      totalCost += move.cost;
    });

    if (totalCost > 12) {
      alert("Deine Attacken dürfen maximal 12 Kostenpunkte haben!");
      return;
    }

    const pokemon = playerTeam[selectedPokemonForMoves];
    const updatedTeam = [...playerTeam];
    updatedTeam[selectedPokemonForMoves].moves = newMoves;
    setPlayerTeam(updatedTeam);
    savePokemonMoves(pokemon.id, newMoves);

    // Zurück zum Kampf wenn wir im Kampf waren, sonst zur Pokémon-Auswahl
    if (enemyTrainer) {
      setBattleState("battle");
      setIsPlayerTurn(true);
    } else {
      setBattleState("pokemon-choice");
    }

    setSelectedPokemonForMoves(-1);
    setSelectedMoves([]);
  };

  const selectStartingPokemon = (index: number) => {
    const newTeam = [...playerTeam];
    newTeam.forEach((p) => (p.isActive = false));
    newTeam[index].isActive = true;
    setPlayerTeam(newTeam);
    setPlayerActivePokemon(index);
    generateEnemyTrainer();
  };

  const generateEnemyTrainer = async () => {
    try {
      const trainerNames = [
        "Käfer-Sammler",
        "Youngster",
        "Lass",
        "Gentleman",
        "Elite Vier",
        "Champ",
      ];
      const trainerName =
        trainerNames[Math.min(currentRound - 1, trainerNames.length - 1)];

      const enemyTeam: BattlePokemon[] = [];
      const usedIds = new Set<number>();

      const difficultyMultiplier = Math.min(
        0.5 + (currentRound - 1) * 0.15,
        2.0
      );
      const enemyLevel = Math.min(5 + currentRound * 3, 50);

      for (let i = 0; i < 6; i++) {
        let randomId: number;
        do {
          const minId = Math.min(1 + currentRound * 10, 100);
          const maxId = Math.min(minId + 50, 151);
          randomId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
        } while (usedIds.has(randomId));

        usedIds.add(randomId);

        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${randomId}`
        );
        const pokemon = await response.json();
        const hp =
          pokemon.stats.find((s: any) => s.stat.name === "hp")?.base_stat || 50;

        const scaledHp = Math.floor(hp * difficultyMultiplier);
        const availableMoves = await getAllPokemonMoves(randomId);
        const selectedMoves = availableMoves.slice(0, 4);

        enemyTeam.push({
          ...pokemon,
          currentHp: scaledHp,
          maxHp: scaledHp,
          isActive: i === 0,
          moves: selectedMoves,
          availableMoves: availableMoves,
          stats: pokemon.stats.map((stat: any) => ({
            ...stat,
            base_stat: Math.floor(stat.base_stat * difficultyMultiplier),
          })),
        });
      }

      setEnemyTrainer({
        name: trainerName,
        team: enemyTeam,
      });

      setEnemyActivePokemon(0);
      // Reset cooldowns only when facing a new trainer
      setPlayerTeam((prevTeam) =>
        prevTeam.map((pokemon) => ({
          ...pokemon,
          moves: pokemon.moves.map((move) => ({
            ...move,
            cooldown: 0,
          })),
        }))
      );
      setIsPlayerTurn(true);
      setBattleState("battle");
      setBattleLog([
        `Trainer ${trainerName} fordert dich heraus!`,
        `${playerTeam[playerActivePokemon].name} betritt den Kampf!`,
        `${enemyTeam[0].name} betritt den Kampf!`,
      ]);
    } catch (error) {
      console.error("Error generating enemy trainer:", error);
    }
  };

  const getTypeEffectiveness = (
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

  const calculateDamage = (
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

  const playBattleAnimation = (
    attacker: "player" | "enemy",
    target: "player" | "enemy"
  ) => {
    setBattleAnimation({ type: "attack", attacker, target });
    setTimeout(
      () => setBattleAnimation({ type: "", attacker: "", target: "" }),
      1000
    );
  };

  const switchPokemon = (newIndex: number) => {
    if (newIndex === playerActivePokemon || playerTeam[newIndex].currentHp <= 0)
      return;

    const newTeam = [...playerTeam];
    newTeam[playerActivePokemon].isActive = false;
    newTeam[newIndex].isActive = true;
    setPlayerTeam(newTeam);
    setPlayerActivePokemon(newIndex);
    setShowPokemonMenu(false);
    setBattleState("battle");
    setBattleLog((prev) => [
      ...prev,
      `${newTeam[newIndex].name} betritt den Kampf!`,
    ]);

    console.log("Pokemon switched, checking if enemy can attack");

    // Prüfe ob der Gegner noch angreifen kann
    if (
      enemyTrainer &&
      enemyTrainer.team[enemyActivePokemon] &&
      enemyTrainer.team[enemyActivePokemon].currentHp > 0
    ) {
      console.log("Enemy can attack, starting enemy turn");
      setIsPlayerTurn(false);
    } else {
      console.log("Enemy cannot attack, staying player turn");
      setIsPlayerTurn(true);
    }
  };

  const selectPokemonAfterFaint = (newIndex: number) => {
    if (playerTeam[newIndex].currentHp <= 0) return;

    const newTeam = [...playerTeam];
    newTeam[playerActivePokemon].isActive = false;
    newTeam[newIndex].isActive = true;
    setPlayerTeam(newTeam);
    setPlayerActivePokemon(newIndex);
    setBattleState("battle");
    setBattleLog((prev) => [
      ...prev,
      `${newTeam[newIndex].name} betritt den Kampf!`,
    ]);
    setIsPlayerTurn(true);
  };

  const playerAttack = (moveIndex: number) => {
    if (!enemyTrainer || !isPlayerTurn) return;

    const playerPokemon = playerTeam[playerActivePokemon];
    const enemyPokemon = enemyTrainer.team[enemyActivePokemon];
    const move = playerPokemon.moves[moveIndex];

    if (playerPokemon.currentHp <= 0) return;

    if (move.cooldown > 0) {
      setBattleLog((prev) => [
        ...prev,
        `Attacke ${move.name} hat noch ${move.cooldown} Runden Cooldown!`,
      ]);
      setShowMoveMenu(false);
      setIsPlayerTurn(false);
      return;
    }

    setShowMoveMenu(false);

    // Player attacks enemy - show attack animation from player to enemy
    playBattleAnimation("player", "enemy");

    setTimeout(() => {
      const { damage, effectiveness, isCritical } = calculateDamage(
        playerPokemon,
        enemyPokemon,
        move
      );
      const newEnemyHp = Math.max(0, enemyPokemon.currentHp - damage);

      const newTrainer = { ...enemyTrainer };
      newTrainer.team[enemyActivePokemon].currentHp = newEnemyHp;
      setEnemyTrainer(newTrainer);

      let effectivenessText = "";
      if (effectiveness > 1) effectivenessText = " Es ist sehr effektiv!";
      else if (effectiveness < 1)
        effectivenessText = " Es ist nicht sehr effektiv...";
      else if (effectiveness === 0)
        effectivenessText = " Es hat keine Wirkung...";

      const criticalText = isCritical ? " Volltreffer!" : "";

      setBattleLog((prev) => [
        ...prev,
        `${playerPokemon.name} setzt ${move.name} ein!`,
        `${damage} Schaden verursacht!${effectivenessText}${criticalText}`,
      ]);

      // Setze Cooldown für die verwendete Attacke
      const updatedPlayerTeam = [...playerTeam];
      updatedPlayerTeam[playerActivePokemon].moves[moveIndex].cooldown =
        updatedPlayerTeam[playerActivePokemon].moves[moveIndex].maxCooldown;
      setPlayerTeam(updatedPlayerTeam);

      if (newEnemyHp <= 0) {
        setBattleLog((prev) => [...prev, `${enemyPokemon.name} ist besiegt!`]);

        // Give points for each Pokemon defeated
        const pokemonPoints = 20 * currentRound;
        const newScore = playerScore + pokemonPoints;
        setPlayerScore(newScore);
        localStorage.setItem("battleScore", newScore.toString());

        setBattleLog((prev) => [
          ...prev,
          `+${pokemonPoints} Punkte für besiegtes Pokémon!`,
        ]);

        setTimeout(() => {
          if (!switchToNextPokemon(false)) {
            // Bonus for defeating all trainer's Pokemon
            const trainerBonus = 50 * currentRound;
            const finalScore = newScore + trainerBonus;
            saveProgress(finalScore, currentRound + 1);
            setBattleLog((prev) => [
              ...prev,
              `Du hast Trainer ${enemyTrainer.name} besiegt!`,
              `+${trainerBonus} Trainer-Bonus!`,
              `Gesamt-Score: ${finalScore}`,
            ]);
            setBattleState("victory");
            return;
          } else {
            setIsPlayerTurn(true);
          }
        }, 1500);
      } else {
        // Nur wenn der Gegner noch lebt, Gegnerzug starten
        console.log("Enemy still alive, starting enemy turn");
        setIsPlayerTurn(false);
      }
    }, 1000);
  };

  const enemyAttack = () => {
    console.log("Enemy attack executing", {
      enemyTrainer: !!enemyTrainer,
      isPlayerTurn,
    });

    if (!enemyTrainer) {
      console.log("No enemy trainer, resetting to player turn");
      setIsPlayerTurn(true);
      return;
    }

    const playerPokemon = playerTeam[playerActivePokemon];
    const enemyPokemon = enemyTrainer.team[enemyActivePokemon];

    if (!enemyPokemon || enemyPokemon.currentHp <= 0) {
      console.log("Enemy pokemon is dead or missing, resetting to player turn");
      setIsPlayerTurn(true);
      return;
    }

    if (!playerPokemon || playerPokemon.currentHp <= 0) {
      console.log(
        "Player pokemon is dead or missing, resetting to player turn"
      );
      setIsPlayerTurn(true);
      return;
    }

    const availableMoves = enemyPokemon.moves.filter(
      (move) => move && move.name && move.cooldown === 0
    );
    if (availableMoves.length === 0) {
      console.log("Enemy has no valid moves, using default move");
      availableMoves.push({
        name: "TACKLE",
        type: "normal",
        power: 40,
        pp: 35,
        accuracy: 100,
        cooldown: 0,
        maxCooldown: 0,
        cost: 2,
      });
    }

    const move =
      availableMoves[Math.floor(Math.random() * availableMoves.length)];
    console.log("Enemy using move:", move.name);

    // Enemy attacks player - show attack animation from enemy to player
    playBattleAnimation("enemy", "player");

    setTimeout(() => {
      try {
        const { damage, effectiveness, isCritical } = calculateDamage(
          enemyPokemon,
          playerPokemon,
          move
        );
        const newPlayerHp = Math.max(0, playerPokemon.currentHp - damage);

        const newTeam = [...playerTeam];
        newTeam[playerActivePokemon].currentHp = newPlayerHp;
        setPlayerTeam(newTeam);

        let effectivenessText = "";
        if (effectiveness > 1) effectivenessText = " Es ist sehr effektiv!";
        else if (effectiveness < 1)
          effectivenessText = " Es ist nicht sehr effektiv...";
        else if (effectiveness === 0)
          effectivenessText = " Es hat keine Wirkung...";

        const criticalText = isCritical ? " Volltreffer!" : "";

        setBattleLog((prev) => [
          ...prev,
          `${enemyPokemon.name} setzt ${move.name} ein!`,
          `${damage} Schaden verursacht!${effectivenessText}${criticalText}`,
        ]);

        // Setze Cooldown für die verwendete Attacke
        const updatedEnemyTrainer = { ...enemyTrainer };
        const moveIndex = updatedEnemyTrainer.team[
          enemyActivePokemon
        ].moves.findIndex((m) => m.name === move.name);
        if (moveIndex !== -1) {
          updatedEnemyTrainer.team[enemyActivePokemon].moves[
            moveIndex
          ].cooldown =
            updatedEnemyTrainer.team[enemyActivePokemon].moves[
              moveIndex
            ].maxCooldown;
          setEnemyTrainer(updatedEnemyTrainer);
        }

        if (newPlayerHp <= 0) {
          setBattleLog((prev) => [
            ...prev,
            `${playerPokemon.name} ist besiegt!`,
          ]);

          setTimeout(() => {
            // Prüfe ob noch andere Pokémon verfügbar sind
            const hasAlivePokemon = playerTeam.some(
              (p, index) => index !== playerActivePokemon && p.currentHp > 0
            );

            if (!hasAlivePokemon) {
              setBattleLog((prev) => [
                ...prev,
                "Alle deine Pokémon sind besiegt!",
                "Du hast verloren!",
              ]);
              // Zeige Score-Speicherung an statt sofort zu resetten
              setFinalScore(playerScore);
              setShowScoreSave(true);
              setBattleState("defeat");
              return;
            } else {
              // Zeige Pokémon-Auswahl für den Spieler
              setBattleState("pokemon-fainted");
            }
          }, 1500);
        } else {
          // Wichtig: Spielerzug zurücksetzen nach erfolgreichem Angriff
          console.log("Enemy attack completed, returning to player turn");
          setIsPlayerTurn(true);
        }
      } catch (error) {
        console.error("Error in enemy attack:", error);
        setIsPlayerTurn(true);
      }
    }, 1000);
  };

  const switchToNextPokemon = (isPlayer: boolean) => {
    if (isPlayer) {
      // Für Spieler: Zeige Auswahl-Menü statt automatisch zu wechseln
      return false; // Immer false, damit das Auswahl-Menü gezeigt wird
    } else {
      if (!enemyTrainer) return false;
      // Für Gegner: Suche nach allen lebenden Pokémon
      const nextAlive = enemyTrainer.team.findIndex(
        (p, index) => index !== enemyActivePokemon && p.currentHp > 0
      );
      if (nextAlive !== -1) {
        const newTrainer = { ...enemyTrainer };
        newTrainer.team[enemyActivePokemon].isActive = false;
        newTrainer.team[nextAlive].isActive = true;
        setEnemyTrainer(newTrainer);
        setEnemyActivePokemon(nextAlive);
        setBattleLog((prev) => [
          ...prev,
          `${newTrainer.team[nextAlive].name} betritt den Kampf!`,
        ]);
        return true;
      }
    }
    return false;
  };

  const continueToNextTrainer = () => {
    setBattleState("pokemon-choice");
  };

  const resetBattle = () => {
    setEnemyTrainer(null);
    setBattleLog([]);
    setBattleState("select");
    setPlayerActivePokemon(0);
    setEnemyActivePokemon(0);
    setShowPokemonMenu(false);
    setShowMoveMenu(false);
    setBattleAnimation({ type: "", attacker: "", target: "" });
    setIsPlayerTurn(true);
    loadTeam();
  };

  const toggleMove = (move: Move) => {
    if (selectedMoves.find((m) => m.name === move.name)) {
      setSelectedMoves(selectedMoves.filter((m) => m.name !== move.name));
    } else if (selectedMoves.length < 4) {
      setSelectedMoves([...selectedMoves, move]);
    }
  };

  // Füge diese Funktion nach den anderen Funktionen hinzu
  const forcePlayerTurn = () => {
    console.log("Force player turn called");
    setIsPlayerTurn(true);
    setShowPokemonMenu(false);
    setShowMoveMenu(false);
    setBattleLog((prev) => [...prev, "Zug wurde zurückgesetzt..."]);
  };

  const saveScoreAndReset = async () => {
    // Verbesserte Username-Eingabe mit Validierung
    let username = "";
    while (!username || username.trim().length === 0) {
      username =
        prompt("Gib deinen Namen für das Leaderboard ein (max. 20 Zeichen):") ||
        "";

      if (username === null) {
        // Benutzer hat Cancel gedrückt
        return;
      }

      if (username.trim().length === 0) {
        alert("Bitte gib einen gültigen Namen ein!");
        continue;
      }

      if (username.length > 20) {
        alert("Name ist zu lang! Maximal 20 Zeichen erlaubt.");
        username = username.slice(0, 20);
      }

      break;
    }

    try {
      // Versuche Score in Database zu speichern
      const response = await fetch("/api/leaderboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim().slice(0, 20),
          score: finalScore,
        }),
      });

      if (response.ok) {
        console.log("Score successfully saved to database");
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(
        "Error saving to database, using localStorage fallback:",
        error
      );

      // Fallback zu localStorage wenn Database nicht verfügbar
      const savedLeaderboard = localStorage.getItem("leaderboard");
      const leaderboard = savedLeaderboard ? JSON.parse(savedLeaderboard) : [];

      const newEntry = {
        id: Date.now(),
        username: username.trim().slice(0, 20),
        score: finalScore,
        date: new Date().toLocaleDateString(),
      };

      const updatedLeaderboard = [...leaderboard, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      localStorage.setItem("leaderboard", JSON.stringify(updatedLeaderboard));
    }

    // Progress zurücksetzen
    saveProgress(0, 1);
    setShowScoreSave(false);
    setFinalScore(0);

    // Navigation zum Leaderboard mit kleiner Verzögerung für bessere UX
    setTimeout(() => {
      window.location.href = "/leaderboard";
    }, 500);
  };

  const skipScoreSave = () => {
    saveProgress(0, 1);
    setShowScoreSave(false);
    setFinalScore(0);
  };

  // Add this new useEffect after the existing useEffects:
  useEffect(() => {
    // Handle enemy turn after state updates
    if (
      !isPlayerTurn &&
      battleState === "battle" &&
      !showPokemonMenu &&
      !showMoveMenu
    ) {
      const timer = setTimeout(() => {
        if (
          enemyTrainer &&
          enemyTrainer.team[enemyActivePokemon] &&
          enemyTrainer.team[enemyActivePokemon].currentHp > 0
        ) {
          console.log("Triggering enemy attack from useEffect");
          enemyAttack();
        } else {
          console.log("Enemy not ready, returning to player turn");
          setIsPlayerTurn(true);
        }
      }, 500); // Small delay to ensure state is updated

      return () => clearTimeout(timer);
    }
  }, [
    isPlayerTurn,
    battleState,
    showPokemonMenu,
    showMoveMenu,
    enemyTrainer,
    enemyActivePokemon,
  ]);

  useEffect(() => {
    // Only reduce cooldowns when the turn actually changes
    if (battleState === "battle" && previousPlayerTurn !== isPlayerTurn) {
      setPreviousPlayerTurn(isPlayerTurn);

      // Reduce cooldowns for all Pokemon
      setPlayerTeam((prevTeam) =>
        prevTeam.map((pokemon) => ({
          ...pokemon,
          moves: pokemon.moves.map((move) => ({
            ...move,
            cooldown: Math.max(0, move.cooldown - 1),
          })),
        }))
      );

      setEnemyTrainer((prevTrainer) => {
        if (!prevTrainer) return prevTrainer;

        return {
          ...prevTrainer,
          team: prevTrainer.team.map((pokemon) => ({
            ...pokemon,
            moves: pokemon.moves.map((move) => ({
              ...move,
              cooldown: Math.max(0, move.cooldown - 1),
            })),
          })),
        };
      });
    }
  }, [isPlayerTurn, battleState, previousPlayerTurn]);

  const editPokemonMoves = (pokemonIndex: number) => {
    setSelectedPokemonForMoves(pokemonIndex);
    setSelectedMoves(playerTeam[pokemonIndex].moves);
    setShowPokemonMenu(false);
    setBattleState("move-selection");
  };

  if (playerTeam.length === 0) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-white border-4 border-black p-8">
          <p className="pixel-font text-gameboy-darkest mb-4">
            KEIN POKÉMON IM TEAM
          </p>
          <p className="pixel-font text-sm text-gray-600 mb-4">
            Füge Pokémon zu deinem Team hinzu bevor du kämpfst
          </p>
        </div>
      </div>
    );
  }

  if (battleState === "select") {
    return (
      <div className="space-y-4">
        <div className="bg-white border-4 border-black p-4 text-center">
          <h2 className="pixel-font font-bold text-gameboy-darkest mb-2">
            TRAINER KAMPF
          </h2>
          <p className="pixel-font text-sm text-gray-600 mb-2">
            Aktueller Score: {playerScore}
          </p>
          <p className="pixel-font text-sm text-gray-600 mb-4">
            Runde: {currentRound}
          </p>
          <RetroButton onClick={() => setBattleState("pokemon-choice")}>
            KAMPF STARTEN
          </RetroButton>
        </div>

        <div className="bg-white border-4 border-black p-4">
          <h3 className="pixel-font font-bold text-gameboy-darkest mb-4">
            DEIN TEAM
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playerTeam.map((pokemon, index) => (
              <div
                key={pokemon.id}
                className="bg-white border-4 border-black p-4"
              >
                <div className="text-center space-y-3">
                  <div className="pixel-font text-xs text-gray-600">
                    SLOT {index + 1}
                  </div>
                  <div className="bg-gray-100 p-3 mx-auto w-32 h-32 flex items-center justify-center rounded-lg">
                    <Image
                      src={
                        pokemon.sprites.front_default ||
                        "/placeholder.svg?height=96&width=96"
                      }
                      alt={pokemon.name}
                      width={96}
                      height={96}
                      className="pixelated drop-shadow-lg"
                    />
                  </div>
                  <h3 className="pixel-font text-sm font-bold text-gameboy-darkest">
                    {pokemon.name.charAt(0).toUpperCase() +
                      pokemon.name.slice(1)}
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
                  <p className="pixel-font text-xs text-gray-600">
                    {pokemon.currentHp}/{pokemon.maxHp} HP
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (battleState === "move-selection") {
    const pokemon = playerTeam[selectedPokemonForMoves];
    const currentCost = selectedMoves.reduce(
      (total, move) => total + move.cost,
      0
    );
    const remainingCost = 12 - currentCost;

    return (
      <div className="space-y-4">
        <div className="bg-white border-4 border-black p-4 text-center">
          <h2 className="pixel-font font-bold text-gameboy-darkest mb-2">
            ATTACKEN FÜR {pokemon.name.toUpperCase()} WÄHLEN
          </h2>
          <p className="pixel-font text-sm text-gray-600">
            Wähle 4 Attacken ({selectedMoves.length}/4)
          </p>
          <div className="mt-2 pixel-font text-sm">
            <span className="text-gameboy-darkest">
              Kosten: {currentCost}/12
            </span>
            <span className="text-gray-600 ml-4">
              Verfügbar: {remainingCost}
            </span>
          </div>
          <div className="mt-2 bg-gray-300 border border-black h-3 w-48 mx-auto">
            <div
              className="bg-gameboy-medium h-full transition-all duration-300"
              style={{ width: `${(currentCost / 12) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white border-4 border-black p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
            {pokemon.availableMoves.map((move, index) => {
              const isSelected = selectedMoves.find(
                (m) => m.name === move.name
              );
              const canAdd =
                isSelected ||
                (selectedMoves.length < 4 && currentCost + move.cost <= 12);
              return (
                <RetroButton
                  key={index}
                  onClick={() => toggleMove(move)}
                  variant={
                    isSelected ? "primary" : canAdd ? "secondary" : "secondary"
                  }
                  disabled={!canAdd}
                  className={`h-16 text-xs leading-tight ${
                    !canAdd ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-bold">{move.name}</span>
                    <span className="text-xs opacity-75 mt-1">
                      {move.type.toUpperCase()} | {move.power} PWR | COST:{" "}
                      {move.cost} | CD: {move.maxCooldown}
                    </span>
                  </div>
                </RetroButton>
              );
            })}
          </div>

          <div className="mt-4 flex justify-center gap-2">
            <RetroButton
              onClick={() => updatePokemonMoves(selectedMoves)}
              disabled={selectedMoves.length !== 4}
              variant="primary"
            >
              BESTÄTIGEN
            </RetroButton>
            <RetroButton
              onClick={() => {
                if (enemyTrainer) {
                  setBattleState("battle");
                  setShowPokemonMenu(true);
                } else {
                  setBattleState("pokemon-choice");
                }
                setSelectedPokemonForMoves(-1);
                setSelectedMoves([]);
              }}
              variant="secondary"
            >
              ABBRECHEN
            </RetroButton>
          </div>
        </div>
      </div>
    );
  }

  if (battleState === "pokemon-choice") {
    return (
      <div className="space-y-4">
        <div className="bg-white border-4 border-black p-4 text-center">
          <h2 className="pixel-font font-bold text-gameboy-darkest mb-4">
            WÄHLE DEIN ERSTES POKÉMON
          </h2>
        </div>

        <div className="bg-white border-4 border-black p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playerTeam.map((pokemon, index) => (
              <div
                key={pokemon.id}
                className="bg-white border-4 border-black p-4"
              >
                <div className="text-center space-y-3">
                  <div className="pixel-font text-xs text-gray-600">
                    SLOT {index + 1}
                  </div>
                  <div className="bg-gray-100 p-3 mx-auto w-32 h-32 flex items-center justify-center rounded-lg">
                    <Image
                      src={
                        pokemon.sprites.front_default ||
                        "/placeholder.svg?height=96&width=96"
                      }
                      alt={pokemon.name}
                      width={96}
                      height={96}
                      className="pixelated drop-shadow-lg"
                    />
                  </div>
                  <h3 className="pixel-font text-sm font-bold text-gameboy-darkest">
                    {pokemon.name.charAt(0).toUpperCase() +
                      pokemon.name.slice(1)}
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
                  <p className="pixel-font text-xs text-gray-600">
                    {pokemon.currentHp}/{pokemon.maxHp} HP
                  </p>
                  <div className="space-y-1">
                    <RetroButton
                      onClick={() => selectStartingPokemon(index)}
                      className="text-xs w-full"
                    >
                      WÄHLEN
                    </RetroButton>
                    <RetroButton
                      onClick={() => selectMovesForPokemon(index)}
                      variant="secondary"
                      className="text-xs w-full"
                    >
                      ATTACKEN
                    </RetroButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Neuer State: Pokémon-Auswahl nach Niederlage
  if (battleState === "pokemon-fainted") {
    const alivePokemon = playerTeam.filter(
      (p, index) => index !== playerActivePokemon && p.currentHp > 0
    );

    return (
      <div className="space-y-4">
        <div className="bg-white border-4 border-black p-4 text-center">
          <h2 className="pixel-font font-bold text-gameboy-darkest mb-4">
            WÄHLE DEIN NÄCHSTES POKÉMON
          </h2>
          <p className="pixel-font text-sm text-gray-600">
            Dein {playerTeam[playerActivePokemon].name} ist besiegt!
          </p>
        </div>

        <div className="bg-white border-4 border-black p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {playerTeam.map((pokemon, index) => {
              const isAlive =
                pokemon.currentHp > 0 && index !== playerActivePokemon;
              if (!isAlive) return null;

              return (
                <div key={pokemon.id} className="text-center">
                  <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded">
                    <Image
                      src={
                        pokemon.sprites.front_default ||
                        "/placeholder.svg?height=32&width=32"
                      }
                      alt={pokemon.name}
                      width={32}
                      height={32}
                      className="pixelated"
                    />
                  </div>
                  <h3 className="pixel-font text-sm font-bold text-gameboy-darkest mb-2">
                    {pokemon.name}
                  </h3>
                  <p className="pixel-font text-xs text-gray-600 mb-2">
                    {pokemon.currentHp}/{pokemon.maxHp} HP
                  </p>
                  <RetroButton
                    onClick={() => selectPokemonAfterFaint(index)}
                    className="text-xs w-full"
                  >
                    WÄHLEN
                  </RetroButton>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const currentPlayerPokemon = playerTeam[playerActivePokemon];
  const currentEnemyPokemon = enemyTrainer?.team[enemyActivePokemon];
  const currentBackground = getCurrentBackground();

  return (
    <div className="space-y-4">
      {/* Battle Status - Mobile Optimized */}
      <div className="bg-white border-4 border-black p-2 md:p-2 text-center">
        <p className="pixel-font text-xs md:text-sm font-bold text-gameboy-darkest">
          VS TRAINER {enemyTrainer?.name?.toUpperCase()} | RUNDE {currentRound}{" "}
          | SCORE: {playerScore}
        </p>
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 pixel-font text-xs text-gray-600 mt-1">
          <span>{isPlayerTurn ? "DEIN ZUG" : "GEGNER ZUG"}</span>
          <span>Arena: {currentBackground.name}</span>
          {enemyTrainer && (
            <span>
              Gegner: {enemyTrainer.team.filter((p) => p.currentHp > 0).length}
              /6 Pokémon
            </span>
          )}
        </div>
      </div>

      {/* Stadium Battle Field - Vertical Stack Layout */}
      <div
        className="relative border-4 border-black min-h-[500px] md:min-h-[600px] overflow-hidden flex flex-col"
        style={{
          background: currentBackground.gradient,
        }}
      >
        {/* Enemy Pokemon Info Box - Top */}
        {currentEnemyPokemon && (
          <div className="absolute top-4 right-24 transform -translate-x-1 z-10">
            <div className="bg-gameboy-light border-2 border-black p-2 md:p-3 rounded shadow-lg">
              <div className="pixel-font text-xs md:text-sm font-bold text-gameboy-darkest mb-1 md:mb-2">
                {currentEnemyPokemon.name.toUpperCase()} ♂ Lv.
                {5 + currentRound * 3}
              </div>
              <div className="bg-gray-300 border border-black h-2 md:h-3 w-32 md:w-40">
                <div
                  className="bg-green-500 h-full transition-all duration-500"
                  style={{
                    width: `${
                      (currentEnemyPokemon.currentHp /
                        currentEnemyPokemon.maxHp) *
                      100
                    }%`,
                  }}
                />
              </div>
              <div className="pixel-font text-xs text-gameboy-darkest mt-1">
                HP: {currentEnemyPokemon.currentHp}/{currentEnemyPokemon.maxHp}
              </div>
            </div>
          </div>
        )}

        {/* Enemy Pokemon Sprite - Top Right */}
        {currentEnemyPokemon && (
          <div className="absolute top-10 md:top-10 right-1 md:right-1 z-50">
            <div
              className={`relative transition-all duration-300 ${
                battleAnimation.target === "enemy" &&
                battleAnimation.type === "attack"
                  ? "animate-pulse scale-110"
                  : battleAnimation.attacker === "enemy" &&
                    battleAnimation.type === "attack"
                  ? "animate-bounce"
                  : ""
              }`}
            >
              <Image
                src={
                  currentEnemyPokemon.sprites.front_default ||
                  "/placeholder.svg?height=120&width=120"
                }
                alt={currentEnemyPokemon.name}
                width={160} // Minimum 160px
                height={160}
                className="pixelated drop-shadow-lg md:w-60 md:h-60 lg:w-70 lg:h-70"
                style={{
                  filter:
                    battleAnimation.target === "enemy" &&
                    battleAnimation.type === "attack"
                      ? "brightness(1.5) contrast(1.2) hue-rotate(15deg)"
                      : "none",
                }}
              />
              {/* Attack indicator when enemy is attacking */}
              {battleAnimation.attacker === "enemy" &&
                battleAnimation.type === "attack" && (
                  <div className="absolute -top-2 md:-top-3 -right-2 md:-right-3 text-sm md:text-lg animate-ping">
                    ⚡
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Player Pokemon Sprite - Bottom Left */}
        {currentPlayerPokemon && (
          <div className="absolute bottom-12 md:bottom-12 left-1 md:left-1">
            <div
              className={`relative transition-all duration-300 ${
                battleAnimation.target === "player" &&
                battleAnimation.type === "attack"
                  ? "animate-pulse scale-110"
                  : battleAnimation.attacker === "player" &&
                    battleAnimation.type === "attack"
                  ? "animate-bounce"
                  : ""
              }`}
            >
              <Image
                src={
                  currentPlayerPokemon.sprites.back_default ||
                  currentPlayerPokemon.sprites.front_default ||
                  "/placeholder.svg?height=160&width=160" ||
                  "/placeholder.svg"
                }
                alt={currentPlayerPokemon.name}
                width={180} // Minimum 180px
                height={180}
                className="pixelated drop-shadow-lg md:w-80 md:h-80 lg:w-90 lg:h-90"
                style={{
                  filter:
                    battleAnimation.target === "player" &&
                    battleAnimation.type === "attack"
                      ? "brightness(1.5) contrast(1.2) hue-rotate(15deg)"
                      : "none",
                }}
              />
              {/* Attack indicator when player is attacking */}
              {battleAnimation.attacker === "player" &&
                battleAnimation.type === "attack" && (
                  <div className="absolute -top-3 md:-top-4 -right-3 md:-right-4 text-lg md:text-2xl animate-ping">
                    ⚡
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Player Pokemon Info Box - Bottom */}
        {currentPlayerPokemon && (
          <div className="absolute bottom-2 left-20 transform -translate-x-1">
            <div className="bg-gameboy-light border-2 border-black p-2 md:p-3 rounded shadow-lg">
              <div className="pixel-font text-xs md:text-sm font-bold text-gameboy-darkest mb-1 md:mb-2">
                {currentPlayerPokemon.name.toUpperCase()} ♂ Lv.
                {Math.floor(
                  currentPlayerPokemon.stats.reduce(
                    (sum, stat) => sum + stat.base_stat,
                    0
                  ) / 50
                )}
              </div>
              <div className="bg-gray-300 border border-black h-2 md:h-3 w-32 md:w-40 mb-1 md:mb-2">
                <div
                  className="bg-green-500 h-full transition-all duration-500"
                  style={{
                    width: `${
                      (currentPlayerPokemon.currentHp /
                        currentPlayerPokemon.maxHp) *
                      100
                    }%`,
                  }}
                />
              </div>
              <div className="pixel-font text-xs text-gameboy-darkest">
                HP: {currentPlayerPokemon.currentHp}/
                {currentPlayerPokemon.maxHp}
              </div>
            </div>
          </div>
        )}

        {/* Battle Effects Overlay - Adjusted for vertical layout */}
        {battleAnimation.type === "attack" && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Attack beam effect - From player (bottom left) to enemy (top right) */}
            {battleAnimation.attacker === "player" && (
              <div className="absolute bottom-1/3 left-1/4 w-1/2 h-1 md:h-2 bg-yellow-400 opacity-80 animate-pulse transform -rotate-12"></div>
            )}
            {/* Attack beam effect - From enemy (top right) to player (bottom left) */}
            {battleAnimation.attacker === "enemy" && (
              <div className="absolute top-1/3 right-1/4 w-1/2 h-1 md:h-2 bg-red-400 opacity-80 animate-pulse transform rotate-12"></div>
            )}

            {/* Impact effects - Adjusted positions */}
            {battleAnimation.target === "enemy" && (
              <div className="absolute top-1/4 right-1/4 text-3xl md:text-5xl animate-bounce">
                💥
              </div>
            )}
            {battleAnimation.target === "player" && (
              <div className="absolute bottom-1/3 left-1/4 text-4xl md:text-6xl animate-bounce">
                💥
              </div>
            )}
          </div>
        )}
      </div>

      {/* Battle Log - Mobile Optimized */}
      <div className="bg-white border-4 border-black p-2 md:p-4">
        <div className="bg-gameboy-light border-2 border-black p-2 md:p-3 h-20 md:h-24 overflow-y-auto">
          {battleLog.slice(-3).map((log, index) => (
            <div
              key={index}
              className="pixel-font text-xs text-gameboy-darkest mb-1"
            >
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Battle Menu */}
      {battleState === "battle" &&
        !showPokemonMenu &&
        !showMoveMenu &&
        isPlayerTurn && (
          <div className="bg-white border-4 border-black p-4">
            <div className="grid grid-cols-2 gap-2">
              <RetroButton
                onClick={() => setShowMoveMenu(true)}
                className="h-12"
              >
                KAMPF
              </RetroButton>
              <RetroButton
                onClick={() => setShowPokemonMenu(true)}
                className="h-12"
                variant="secondary"
              >
                POKÉMON
              </RetroButton>
              <RetroButton className="h-12" variant="secondary" disabled>
                BEUTEL
              </RetroButton>
              <RetroButton
                className="h-12"
                variant="danger"
                onClick={giveUpBattle}
              >
                AUFGEBEN
              </RetroButton>
            </div>
          </div>
        )}

      {/* Fallback wenn das Spiel hängt */}
      {battleState === "battle" &&
        !showPokemonMenu &&
        !showMoveMenu &&
        !isPlayerTurn && (
          <div className="bg-white border-4 border-black p-4 text-center">
            <p className="pixel-font text-sm text-gray-600 mb-2">
              Warte auf Gegnerzug...
            </p>
            <RetroButton
              onClick={forcePlayerTurn}
              variant="secondary"
              className="text-xs"
            >
              ZUG ZURÜCKSETZEN
            </RetroButton>
          </div>
        )}

      {/* Move Selection Menu */}
      {showMoveMenu && currentPlayerPokemon && isPlayerTurn && (
        <div className="bg-white border-4 border-black p-4">
          <h3 className="pixel-font font-bold text-gameboy-darkest mb-4">
            ATTACKE WÄHLEN
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {currentPlayerPokemon.moves.map((move, index) => (
              <RetroButton
                key={index}
                onClick={() => playerAttack(index)}
                className="h-16 text-xs leading-tight"
                variant={move.power > 0 ? "primary" : "secondary"}
                disabled={move.cooldown > 0}
              >
                <div className="flex flex-col items-center">
                  <span className="font-bold">{move.name}</span>
                  <span className="text-xs opacity-75 mt-1">
                    {move.type.toUpperCase()} | {move.power} | CD:{" "}
                    {move.cooldown}
                  </span>
                </div>
              </RetroButton>
            ))}
          </div>
          <div className="mt-2">
            <RetroButton
              onClick={() => setShowMoveMenu(false)}
              variant="secondary"
              className="text-xs"
            >
              ZURÜCK
            </RetroButton>
          </div>
        </div>
      )}

      {/* Pokemon Selection Menu */}
      {showPokemonMenu && isPlayerTurn && (
        <div className="bg-white border-4 border-black p-4">
          <h3 className="pixel-font font-bold text-gameboy-darkest mb-4">
            POKÉMON WÄHLEN
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {playerTeam.map((pokemon, index) => (
              <div
                key={pokemon.id}
                className="flex items-center gap-2 p-2 border-2 border-black bg-gameboy-light"
              >
                <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded">
                  <Image
                    src={
                      pokemon.sprites.front_default ||
                      "/placeholder.svg?height=32&width=32"
                    }
                    alt={pokemon.name}
                    width={32}
                    height={32}
                    className="pixelated"
                  />
                </div>
                <div className="flex-1">
                  <div className="pixel-font text-sm font-bold text-gameboy-darkest">
                    {pokemon.name.toUpperCase()}
                  </div>
                  <div className="pixel-font text-xs text-gray-600">
                    {pokemon.currentHp}/{pokemon.maxHp} HP
                  </div>
                </div>
                <div className="flex gap-1">
                  <RetroButton
                    onClick={() => switchPokemon(index)}
                    disabled={
                      index === playerActivePokemon || pokemon.currentHp <= 0
                    }
                    className="text-xs px-2 py-1"
                    variant={pokemon.currentHp > 0 ? "primary" : "danger"}
                  >
                    {index === playerActivePokemon
                      ? "AKTIV"
                      : pokemon.currentHp > 0
                      ? "WECHSELN"
                      : "K.O."}
                  </RetroButton>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <RetroButton
              onClick={() => setShowPokemonMenu(false)}
              variant="secondary"
              className="text-xs"
            >
              ZURÜCK
            </RetroButton>
          </div>
        </div>
      )}

      {/* Victory/Defeat Actions */}
      {battleState === "victory" && (
        <div className="bg-white border-4 border-black p-4 text-center">
          <div className="space-y-2">
            <RetroButton onClick={continueToNextTrainer}>
              NÄCHSTER TRAINER
            </RetroButton>
            <RetroButton onClick={resetBattle} variant="secondary">
              NEUER KAMPF
            </RetroButton>
            <RetroButton
              onClick={() => {
                setFinalScore(playerScore);
                setShowScoreSave(true);
              }}
              variant="danger"
            >
              AUFHÖREN
            </RetroButton>
          </div>
        </div>
      )}

      {battleState === "defeat" && !showScoreSave && (
        <div className="bg-white border-4 border-black p-4 text-center">
          <RetroButton onClick={resetBattle}>NEUER KAMPF</RetroButton>
        </div>
      )}

      {showScoreSave && (
        <div className="bg-white border-4 border-black p-4 text-center space-y-4">
          <h3 className="pixel-font font-bold text-gameboy-darkest">
            SPIEL BEENDET!
          </h3>
          <p className="pixel-font text-sm text-gray-600">
            Dein finaler Score: {finalScore}
          </p>
          <p className="pixel-font text-xs text-gray-600">
            Möchtest du deinen Score speichern?
          </p>
          <div className="flex justify-center gap-2">
            <RetroButton onClick={saveScoreAndReset}>
              SCORE SPEICHERN
            </RetroButton>
            <RetroButton onClick={skipScoreSave} variant="secondary">
              ÜBERSPRINGEN
            </RetroButton>
          </div>
        </div>
      )}
    </div>
  );

  function giveUpBattle() {
    if (
      confirm("Möchtest du aufgeben? Dein aktueller Score wird gespeichert.")
    ) {
      setFinalScore(playerScore);
      setShowScoreSave(true);
      setBattleState("defeat");
    }
  }
}

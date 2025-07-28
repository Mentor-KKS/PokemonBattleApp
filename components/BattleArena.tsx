"use client";

import { useState, useEffect } from "react";
import RetroButton from "./retro-button";
import PokemonCard from "./PokemonCard";
import BattleField from "./BattleField";
import MoveSelection from "./MoveSelection";
import BattleMenus from "./BattleMenus";
import {
  BattlePokemon,
  Trainer,
  Move,
  battleBackgrounds,
  Pokemon,
} from "@/types/pokemon";
import {
  calculateDamage,
  getAllPokemonMoves,
  convertToBattlePokemon,
  savePokemonMoves,
  saveProgress,
  loadProgress,
  formatEffectivenessText,
} from "@/utils/battleUtils";

type BattlePhase =
  | "select"
  | "pokemon-choice"
  | "move-selection"
  | "battle"
  | "victory"
  | "defeat"
  | "pokemon-fainted";

export default function BattleArena() {
  const [playerTeam, setPlayerTeam] = useState<BattlePokemon[]>([]);
  const [enemyTrainer, setEnemyTrainer] = useState<Trainer | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [battlePhase, setBattlePhase] = useState<BattlePhase>("select");
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
  const [showScoreSave, setShowScoreSave] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    loadTeam();
    const progress = loadProgress();
    setPlayerScore(progress.score);
    setCurrentRound(progress.round);
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
        team.map((pokemon) => convertToBattlePokemon(pokemon))
      );
      setPlayerTeam(battleTeam);
    }
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
          originalMoves: pokemon.moves,
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
      resetCooldowns();
      setIsPlayerTurn(true);
      setBattlePhase("battle");
      setBattleLog([
        `Trainer ${trainerName} fordert dich heraus!`,
        `${playerTeam[playerActivePokemon].name} betritt den Kampf!`,
        `${enemyTeam[0].name} betritt den Kampf!`,
      ]);
    } catch (error) {
      console.error("Error generating enemy trainer:", error);
    }
  };

  const resetCooldowns = () => {
    setPlayerTeam((prevTeam) =>
      prevTeam.map((pokemon) => ({
        ...pokemon,
        moves: pokemon.moves.map((move) => ({
          ...move,
          cooldown: 0,
        })),
      }))
    );
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

  const playerAttack = (moveIndex: number) => {
    if (!enemyTrainer || !isPlayerTurn) return;

    const playerPokemon = playerTeam[playerActivePokemon];
    const enemyPokemon = enemyTrainer.team[enemyActivePokemon];
    const move = playerPokemon.moves[moveIndex];

    if (playerPokemon.currentHp <= 0 || move.cooldown > 0) {
      if (move.cooldown > 0) {
        setBattleLog((prev) => [
          ...prev,
          `Attacke ${move.name} hat noch ${move.cooldown} Runden Cooldown!`,
        ]);
      }
      setShowMoveMenu(false);
      setIsPlayerTurn(false);
      return;
    }

    setShowMoveMenu(false);
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

      const effectivenessText = formatEffectivenessText(effectiveness);
      const criticalText = isCritical ? " Volltreffer!" : "";

      setBattleLog((prev) => [
        ...prev,
        `${playerPokemon.name} setzt ${move.name} ein!`,
        `${damage} Schaden verursacht!${effectivenessText}${criticalText}`,
      ]);

      // Set cooldown
      const updatedPlayerTeam = [...playerTeam];
      updatedPlayerTeam[playerActivePokemon].moves[moveIndex].cooldown =
        updatedPlayerTeam[playerActivePokemon].moves[moveIndex].maxCooldown;
      setPlayerTeam(updatedPlayerTeam);

      if (newEnemyHp <= 0) {
        handlePokemonDefeated(true);
      } else {
        setIsPlayerTurn(false);
      }
    }, 1000);
  };

  const enemyAttack = () => {
    if (!enemyTrainer) return;

    const playerPokemon = playerTeam[playerActivePokemon];
    const enemyPokemon = enemyTrainer.team[enemyActivePokemon];

    if (
      !enemyPokemon ||
      enemyPokemon.currentHp <= 0 ||
      !playerPokemon ||
      playerPokemon.currentHp <= 0
    ) {
      setIsPlayerTurn(true);
      return;
    }

    const availableMoves = enemyPokemon.moves.filter(
      (move) => move && move.name && move.cooldown === 0
    );
    if (availableMoves.length === 0) {
      setIsPlayerTurn(true);
      return;
    }

    const move =
      availableMoves[Math.floor(Math.random() * availableMoves.length)];
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

        const effectivenessText = formatEffectivenessText(effectiveness);
        const criticalText = isCritical ? " Volltreffer!" : "";

        setBattleLog((prev) => [
          ...prev,
          `${enemyPokemon.name} setzt ${move.name} ein!`,
          `${damage} Schaden verursacht!${effectivenessText}${criticalText}`,
        ]);

        // Set cooldown
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
          handlePokemonDefeated(false);
        } else {
          setIsPlayerTurn(true);
        }
      } catch (error) {
        console.error("Error in enemy attack:", error);
        setIsPlayerTurn(true);
      }
    }, 1000);
  };

  const handlePokemonDefeated = (isEnemyDefeated: boolean) => {
    if (isEnemyDefeated) {
      const pokemonPoints = 20 * currentRound;
      const newScore = playerScore + pokemonPoints;
      setPlayerScore(newScore);
      localStorage.setItem("battleScore", newScore.toString());

      setBattleLog((prev) => [
        ...prev,
        `${enemyTrainer?.team[enemyActivePokemon].name} ist besiegt!`,
        `+${pokemonPoints} Punkte für besiegtes Pokémon!`,
      ]);

      setTimeout(() => {
        if (!switchToNextPokemon(false)) {
          // Trainer defeated
          const trainerBonus = 50 * currentRound;
          const finalScore = newScore + trainerBonus;
          saveProgress(finalScore, currentRound + 1);
          setBattleLog((prev) => [
            ...prev,
            `Du hast Trainer ${enemyTrainer?.name} besiegt!`,
            `+${trainerBonus} Trainer-Bonus!`,
            `Gesamt-Score: ${finalScore}`,
          ]);
          setBattlePhase("victory");
        } else {
          setIsPlayerTurn(true);
        }
      }, 1500);
    } else {
      setBattleLog((prev) => [
        ...prev,
        `${playerTeam[playerActivePokemon].name} ist besiegt!`,
      ]);

      setTimeout(() => {
        const hasAlivePokemon = playerTeam.some(
          (p, index) => index !== playerActivePokemon && p.currentHp > 0
        );

        if (!hasAlivePokemon) {
          setBattleLog((prev) => [
            ...prev,
            "Alle deine Pokémon sind besiegt!",
            "Du hast verloren!",
          ]);
          setFinalScore(playerScore);
          setShowScoreSave(true);
          setBattlePhase("defeat");
        } else {
          setBattlePhase("pokemon-fainted");
        }
      }, 1500);
    }
  };

  const switchToNextPokemon = (isPlayer: boolean) => {
    if (isPlayer) {
      return false;
    } else {
      if (!enemyTrainer) return false;
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

  const switchPokemon = (newIndex: number) => {
    if (newIndex === playerActivePokemon || playerTeam[newIndex].currentHp <= 0)
      return;

    const newTeam = [...playerTeam];
    newTeam[playerActivePokemon].isActive = false;
    newTeam[newIndex].isActive = true;
    setPlayerTeam(newTeam);
    setPlayerActivePokemon(newIndex);
    setShowPokemonMenu(false);
    setBattlePhase("battle");
    setBattleLog((prev) => [
      ...prev,
      `${newTeam[newIndex].name} betritt den Kampf!`,
    ]);

    if (
      enemyTrainer &&
      enemyTrainer.team[enemyActivePokemon] &&
      enemyTrainer.team[enemyActivePokemon].currentHp > 0
    ) {
      setIsPlayerTurn(false);
    } else {
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
    setBattlePhase("battle");
    setBattleLog((prev) => [
      ...prev,
      `${newTeam[newIndex].name} betritt den Kampf!`,
    ]);
    setIsPlayerTurn(true);
  };

  const selectMovesForPokemon = (pokemonIndex: number) => {
    setSelectedPokemonForMoves(pokemonIndex);
    setBattlePhase("move-selection");
  };

  const updatePokemonMoves = (newMoves: Move[]) => {
    const totalCost = newMoves.reduce((total, move) => total + move.cost, 0);

    if (totalCost > 12) {
      alert("Deine Attacken dürfen maximal 12 Kostenpunkte haben!");
      return;
    }

    const pokemon = playerTeam[selectedPokemonForMoves];
    const updatedTeam = [...playerTeam];
    updatedTeam[selectedPokemonForMoves].moves = newMoves;
    setPlayerTeam(updatedTeam);
    savePokemonMoves(pokemon.id, newMoves);

    if (enemyTrainer) {
      setBattlePhase("battle");
      setIsPlayerTurn(true);
    } else {
      setBattlePhase("pokemon-choice");
    }

    setSelectedPokemonForMoves(-1);
  };

  const resetBattle = () => {
    setEnemyTrainer(null);
    setBattleLog([]);
    setBattlePhase("select");
    setPlayerActivePokemon(0);
    setEnemyActivePokemon(0);
    setShowPokemonMenu(false);
    setShowMoveMenu(false);
    setBattleAnimation({ type: "", attacker: "", target: "" });
    setIsPlayerTurn(true);
    loadTeam();
  };

  const giveUpBattle = () => {
    if (
      confirm("Möchtest du aufgeben? Dein aktueller Score wird gespeichert.")
    ) {
      setFinalScore(playerScore);
      setShowScoreSave(true);
      setBattlePhase("defeat");
    }
  };

  const saveScoreAndReset = async () => {
    let username = "";
    while (!username || username.trim().length === 0) {
      username =
        prompt("Gib deinen Namen für das Leaderboard ein (max. 20 Zeichen):") ||
        "";

      if (username === null) return;

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
      const response = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim().slice(0, 20),
          score: finalScore,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(
        "Error saving to database, using localStorage fallback:",
        error
      );

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

    saveProgress(0, 1);
    setShowScoreSave(false);
    setFinalScore(0);

    setTimeout(() => {
      window.location.href = "/leaderboard";
    }, 500);
  };

  const skipScoreSave = () => {
    saveProgress(0, 1);
    setShowScoreSave(false);
    setFinalScore(0);
  };

  // Handle enemy turn
  useEffect(() => {
    if (
      !isPlayerTurn &&
      battlePhase === "battle" &&
      !showPokemonMenu &&
      !showMoveMenu
    ) {
      const timer = setTimeout(() => {
        if (
          enemyTrainer &&
          enemyTrainer.team[enemyActivePokemon] &&
          enemyTrainer.team[enemyActivePokemon].currentHp > 0
        ) {
          enemyAttack();
        } else {
          setIsPlayerTurn(true);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    isPlayerTurn,
    battlePhase,
    showPokemonMenu,
    showMoveMenu,
    enemyTrainer,
    enemyActivePokemon,
  ]);

  // Reduce cooldowns on turn change
  useEffect(() => {
    if (battlePhase === "battle") {
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
  }, [isPlayerTurn, battlePhase]);

  // Early returns for empty team
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

  const currentPlayerPokemon = playerTeam[playerActivePokemon];
  const currentEnemyPokemon = enemyTrainer?.team[enemyActivePokemon];
  const currentBackground = getCurrentBackground();

  return (
    <div className="space-y-4">
      {/* Battle Status */}
      {battlePhase === "battle" && (
        <div className="bg-white border-4 border-black p-2 md:p-2 text-center">
          <p className="pixel-font text-xs md:text-sm font-bold text-gameboy-darkest">
            VS TRAINER {enemyTrainer?.name?.toUpperCase()} | RUNDE{" "}
            {currentRound} | SCORE: {playerScore}
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 pixel-font text-xs text-gray-600 mt-1">
            <span>{isPlayerTurn ? "DEIN ZUG" : "GEGNER ZUG"}</span>
            <span>Arena: {currentBackground.name}</span>
            {enemyTrainer && (
              <span>
                Gegner:{" "}
                {enemyTrainer.team.filter((p) => p.currentHp > 0).length}/6
                Pokémon
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      {battlePhase === "select" && (
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
            <RetroButton onClick={() => setBattlePhase("pokemon-choice")}>
              KAMPF STARTEN
            </RetroButton>
          </div>

          <div className="bg-white border-4 border-black p-4">
            <h3 className="pixel-font font-bold text-gameboy-darkest mb-4">
              DEIN TEAM
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playerTeam.map((pokemon, index) => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  index={index}
                  variant="team"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {battlePhase === "pokemon-choice" && (
        <div className="space-y-4">
          <div className="bg-white border-4 border-black p-4 text-center">
            <h2 className="pixel-font font-bold text-gameboy-darkest mb-4">
              WÄHLE DEIN ERSTES POKÉMON
            </h2>
          </div>

          <div className="bg-white border-4 border-black p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playerTeam.map((pokemon, index) => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  index={index}
                  showActions={true}
                  onSelect={selectStartingPokemon}
                  onEditMoves={selectMovesForPokemon}
                  variant="team"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {battlePhase === "move-selection" && selectedPokemonForMoves >= 0 && (
        <MoveSelection
          pokemon={playerTeam[selectedPokemonForMoves]}
          onConfirm={updatePokemonMoves}
          onCancel={() => {
            if (enemyTrainer) {
              setBattlePhase("battle");
              setShowPokemonMenu(true);
            } else {
              setBattlePhase("pokemon-choice");
            }
            setSelectedPokemonForMoves(-1);
          }}
          initialMoves={playerTeam[selectedPokemonForMoves]?.moves || []}
        />
      )}

      {battlePhase === "pokemon-fainted" && (
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
                  <PokemonCard
                    key={pokemon.id}
                    pokemon={pokemon}
                    index={index}
                    showActions={true}
                    onSelect={selectPokemonAfterFaint}
                    variant="battle"
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {battlePhase === "battle" &&
        currentPlayerPokemon &&
        currentEnemyPokemon && (
          <>
            <BattleField
              playerPokemon={currentPlayerPokemon}
              enemyPokemon={currentEnemyPokemon}
              background={currentBackground}
              currentRound={currentRound}
              battleAnimation={battleAnimation}
            />

            {/* Battle Log */}
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

            <BattleMenus
              showMoveMenu={showMoveMenu}
              showPokemonMenu={showPokemonMenu}
              currentPlayerPokemon={currentPlayerPokemon}
              playerTeam={playerTeam}
              playerActivePokemon={playerActivePokemon}
              isPlayerTurn={isPlayerTurn}
              onAttack={playerAttack}
              onSwitchPokemon={switchPokemon}
              onShowMoves={() => setShowMoveMenu(true)}
              onShowPokemon={() => setShowPokemonMenu(true)}
              onGiveUp={giveUpBattle}
              onCloseMoveMenu={() => setShowMoveMenu(false)}
              onClosePokemonMenu={() => setShowPokemonMenu(false)}
            />

            {/* Fallback when game hangs */}
            {!showPokemonMenu && !showMoveMenu && !isPlayerTurn && (
              <div className="bg-white border-4 border-black p-4 text-center">
                <p className="pixel-font text-sm text-gray-600 mb-2">
                  Warte auf Gegnerzug...
                </p>
                <RetroButton
                  onClick={() => setIsPlayerTurn(true)}
                  variant="secondary"
                  className="text-xs"
                >
                  ZUG ZURÜCKSETZEN
                </RetroButton>
              </div>
            )}
          </>
        )}

      {/* Victory/Defeat Actions */}
      {battlePhase === "victory" && (
        <div className="bg-white border-4 border-black p-4 text-center">
          <div className="space-y-2">
            <RetroButton onClick={() => setBattlePhase("pokemon-choice")}>
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

      {battlePhase === "defeat" && !showScoreSave && (
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
}

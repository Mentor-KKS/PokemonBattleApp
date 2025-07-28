import RetroButton from "./retro-button";
import PokemonCard from "./PokemonCard";
import { BattlePokemon, Move } from "../types/pokemon";

interface BattleMenusProps {
  showMoveMenu: boolean;
  showPokemonMenu: boolean;
  currentPlayerPokemon: BattlePokemon;
  playerTeam: BattlePokemon[];
  playerActivePokemon: number;
  isPlayerTurn: boolean;
  onAttack: (moveIndex: number) => void;
  onSwitchPokemon: (index: number) => void;
  onShowMoves: () => void;
  onShowPokemon: () => void;
  onGiveUp: () => void;
  onCloseMoveMenu: () => void;
  onClosePokemonMenu: () => void;
}

export default function BattleMenus({
  showMoveMenu,
  showPokemonMenu,
  currentPlayerPokemon,
  playerTeam,
  playerActivePokemon,
  isPlayerTurn,
  onAttack,
  onSwitchPokemon,
  onShowMoves,
  onShowPokemon,
  onGiveUp,
  onCloseMoveMenu,
  onClosePokemonMenu,
}: BattleMenusProps) {
  // Main Battle Menu
  if (!showMoveMenu && !showPokemonMenu && isPlayerTurn) {
    return (
      <div className="bg-white border-4 border-black p-4">
        <div className="grid grid-cols-2 gap-2">
          <RetroButton onClick={onShowMoves} className="h-12">
            KAMPF
          </RetroButton>
          <RetroButton
            onClick={onShowPokemon}
            className="h-12"
            variant="secondary"
          >
            POKÉMON
          </RetroButton>
          <RetroButton className="h-12" variant="secondary" disabled>
            BEUTEL
          </RetroButton>
          <RetroButton className="h-12" variant="danger" onClick={onGiveUp}>
            AUFGEBEN
          </RetroButton>
        </div>
      </div>
    );
  }

  // Move Selection Menu
  if (showMoveMenu && currentPlayerPokemon && isPlayerTurn) {
    return (
      <div className="bg-white border-4 border-black p-4">
        <h3 className="pixel-font font-bold text-gameboy-darkest mb-4">
          ATTACKE WÄHLEN
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {currentPlayerPokemon.moves.map((move, index) => (
            <RetroButton
              key={index}
              onClick={() => onAttack(index)}
              className="h-16 text-xs leading-tight"
              variant={move.power > 0 ? "primary" : "secondary"}
              disabled={move.cooldown > 0}
            >
              <div className="flex flex-col items-center">
                <span className="font-bold">{move.name}</span>
                <span className="text-xs opacity-75 mt-1">
                  {move.type.toUpperCase()} | {move.power} | CD: {move.cooldown}
                </span>
              </div>
            </RetroButton>
          ))}
        </div>
        <div className="mt-2">
          <RetroButton
            onClick={onCloseMoveMenu}
            variant="secondary"
            className="text-xs"
          >
            ZURÜCK
          </RetroButton>
        </div>
      </div>
    );
  }

  // Pokemon Selection Menu
  if (showPokemonMenu && isPlayerTurn) {
    return (
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
                <img
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
                  onClick={() => onSwitchPokemon(index)}
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
            onClick={onClosePokemonMenu}
            variant="secondary"
            className="text-xs"
          >
            ZURÜCK
          </RetroButton>
        </div>
      </div>
    );
  }

  return null;
}

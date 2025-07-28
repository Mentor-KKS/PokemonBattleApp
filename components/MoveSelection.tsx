import { useState } from "react";
import RetroButton from "./retro-button";
import { Move, BattlePokemon } from "../types/pokemon";

interface MoveSelectionProps {
  pokemon: BattlePokemon;
  onConfirm: (moves: Move[]) => void;
  onCancel: () => void;
  initialMoves?: Move[];
}

export default function MoveSelection({
  pokemon,
  onConfirm,
  onCancel,
  initialMoves = [],
}: MoveSelectionProps) {
  const [selectedMoves, setSelectedMoves] = useState<Move[]>(initialMoves);

  const currentCost = selectedMoves.reduce(
    (total, move) => total + move.cost,
    0
  );
  const remainingCost = 12 - currentCost;

  const toggleMove = (move: Move) => {
    if (selectedMoves.find((m) => m.name === move.name)) {
      setSelectedMoves(selectedMoves.filter((m) => m.name !== move.name));
    } else if (selectedMoves.length < 4) {
      setSelectedMoves([...selectedMoves, move]);
    }
  };

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
          <span className="text-gameboy-darkest">Kosten: {currentCost}/12</span>
          <span className="text-gray-600 ml-4">Verfügbar: {remainingCost}</span>
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
            const isSelected = selectedMoves.find((m) => m.name === move.name);
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
            onClick={() => onConfirm(selectedMoves)}
            disabled={selectedMoves.length !== 4}
            variant="primary"
          >
            BESTÄTIGEN
          </RetroButton>
          <RetroButton onClick={onCancel} variant="secondary">
            ABBRECHEN
          </RetroButton>
        </div>
      </div>
    </div>
  );
}

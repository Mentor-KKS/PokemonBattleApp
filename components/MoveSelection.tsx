import { useState, useEffect } from "react";
import RetroButton from "./retro-button";
import { Move, BattlePokemon } from "@/types/pokemon";
import { selectBestMoves, validateMoveSet } from "@/utils/moveUtils";

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
  const [selectedMoves, setSelectedMoves] = useState<Move[]>([]);

  useEffect(() => {
    if (initialMoves.length > 0) {
      const validation = validateMoveSet(initialMoves);

      if (validation.isValid) {
        setSelectedMoves(initialMoves);
      } else {
        const autoSelectedMoves = selectBestMoves(pokemon.availableMoves);
        setSelectedMoves(autoSelectedMoves);
      }
    } else {
      const autoSelectedMoves = selectBestMoves(pokemon.availableMoves);
      setSelectedMoves(autoSelectedMoves);
    }
  }, [pokemon.availableMoves, initialMoves]);

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

  const canConfirm = () => {
    const validation = validateMoveSet(selectedMoves);
    return validation.isValid;
  };

  const handleConfirm = () => {
    if (canConfirm()) {
      onConfirm(selectedMoves);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gameboy-light border-4 border-black p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-4">
          <h2 className="pixel-font text-lg font-bold text-gameboy-darkest mb-2">
            ATTACKEN FÜR {pokemon.name.toUpperCase()} WÄHLEN
          </h2>
          <p className="pixel-font text-sm text-gameboy-darkest mb-2">
            Wähle 4 Attacken ({selectedMoves.length}/4)
          </p>
          <div className="flex justify-between pixel-font text-xs text-gameboy-darkest">
            <span>Kosten: {currentCost}/12</span>
            <span>Verfügbar: {remainingCost}</span>
          </div>
          {!selectedMoves.some((move) => move.maxCooldown === 0) && (
            <p className="pixel-font text-xs text-red-600 mt-1">
              ⚠️ Mindestens eine Attacke mit Cooldown 0 erforderlich!
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
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
                } ${move.maxCooldown === 0 ? "ring-2 ring-yellow-400" : ""}`}
              >
                <div>
                  <div className="font-bold">{move.name}</div>
                  <div className="text-xs">
                    {move.type.toUpperCase()} | {move.power} PWR | COST:{" "}
                    {move.cost} | CD: {move.maxCooldown}
                  </div>
                </div>
              </RetroButton>
            );
          })}
        </div>

        <div className="flex gap-2 justify-center">
          <RetroButton
            onClick={handleConfirm}
            disabled={!canConfirm()}
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

import { Move } from "@/types/pokemon";

/**
 * Wählt automatisch die besten 4 Moves für ein Pokémon aus
 * Garantiert: 4 Moves, max 12 Kostenpunkte, mindestens 1 Move mit Cooldown 0
 */
export const selectBestMoves = (availableMoves: Move[]): Move[] => {
  // 1. Mindestens einen Move mit maxCooldown = 0 finden
  const zeroCooldownMoves = availableMoves.filter(
    (move) => move.maxCooldown === 0
  );
  const otherMoves = availableMoves.filter((move) => move.maxCooldown > 0);

  // 2. Moves nach Effizienz sortieren (Power/Cost Verhältnis)
  const sortedZeroCooldown = zeroCooldownMoves.sort((a, b) => {
    const efficiencyA = a.power / Math.max(a.cost, 1);
    const efficiencyB = b.power / Math.max(b.cost, 1);
    return efficiencyB - efficiencyA;
  });

  const sortedOtherMoves = otherMoves.sort((a, b) => {
    const efficiencyA = a.power / Math.max(a.cost, 1);
    const efficiencyB = b.power / Math.max(b.cost, 1);
    return efficiencyB - efficiencyA;
  });

  const selected: Move[] = [];
  let totalCost = 0;

  // 3. Ersten besten Move mit Cooldown 0 hinzufügen
  if (sortedZeroCooldown.length > 0) {
    const bestZeroCooldown = sortedZeroCooldown[0];
    if (bestZeroCooldown.cost <= 12) {
      selected.push(bestZeroCooldown);
      totalCost += bestZeroCooldown.cost;
    }
  }

  // 4. Restliche Moves hinzufügen (sowohl 0-Cooldown als auch andere)
  const allSortedMoves = [
    ...sortedZeroCooldown.slice(1), // Restliche 0-Cooldown Moves
    ...sortedOtherMoves,
  ];

  for (const move of allSortedMoves) {
    if (selected.length >= 4) break;
    if (totalCost + move.cost <= 12) {
      selected.push(move);
      totalCost += move.cost;
    }
  }

  // 5. Falls weniger als 4 Moves gefunden, günstigste hinzufügen
  if (selected.length < 4) {
    const remainingMoves = availableMoves
      .filter((move) => !selected.some((s) => s.name === move.name))
      .sort((a, b) => a.cost - b.cost);

    for (const move of remainingMoves) {
      if (selected.length >= 4) break;
      if (totalCost + move.cost <= 12) {
        selected.push(move);
        totalCost += move.cost;
      }
    }
  }

  // 6. Sicherheitscheck: Mindestens ein Move mit Cooldown 0
  const hasZeroCooldown = selected.some((move) => move.maxCooldown === 0);
  if (!hasZeroCooldown && zeroCooldownMoves.length > 0) {
    // Ersetze den teuersten Move durch den günstigsten 0-Cooldown Move
    const mostExpensive = selected.reduce((prev, current) =>
      prev.cost > current.cost ? prev : current
    );
    const cheapestZeroCooldown = zeroCooldownMoves.sort(
      (a, b) => a.cost - b.cost
    )[0];

    const newSelected = selected.filter((m) => m.name !== mostExpensive.name);
    const newTotalCost = newSelected.reduce((sum, m) => sum + m.cost, 0);

    if (newTotalCost + cheapestZeroCooldown.cost <= 12) {
      newSelected.push(cheapestZeroCooldown);
      return newSelected;
    }
  }

  // 7. Fallback: Falls immer noch keine gültigen Moves, einfache Auswahl
  if (selected.length === 0) {
    const fallbackMove = zeroCooldownMoves[0] || availableMoves[0];
    if (fallbackMove && fallbackMove.cost <= 12) {
      selected.push(fallbackMove);
    }
  }

  return selected;
};

/**
 * Validiert ob ein Move-Set gültig ist
 */
export const validateMoveSet = (
  moves: Move[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (moves.length !== 4) {
    errors.push(`Genau 4 Moves erforderlich (aktuell: ${moves.length})`);
  }

  const totalCost = moves.reduce((sum, move) => sum + move.cost, 0);
  if (totalCost > 12) {
    errors.push(`Maximale Kosten überschritten: ${totalCost}/12`);
  }

  const hasZeroCooldown = moves.some((move) => move.maxCooldown === 0);
  if (!hasZeroCooldown) {
    errors.push("Mindestens ein Move mit Cooldown 0 erforderlich");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

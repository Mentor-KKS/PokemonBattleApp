import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import RetroButton from "./retro-button";
import { BattlePokemon, typeColors, Pokemon } from "../types/pokemon";

interface PokemonCardProps {
  // Unterstützt beide Typen: Pokemon (für Pokédex) und BattlePokemon (für Kämpfe)
  pokemon: BattlePokemon | Pokemon;
  index: number;

  // Battle-spezifische Props
  showActions?: boolean;
  onSelect?: (index: number) => void;
  onEditMoves?: (index: number) => void;
  isActive?: boolean;
  canSelect?: boolean;

  // Pokédex-spezifische Props
  onAddToTeam?: () => void;
  isInTeam?: boolean;
  canAdd?: boolean;
  strength?: number;
  showTeamButton?: boolean;
  showDetailsLink?: boolean;

  // Layout Props
  variant?: "default" | "team" | "battle" | "pokedex";
  className?: string;
}

export default function PokemonCard({
  pokemon,
  index,
  showActions = false,
  onSelect,
  onEditMoves,
  isActive = false,
  canSelect = true,
  onAddToTeam,
  isInTeam = false,
  canAdd = true,
  strength = 0,
  showTeamButton = false,
  showDetailsLink = false,
  variant = "default",
  className = "",
}: PokemonCardProps) {
  const [imageError, setImageError] = useState(false);

  // Type Guard: Prüfe ob es ein BattlePokemon ist
  const isBattlePokemon = (pokemon: any): pokemon is BattlePokemon => {
    return "currentHp" in pokemon && "maxHp" in pokemon;
  };

  // Berechne Level und HP nur für BattlePokemon
  const level = isBattlePokemon(pokemon)
    ? Math.floor(
        pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0) / 50
      )
    : 0;

  const hpPercentage = isBattlePokemon(pokemon)
    ? (pokemon.currentHp / pokemon.maxHp) * 100
    : 100;

  // Berechne Stärke für normale Pokemon
  const pokemonStrength =
    !isBattlePokemon(pokemon) && strength > 0
      ? strength
      : pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

  const pokemonImage = (
    <div className="bg-gray-100 p-3 mx-auto w-32 h-32 flex items-center justify-center hover:bg-gray-200 transition-colors rounded-lg">
      {!imageError && pokemon.sprites.front_default ? (
        <Image
          src={pokemon.sprites.front_default}
          alt={pokemon.name}
          width={96}
          height={96}
          className="pixelated drop-shadow-lg"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="text-gameboy-darkest pixel-font text-xs">NO IMG</div>
      )}
    </div>
  );

  return (
    <div
      className={`bg-white border-4 border-black p-4 ${className} ${
        isActive ? "ring-4 ring-blue-500" : ""
      }`}
    >
      <div className="text-center space-y-3">
        {/* Slot Nummer für Team-View */}
        {variant === "team" && (
          <div className="pixel-font text-xs text-gray-600">
            SLOT {index + 1}
          </div>
        )}

        {/* Pokemon Image - mit oder ohne Link */}
        {showDetailsLink ? (
          <Link href={`/pokemon/${pokemon.id}`} className="cursor-pointer">
            {pokemonImage}
          </Link>
        ) : (
          pokemonImage
        )}

        {/* Pokemon Name und Info */}
        <div>
          <h3 className="pixel-font text-sm font-bold text-gameboy-darkest">
            {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
          </h3>

          {/* Pokédex Nummer */}
          {variant === "pokedex" && (
            <p className="pixel-font text-xs text-gray-600">
              #{pokemon.id.toString().padStart(3, "0")}
            </p>
          )}

          {/* Level für Battle */}
          {variant === "battle" && (
            <div className="pixel-font text-xs text-gray-600">Lv.{level}</div>
          )}

          {/* Stärke für Pokédex */}
          {(variant === "pokedex" || showTeamButton) && (
            <p className="pixel-font text-xs text-gameboy-dark">
              Stärke: {pokemonStrength}
            </p>
          )}
        </div>

        {/* Pokemon Types */}
        <div className="flex justify-center gap-1">
          {pokemon.types.map((type, typeIndex) => (
            <span
              key={typeIndex}
              className={`pixel-font text-xs px-2 py-1 text-white border border-black ${
                typeColors[type.type.name] || "bg-gray-400"
              }`}
            >
              {type.type.name.toUpperCase()}
            </span>
          ))}
        </div>

        {/* HP Bar nur für BattlePokemon */}
        {isBattlePokemon(pokemon) && (
          <div className="space-y-1">
            <div className="bg-gray-300 border border-black h-2 w-full">
              <div
                className={`h-full transition-all duration-500 ${
                  hpPercentage > 50
                    ? "bg-green-500"
                    : hpPercentage > 25
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${hpPercentage}%` }}
              />
            </div>
            <p className="pixel-font text-xs text-gray-600">
              {pokemon.currentHp}/{pokemon.maxHp} HP
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-1">
          {/* Battle Actions */}
          {showActions && (
            <>
              <RetroButton
                onClick={() => onSelect?.(index)}
                className="text-xs w-full"
                disabled={
                  !canSelect ||
                  (isBattlePokemon(pokemon) && pokemon.currentHp <= 0)
                }
              >
                {isBattlePokemon(pokemon) && pokemon.currentHp <= 0
                  ? "K.O."
                  : isActive
                  ? "AKTIV"
                  : "WÄHLEN"}
              </RetroButton>
              {onEditMoves && (
                <RetroButton
                  onClick={() => onEditMoves(index)}
                  variant="secondary"
                  className="text-xs w-full"
                >
                  ATTACKEN
                </RetroButton>
              )}
            </>
          )}

          {/* Team Button für Pokédex */}
          {showTeamButton && onAddToTeam && (
            <RetroButton
              onClick={onAddToTeam}
              disabled={isInTeam || !canAdd}
              variant={isInTeam ? "secondary" : "primary"}
              className="w-full text-xs"
            >
              {isInTeam ? "IM TEAM" : !canAdd ? "ZU STARK" : "ZUM TEAM"}
            </RetroButton>
          )}
        </div>
      </div>
    </div>
  );
}

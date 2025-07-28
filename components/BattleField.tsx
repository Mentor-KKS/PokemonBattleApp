import Image from "next/image";
import { useState } from "react";
import { BattlePokemon, BattleBackground } from "@/types/pokemon";

interface BattleFieldProps {
  playerPokemon: BattlePokemon;
  enemyPokemon: BattlePokemon;
  background: BattleBackground;
  currentRound: number;
  battleAnimation: {
    type: string;
    attacker: "player" | "enemy" | "";
    target: "player" | "enemy" | "";
  };
}

export default function BattleField({
  playerPokemon,
  enemyPokemon,
  background,
  currentRound,
  battleAnimation,
}: BattleFieldProps) {
  const [imageError, setImageError] = useState(false);
  const playerLevel = Math.floor(
    playerPokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0) / 50
  );
  const enemyLevel = 5 + currentRound * 3;

  const getBackgroundStyle = () => {
    if (background.style === "image" && background.image && !imageError) {
      return {
        backgroundImage: `url(${background.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    } else if (
      background.style === "combined" &&
      background.image &&
      !imageError
    ) {
      return {
        background: `${background.gradient}, url(${background.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    } else {
      return {
        background: background.gradient,
      };
    }
  };

  return (
    <div
      className="relative border-4 border-black min-h-[500px] md:min-h-[600px] overflow-hidden flex flex-col"
      style={getBackgroundStyle()}
    >
      {background.image && (
        <img
          src={background.image}
          alt=""
          style={{ display: "none" }}
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
      )}
      {/* Enemy Pokemon Info Box - Top */}
      <div
        className="absolute top-4 right-48 transform -translate-x-1 z-10"
        style={{ top: "160px" }}
      >
        <div className="bg-gameboy-light border-2 border-black p-2 md:p-3 rounded shadow-lg">
          <div className="pixel-font text-xs md:text-sm font-bold text-gameboy-darkest mb-1 md:mb-2">
            {enemyPokemon.name.toUpperCase()} ♂ Lv.{enemyLevel}
          </div>
          <div className="bg-gray-300 border border-black h-2 md:h-3 w-32 md:w-40">
            <div
              className="bg-green-500 h-full transition-all duration-500"
              style={{
                width: `${
                  (enemyPokemon.currentHp / enemyPokemon.maxHp) * 100
                }%`,
              }}
            />
          </div>
          <div className="pixel-font text-xs text-gameboy-darkest mt-1">
            HP: {enemyPokemon.currentHp}/{enemyPokemon.maxHp}
          </div>
        </div>
      </div>

      {/* Enemy Pokemon Sprite - Top Right */}
      <div className="absolute right-1 md:right-20" style={{ top: "220px" }}>
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
              enemyPokemon.sprites.front_default ||
              "/placeholder.svg?height=120&width=120"
            }
            alt={enemyPokemon.name}
            width={160}
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
          {battleAnimation.attacker === "enemy" &&
            battleAnimation.type === "attack" && (
              <div className="absolute -top-2 md:-top-3 -right-2 md:-right-3 text-sm md:text-lg animate-ping">
                ⚡
              </div>
            )}
        </div>
      </div>

      {/* Player Pokemon Sprite - Bottom Left */}
      <div className="absolute bottom-4 md:bottom-4 left-1 md:left-1">
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
              playerPokemon.sprites.back_default ||
              playerPokemon.sprites.front_default ||
              "/placeholder.svg?height=160&width=160"
            }
            alt={playerPokemon.name}
            width={180}
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
          {battleAnimation.attacker === "player" &&
            battleAnimation.type === "attack" && (
              <div className="absolute -top-3 md:-top-4 -right-3 md:-right-4 text-lg md:text-2xl animate-ping">
                ⚡
              </div>
            )}
        </div>
      </div>

      {/* Player Pokemon Info Box - Bottom */}
      <div className="absolute bottom-72 left-52 transform -translate-x-1">
        <div className="bg-gameboy-light border-2 border-black p-2 md:p-3 rounded shadow-lg">
          <div className="pixel-font text-xs md:text-sm font-bold text-gameboy-darkest mb-1 md:mb-2">
            {playerPokemon.name.toUpperCase()} ♂ Lv.{playerLevel}
          </div>
          <div className="bg-gray-300 border border-black h-2 md:h-3 w-32 md:w-40 mb-1 md:mb-2">
            <div
              className="bg-green-500 h-full transition-all duration-500"
              style={{
                width: `${
                  (playerPokemon.currentHp / playerPokemon.maxHp) * 100
                }%`,
              }}
            />
          </div>
          <div className="pixel-font text-xs text-gameboy-darkest">
            HP: {playerPokemon.currentHp}/{playerPokemon.maxHp}
          </div>
        </div>
      </div>

      {/* Battle Effects Overlay */}
      {battleAnimation.type === "attack" && (
        <div className="absolute inset-0 pointer-events-none">
          {battleAnimation.attacker === "player" && (
            <div className="absolute bottom-2/4 left-1/4 w-1/3 h-1 md:h-2 bg-yellow-400 opacity-80 animate-pulse transform -rotate-7"></div>
          )}
          {battleAnimation.attacker === "enemy" && (
            <div className="absolute bottom-2/4 right-1/4 w-1/3 h-1 md:h-2 bg-red-400 opacity-80 animate-pulse transform rotate-7"></div>
          )}
          {battleAnimation.target === "enemy" && (
            <div className="absolute bottom-2/4 right-1/4 text-3xl md:text-5xl animate-bounce">
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
  );
}

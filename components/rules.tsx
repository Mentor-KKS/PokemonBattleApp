"use client"

import { useState } from "react"
import RetroButton from "./retro-button"
import Link from "next/link"

export default function Rules() {
  const [activeSection, setActiveSection] = useState<string>("overview")

  const sections = [
    { id: "overview", title: "ÜBERSICHT", icon: "🎮" },
    { id: "team", title: "TEAM BUILDING", icon: "👥" },
    { id: "moves", title: "ATTACKEN", icon: "⚔️" },
    { id: "battle", title: "KAMPF SYSTEM", icon: "⚡" },
    { id: "scoring", title: "PUNKTE SYSTEM", icon: "🏆" },
    { id: "tips", title: "TIPPS & TRICKS", icon: "💡" },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-4">
            <h2 className="pixel-font text-lg font-bold text-gameboy-darkest mb-4">🎮 SPIELÜBERSICHT</h2>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">ZIEL DES SPIELS</h3>
              <p className="pixel-font text-sm text-gray-700">
                Baue ein starkes Pokémon-Team und kämpfe gegen verschiedene Trainer! Sammle Punkte, steige in den Runden
                auf und werde der ultimative Pokémon-Champion!
              </p>
            </div>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">SPIELABLAUF</h3>
              <div className="space-y-2 pixel-font text-sm text-gray-700">
                <div>1. 📱 Sammle bis zu 6 Pokémon für dein Team</div>
                <div>2. ⚔️ Passe die Attacken deiner Pokémon an</div>
                <div>3. 🥊 Kämpfe gegen Trainer in verschiedenen Runden</div>
                <div>4. 🏆 Sammle Punkte und steige im Leaderboard auf</div>
                <div>5. 🔄 Wiederhole den Prozess für höhere Runden</div>
              </div>
            </div>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">WICHTIGE FEATURES</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pixel-font text-sm text-gray-700">
                <div>• Team-Stärke Balancing</div>
                <div>• Attacken-Cooldown System</div>
                <div>• Typ-Effektivität</div>
                <div>• Kritische Treffer</div>
                <div>• Verschiedene Arenen</div>
                <div>• Persistente Fortschritte</div>
              </div>
            </div>
          </div>
        )

      case "team":
        return (
          <div className="space-y-4">
            <h2 className="pixel-font text-lg font-bold text-gameboy-darkest mb-4">👥 TEAM BUILDING</h2>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">TEAM ZUSAMMENSTELLEN</h3>
              <div className="space-y-2 pixel-font text-sm text-gray-700">
                <div>• Maximal 6 Pokémon pro Team</div>
                <div>• Jedes Pokémon kann nur einmal im Team sein</div>
                <div>• Pokémon von der Startseite zum Team hinzufügen</div>
                <div>• Team-Übersicht auf der "MY TEAM" Seite</div>
              </div>
            </div>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">STÄRKE-BALANCING</h3>
              <div className="space-y-2 pixel-font text-sm text-gray-700">
                <div>• Maximale Team-Stärke: 400 Punkte</div>
                <div>• Pokémon-Stärke = Durchschnitt aller Basis-Stats</div>
                <div>• Starke Pokémon verbrauchen mehr Stärke-Punkte</div>
                <div>• Balanciere zwischen starken und schwächeren Pokémon</div>
              </div>
              <div className="bg-white border border-black p-2 pixel-font text-xs">
                <strong>Beispiel:</strong> Ein Pokémon mit 600 Gesamt-Stats hat Stärke 100 (600÷6=100)
              </div>
            </div>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">TEAM MANAGEMENT</h3>
              <div className="space-y-2 pixel-font text-sm text-gray-700">
                <div>• Pokémon Details durch Klick auf das Pokémon ansehen</div>
                <div>• Pokémon aus dem Team entfernen</div>
                <div>• Gesamtes Team löschen</div>
                <div>• Team-Statistiken einsehen</div>
              </div>
            </div>
          </div>
        )

      case "moves":
        return (
          <div className="space-y-4">
            <h2 className="pixel-font text-lg font-bold text-gameboy-darkest mb-4">⚔️ ATTACKEN SYSTEM</h2>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">ATTACKEN ANPASSEN</h3>
              <div className="space-y-2 pixel-font text-sm text-gray-700">
                <div>• Jedes Pokémon kann 4 Attacken haben</div>
                <div>• Attacken vor dem Kampf oder während des Kampfes ändern</div>
                <div>• Aus bis zu 20 verfügbaren Attacken wählen</div>
                <div>• Attacken haben verschiedene Typen und Stärken</div>
              </div>
            </div>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">KOSTEN-BALANCING</h3>
              <div className="space-y-2 pixel-font text-sm text-gray-700">
                <div>• Maximale Attacken-Kosten: 12 Punkte pro Pokémon</div>
                <div>• Stärkere Attacken kosten mehr Punkte</div>
                <div>• Status-Attacken (0 Schaden): 1 Punkt</div>
                <div>• Schwache Attacken (≤40): 2 Punkte</div>
                <div>• Mittlere Attacken (41-60): 3 Punkte</div>
                <div>• Starke Attacken (61-80): 4 Punkte</div>
                <div>• Sehr starke Attacken (81-100): 5 Punkte</div>
                <div>• Mega-Attacken (&gt;100): 6 Punkte</div>
              </div>
            </div>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">COOLDOWN SYSTEM</h3>
              <div className="space-y-2 pixel-font text-sm text-gray-700">
                <div>• Starke Attacken haben Cooldown-Zeiten</div>
                <div>• Cooldown = Runden bis Attacke wieder nutzbar</div>
                <div>• Cooldown bleibt zwischen Pokémon-Kämpfen bestehen</div>
                <div>• Reset nur bei neuem Trainer</div>
              </div>
              <div className="bg-white border border-black p-2 pixel-font text-xs">
                <strong>Cooldown-Zeiten:</strong>
                <br />• 0-40 Schaden: 0 Runden
                <br />• 41-60 Schaden: 1 Runde
                <br />• 61-80 Schaden: 2 Runden
                <br />• 81-100 Schaden: 3 Runden
                <br />• &gt;100 Schaden: 4 Runden
              </div>
            </div>
          </div>
        )

      case "battle":
        return (
          <div className="space-y-4">
            <h2 className="pixel-font text-lg font-bold text-gameboy-darkest mb-4">⚡ KAMPF SYSTEM</h2>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">KAMPF ABLAUF</h3>
              <div className="space-y-2 pixel-font text-sm text-gray-700">
                <div>1. Wähle dein erstes Pokémon</div>
                <div>2. Kämpfe gegen 6 Gegner-Pokémon</div>
                <div>3. Wähle Attacken oder wechsle Pokémon</div>
                <div>4. Besiege alle Gegner-Pokémon um zu gewinnen</div>
              </div>
            </div>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">KAMPF MECHANIKEN</h3>
              <div className="space-y-2 pixel-font text-sm text-gray-700">
                <div>
                  • <strong>Typ-Effektivität:</strong> Manche Typen sind effektiver
                </div>
                <div>
                  • <strong>Kritische Treffer:</strong> Basierend auf Initiative-Wert
                </div>
                <div>
                  • <strong>Schadens-Berechnung:</strong> Angriff vs. Verteidigung
                </div>
                <div>
                  • <strong>Zufallsfaktor:</strong> ±20% Schadens-Variation
                </div>
              </div>
            </div>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">POKÉMON WECHSELN</h3>
              <div className="space-y-2 pixel-font text-sm text-gray-700">
                <div>• Jederzeit im Kampf möglich (außer bei K.O.)</div>
                <div>• Bei K.O. musst du ein neues Pokémon wählen</div>
                <div>• Gegner greift nach Pokémon-Wechsel an</div>
                <div>• HP und Status bleiben erhalten</div>
              </div>
            </div>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">VERSCHIEDENE ARENEN</h3>
              <div className="grid grid-cols-2 gap-2 pixel-font text-sm text-gray-700">
                <div>• Stadium (Runde 1)</div>
                <div>• Forest (Runde 2)</div>
                <div>• Cave (Runde 3)</div>
                <div>• Beach (Runde 4)</div>
                <div>• Volcano (Runde 5)</div>
                <div>• Desert (Runde 6)</div>
                <div>• Iceland (Runde 7+)</div>
              </div>
            </div>
          </div>
        )

      case "scoring":
        return (
          <div className="space-y-4">
            <h2 className="pixel-font text-lg font-bold text-gameboy-darkest mb-4">🏆 PUNKTE SYSTEM</h2>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">PUNKTE SAMMELN</h3>
              <div className="space-y-2 pixel-font text-sm text-gray-700">
                <div>
                  • <strong>Sieg:</strong> +100 × Rundennummer Punkte
                </div>
                <div>
                  • <strong>Niederlage:</strong> Keine Punkte verloren
                </div>
                <div>• Punkte werden automatisch gespeichert</div>
                <div>• Fortschritt bleibt zwischen Sessions erhalten</div>
              </div>
              <div className="bg-white border border-black p-2 pixel-font text-xs">
                <strong>Beispiele:</strong>
                <br />• Runde 1 Sieg: +100 Punkte
                <br />• Runde 5 Sieg: +500 Punkte
                <br />• Runde 10 Sieg: +1000 Punkte
              </div>
            </div>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">SCHWIERIGKEITS-STEIGERUNG</h3>
              <div className="space-y-2 pixel-font text-sm text-gray-700">
                <div>• Gegner werden mit jeder Runde stärker</div>
                <div>• Höhere Level und bessere Stats</div>
                <div>• Verschiedene Trainer-Typen:</div>
                <div className="ml-4">
                  <div>- Käfer-Sammler (Runde 1)</div>
                  <div>- Youngster (Runde 2)</div>
                  <div>- Lass (Runde 3)</div>
                  <div>- Gentleman (Runde 4)</div>
                  <div>- Elite Vier (Runde 5)</div>
                  <div>- Champ (Runde 6+)</div>
                </div>
              </div>
            </div>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">LEADERBOARD</h3>
              <div className="space-y-2 pixel-font text-sm text-gray-700">
                <div>• Top 10 Spieler werden angezeigt</div>
                <div>• Score beim Game Over speichern</div>
                <div>• Vergleiche dich mit anderen Spielern</div>
                <div>• Datum der Einträge wird gespeichert</div>
              </div>
            </div>
          </div>
        )

      case "tips":
        return (
          <div className="space-y-4">
            <h2 className="pixel-font text-lg font-bold text-gameboy-darkest mb-4">💡 TIPPS & TRICKS</h2>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">TEAM BUILDING TIPPS</h3>
              <div className="space-y-2 pixel-font text-sm text-gray-700">
                <div>• ⚖️ Balanciere starke und schwache Pokémon</div>
                <div>• 🌈 Nutze verschiedene Typen für Typ-Vorteile</div>
                <div>• 🛡️ Achte auf gute Verteidigungswerte</div>
                <div>• ⚡ Schnelle Pokémon haben höhere Krit-Chance</div>
                <div>• 💪 Hohe Angriffswerte = mehr Schaden</div>
              </div>
            </div>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">ATTACKEN STRATEGIEN</h3>
              <div className="space-y-2 pixel-font text-sm text-gray-700">
                <div>• 🎯 Mische starke und schwache Attacken</div>
                <div>• ⏰ Plane Cooldowns strategisch ein</div>
                <div>• 🔄 Status-Attacken können nützlich sein</div>
                <div>• 💥 Nutze Typ-Vorteile für 2x Schaden</div>
                <div>• 🚫 Vermeide Typ-Nachteile (0.5x Schaden)</div>
              </div>
            </div>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">KAMPF TIPPS</h3>
              <div className="space-y-2 pixel-font text-sm text-gray-700">
                <div>• 🔄 Wechsle Pokémon bei Typ-Nachteilen</div>
                <div>• 💊 Spare starke Pokémon für schwere Gegner</div>
                <div>• ⏱️ Nutze Cooldown-Zeit für Pokémon-Wechsel</div>
                <div>• 🎲 Rechne mit Zufallsschäden (±20%)</div>
                <div>• 🏃 Bei kritischer HP rechtzeitig wechseln</div>
              </div>
            </div>

            <div className="bg-gameboy-light border-2 border-black p-4 space-y-3">
              <h3 className="pixel-font font-bold text-gameboy-darkest">FORTGESCHRITTENE TIPPS</h3>
              <div className="space-y-2 pixel-font text-sm text-gray-700">
                <div>• 📊 Studiere Gegner-Pokémon vor dem Kampf</div>
                <div>• 🔧 Passe Attacken zwischen Runden an</div>
                <div>• 💾 Nutze "ZUG ZURÜCKSETZEN" bei Problemen</div>
                <div>• 🏆 Sammle konstant Punkte für Leaderboard</div>
                <div>• 🎮 Experimentiere mit verschiedenen Strategien</div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="bg-white border-4 border-black p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {sections.map((section) => (
            <RetroButton
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              variant={activeSection === section.id ? "primary" : "secondary"}
              className="text-xs h-12 flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">{section.icon}</span>
              <span>{section.title}</span>
            </RetroButton>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border-4 border-black p-4 min-h-[400px]">{renderContent()}</div>

      {/* Quick Navigation */}
      <div className="bg-white border-4 border-black p-4 text-center">
        <h3 className="pixel-font font-bold text-gameboy-darkest mb-2">SCHNELL-NAVIGATION</h3>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/">
            <RetroButton variant="secondary" className="text-xs">
              🏠 HOME
            </RetroButton>
          </Link>
          <Link href="/team">
            <RetroButton variant="secondary" className="text-xs">
              👥 TEAM
            </RetroButton>
          </Link>
          <Link href="/battle">
            <RetroButton variant="secondary" className="text-xs">
              ⚔️ BATTLE
            </RetroButton>
          </Link>
          <Link href="/leaderboard">
            <RetroButton variant="secondary" className="text-xs">
              🏆 LEADERBOARD
            </RetroButton>
          </Link>
        </div>
      </div>
    </div>
  )
}

import { useState } from "react";
import { FORMATIONS, FORMATION_KEYS } from "@/components/composition/formations";
import { MOCK_PLAYERS, type FUTPlayer } from "@/components/composition/mockPlayers";
import { PitchView } from "@/components/composition/PitchView";
import { FUTPlayerCard } from "@/components/composition/FUTPlayerCard";

export default function Composition() {
  const [selectedFormation, setSelectedFormation] = useState("4-3-3");
  const formation = FORMATIONS[selectedFormation];

  // For now, assign mock players to formation positions in order
  const assignedPlayers: FUTPlayer[] = formation.positions.map((_, i) => MOCK_PLAYERS[i]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-t-primary leading-none" style={{ fontSize: "var(--text-h1)" }}>
            COMPOSITION
          </h1>
          <p className="text-t-secondary font-ui text-[var(--text-small)] mt-2">
            Composition FUT — Glisse, place, domine.
          </p>
        </div>

        {/* Formation selector */}
        <div className="flex gap-2">
          {FORMATION_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setSelectedFormation(key)}
              className={`px-3 py-1.5 rounded-lg font-ui text-[12px] transition-all ${
                selectedFormation === key
                  ? "bg-primary text-primary-text font-semibold"
                  : "bg-bg-surface-2 text-t-secondary hover:bg-bg-surface-3 hover:text-t-primary border border-b-subtle"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pitch */}
        <div className="lg:col-span-2">
          <PitchView formation={formation} players={assignedPlayers} />
        </div>

        {/* Sidebar — squad list */}
        <div className="space-y-4">
          {/* Chemistry legend */}
          <div className="bg-bg-surface-1 border border-b-subtle rounded-xl p-4">
            <h3 className="font-display text-[14px] text-t-primary mb-3">CHIMIE</h3>
            <div className="space-y-2">
              {[
                { label: "Optimale", color: "bg-[var(--chem-optimal)]" },
                { label: "Bonne", color: "bg-[var(--chem-good)]" },
                { label: "Faible", color: "bg-[var(--chem-weak)]" },
                { label: "Mauvaise", color: "bg-[var(--chem-bad)]" },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-2">
                  <div className={`w-6 h-1 rounded-full ${c.color}`} />
                  <span className="font-ui text-[11px] text-t-secondary">{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Player list */}
          <div className="bg-bg-surface-1 border border-b-subtle rounded-xl p-4">
            <h3 className="font-display text-[14px] text-t-primary mb-3">EFFECTIF</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {MOCK_PLAYERS.map((player, i) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    i < formation.positions.length
                      ? "bg-primary-dim border border-primary-border"
                      : "bg-bg-surface-2 border border-b-subtle hover:bg-bg-surface-3"
                  }`}
                >
                  <span className="font-display text-[14px] text-t-muted w-6 text-center">
                    #{player.jerseyNumber}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-ui text-[12px] text-t-primary truncate">
                      {player.firstName} {player.lastName}
                    </p>
                    <p className="font-ui text-[10px] text-t-muted">{player.position}</p>
                  </div>
                  <span
                    className={`font-display text-[14px] ${
                      player.rating >= 80
                        ? "text-[var(--color-success)]"
                        : player.rating >= 70
                          ? "text-[var(--color-warning)]"
                          : "text-t-primary"
                    }`}
                  >
                    {player.rating}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

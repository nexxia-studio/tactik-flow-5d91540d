import { useState, useCallback } from "react";
import { FORMATIONS, FORMATION_KEYS } from "@/components/composition/formations";
import { MOCK_PLAYERS, type FUTPlayer } from "@/components/composition/mockPlayers";
import { PitchView } from "@/components/composition/PitchView";
import { GripVertical } from "lucide-react";

export default function Composition() {
  const [selectedFormation, setSelectedFormation] = useState("4-3-3");
  const formation = FORMATIONS[selectedFormation];

  // assignedIds[slotIndex] = player id (or null for empty)
  const [assignedIds, setAssignedIds] = useState<(string | null)[]>(() =>
    MOCK_PLAYERS.slice(0, 11).map((p) => p.id)
  );

  const playerMap = new Map(MOCK_PLAYERS.map((p) => [p.id, p]));

  const assignedPlayers: (FUTPlayer | null)[] = formation.positions.map(
    (_, i) => (assignedIds[i] ? playerMap.get(assignedIds[i]!) ?? null : null)
  );

  const assignedSet = new Set(assignedIds.filter(Boolean));
  const bench = MOCK_PLAYERS.filter((p) => !assignedSet.has(p.id));

  // Swap two pitch slots
  const swapSlots = useCallback((fromSlot: number, toSlot: number) => {
    setAssignedIds((prev) => {
      const next = [...prev];
      // Ensure array is long enough
      while (next.length <= Math.max(fromSlot, toSlot)) next.push(null);
      [next[fromSlot], next[toSlot]] = [next[toSlot], next[fromSlot]];
      return next;
    });
  }, []);

  // Place a bench player into a slot (replacing whoever is there → goes to bench)
  const placeBenchPlayer = useCallback((playerId: string, toSlot: number) => {
    setAssignedIds((prev) => {
      const next = [...prev];
      while (next.length <= toSlot) next.push(null);
      // If that player is already on pitch in another slot, clear old slot
      const oldSlot = next.indexOf(playerId);
      if (oldSlot !== -1) next[oldSlot] = null;
      next[toSlot] = playerId;
      return next;
    });
  }, []);

  // Handle formation change — keep same players, just re-map
  const handleFormationChange = (key: string) => {
    setSelectedFormation(key);
    // Trim or pad assigned list to new formation size
    const newSize = FORMATIONS[key].positions.length;
    setAssignedIds((prev) => {
      const next = [...prev];
      while (next.length < newSize) next.push(null);
      return next.slice(0, newSize);
    });
  };

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
              onClick={() => handleFormationChange(key)}
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
          <PitchView
            formation={formation}
            players={assignedPlayers}
            onSwapSlots={swapSlots}
            onDropBenchPlayer={placeBenchPlayer}
          />
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

          {/* Bench / squad list */}
          <div className="bg-bg-surface-1 border border-b-subtle rounded-xl p-4">
            <h3 className="font-display text-[14px] text-t-primary mb-1">BANC</h3>
            <p className="font-ui text-[10px] text-t-muted mb-3">Glisse un joueur sur le terrain</p>
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
              {bench.length === 0 && (
                <p className="font-ui text-[11px] text-t-muted py-4 text-center">Tous les joueurs sont sur le terrain</p>
              )}
              {bench.map((player) => (
                <div
                  key={player.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("bench-player-id", player.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-bg-surface-2 border border-b-subtle hover:bg-bg-surface-3 cursor-grab active:cursor-grabbing transition-colors select-none"
                >
                  <GripVertical className="h-3.5 w-3.5 text-t-muted shrink-0" />
                  <span className="font-display text-[13px] text-t-muted w-5 text-center">
                    #{player.jerseyNumber}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-ui text-[12px] text-t-primary truncate">
                      {player.firstName} {player.lastName}
                    </p>
                    <p className="font-ui text-[10px] text-t-muted">{player.position}</p>
                  </div>
                  <span
                    className={`font-display text-[13px] ${
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

          {/* Titulaires list */}
          <div className="bg-bg-surface-1 border border-b-subtle rounded-xl p-4">
            <h3 className="font-display text-[14px] text-t-primary mb-3">TITULAIRES</h3>
            <div className="space-y-1.5">
              {assignedPlayers.map((player, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-primary-dim border border-primary-border"
                >
                  <span className="font-ui text-[10px] text-t-muted uppercase w-8">
                    {formation.positions[i]?.label}
                  </span>
                  {player ? (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="font-ui text-[12px] text-t-primary truncate">
                          {player.firstName} {player.lastName}
                        </p>
                      </div>
                      <span className="font-display text-[13px] text-t-secondary">
                        #{player.jerseyNumber}
                      </span>
                    </>
                  ) : (
                    <span className="font-ui text-[11px] text-t-muted italic">Vide</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

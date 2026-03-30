import { useState, useCallback, useMemo } from "react";
import { FORMATIONS, FORMATION_KEYS } from "@/components/composition/formations";
import { MOCK_PLAYERS, type FUTPlayer, type PlayerStatus, getPositionCategory } from "@/components/composition/mockPlayers";
import { PitchView } from "@/components/composition/PitchView";
import { SquadList } from "@/components/composition/SquadList";

const MAX_SUBSTITUTES = 4;

/**
 * Given a formation, returns the filling order for slots:
 * GK first, then DEF right-to-left (highest x first), then MID R→L, then ATT R→L.
 */
function getSlotFillingOrder(formation: typeof FORMATIONS[string]): number[] {
  const categorized: { idx: number; cat: string; x: number }[] = formation.positions.map(
    (pos, idx) => ({ idx, cat: getPositionCategory(pos.label), x: pos.x })
  );

  const catOrder = ["GK", "DEF", "MID", "ATT"];
  categorized.sort((a, b) => {
    const catDiff = catOrder.indexOf(a.cat) - catOrder.indexOf(b.cat);
    if (catDiff !== 0) return catDiff;
    return b.x - a.x; // right to left (higher x first)
  });

  return categorized.map((c) => c.idx);
}

export default function Composition() {
  const [selectedFormation, setSelectedFormation] = useState("4-3-3");
  const formation = FORMATIONS[selectedFormation];

  // assignedIds[slotIndex] = player id (or null)
  const [assignedIds, setAssignedIds] = useState<(string | null)[]>(() =>
    MOCK_PLAYERS.filter((p) => p.status === "available")
      .slice(0, 11)
      .map((p) => p.id)
  );

  // Substitute IDs (not on pitch but marked as sub)
  const [substituteIds, setSubstituteIds] = useState<string[]>(() => {
    const available = MOCK_PLAYERS.filter((p) => p.status === "available");
    return available.slice(11, 16).map((p) => p.id);
  });

  // Player status overrides
  const [playerStatuses, setPlayerStatuses] = useState<Record<string, PlayerStatus>>(() => {
    const map: Record<string, PlayerStatus> = {};
    MOCK_PLAYERS.forEach((p) => { map[p.id] = p.status; });
    return map;
  });

  // Compute players with overridden statuses
  const playersWithStatus = useMemo(
    () => MOCK_PLAYERS.map((p) => ({ ...p, status: playerStatuses[p.id] ?? p.status })),
    [playerStatuses]
  );

  const playerMap = useMemo(() => new Map(playersWithStatus.map((p) => [p.id, p])), [playersWithStatus]);

  const assignedPlayers: (FUTPlayer | null)[] = formation.positions.map(
    (_, i) => (assignedIds[i] ? playerMap.get(assignedIds[i]!) ?? null : null)
  );

  const fillingOrder = useMemo(() => getSlotFillingOrder(formation), [formation]);

  // Add a player to the next empty slot matching their position category
  const addPlayer = useCallback(
    (playerId: string) => {
      const player = playerMap.get(playerId);
      if (!player) return;

      setAssignedIds((prev) => {
        // Already assigned?
        if (prev.includes(playerId)) return prev;

        const next = [...prev];
        while (next.length < formation.positions.length) next.push(null);

        const playerCat = getPositionCategory(player.position);

        // Try to find an empty slot of same category first (in filling order)
        for (const slotIdx of fillingOrder) {
          if (next[slotIdx] !== null) continue;
          const slotCat = getPositionCategory(formation.positions[slotIdx].label);
          if (slotCat === playerCat) {
            next[slotIdx] = playerId;
            return next;
          }
        }

        // Fallback: any empty slot
        for (const slotIdx of fillingOrder) {
          if (next[slotIdx] === null) {
            next[slotIdx] = playerId;
            return next;
          }
        }

        return prev; // no empty slot
      });

      // Remove from substitutes if was there
      setSubstituteIds((prev) => prev.filter((id) => id !== playerId));
    },
    [playerMap, formation, fillingOrder]
  );

  // Toggle substitute (bench) status
  const toggleSubstitute = useCallback((playerId: string) => {
    setSubstituteIds((prev) => {
      if (prev.includes(playerId)) {
        return prev.filter((id) => id !== playerId);
      }
      if (prev.length >= MAX_SUBSTITUTES) return prev;
      return [...prev, playerId];
    });
  }, []);

  // Change player status
  const changePlayerStatus = useCallback((playerId: string, status: PlayerStatus) => {
    setPlayerStatuses((prev) => ({ ...prev, [playerId]: status }));
    if (status !== "available") {
      setAssignedIds((prev) => {
        const idx = prev.indexOf(playerId);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = null;
        return next;
      });
      setSubstituteIds((prev) => prev.filter((id) => id !== playerId));
    }
  }, []);

  // Remove a player from the pitch
  const removePlayer = useCallback((playerId: string) => {
    setAssignedIds((prev) => {
      const idx = prev.indexOf(playerId);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = null;
      return next;
    });
  }, []);

  // Swap two pitch slots (drag & drop)
  const swapSlots = useCallback((fromSlot: number, toSlot: number) => {
    setAssignedIds((prev) => {
      const next = [...prev];
      while (next.length <= Math.max(fromSlot, toSlot)) next.push(null);
      [next[fromSlot], next[toSlot]] = [next[toSlot], next[fromSlot]];
      return next;
    });
  }, []);

  // Bench player drop onto pitch
  const placeBenchPlayer = useCallback((playerId: string, toSlot: number) => {
    setAssignedIds((prev) => {
      const next = [...prev];
      while (next.length <= toSlot) next.push(null);
      const oldSlot = next.indexOf(playerId);
      if (oldSlot !== -1) next[oldSlot] = null;
      next[toSlot] = playerId;
      return next;
    });
    setSubstituteIds((prev) => prev.filter((id) => id !== playerId));
  }, []);

  // Formation change
  const handleFormationChange = (key: string) => {
    setSelectedFormation(key);
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
            Composition FUT — Clique pour composer ton XI.
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
            onRemovePlayer={removePlayer}
          />
        </div>

        {/* Sidebar — squad list */}
        <div>
          <SquadList
            allPlayers={MOCK_PLAYERS}
            assignedIds={assignedIds}
            substituteIds={substituteIds}
            onAddPlayer={addPlayer}
            onRemovePlayer={removePlayer}
            positionLabels={formation.positions.map((p) => p.label)}
          />
        </div>
      </div>
    </div>
  );
}

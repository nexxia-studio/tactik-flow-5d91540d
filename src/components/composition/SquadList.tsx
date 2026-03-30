import { type FUTPlayer, type PositionCategory, getPositionCategory } from "./mockPlayers";
import { ShieldAlert, Cross, Ban, UserPlus, UserMinus } from "lucide-react";

interface Props {
  /** All players in the squad */
  allPlayers: FUTPlayer[];
  /** IDs of players currently on the pitch (titulaires) */
  assignedIds: (string | null)[];
  /** IDs of players marked as substitutes */
  substituteIds: string[];
  /** Called when a non-assigned player is clicked → add to pitch */
  onAddPlayer: (playerId: string) => void;
  /** Called when a titulaire is clicked in the list → remove from pitch */
  onRemovePlayer: (playerId: string) => void;
  /** Formation position labels for display */
  positionLabels: string[];
}

const CATEGORY_ORDER: PositionCategory[] = ["GK", "DEF", "MID", "ATT"];
const CATEGORY_LABELS: Record<PositionCategory, string> = {
  GK: "Gardien",
  DEF: "Défenseurs",
  MID: "Milieux",
  ATT: "Attaquants",
};

const STATUS_INFO = {
  injured: { label: "Blessé", icon: Cross, colorClass: "text-[var(--color-danger)]" },
  suspended: { label: "Suspendu", icon: ShieldAlert, colorClass: "text-[var(--color-warning)]" },
  unavailable: { label: "Indisponible", icon: Ban, colorClass: "text-t-muted" },
};

function PlayerRow({
  player,
  isAssigned,
  slotLabel,
  isUnavailable,
  onAdd,
  onRemove,
}: {
  player: FUTPlayer;
  isAssigned: boolean;
  slotLabel?: string;
  isUnavailable: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const statusMeta = player.status !== "available" ? STATUS_INFO[player.status] : null;

  return (
    <button
      onClick={isUnavailable ? undefined : isAssigned ? onRemove : onAdd}
      disabled={isUnavailable}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left select-none ${
        isUnavailable
          ? "bg-bg-surface-2/50 opacity-50 cursor-not-allowed"
          : isAssigned
            ? "bg-primary-dim border border-primary-border hover:bg-primary-dim/70 cursor-pointer"
            : "bg-bg-surface-2 border border-b-subtle hover:bg-bg-surface-3 cursor-pointer"
      }`}
    >
      {/* Jersey number */}
      <span className="font-display text-[13px] text-t-muted w-6 text-center shrink-0">
        #{player.jerseyNumber}
      </span>

      {/* Player info */}
      <div className="flex-1 min-w-0">
        <p className="font-ui text-[12px] text-t-primary truncate">
          {player.firstName} {player.lastName}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="font-ui text-[10px] text-t-muted">{player.position}</span>
          {slotLabel && (
            <span className="font-ui text-[9px] text-primary uppercase">→ {slotLabel}</span>
          )}
          {statusMeta && (
            <span className={`font-ui text-[9px] flex items-center gap-0.5 ${statusMeta.colorClass}`}>
              <statusMeta.icon className="h-2.5 w-2.5" />
              {statusMeta.label}
            </span>
          )}
        </div>
      </div>

      {/* Rating */}
      <span
        className={`font-display text-[13px] shrink-0 ${
          player.rating >= 80
            ? "text-[var(--color-success)]"
            : player.rating >= 70
              ? "text-[var(--color-warning)]"
              : "text-t-primary"
        }`}
      >
        {player.rating}
      </span>

      {/* Action icon */}
      {!isUnavailable && (
        <span className="shrink-0">
          {isAssigned ? (
            <UserMinus className="h-3.5 w-3.5 text-[var(--color-danger)]" />
          ) : (
            <UserPlus className="h-3.5 w-3.5 text-primary" />
          )}
        </span>
      )}
    </button>
  );
}

export function SquadList({
  allPlayers,
  assignedIds,
  substituteIds,
  onAddPlayer,
  onRemovePlayer,
  positionLabels,
}: Props) {
  const assignedSet = new Set(assignedIds.filter(Boolean));
  const substituteSet = new Set(substituteIds);

  // Build player map
  const playerMap = new Map(allPlayers.map((p) => [p.id, p]));

  // Find slot label for an assigned player
  const getSlotLabel = (playerId: string): string | undefined => {
    const slotIdx = assignedIds.indexOf(playerId);
    if (slotIdx === -1) return undefined;
    return positionLabels[slotIdx];
  };

  // Categorize available (non-unavailable) players
  const unavailablePlayers = allPlayers.filter(
    (p) => p.status === "injured" || p.status === "suspended" || p.status === "unavailable"
  );

  const availablePlayers = allPlayers.filter((p) => p.status === "available");

  // Split titulaires by position category
  const titulaires = availablePlayers.filter((p) => assignedSet.has(p.id));
  const substitutes = availablePlayers.filter((p) => substituteSet.has(p.id) && !assignedSet.has(p.id));
  const nonSelected = availablePlayers.filter(
    (p) => !assignedSet.has(p.id) && !substituteSet.has(p.id)
  );

  // Group titulaires by position category
  const titulairesByCategory = new Map<PositionCategory, FUTPlayer[]>();
  for (const cat of CATEGORY_ORDER) {
    titulairesByCategory.set(
      cat,
      titulaires.filter((p) => getPositionCategory(p.position) === cat)
    );
  }

  const renderSection = (title: string, players: FUTPlayer[], isAssigned: boolean) => {
    if (players.length === 0) return null;
    return (
      <div>
        <h4 className="font-display text-[11px] text-t-muted uppercase tracking-wider mb-1.5 px-1">
          {title}
        </h4>
        <div className="space-y-1">
          {players.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              isAssigned={isAssigned}
              slotLabel={isAssigned ? getSlotLabel(player.id) : undefined}
              isUnavailable={player.status !== "available"}
              onAdd={() => onAddPlayer(player.id)}
              onRemove={() => onRemovePlayer(player.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-bg-surface-1 border border-b-subtle rounded-xl p-4">
      <h3 className="font-display text-[14px] text-t-primary mb-1">EFFECTIF</h3>
      <p className="font-ui text-[10px] text-t-muted mb-3">
        Clique pour ajouter / retirer un joueur
      </p>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
        {/* Titulaires grouped by position */}
        {CATEGORY_ORDER.map((cat) =>
          renderSection(
            CATEGORY_LABELS[cat],
            titulairesByCategory.get(cat) || [],
            true
          )
        )}

        {/* Remplaçants */}
        {renderSection("Remplaçants", substitutes, false)}

        {/* Non sélectionnés */}
        {renderSection("Non sélectionnés", nonSelected, false)}

        {/* Blessés / Suspendus / Indisponibles */}
        {unavailablePlayers.length > 0 && (
          <div>
            <h4 className="font-display text-[11px] text-t-muted uppercase tracking-wider mb-1.5 px-1">
              Blessés / Suspendus / Indisponibles
            </h4>
            <div className="space-y-1">
              {unavailablePlayers.map((player) => (
                <PlayerRow
                  key={player.id}
                  player={player}
                  isAssigned={false}
                  isUnavailable
                  onAdd={() => {}}
                  onRemove={() => {}}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

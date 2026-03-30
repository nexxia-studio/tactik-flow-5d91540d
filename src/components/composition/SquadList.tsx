import { useState, useRef, useCallback } from "react";
import { type FUTPlayer, type PlayerStatus, type PositionCategory, getPositionCategory } from "./mockPlayers";
import { ShieldAlert, Cross, Ban, UserPlus, UserMinus, ArrowRightLeft } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "@/components/ui/context-menu";

interface Props {
  allPlayers: FUTPlayer[];
  assignedIds: (string | null)[];
  substituteIds: string[];
  onAddPlayer: (playerId: string) => void;
  onRemovePlayer: (playerId: string) => void;
  onToggleSubstitute: (playerId: string) => void;
  onChangeStatus: (playerId: string, status: PlayerStatus) => void;
  maxSubstitutes: number;
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

const STATUS_OPTIONS: { value: PlayerStatus; label: string }[] = [
  { value: "available", label: "Actif" },
  { value: "suspended", label: "Suspendu" },
  { value: "injured", label: "Blessé" },
  { value: "unavailable", label: "Indisponible" },
];

/** Hook for long-press detection (mobile) */
function useLongPress(callback: () => void, delay = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const start = useCallback(() => {
    didLongPress.current = false;
    timerRef.current = setTimeout(() => {
      didLongPress.current = true;
      callback();
    }, delay);
  }, [callback, delay]);

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchCancel: cancel,
    didLongPress,
  };
}

function PlayerRow({
  player,
  isAssigned,
  isSubstitute,
  slotLabel,
  isUnavailable,
  onClick,
  onChangeStatus,
}: {
  player: FUTPlayer;
  isAssigned: boolean;
  isSubstitute: boolean;
  slotLabel?: string;
  isUnavailable: boolean;
  onClick: () => void;
  onChangeStatus: (status: PlayerStatus) => void;
}) {
  const statusMeta = player.status !== "available" ? STATUS_INFO[player.status] : null;

  const longPress = useLongPress(() => {
    // On mobile long press, we programmatically trigger context menu via state
    // But since ContextMenu handles right-click natively, for mobile we'll
    // use a different approach - the ContextMenu trigger handles touch events
  });

  const rowContent = (
    <button
      onClick={(e) => {
        // Don't handle click if it was a long press
        if (longPress.didLongPress.current) {
          longPress.didLongPress.current = false;
          return;
        }
        onClick();
      }}
      disabled={isUnavailable}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left select-none ${
        isUnavailable
          ? "bg-bg-surface-2/50 opacity-50 cursor-not-allowed"
          : isAssigned
            ? "bg-primary-dim border border-primary-border hover:bg-primary-dim/70 cursor-pointer"
            : isSubstitute
              ? "bg-accent/10 border border-accent/30 hover:bg-accent/20 cursor-pointer"
              : "bg-bg-surface-2 border border-b-subtle hover:bg-bg-surface-3 cursor-pointer"
      }`}
      {...longPress}
    >
      <span className="font-display text-[13px] text-t-muted w-6 text-center shrink-0">
        #{player.jerseyNumber}
      </span>

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

      {!isUnavailable && (
        <span className="shrink-0">
          {isAssigned ? (
            <UserMinus className="h-3.5 w-3.5 text-[var(--color-danger)]" />
          ) : isSubstitute ? (
            <ArrowRightLeft className="h-3.5 w-3.5 text-accent" />
          ) : (
            <UserPlus className="h-3.5 w-3.5 text-primary" />
          )}
        </span>
      )}
    </button>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{rowContent}</ContextMenuTrigger>
      <ContextMenuContent className="bg-bg-surface-1 border-b-subtle min-w-[160px]">
        <ContextMenuLabel className="font-display text-[11px] text-t-muted">
          Statut de {player.firstName}
        </ContextMenuLabel>
        <ContextMenuSeparator className="bg-b-subtle" />
        {STATUS_OPTIONS.map((opt) => (
          <ContextMenuItem
            key={opt.value}
            onClick={() => onChangeStatus(opt.value)}
            className={`font-ui text-[12px] cursor-pointer ${
              player.status === opt.value ? "text-primary font-semibold" : "text-t-primary"
            }`}
          >
            {player.status === opt.value && <span className="mr-1.5">✓</span>}
            {opt.label}
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function SquadList({
  allPlayers,
  assignedIds,
  substituteIds,
  onAddPlayer,
  onRemovePlayer,
  onToggleSubstitute,
  onChangeStatus,
  maxSubstitutes,
  positionLabels,
}: Props) {
  const assignedSet = new Set(assignedIds.filter(Boolean));
  const substituteSet = new Set(substituteIds);

  const getSlotLabel = (playerId: string): string | undefined => {
    const slotIdx = assignedIds.indexOf(playerId);
    if (slotIdx === -1) return undefined;
    return positionLabels[slotIdx];
  };

  const unavailablePlayers = allPlayers.filter(
    (p) => p.status === "injured" || p.status === "suspended" || p.status === "unavailable"
  );
  const availablePlayers = allPlayers.filter((p) => p.status === "available");

  const titulaires = availablePlayers.filter((p) => assignedSet.has(p.id));
  const substitutes = availablePlayers.filter((p) => substituteSet.has(p.id) && !assignedSet.has(p.id));
  const nonSelected = availablePlayers.filter(
    (p) => !assignedSet.has(p.id) && !substituteSet.has(p.id)
  );

  const titulairesByCategory = new Map<PositionCategory, FUTPlayer[]>();
  for (const cat of CATEGORY_ORDER) {
    titulairesByCategory.set(
      cat,
      titulaires.filter((p) => getPositionCategory(p.position) === cat)
    );
  }

  const renderSection = (
    title: string,
    players: FUTPlayer[],
    mode: "titulaire" | "substitute" | "non-selected" | "unavailable"
  ) => {
    if (players.length === 0) return null;
    return (
      <div>
        <h4 className="font-display text-[11px] text-t-muted uppercase tracking-wider mb-1.5 px-1">
          {title}
          {mode === "substitute" && (
            <span className="ml-1 text-accent">({players.length}/{maxSubstitutes})</span>
          )}
        </h4>
        <div className="space-y-1">
          {players.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              isAssigned={mode === "titulaire"}
              isSubstitute={mode === "substitute"}
              slotLabel={mode === "titulaire" ? getSlotLabel(player.id) : undefined}
              isUnavailable={mode === "unavailable"}
              onClick={
                mode === "titulaire"
                  ? () => onRemovePlayer(player.id)
                  : mode === "substitute"
                    ? () => onToggleSubstitute(player.id)
                    : mode === "non-selected"
                      ? () => onToggleSubstitute(player.id)
                      : () => {}
              }
              onChangeStatus={(status) => onChangeStatus(player.id, status)}
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
        Clique pour gérer · Clic droit pour changer le statut
      </p>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
        {CATEGORY_ORDER.map((cat) =>
          renderSection(
            CATEGORY_LABELS[cat],
            titulairesByCategory.get(cat) || [],
            "titulaire"
          )
        )}

        {renderSection("Remplaçants", substitutes, "substitute")}
        {renderSection("Non sélectionnés", nonSelected, "non-selected")}
        {renderSection("Blessés / Suspendus / Indisponibles", unavailablePlayers, "unavailable")}
      </div>
    </div>
  );
}

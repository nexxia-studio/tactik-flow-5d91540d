import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MOCK_FUT_COMPOSITIONS, MOCK_CONVOCATION_PLAYERS,
  type FUTComposition, type SelectionStatus,
} from "@/data/mockCommunication";

interface Props {
  matchId: string;
  selections: Record<string, SelectionStatus>;
  onImportComposition: (selections: Record<string, SelectionStatus>, compositionId: string) => void;
  includeInMessage: boolean;
  onIncludeChange: (v: boolean) => void;
  wasModified: boolean;
}

// Position emoji mapping for WhatsApp message
export const POSITION_LINE_MAP: Record<string, { emoji: string; order: number }> = {
  GK:  { emoji: "🥅", order: 0 },
  RB:  { emoji: "🛡️", order: 1 },
  CB:  { emoji: "🛡️", order: 1 },
  LB:  { emoji: "🛡️", order: 1 },
  CDM: { emoji: "⚡", order: 2 },
  CM:  { emoji: "⚡", order: 2 },
  CAM: { emoji: "⚡", order: 2 },
  RW:  { emoji: "🏃", order: 3 },
  LW:  { emoji: "🏃", order: 3 },
  ST:  { emoji: "🏃", order: 3 },
};

export function buildCompositionText(compositionId: string): string {
  const comp = MOCK_FUT_COMPOSITIONS.find((c) => c.id === compositionId);
  if (!comp) return "";

  const playerMap = new Map(MOCK_CONVOCATION_PLAYERS.map((p) => [p.id, p]));

  // Group starters by line
  const lines: Map<number, { emoji: string; names: string[] }> = new Map();

  for (const s of comp.starters) {
    const player = playerMap.get(s.player_id);
    if (!player) continue;
    const info = POSITION_LINE_MAP[s.position] ?? { emoji: "⚽", order: 4 };
    if (!lines.has(info.order)) {
      lines.set(info.order, { emoji: info.emoji, names: [] });
    }
    lines.get(info.order)!.names.push(`${player.first_name[0]}. ${player.last_name}`);
  }

  const result: string[] = [];
  result.push(`📋 COMPOSITION :`);
  result.push(comp.formation);

  const sortedLines = [...lines.entries()].sort(([a], [b]) => a - b);
  for (const [, line] of sortedLines) {
    result.push(`${line.emoji} ${line.names.join(" — ")}`);
  }

  return result.join("\n");
}

export default function FUTCompositionLink({
  matchId, selections, onImportComposition,
  includeInMessage, onIncludeChange, wasModified,
}: Props) {
  const [enabled, setEnabled] = useState(false);
  const [selectedCompId, setSelectedCompId] = useState<string>("");

  const available = useMemo(
    () => MOCK_FUT_COMPOSITIONS.filter((c) => c.match_id === matchId),
    [matchId],
  );

  // Reset when match changes
  useEffect(() => {
    setEnabled(false);
    setSelectedCompId("");
  }, [matchId]);

  const handleToggle = (on: boolean) => {
    setEnabled(on);
    if (!on) setSelectedCompId("");
  };

  const handleSelect = (compId: string) => {
    setSelectedCompId(compId);
    const comp = MOCK_FUT_COMPOSITIONS.find((c) => c.id === compId);
    if (!comp) return;

    const newSelections: Record<string, SelectionStatus> = {};
    comp.starters.forEach((s) => { newSelections[s.player_id] = "starter"; });
    comp.substitutes.forEach((id) => { newSelections[id] = "sub"; });
    onImportComposition(newSelections, compId);
  };

  if (!matchId) return null;

  return (
    <div className="space-y-3">
      <p className="font-ui text-[11px] text-t-muted uppercase tracking-wider">
        Composition FUT
      </p>

      <div className="flex items-center gap-3">
        <Switch
          checked={enabled}
          onCheckedChange={handleToggle}
        />
        <span className="font-ui text-[13px] text-t-secondary">
          Utiliser une composition FUT
        </span>
        {selectedCompId && (
          <span
            className="ml-auto px-2.5 py-1 rounded-md font-ui text-[10px] uppercase tracking-wider"
            style={{
              backgroundColor: wasModified
                ? "rgba(255,170,0,0.15)"
                : "rgba(22,255,110,0.15)",
              color: wasModified
                ? "var(--color-warning, #ffaa00)"
                : "var(--color-primary)",
            }}
          >
            {wasModified ? "Compo FUT modifiée" : "Compo FUT importée"}
          </span>
        )}
      </div>

      {enabled && (
        <>
          {available.length > 0 ? (
            <Select value={selectedCompId} onValueChange={handleSelect}>
              <SelectTrigger className="bg-bg-surface-2 border-b-subtle font-ui text-[13px] text-t-primary max-w-md">
                <SelectValue placeholder="Sélectionner une composition" />
              </SelectTrigger>
              <SelectContent className="bg-bg-surface-1 border-b-subtle">
                {available.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="font-ui text-[13px]">
                    Composition vs {MOCK_FUT_COMPOSITIONS.length > 0
                      ? `— ${c.formation}`
                      : c.formation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="bg-bg-surface-2 border border-b-subtle rounded-xl p-4">
              <p className="font-ui text-[13px] text-t-muted">
                Aucune composition créée pour ce match.{" "}
                <Link to="/composition" className="text-primary hover:underline">
                  Créer une composition →
                </Link>
              </p>
            </div>
          )}

          {selectedCompId && (
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="include-comp"
                checked={includeInMessage}
                onCheckedChange={(v) => onIncludeChange(!!v)}
              />
              <label htmlFor="include-comp" className="font-ui text-[12px] text-t-secondary cursor-pointer">
                Inclure la composition dans le message WhatsApp
              </label>
            </div>
          )}
        </>
      )}
    </div>
  );
}

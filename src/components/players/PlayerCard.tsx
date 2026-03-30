import { User, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Player } from "@/hooks/usePlayers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const positionColors: Record<string, string> = {
  Gardien: "bg-[var(--color-info)]/15 text-[var(--color-info)]",
  Défenseur: "bg-[var(--color-danger)]/15 text-[var(--color-danger)]",
  Milieu: "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
  Attaquant: "bg-[var(--color-success)]/15 text-[var(--color-success)]",
};

interface PlayerCardProps {
  player: Player;
  onEdit: (player: Player) => void;
  onDelete: (player: Player) => void;
}

export function PlayerCard({ player, onEdit, onDelete }: PlayerCardProps) {
  return (
    <div className="bg-bg-surface-1 border border-b-subtle rounded-xl p-4 flex items-center gap-4 hover:border-b-default transition-all group animate-fade-in">
      {/* Avatar */}
      <div className="h-10 w-10 rounded-full bg-bg-surface-2 flex items-center justify-center shrink-0">
        {player.jersey_number ? (
          <span className="font-display text-[14px] text-t-primary">{player.jersey_number}</span>
        ) : (
          <User className="h-4 w-4 text-t-muted" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-ui text-[14px] text-t-primary truncate">
          {player.first_name} <span className="font-semibold">{player.last_name.toUpperCase()}</span>
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-ui font-semibold uppercase tracking-wider ${positionColors[player.position] || "bg-bg-surface-2 text-t-secondary"}`}>
            {player.position}
          </span>
          {player.email && (
            <span className="text-[11px] font-ui text-t-muted truncate">{player.email}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1.5 rounded-lg text-t-muted hover:bg-bg-surface-2 hover:text-t-primary transition-all opacity-0 group-hover:opacity-100 cursor-pointer">
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-bg-surface-2 border-b-subtle">
          <DropdownMenuItem onClick={() => onEdit(player)} className="text-[13px] font-ui cursor-pointer">
            <Pencil className="h-3.5 w-3.5 mr-2" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(player)} className="text-[13px] font-ui text-danger cursor-pointer">
            <Trash2 className="h-3.5 w-3.5 mr-2" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

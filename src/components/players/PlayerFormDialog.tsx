import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Player } from "@/hooks/usePlayers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const POSITIONS = ["Gardien", "Défenseur", "Milieu", "Attaquant"];

interface PlayerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player?: Player | null;
  onSubmit: (data: {
    first_name: string;
    last_name: string;
    position: string;
    jersey_number: number | null;
    email: string | null;
    phone: string | null;
  }) => void;
  submitting: boolean;
}

export function PlayerFormDialog({ open, onOpenChange, player, onSubmit, submitting }: PlayerFormDialogProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("Milieu");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (player) {
      setFirstName(player.first_name);
      setLastName(player.last_name);
      setPosition(player.position);
      setJerseyNumber(player.jersey_number?.toString() || "");
      setEmail(player.email || "");
      setPhone(player.phone || "");
    } else {
      setFirstName("");
      setLastName("");
      setPosition("Milieu");
      setJerseyNumber("");
      setEmail("");
      setPhone("");
    }
  }, [player, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      position,
      jersey_number: jerseyNumber ? parseInt(jerseyNumber) : null,
      email: email.trim() || null,
      phone: phone.trim() || null,
    });
  };

  const inputClass =
    "w-full font-ui text-[13px] bg-bg-surface-1 border border-b-default text-t-primary rounded-lg px-3 py-2.5 outline-none focus:border-primary transition-colors placeholder:text-t-muted";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-bg-surface-2 border-b-subtle sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-t-primary" style={{ fontSize: "var(--text-h3)" }}>
            {player ? "MODIFIER JOUEUR" : "AJOUTER JOUEUR"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-ui text-[11px] uppercase tracking-[0.15em] text-t-secondary">Prénom</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="Prénom" className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="font-ui text-[11px] uppercase tracking-[0.15em] text-t-secondary">Nom</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Nom" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-ui text-[11px] uppercase tracking-[0.15em] text-t-secondary">Position</label>
              <select value={position} onChange={(e) => setPosition(e.target.value)} className={`${inputClass} cursor-pointer`}>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-ui text-[11px] uppercase tracking-[0.15em] text-t-secondary">Numéro</label>
              <input type="number" min="1" max="99" value={jerseyNumber} onChange={(e) => setJerseyNumber(e.target.value)} placeholder="—" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-ui text-[11px] uppercase tracking-[0.15em] text-t-secondary">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optionnel" className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="font-ui text-[11px] uppercase tracking-[0.15em] text-t-secondary">Téléphone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optionnel" className={inputClass} />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !firstName.trim() || !lastName.trim()}
            className="w-full font-ui text-[11px] font-semibold tracking-wider uppercase
                       px-4 py-3 rounded-lg bg-primary text-primary-text
                       hover:opacity-90 active:scale-[0.98] transition-all
                       disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Enregistrement…" : player ? "Enregistrer" : "Ajouter"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

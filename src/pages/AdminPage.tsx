import { useState } from "react";
import {
  Users, Calendar, Trophy, ChevronDown, Download, X, Send,
  Settings, CreditCard, FileText, AlertTriangle, RotateCcw, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DangerConfirmDialog } from "@/components/admin/DangerConfirmDialog";

/* ── Mock data ── */
const CLUB = {
  name: "RFC XHOFFRAIX",
  city: "Xhoffraix",
  division: "Liège 2C",
  sport: "Football",
  players_count: 18,
  season: "2024-2025",
  matches_played: 13,
};

const SUBSCRIPTION = {
  plan: "solo" as "solo" | "solo+" | "club",
  plan_label: "SOLO",
  amount: 9,
  period: "mois" as const,
  renewal_date: "1 mai 2025",
  status: "active" as const,
  licenses_used: 1,
  licenses_total: 1,
};

const INVOICES = [
  { id: "inv1", date: "1 mars 2025", description: "Tactik Solo — Mars 2025", amount: "9,00 €", status: "paid" as const },
  { id: "inv2", date: "1 février 2025", description: "Tactik Solo — Février 2025", amount: "9,00 €", status: "paid" as const },
  { id: "inv3", date: "1 janvier 2025", description: "Tactik Solo — Janvier 2025", amount: "9,00 €", status: "paid" as const },
];

const INVITATIONS = [
  { id: "i1", name: "Marc Lecomte", email: "marc@xhoffraix.be", role: "coach" as const, status: "active" as const, date: "12 déc. 2024" },
  { id: "i2", name: "Pierre Xhonneux", email: "pierre@gmail.com", role: "fine_manager" as const, status: "pending" as const, date: "3 mars 2025" },
];

const PLAN_STYLES = {
  solo: { bg: "bg-primary", text: "text-primary-text" },
  "solo+": { bg: "bg-[var(--color-info)]", text: "text-white" },
  club: { bg: "bg-[var(--color-warning)]", text: "text-black" },
};

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  coach: { label: "Coach", color: "bg-[var(--color-info)]/15 text-[var(--color-info)]" },
  fine_manager: { label: "Gestionnaire amendes", color: "bg-[var(--color-warning)]/15 text-[var(--color-warning)]" },
};

export default function AdminPage() {
  const [dangerAction, setDangerAction] = useState<"reset" | "delete" | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("coach");

  const planStyle = PLAN_STYLES[SUBSCRIPTION.plan] ?? PLAN_STYLES.solo;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="font-display text-t-primary leading-none" style={{ fontSize: "var(--text-h1)" }}>
          ADMINISTRATION
        </h1>
        <p className="text-t-muted font-ui italic text-[var(--text-small)] mt-2">
          Gestion du club et de l'abonnement
        </p>
      </div>

      {/* Section 1 — Mon club */}
      <section className="bg-bg-surface-1 border border-b-subtle rounded-xl p-6 space-y-6">
        <h2 className="font-display text-t-primary text-[var(--text-h3)] uppercase">Mon club</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Col 1 — Infos */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-4">
              <div className="w-[80px] h-[80px] rounded-full bg-primary-dim flex items-center justify-center shrink-0">
                <span className="font-display text-[24px] text-primary">RFC</span>
              </div>
              <div>
                <p className="font-display text-[20px] text-t-primary leading-tight">{CLUB.name}</p>
                <p className="font-ui italic text-t-muted text-[var(--text-small)]">{CLUB.city}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-md font-ui text-[var(--text-label)] bg-primary-dim text-primary">
                    {CLUB.division}
                  </span>
                  <span className="px-2 py-0.5 rounded-md font-ui text-[var(--text-label)] bg-bg-surface-3 text-t-secondary">
                    {CLUB.sport}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2 — Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Joueurs", value: CLUB.players_count, icon: Users },
              { label: "Saison", value: CLUB.season, icon: Calendar },
              { label: "Matchs joués", value: CLUB.matches_played, icon: Trophy },
            ].map((stat) => (
              <div key={stat.label} className="bg-bg-surface-2 border border-b-subtle rounded-xl p-4 flex flex-col items-center gap-2 text-center">
                <stat.icon className="w-5 h-5 text-t-muted" />
                <span className="font-display text-[18px] text-t-primary leading-none">{stat.value}</span>
                <span className="font-ui text-[var(--text-micro)] text-t-muted uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full py-2.5 rounded-xl font-ui text-[var(--text-label)] uppercase tracking-wider bg-transparent border border-b-default text-t-secondary hover:bg-bg-surface-2 transition-all">
          Modifier les infos du club
        </button>
      </section>

      {/* Section 2 — Abonnement */}
      <section className="bg-bg-surface-1 border border-b-subtle rounded-xl p-6 space-y-6">
        <h2 className="font-display text-t-primary text-[var(--text-h3)] uppercase">Abonnement</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left — Plan info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-lg font-display text-[14px] uppercase ${planStyle.bg} ${planStyle.text}`}>
                {SUBSCRIPTION.plan_label}
              </span>
              <span className="px-2 py-0.5 rounded-md font-ui text-[var(--text-label)] bg-[var(--color-success)]/15 text-[var(--color-success)]">
                Actif
              </span>
            </div>
            <p className="font-ui text-[var(--text-micro)] text-t-muted uppercase tracking-wider">Plan actuel</p>
            <p className="font-ui text-[var(--text-body)] text-t-secondary">
              Renouvellement le {SUBSCRIPTION.renewal_date}
            </p>

            {SUBSCRIPTION.plan === "club" && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between font-ui text-[var(--text-small)]">
                  <span className="text-t-secondary">Licences utilisées</span>
                  <span className="text-t-primary">{SUBSCRIPTION.licenses_used} / {SUBSCRIPTION.licenses_total}</span>
                </div>
                <Progress value={(SUBSCRIPTION.licenses_used / SUBSCRIPTION.licenses_total) * 100} className="h-2" />
              </div>
            )}
          </div>

          {/* Right — Price */}
          <div className="flex items-center justify-center md:justify-end gap-1">
            <span className="font-display text-[32px] text-primary leading-none">{SUBSCRIPTION.amount}€</span>
            <span className="font-ui text-t-muted text-[var(--text-body)]">/{SUBSCRIPTION.period}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex-1 py-2.5 rounded-xl font-ui text-[var(--text-label)] uppercase tracking-wider bg-primary text-primary-text hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <CreditCard className="w-4 h-4" />
            Gérer mon abonnement
          </button>
          <button className="flex-1 py-2.5 rounded-xl font-ui text-[var(--text-label)] uppercase tracking-wider bg-transparent border border-b-default text-t-secondary hover:bg-bg-surface-2 transition-all">
            Changer de plan
          </button>
        </div>

        {/* Invoices */}
        <Accordion type="single" collapsible>
          <AccordionItem value="invoices" className="border-b-subtle">
            <AccordionTrigger className="font-ui text-[var(--text-body)] text-t-secondary hover:text-t-primary">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Historique des factures
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {INVOICES.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between bg-bg-surface-2 border border-b-subtle rounded-lg p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-ui text-[var(--text-body)] text-t-primary">{inv.description}</p>
                      <p className="font-ui text-[var(--text-micro)] text-t-muted">{inv.date}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-ui text-[var(--text-body)] text-t-primary">{inv.amount}</span>
                      <span className="px-2 py-0.5 rounded-md font-ui text-[var(--text-label)] bg-[var(--color-success)]/15 text-[var(--color-success)]">
                        Payé
                      </span>
                      <button className="p-1.5 rounded-lg hover:bg-bg-surface-3 transition-colors text-t-muted hover:text-t-primary">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Section 3 — Invitations */}
      <section className="bg-bg-surface-1 border border-b-subtle rounded-xl p-6 space-y-6">
        <h2 className="font-display text-t-primary text-[var(--text-h3)] uppercase">Accès coaches</h2>

        <div className="space-y-3">
          {INVITATIONS.map((inv) => {
            const roleInfo = ROLE_LABELS[inv.role] ?? { label: inv.role, color: "bg-bg-surface-3 text-t-secondary" };
            return (
              <div key={inv.id} className="flex items-center gap-3 bg-bg-surface-2 border border-b-subtle rounded-xl p-4">
                <div className="w-10 h-10 rounded-full bg-primary-dim flex items-center justify-center shrink-0">
                  <span className="font-display text-[12px] text-primary">
                    {inv.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-ui text-[var(--text-body)] text-t-primary">{inv.name}</p>
                  <p className="font-ui italic text-[var(--text-small)] text-t-muted truncate">{inv.email}</p>
                  <p className="font-ui text-[var(--text-micro)] text-t-muted mt-0.5">{inv.date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-md font-ui text-[var(--text-label)] ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                  {inv.status === "active" ? (
                    <span className="px-2 py-0.5 rounded-md font-ui text-[var(--text-label)] bg-[var(--color-success)]/15 text-[var(--color-success)]">
                      Actif
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md font-ui text-[var(--text-label)] bg-bg-surface-3 text-t-muted">
                      Invitation envoyée
                    </span>
                  )}
                  <button
                    onClick={() => toast.success(`Accès révoqué pour ${inv.name}`)}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-danger)]/10 transition-colors text-t-muted hover:text-[var(--color-danger)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Invite form */}
        <div className="border-t border-b-subtle pt-5">
          <p className="font-ui text-[var(--text-label)] text-t-muted uppercase tracking-wider mb-3">
            Inviter un nouveau membre
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@exemple.com"
              type="email"
              className="flex-1 bg-bg-surface-2 border-b-subtle font-ui text-[var(--text-body)]"
            />
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="w-full sm:w-[220px] bg-bg-surface-2 border-b-subtle font-ui text-[var(--text-body)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-bg-surface-2 border-b-subtle">
                <SelectItem value="coach" className="font-ui">Coach</SelectItem>
                <SelectItem value="fine_manager" className="font-ui">Gestionnaire amendes</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={() => {
                if (!inviteEmail.trim()) return;
                toast.success(`Invitation envoyée à ${inviteEmail}`);
                setInviteEmail("");
              }}
              className="py-2.5 px-5 rounded-xl font-ui text-[var(--text-label)] uppercase tracking-wider bg-primary text-primary-text hover:opacity-90 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <Send className="w-4 h-4" />
              Envoyer l'invitation
            </button>
          </div>
        </div>
      </section>

      {/* Section 4 — Danger zone */}
      <section className="bg-bg-surface-1 border border-[rgba(255,59,48,0.3)] rounded-xl p-6 space-y-6">
        <h2 className="font-ui text-[var(--color-danger)] text-[var(--text-h3)] uppercase tracking-wider">
          Zone de danger
        </h2>

        <div className="space-y-4">
          {/* Reset season */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-bg-surface-2 border border-b-subtle rounded-xl p-4">
            <div className="flex-1">
              <p className="font-ui text-[var(--text-body)] text-t-primary flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[var(--color-danger)]" />
                Réinitialiser les données de la saison
              </p>
              <p className="font-ui text-[var(--text-small)] text-t-muted mt-1">
                Supprime tous les matchs, entraînements et stats de la saison en cours
              </p>
            </div>
            <button
              onClick={() => setDangerAction("reset")}
              className="px-4 py-2 rounded-xl font-ui text-[var(--text-label)] uppercase tracking-wider border border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-all shrink-0"
            >
              Réinitialiser
            </button>
          </div>

          {/* Delete club */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-bg-surface-2 border border-b-subtle rounded-xl p-4">
            <div className="flex-1">
              <p className="font-ui text-[var(--text-body)] text-t-primary flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-[var(--color-danger)]" />
                Supprimer le club
              </p>
              <p className="font-ui text-[var(--text-small)] text-t-muted mt-1">
                Action irréversible. Toutes les données seront supprimées.
              </p>
            </div>
            <button
              onClick={() => setDangerAction("delete")}
              className="px-4 py-2 rounded-xl font-ui text-[var(--text-label)] uppercase tracking-wider bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger)]/90 transition-all shrink-0"
            >
              Supprimer
            </button>
          </div>
        </div>
      </section>

      {/* Danger confirmation dialog */}
      <DangerConfirmDialog
        open={dangerAction !== null}
        onOpenChange={(open) => { if (!open) setDangerAction(null); }}
        action={dangerAction ?? "reset"}
        clubName={CLUB.name}
        onConfirm={() => {
          toast.success(dangerAction === "reset" ? "Saison réinitialisée ✓" : "Club supprimé ✓");
          setDangerAction(null);
        }}
      />
    </div>
  );
}

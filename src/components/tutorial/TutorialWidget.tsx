import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  List,
  BookOpen,
} from "lucide-react";
import { TUTORIAL_STEPS, type TutorialStep } from "./steps";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Permet de piloter l'iframe du calculateur (changement d'onglet, surlignage). */
  runCommand: (action: string, params: any) => Promise<any>;
};

export function TutorialWidget({ open, onOpenChange, runCommand }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [view, setView] = useState<"step" | "summary">("step");

  const step: TutorialStep = TUTORIAL_STEPS[stepIdx];

  const grouped = useMemo(() => {
    const map = new Map<string, { idx: number; step: TutorialStep }[]>();
    TUTORIAL_STEPS.forEach((s, idx) => {
      const k = s.category;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push({ idx, step: s });
    });
    return map;
  }, []);

  // Quand l'étape change : on bascule sur le bon onglet, on rejoue les
  // commandes de setup éventuelles (pour pré-remplir un exemple) puis on
  // surligne la zone cible. L'ordre tab → setup → highlight est important :
  // certaines commandes de setup (run_calc, apply_preset…) supposent que
  // les bons champs sont visibles dans le DOM.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        if (step.tab) await runCommand("switch_tab", { tab: step.tab });
        if (cancelled) return;
        if (step.setup && step.setup.length) {
          for (const cmd of step.setup) {
            if (cancelled) return;
            try {
              await runCommand(cmd.action, cmd.params || {});
            } catch {
              /* continue malgré l'erreur d'une commande isolée */
            }
          }
          // petite pause pour laisser le DOM se mettre à jour avant de
          // calculer le rect du surlignage.
          await new Promise((r) => setTimeout(r, 120));
        }
        if (cancelled) return;
        if (step.highlight) {
          await runCommand("highlight", { selector: step.highlight });
        } else {
          await runCommand("clear_highlight", {});
        }
      } catch {
        /* iframe pas prête, on ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, step, runCommand]);

  // Nettoyage du surlignage à la fermeture.
  useEffect(() => {
    if (!open) {
      runCommand("clear_highlight", {}).catch(() => {});
    }
  }, [open, runCommand]);

  const next = () =>
    setStepIdx((i) => Math.min(i + 1, TUTORIAL_STEPS.length - 1));
  const prev = () => setStepIdx((i) => Math.max(i - 1, 0));
  const goTo = (i: number) => {
    setStepIdx(i);
    setView("step");
  };

  const progress = Math.round(((stepIdx + 1) / TUTORIAL_STEPS.length) * 100);

  // ─────────────── Bouton flottant (tutoriel fermé) ───────────────
  if (!open) {
    return (
      <button
        onClick={() => onOpenChange(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-5 py-3 text-white shadow-lg hover:scale-105 transition-transform bg-blue-600 hover:bg-blue-700"
      >
        <GraduationCap className="w-5 h-5" />
        <span className="font-medium">Tutoriel</span>
      </button>
    );
  }

  // ─────────────── Sidebar plein écran (tutoriel ouvert) ───────────────
  return (
    <aside className="flex flex-col h-full w-full md:w-[440px] lg:w-[480px] xl:w-[520px] flex-shrink-0 bg-white border-l border-slate-200 shadow-2xl">
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 text-white bg-blue-600 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold leading-tight truncate">
              Tutoriel visuel
            </div>
            <div className="text-xs opacity-80 truncate">
              {view === "step"
                ? `Étape ${stepIdx + 1} / ${TUTORIAL_STEPS.length} — ${step.category}`
                : `Sommaire (${TUTORIAL_STEPS.length} étapes)`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setView(view === "step" ? "summary" : "step")}
            className="px-2.5 py-1.5 rounded hover:bg-white/20 inline-flex items-center gap-1.5 text-xs font-medium"
            title={view === "step" ? "Voir le sommaire" : "Reprendre l'étape"}
          >
            {view === "step" ? (
              <>
                <List className="w-3.5 h-3.5" /> Sommaire
              </>
            ) : (
              <>
                <BookOpen className="w-3.5 h-3.5" /> Étape
              </>
            )}
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded hover:bg-white/20"
            aria-label="Fermer le tutoriel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="h-1 w-full bg-blue-100 flex-shrink-0">
        <div
          className="h-full bg-blue-600 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Contenu défilable */}
      {view === "summary" ? (
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50">
          <p className="text-xs text-slate-500">
            Cliquez sur une étape pour y sauter directement. Les étapes
            terminées apparaissent en vert.
          </p>
          {Array.from(grouped.entries()).map(([cat, items]) => (
            <div key={cat}>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                {cat}
              </div>
              <div className="space-y-1.5">
                {items.map(({ idx, step: s }) => (
                  <button
                    key={idx}
                    onClick={() => goTo(idx)}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${
                      idx === stepIdx
                        ? "bg-blue-50 border-blue-300 text-blue-900"
                        : "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
                    }`}
                  >
                    {idx < stepIdx ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${
                          idx === stepIdx
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="text-base">{s.icon}</span>
                      <span className="truncate">{s.title}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-2xl flex-shrink-0">
              {step.icon}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                {step.category}
              </div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {step.title}
              </h3>
            </div>
          </div>

          <div className="text-sm text-slate-700 leading-relaxed space-y-2">
            {step.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {step.tips && step.tips.length > 0 && (
            <div className="mt-5 p-4 rounded-md bg-amber-50 border border-amber-200">
              <div className="text-[11px] uppercase tracking-wider text-amber-800 font-semibold mb-2">
                💡 Astuces
              </div>
              <ul className="text-xs text-amber-900 space-y-1.5 list-disc list-inside">
                {step.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {step.fields && step.fields.length > 0 && (
            <div className="mt-5">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                Champs concernés
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {step.fields.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-baseline gap-2 px-3 py-2 rounded-md bg-white border border-slate-200 text-xs"
                  >
                    <span className="font-mono font-bold text-blue-700 flex-shrink-0">
                      {f.id}
                    </span>
                    <span className="text-slate-600">— {f.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step.zones && (
            <div className="mt-5 p-4 rounded-md bg-blue-50 border border-blue-200">
              <div className="text-[11px] uppercase tracking-wider text-blue-800 font-semibold mb-2">
                Barème {step.zones.label}
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {step.zones.values.map((v, i) => (
                  <div
                    key={i}
                    className="text-center py-2 rounded bg-white border border-blue-200"
                  >
                    <div className="text-[10px] font-bold text-blue-700">
                      Z{i + 1}
                    </div>
                    <div className="text-[12px] font-mono text-slate-700">
                      {v}€
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pied avec navigation */}
      <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between gap-2 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={prev}
          disabled={stepIdx === 0 || view === "summary"}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
        </Button>
        <div className="text-[11px] text-slate-500 font-mono">
          {stepIdx + 1} / {TUTORIAL_STEPS.length}
        </div>
        {stepIdx === TUTORIAL_STEPS.length - 1 ? (
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Terminer <CheckCircle2 className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button size="sm" onClick={next} disabled={view === "summary"}>
            Suivant <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </aside>
  );
}

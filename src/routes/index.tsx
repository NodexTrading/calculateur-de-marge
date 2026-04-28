import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { TutorialWidget } from "@/components/tutorial/TutorialWidget";
import { PWAControls } from "@/components/pwa/PWAControls";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const pendingRef = useRef<
    Map<
      string,
      { resolve: (v: any) => void; reject: (e: Error) => void; timer: number }
    >
  >(new Map());

  // Réception des résultats de commandes depuis l'iframe.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "forma:ready") return;
      if (data.type === "forma:result" && data.id) {
        const entry = pendingRef.current.get(data.id);
        if (!entry) return;
        window.clearTimeout(entry.timer);
        pendingRef.current.delete(data.id);
        if (data.ok) entry.resolve(data.data);
        else entry.reject(new Error(data.error || "Erreur d'exécution"));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Envoie une commande à l'iframe et attend la réponse.
  const runCommand = useCallback((action: string, params: any) => {
    return new Promise<any>((resolve, reject) => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return reject(new Error("Calculateur non chargé"));
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const timer = window.setTimeout(() => {
        pendingRef.current.delete(id);
        reject(new Error("Délai dépassé"));
      }, 8000);
      pendingRef.current.set(id, { resolve, reject, timer });
      win.postMessage(
        { type: "forma:command", id, action, params: params || {} },
        "*"
      );
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-white flex">
      {/* Zone calculateur — prend toute la largeur quand le tuto est fermé,
          le reste de la largeur (à côté du panneau) quand il est ouvert.
          Sur mobile, l'iframe disparaît derrière le panneau plein écran. */}
      <div
        className={
          tutorialOpen
            ? "hidden md:block md:flex-1 md:min-w-0 h-full"
            : "flex-1 h-full"
        }
      >
        <iframe
          ref={iframeRef}
          src="/calculateur.html"
          title="Calculateur de Marge Forma Interim"
          className="w-full h-full border-0"
        />
      </div>

      <TutorialWidget
        open={tutorialOpen}
        onOpenChange={setTutorialOpen}
        runCommand={runCommand}
      />
      <PWAControls />
    </div>
  );
}

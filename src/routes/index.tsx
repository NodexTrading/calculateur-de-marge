import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";
import { TutorialWidget } from "@/components/tutorial/TutorialWidget";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
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
    <div className="fixed inset-0 bg-white">
      <iframe
        ref={iframeRef}
        src="/calculateur.html"
        title="Calculateur de Marge Forma Interim"
        className="w-full h-full border-0"
      />
      <TutorialWidget runCommand={runCommand} />
    </div>
  );
}

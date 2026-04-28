import { useEffect, useState } from "react";
import { Download, WifiOff } from "lucide-react";

/** Type imprécis intentionnellement : `BeforeInstallPromptEvent` n'est
 *  pas dans les types DOM standards (encore en proposition). */
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Contrôles PWA : enregistre le service worker au montage, expose un
 * bouton « Installer l'app » quand le navigateur le permet, et affiche
 * un bandeau « Hors ligne » lorsque la connexion est coupée.
 *
 * Le bouton Installer apparaît uniquement après que le navigateur a
 * émis l'événement `beforeinstallprompt` (Chrome / Edge / Samsung
 * Internet sur HTTPS, après quelques visites). Sur iOS Safari il
 * faudrait passer par « Ajouter à l'écran d'accueil » manuellement —
 * on n'affiche donc rien dans ce cas (le navigateur ne donne pas le
 * hook).
 */
export function PWAControls() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [installed, setInstalled] = useState<boolean>(false);

  // Enregistrement du service worker (best-effort, silencieux en cas
  // d'échec : ne doit jamais casser l'app).
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
  }, []);

  // Capture l'événement beforeinstallprompt pour afficher notre propre
  // bouton plutôt que la barre native du navigateur.
  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Suivi de l'état de connexion pour le bandeau offline.
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
    } finally {
      setInstallPrompt(null);
    }
  };

  const showInstall = !!installPrompt && !installed;

  return (
    <>
      {/* Bouton flottant « Installer l'app » — apparaît bas-gauche,
          en miroir du bouton Tutoriel qui est bas-droite. */}
      {showInstall && (
        <button
          onClick={handleInstall}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full px-5 py-3 text-white shadow-lg hover:scale-105 transition-transform bg-emerald-600 hover:bg-emerald-700"
          title="Installer l'application sur cet appareil"
        >
          <Download className="w-5 h-5" />
          <span className="font-medium">Installer l'app</span>
        </button>
      )}

      {/* Bandeau hors ligne en haut, non bloquant. */}
      {!isOnline && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-1.5 text-white text-xs font-medium shadow-md"
          style={{ background: "#475569" }}
          role="status"
          aria-live="polite"
        >
          <WifiOff className="w-3.5 h-3.5" />
          <span>Mode hors ligne — l'app continue de fonctionner normalement.</span>
        </div>
      )}
    </>
  );
}

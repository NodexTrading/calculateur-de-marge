# Calculateur de Marge — Forma Interim BTP

Application web (Vite + React 19 + TanStack Router, SPA statique) qui calcule la marge brute
d'une mission d'intérim BTP à partir du taux horaire, du coefficient et des
indemnités INA (panier, repas, prime trajet, indemnité transport).

> Ce projet est dérivé de `profit-waterfall-helper` : l'**agent IA** a été
> entièrement supprimé et remplacé par un **tutoriel visuel intégré** qui
> guide l'utilisateur à travers chaque onglet, zone et catégorie de l'app.

## ✨ Fonctionnalités

### Saisie de mission
- **5 onglets** : Calcul, Simulateur, Coef Inverse, Clients, Sauvegardes.
- **Modèles de mission** (📋) : bibliothèque de configurations prédéfinies
  + création de modèles personnalisés.
- **Indemnités INA** avec deux barèmes pour l'Indemnité Transport :
  - **Classique Z1 → Z5** (zones conventionnelles BTP).
  - **ACOSS PACA 2025** (grille kilométrique officielle).
- **Toggle Facturée / Non facturée** par INA pour ajuster la marge ligne par ligne.
- **Présets Petit / Grand déplacement** pour pré-remplir les indemnités.

### Calcul & résultats
- **Waterfall détaillée** : Total Facturé − Salaire Brut − Charges Patronales
  + Réduction Fillon/RGDU − INA = Marge Brute.
- **Jauge marge colorée** (rouge → vert) selon les seuils intérim BTP.
- **Tuiles synthétiques** : THM, salaire brut, INA total, net + INA versé.
- **Sections repliables** individuellement (Marge / Waterfall / Tuiles).
- **Total Facturé orange** : déduit le coefficient quand le prix est connu.

### Équipe — même mission
- Saisie d'une équipe entière (nom, TX, retenues) qui partage les paramètres
  communs du formulaire (coef, heures, INA, zones).
- **16 colonnes** par intérimaire : TX, H, TF, THM, Sal Brut, INA, 🚗 véhicule,
  ⛽ carburant, MB, % MB, retenue, net versé, zone & déplacement.
- **Synthèse compacte** : TF, MB, % MB, coût moyen, net moyen, TX moyen,
  frais véhicule, MB nette.
- **Export Excel** (.xlsx).
- **Lien partageable** WhatsApp avec équipe encodée.
- **Envoi vers Facturation Mensuelle BTP** (création automatique du tableau).

### Persistance & sauvegardes
- **Historique** des missions persistant dans le navigateur.
- **Sauvegardes manuelles** datées avec détail repliable (paramètres,
  clients, équipe au moment du snapshot).
- **Restauration** d'une version antérieure en un clic.
- **Export / Import JSON** complet pour synchroniser plusieurs postes.

### Clients
- Fiches clients avec 3 sous-onglets : INA (multiplicateur transport),
  Heures Sup (× coef ou taux brut majoré), Chantiers récurrents.
- Pré-remplissage automatique du formulaire via le sélecteur Client.

### Confort
- **Tutoriel visuel** (bouton bas-droit) : 33 étapes, surlignage animé de
  chaque zone, navigation précédent/suivant + sommaire par catégorie.
- **Thème clair / sombre** persistant.
- **PWA installable** — fonctionne hors-ligne, aucune dépendance serveur.

## 🚀 Lancer en local

```bash
# avec npm
npm install
npm run dev

# ou avec bun
bun install
bun run dev
```

L'app est servie sur `http://localhost:5173` par défaut.

## 🏗️ Architecture

- **`public/calculateur.html`** — l'app de calcul monolithique (HTML + CSS +
  JS, ~5000 lignes), embarquée dans une iframe. Expose un *bridge postMessage* :
  `set_field`, `read_state`, `switch_tab`, `apply_preset`, `select_zone_pt`,
  `select_zone_it`, `highlight`, `clear_highlight`, `ensure_params_open`,
  `ensure_history_demo`, etc.
- **`src/routes/index.tsx`** — coquille React qui héberge l'iframe et le
  composant Tutoriel.
- **`src/components/tutorial/`** :
  - `TutorialWidget.tsx` — overlay (bouton flottant + panneau, sommaire,
    progression, navigation précédent/suivant).
  - `steps.ts` — déclaration des 33 étapes : titre, catégorie, contenu,
    sélecteur CSS du surlignage, onglet à activer, champs et zones associés,
    commandes de setup (auto-remplissage des exemples).
- **`src/components/ui/`** — composants shadcn-ui (Card, Button, etc.).
- **`src/components/pwa/`** — composants liés à l'installation PWA.

## 🎓 Étendre le tutoriel

Pour ajouter une étape, éditez `src/components/tutorial/steps.ts` :

```ts
{
  category: "Onglet Calcul",
  title: "Mon nouveau champ",
  icon: "✨",
  tab: "calcul",
  highlight: "#mon-id",      // sélecteur CSS dans calculateur.html
  body: ["Description…"],
  fields: [{ id: "mon-id", desc: "À quoi il sert" }],
  // optionnel : pré-remplir un exemple avant le surlignage
  setup: [
    { action: "set_field", params: { name: "mon-id", value: 42 } },
    { action: "run_calc" },
  ],
}
```

Le widget gère automatiquement la navigation, le sommaire et la mise en
surbrillance via le bridge postMessage de l'iframe. Les setups jouent dans
l'ordre : `switch_tab` → setup commands → `highlight`.

## 📦 Build

```bash
npm run build       # build prod → dist/
npm run preview     # serveur statique de la build
```

## ☁️ Déploiement Vercel

Le projet est configuré pour un déploiement statique sur Vercel via
`vercel.json` (framework `vite`, output `dist/`). Aucune fonction
serveur n'est nécessaire — tout tourne dans le navigateur.

```bash
# Avec la CLI Vercel
npx vercel
npx vercel --prod
```

Sinon, dans le dashboard Vercel :
1. *Add New Project* → importer le repo GitHub.
2. Vercel détecte automatiquement Vite ; aucun réglage à modifier.
3. *Deploy*.

## 📝 Licence

Privé — Forma Interim.

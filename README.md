# Calculateur de Marge — Forma Interim BTP

Application web (Vite + React 19 + TanStack Router, SPA statique) qui calcule la marge brute
d'une mission d'intérim BTP à partir du taux horaire, du coefficient et des
indemnités INA (panier, repas, prime trajet, indemnité transport).

> Ce projet est dérivé de `profit-waterfall-helper` : l'**agent IA** a été
> entièrement supprimé et remplacé par un **tutoriel visuel intégré** qui
> guide l'utilisateur à travers chaque onglet, zone et catégorie de l'app.

## ✨ Fonctionnalités

- **5 onglets** : Calcul, Simulateur, Coef Inverse, Clients, Sauvegardes.
- **Indemnités INA** avec barème zonal Z1 → Z5 pour Prime Trajet et Indemnité
  Transport, présets Petit/Grand déplacement.
- **Waterfall détaillée** : Total Facturé − Salaire Brut − Charges Patronales
  + Réduction Fillon/RGDU − INA = Marge Brute.
- **Historique persistant** par localStorage, exports/imports JSON.
- **Tutoriel visuel** (bouton bas-droit) : 22 étapes, surlignage animé de
  chaque zone, navigation précédent/suivant + sommaire par catégorie.
- 100 % hors-ligne, aucune dépendance serveur, aucun appel réseau.

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
  JS), embarquée dans une iframe. Expose un *bridge postMessage* :
  `set_field`, `read_state`, `switch_tab`, `apply_preset`, `select_zone_pt`,
  `select_zone_it`, `highlight`, `clear_highlight`, etc.
- **`src/routes/index.tsx`** — coquille React qui héberge l'iframe et le
  composant Tutoriel.
- **`src/components/tutorial/`** :
  - `TutorialWidget.tsx` — overlay (bouton flottant + panneau, sommaire,
    progression, navigation précédent/suivant).
  - `steps.ts` — déclaration des 22 étapes : titre, catégorie, contenu,
    sélecteur CSS du surlignage, onglet à activer, champs et zones associés.
- **`src/components/ui/`** — composants shadcn-ui (Card, Button, etc.).

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
}
```

Le widget gère automatiquement la navigation, le sommaire et la mise en
surbrillance via le bridge postMessage de l'iframe.

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

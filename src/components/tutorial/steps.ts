/** Une commande à envoyer au calculateur via le bridge postMessage avant
 *  que l'étape ne s'affiche. Utile pour auto-remplir un exemple afin que
 *  les zones expliquées (résultats, waterfall, simulateur…) soient
 *  réellement visibles à l'écran. */
export type SetupCommand =
  | { action: "set_field"; params: { name: string; value: number | string } }
  | {
      action: "set_fields";
      params: { fields: { name: string; value: number | string }[] };
    }
  | { action: "apply_preset"; params: { type: "petit" | "grand" | "reset" } }
  | { action: "select_zone_pt"; params: { zone: 1 | 2 | 3 | 4 | 5 } }
  | { action: "select_zone_it"; params: { zone: 1 | 2 | 3 | 4 | 5 } }
  | { action: "run_calc"; params?: Record<string, never> }
  | { action: "reset"; params?: Record<string, never> };

export type TutorialStep = {
  /** Catégorie de l'étape (sert au regroupement dans le sommaire). */
  category: string;
  /** Titre court de l'étape. */
  title: string;
  /** Émoji affiché dans la pastille. */
  icon: string;
  /** Onglet du calculateur sur lequel basculer (calcul/simulateur/inverse/clients/sauvegardes). */
  tab?: "calcul" | "simulateur" | "inverse" | "clients" | "sauvegardes";
  /** Sélecteur CSS d'un élément à surligner dans l'iframe. */
  highlight?: string;
  /** Paragraphes explicatifs. */
  body: string[];
  /** Astuces optionnelles. */
  tips?: string[];
  /** Champs détaillés (id + description). */
  fields?: { id: string; desc: string }[];
  /** Barème zonal éventuel à afficher. */
  zones?: { label: string; values: number[] };
  /** Commandes envoyées AVANT l'affichage du surlignage : auto-remplit
   *  l'exemple "14€/h × 35h, TF 1500€" pour que les zones de résultats
   *  soient réellement parlantes pendant le tutoriel. */
  setup?: SetupCommand[];
};

// ─── Jeux d'exemples partagés entre étapes ───────────────────────────────
// Mission type pour l'onglet Calcul : 14 €/h, 35 h normales,
// petit déplacement, total facturé 1500 €.
const EXAMPLE_CALC: SetupCommand[] = [
  {
    action: "set_fields",
    params: {
      fields: [
        { name: "tx_horaire", value: 14 },
        { name: "hn", value: 35 },
        { name: "hs25", value: 0 },
        { name: "hs50", value: 0 },
        { name: "tf_input", value: 1500 },
      ],
    },
  },
  { action: "apply_preset", params: { type: "petit" } },
  { action: "run_calc" },
];

// Onglet Simulateur : même base, marge cible 15 %.
const EXAMPLE_SIM: SetupCommand[] = [
  {
    action: "set_fields",
    params: {
      fields: [
        { name: "sim-tx", value: 14 },
        { name: "sim-hn", value: 35 },
        { name: "sim-hs25", value: 0 },
        { name: "sim-hs50", value: 0 },
        { name: "sim-mb-cible", value: 15 },
      ],
    },
  },
];

// Onglet Coef Inverse : on connaît TX et TF, on cherche le coefficient.
const EXAMPLE_INV: SetupCommand[] = [
  {
    action: "set_fields",
    params: {
      fields: [
        { name: "inv-tx", value: 14 },
        { name: "inv-hn", value: 35 },
        { name: "inv-hs25", value: 0 },
        { name: "inv-hs50", value: 0 },
        { name: "inv-tf", value: 1500 },
      ],
    },
  },
];

export const TUTORIAL_STEPS: TutorialStep[] = [
  // ─────────── INTRODUCTION ───────────
  {
    category: "Introduction",
    title: "Bienvenue dans le Calculateur de Marge",
    icon: "👋",
    body: [
      "Cet outil calcule la marge brute d'une mission d'intérim BTP à partir du taux horaire, du coefficient et des indemnités INA.",
      "Le tutoriel vous guide à travers chaque onglet et chaque zone de saisie. Naviguez avec « Suivant » / « Précédent », ou ouvrez le sommaire (icône ?) pour sauter à une étape précise.",
    ],
    tips: [
      "Toutes les valeurs sont sauvegardées automatiquement dans le navigateur.",
      "Aucune donnée n'est envoyée à un serveur — l'app fonctionne entièrement hors-ligne.",
    ],
  },
  {
    category: "Introduction",
    title: "Les 5 onglets de l'application",
    icon: "🗂️",
    highlight: ".tab-btn",
    body: [
      "L'app est organisée en 5 onglets accessibles depuis la barre supérieure :",
      "• Calcul — saisie principale d'une mission et calcul de la marge.",
      "• Simulateur — détermine le prix de vente pour atteindre une marge cible.",
      "• 🔍 Coef Inverse — retrouve le coefficient à partir d'un total facturé connu.",
      "• Clients — fiches clients avec barèmes pré-remplis.",
      "• 💾 Sauvegardes — exports et imports de l'historique complet.",
    ],
  },

  // ─────────── ONGLET CALCUL ───────────
  {
    category: "Onglet Calcul",
    title: "Paramètres techniques",
    icon: "⚙️",
    tab: "calcul",
    highlight: "#params-panel",
    body: [
      "Cette zone repliable contient les constantes de calcul. À ouvrir uniquement si la législation change ou si vous travaillez avec un taux non-standard.",
    ],
    fields: [
      { id: "p_tx_chg", desc: "Taux des charges patronales en %." },
      { id: "p_smic", desc: "SMIC horaire de référence (€/h)." },
      { id: "p_c_fillon", desc: "Constante de la formule Fillon." },
      { id: "p_formule", desc: "Choix entre Fillon (ancienne) et RGDU 2026." },
      { id: "p_ifm", desc: "Taux d'Indemnité de Fin de Mission (%)." },
      { id: "p_cp", desc: "Taux de Congés Payés (%)." },
    ],
    tips: ["Cliquez sur le bandeau « ⚙ Paramètres techniques » pour le déplier."],
  },
  {
    category: "Onglet Calcul",
    title: "Sélection du client",
    icon: "🏢",
    tab: "calcul",
    highlight: "#client-select",
    body: [
      "Choisissez un client pré-enregistré pour appliquer automatiquement ses barèmes : multiplicateur d'Indemnité Transport, type de coefficient pour HS25/HS50, etc.",
      "Les badges à droite (Ind. Transport ×N, HS 25 % × coef…) reflètent les paramètres du client sélectionné.",
    ],
    tips: [
      "Vous pouvez créer un client depuis l'onglet « Clients » puis revenir ici.",
      "Sans client, les valeurs par défaut s'appliquent.",
    ],
  },
  {
    category: "Onglet Calcul",
    title: "Taux horaire & Coefficient",
    icon: "💶",
    tab: "calcul",
    highlight: "#tx_horaire",
    body: [
      "Les deux champs maîtres du calcul. Le taux horaire est le brut versé à l'intérimaire. Le coefficient multiplie ce taux pour obtenir le prix horaire facturé au client.",
    ],
    fields: [
      { id: "tx_horaire", desc: "Taux horaire brut (€/h) versé à l'intérimaire." },
      { id: "coef", desc: "Coefficient de facturation (typiquement 1,80 → 2,30)." },
    ],
    tips: [
      "TX × Coef = Prix horaire facturé au client.",
      "Exemple : 13,02 €/h × 1,96 = 25,52 €/h facturé.",
    ],
  },
  {
    category: "Onglet Calcul",
    title: "Total Facturé (orange)",
    icon: "🧾",
    tab: "calcul",
    highlight: "#tf_input",
    body: [
      "Champ orange : si vous le remplissez, l'app déduit le coefficient correspondant. Très pratique quand vous connaissez déjà le prix négocié avec le client.",
      "Laissez vide pour qu'il se calcule automatiquement à partir du Taux × Coef × Heures.",
    ],
    tips: [
      "Le champ orange remplace temporairement le coefficient bleu — un seul des deux fait foi à la fois.",
    ],
  },
  {
    category: "Onglet Calcul",
    title: "Heures de la mission",
    icon: "⏱️",
    tab: "calcul",
    highlight: "#hn",
    body: [
      "Saisissez les heures normales (par défaut 35) ainsi que les heures supplémentaires éventuelles.",
    ],
    fields: [
      { id: "hn", desc: "Heures normales travaillées." },
      { id: "hs25", desc: "Heures supplémentaires majorées de 25 %." },
      { id: "hs50", desc: "Heures supplémentaires majorées de 50 %." },
    ],
    tips: [
      "Selon le client, les HS sont facturées au coefficient (× coef) ou au taux brut majoré (× 1,25 / × 1,50).",
    ],
  },

  // ─────────── INDEMNITÉS INA ───────────
  {
    category: "Indemnités INA",
    title: "Présets Petit / Grand déplacement",
    icon: "🏗️",
    tab: "calcul",
    highlight: ".ina-grid",
    body: [
      "Trois boutons rapides permettent de pré-remplir les indemnités :",
      "• 🏠 Petit déplacement : panier + ind. transport.",
      "• 🏗️ Grand déplacement : repas + prime trajet.",
      "• ✕ Vider : remet toutes les INA à zéro.",
    ],
  },
  {
    category: "Indemnités INA",
    title: "🥪 Prime Panier (× coef)",
    icon: "🥪",
    tab: "calcul",
    highlight: "#ina-item-pp",
    body: [
      "Versée pour les repas pris sur chantier (petit déplacement). Elle est multipliée par le coefficient lorsqu'elle est facturée au client.",
      "Le badge « ✓ Facturée » / « ✗ Non fact. » indique si l'indemnité apparaît sur la facture client.",
    ],
    fields: [
      { id: "nb_pp", desc: "Nombre de jours avec prime panier." },
      { id: "mt_pp", desc: "Montant unitaire (€/jour). Défaut : 1,80 €." },
    ],
  },
  {
    category: "Indemnités INA",
    title: "🍽️ Indemnité Repas (× 1)",
    icon: "🍽️",
    tab: "calcul",
    highlight: "#ina-item-ip",
    body: [
      "Versée en grand déplacement, sans coefficient appliqué : refacturée à l'identique au client.",
    ],
    fields: [
      { id: "nb_ip", desc: "Nombre de jours avec indemnité repas." },
      { id: "mt_ip", desc: "Montant unitaire (€/jour). Défaut : 10,40 €." },
    ],
  },
  {
    category: "Indemnités INA",
    title: "🛣️ Prime Trajet — zones Z1 à Z5",
    icon: "🛣️",
    tab: "calcul",
    highlight: "#ina-item-pt",
    body: [
      "Indemnité kilométrique versée selon la zone géographique du chantier. Multipliée par le coefficient quand elle est facturée.",
      "Cliquez sur Z1, Z2, Z3, Z4 ou Z5 pour appliquer le barème conventionnel correspondant.",
    ],
    fields: [
      { id: "nb_pt", desc: "Nombre de jours d'indemnité trajet." },
      { id: "mt_pt", desc: "Montant unitaire (€/jour). Pré-rempli par la zone." },
    ],
    zones: {
      label: "Prime Trajet (€/jour)",
      values: [2.05, 3.25, 4.38, 5.81, 6.9],
    },
  },
  {
    category: "Indemnités INA",
    title: "🚗 Indemnité Transport — zones Z1 à Z5",
    icon: "🚗",
    tab: "calcul",
    highlight: "#ina-item-it",
    body: [
      "Couvre les frais de déplacement quotidiens. Le multiplicateur (× 1, × 1,5, × 2…) dépend du client : il est défini sur sa fiche.",
    ],
    fields: [
      { id: "nb_it", desc: "Nombre de jours d'indemnité transport." },
      { id: "mt_it", desc: "Montant unitaire (€/jour). Pré-rempli par la zone." },
    ],
    zones: {
      label: "Indemnité Transport (€/jour)",
      values: [3.65, 6.42, 8.63, 11.26, 14.8],
    },
  },

  // ─────────── RÉSULTATS ───────────
  {
    category: "Résultats",
    title: "Bouton Calculer la marge",
    icon: "🧮",
    tab: "calcul",
    highlight: ".btn-calc",
    body: [
      "Les calculs sont automatiques à chaque saisie, mais ce bouton force un recalcul complet et fait défiler vers la zone Résultats.",
      "👉 Pour la suite du tutoriel, on remplit automatiquement un exemple : taux horaire 14 €/h × 35 h, total facturé 1500 €, petit déplacement. Vous voyez ainsi de vrais chiffres dans les zones expliquées.",
    ],
    setup: EXAMPLE_CALC,
  },
  {
    category: "Résultats",
    title: "Marge Brute & Pourcentage",
    icon: "📊",
    tab: "calcul",
    highlight: "#res-sec-hero",
    body: [
      "Affiche la marge brute en euros et son pourcentage sur le total facturé. La jauge colorée (rouge → vert) indique la santé de la mission.",
    ],
    tips: [
      "Sous 8 % : marge faible, à renégocier.",
      "8 → 15 % : standard intérim BTP.",
      "Au-delà de 15 % : marge confortable.",
    ],
  },
  {
    category: "Résultats",
    title: "Détail en cascade (waterfall)",
    icon: "💧",
    tab: "calcul",
    highlight: "#res-sec-wf",
    body: [
      "Décomposition ligne par ligne :",
      "+ Total Facturé",
      "− Salaire Brut (Brut + IFM + CP)",
      "− Charges Patronales",
      "+ Réduction Fillon ou RGDU",
      "− Indemnités INA",
      "= Marge Brute",
    ],
  },
  {
    category: "Résultats",
    title: "Tuiles synthétiques",
    icon: "🔢",
    tab: "calcul",
    highlight: "#res-sec-tiles",
    body: [
      "5 tuiles résument les chiffres clés : Total Heures, Taux Horaire Moyen (THM), Salaire Brut, INA Total, et Net + INA reçu par l'intérimaire.",
    ],
  },
  {
    category: "Résultats",
    title: "Historique des missions",
    icon: "📜",
    tab: "calcul",
    highlight: "#history-section",
    body: [
      "Chaque clic sur « + Historique » archive la mission courante. Vous pouvez recharger une ligne pour la dupliquer ou la modifier.",
    ],
  },

  // ─────────── SIMULATEUR ───────────
  {
    category: "Onglet Simulateur",
    title: "Simulateur Prix Tout Compris",
    icon: "🎯",
    tab: "simulateur",
    body: [
      "Saisissez le taux horaire, les heures, la marge cible et les indemnités : l'app calcule automatiquement le prix de vente nécessaire pour atteindre cette marge.",
      "Idéal pour préparer un devis ou répondre à un appel d'offres avec une rentabilité minimale imposée.",
      "👉 Exemple pré-rempli : 14 €/h × 35 h, marge cible 15 %.",
    ],
    fields: [
      { id: "sim-tx", desc: "Taux horaire brut versé à l'intérimaire." },
      { id: "sim-mb-cible", desc: "Marge brute cible en pourcentage." },
    ],
    setup: EXAMPLE_SIM,
  },

  // ─────────── COEF INVERSE ───────────
  {
    category: "Onglet Coef Inverse",
    title: "Calculateur Coef Inverse",
    icon: "🔍",
    tab: "inverse",
    body: [
      "Vous connaissez le total facturé négocié et le salaire net visé pour l'intérimaire ? Cet onglet remonte au coefficient et au taux horaire qui font tomber les comptes juste.",
      "👉 Exemple pré-rempli : 14 €/h × 35 h pour un total facturé de 1500 €.",
    ],
    fields: [
      { id: "inv-tx", desc: "Taux horaire brut connu." },
      { id: "inv-tf", desc: "Total facturé au client." },
    ],
    tips: [
      "Très utile lorsqu'un client impose un budget global pour la mission.",
    ],
    setup: EXAMPLE_INV,
  },

  // ─────────── CLIENTS ───────────
  {
    category: "Onglet Clients",
    title: "Gestion des fiches clients",
    icon: "🏢",
    tab: "clients",
    highlight: "#clients-grid",
    body: [
      "Créez et modifiez les fiches clients. Chaque fiche stocke ses propres barèmes : multiplicateur d'Indemnité Transport, mode HS25/HS50 (× coef ou taux brut majoré), zones par défaut et chantiers récurrents.",
      "Les fiches sont automatiquement chargées dans l'onglet Calcul via le sélecteur Client.",
    ],
  },

  // ─────────── SAUVEGARDES ───────────
  {
    category: "Onglet Sauvegardes",
    title: "Exports & imports",
    icon: "💾",
    tab: "sauvegardes",
    body: [
      "Exportez l'intégralité de vos données (clients, paramètres, historique) dans un fichier JSON. Importez ce fichier sur un autre poste pour retrouver votre environnement à l'identique.",
    ],
    tips: [
      "Faites une sauvegarde avant chaque modification importante des paramètres techniques.",
      "Le fichier JSON peut être versionné dans un dossier partagé (Drive, OneDrive…).",
    ],
  },

  // ─────────── FIN ───────────
  {
    category: "Fin du tutoriel",
    title: "C'est terminé !",
    icon: "🎉",
    body: [
      "Vous avez fait le tour de toutes les zones de l'application. Vous pouvez maintenant fermer ce panneau et utiliser le calculateur sereinement.",
      "Le tutoriel reste accessible à tout moment via le bouton « Tutoriel » en bas à droite.",
    ],
  },
];

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
  | { action: "reset"; params?: Record<string, never> }
  | { action: "ensure_params_open"; params?: Record<string, never> }
  | { action: "ensure_history_demo"; params?: Record<string, never> };

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
      "Le tutoriel vous guide à travers chaque onglet et chaque zone de saisie. Naviguez avec « Suivant » / « Précédent », ou ouvrez le sommaire (icône Sommaire en haut) pour sauter à une étape précise.",
    ],
    tips: [
      "Toutes les valeurs sont sauvegardées automatiquement dans le navigateur.",
      "Aucune donnée n'est envoyée à un serveur — l'app fonctionne entièrement hors-ligne (PWA installable).",
    ],
  },
  {
    category: "Introduction",
    title: "Les 5 onglets de l'application",
    icon: "🗂️",
    highlight: ".tab-bar",
    body: [
      "L'app est organisée en 5 onglets accessibles depuis la barre supérieure :",
      "• Calcul — saisie principale d'une mission, calcul de la marge, historique et gestion d'équipe.",
      "• Simulateur — détermine le prix de vente pour atteindre une marge cible.",
      "• 🔍 Coef Inverse — retrouve le coefficient à partir d'un total facturé connu.",
      "• Clients — fiches clients avec barèmes, chantiers récurrents et règles HS spécifiques.",
      "• 💾 Sauvegardes — exports / imports complets et restauration de versions antérieures.",
    ],
    tips: [
      "Les compteurs sur les onglets Clients et Sauvegardes affichent le nombre d'éléments enregistrés.",
    ],
  },
  {
    category: "Introduction",
    title: "Thème clair / sombre",
    icon: "🌗",
    highlight: ".forma-theme-toggle",
    body: [
      "Le bouton ☀️/🌙 en haut à droite bascule entre thème clair et sombre. Le choix est persistant (mémorisé pour les prochaines visites).",
      "Toutes les couleurs (cartes, badges, jauge marge, waterfall…) s'adaptent automatiquement.",
    ],
  },

  // ─────────── ONGLET CALCUL ───────────
  {
    category: "Onglet Calcul",
    title: "📋 Modèles de mission",
    icon: "📋",
    tab: "calcul",
    highlight: ".quick-action-btn",
    body: [
      "Le bouton « Modèles de mission » ouvre une bibliothèque de configurations pré-enregistrées (ex : maçon Z2 35 h petit déplacement, chef d'équipe Z3 39 h grand déplacement…).",
      "Cliquez un modèle pour pré-remplir tous les champs (TX, HN, HS, INA, zones) en un clic. Vous pouvez aussi sauvegarder votre mission courante comme nouveau modèle réutilisable.",
    ],
    tips: [
      "Les modèles personnalisés sont marqués d'un badge « custom » et peuvent être supprimés.",
      "Idéal pour les missions récurrentes — gain de temps énorme par rapport à la saisie manuelle.",
    ],
  },
  {
    category: "Onglet Calcul",
    title: "Paramètres techniques (verrouillés 🔒)",
    icon: "⚙️",
    tab: "calcul",
    highlight: "#params-panel",
    body: [
      "Cette zone contient les constantes légales du calcul : charges patronales, SMIC, Fillon/RGDU, IFM, CP.",
      "🔒 Les champs sont volontairement verrouillés en lecture seule. Personne ne doit les modifier dans l'usage courant — leur valeur est légalement fixée et toute erreur fausserait toutes les marges calculées.",
      "👉 Le tutoriel ouvre automatiquement le panneau pour vous montrer son contenu, mais les champs apparaissent grisés et ne réagissent pas.",
    ],
    fields: [
      { id: "p_tx_chg", desc: "Taux des charges patronales (%) — figé." },
      { id: "p_smic", desc: "SMIC horaire de référence (€/h) — figé." },
      { id: "p_c_fillon", desc: "Constante Fillon — figée." },
      { id: "p_formule", desc: "Formule Fillon ancienne ou RGDU 2026 — figée." },
      { id: "p_ifm", desc: "Indemnité de Fin de Mission (%) — figée." },
      { id: "p_cp", desc: "Congés Payés (%) — figé." },
    ],
    tips: [
      "Si la législation évolue (changement de SMIC, refonte des charges…), seul l'administrateur peut éditer ces valeurs directement dans le code source.",
    ],
    setup: [{ action: "ensure_params_open" }],
  },
  {
    category: "Onglet Calcul",
    title: "Sélection du client & badges",
    icon: "🏢",
    tab: "calcul",
    highlight: ".client-selector-row",
    body: [
      "Choisissez un client pré-enregistré pour appliquer automatiquement ses barèmes. Trois badges se mettent à jour à droite :",
      "• Ind. Transport × N — multiplicateur d'indemnité transport propre au client.",
      "• HS 25 % × coef ou × 1,25 — mode de facturation des heures sup à 25 %.",
      "• HS 50 % × coef ou × 1,50 — idem pour les heures sup à 50 %.",
    ],
    tips: [
      "Vous pouvez créer un client depuis l'onglet « Clients » puis revenir ici.",
      "Sans client sélectionné, les valeurs par défaut s'appliquent (× 1, HS × coef).",
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
      "Selon le client, les HS sont facturées au coefficient (× coef) ou au taux brut majoré (× 1,25 / × 1,50). Le badge HS du client en haut indique le mode actif.",
    ],
  },

  // ─────────── INDEMNITÉS INA ───────────
  {
    category: "Indemnités INA",
    title: "Présets Petit / Grand déplacement",
    icon: "✈️",
    tab: "calcul",
    highlight: ".ina-grid",
    body: [
      "Trois boutons rapides permettent de pré-remplir les indemnités :",
      "• 🏠 Petit déplacement : panier + ind. transport.",
      "• ✈️ Grand déplacement : repas + prime trajet.",
      "• ✕ Vider : remet toutes les INA à zéro.",
    ],
  },
  {
    category: "Indemnités INA",
    title: "Toggle Facturée / Non facturée",
    icon: "🔁",
    tab: "calcul",
    highlight: "#ina-item-pp",
    body: [
      "Chaque INA possède un toggle « ✓ Facturée » / « ✗ Non fact. » en haut à gauche de sa case.",
      "• Facturée : l'indemnité apparaît sur la facture client (refacturée, parfois × coef).",
      "• Non facturée : versée à l'intérimaire mais à la charge de l'agence — la marge se trouve donc réduite d'autant.",
      "C'est l'arbitrage clé pour ajuster une marge serrée sur un appel d'offres concurrentiel.",
    ],
    tips: [
      "Côté pratique : Prime Panier et Prime Trajet sont multipliées par le coef quand elles sont facturées (gain agence). Indemnité Repas reste toujours × 1.",
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
      "Versée en grand déplacement, sans coefficient appliqué : refacturée à l'identique au client. La marge sur cette ligne est donc nulle quand elle est facturée.",
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
    title: "🚗 Indemnité Transport — Classique vs ACOSS PACA",
    icon: "🚗",
    tab: "calcul",
    highlight: "#ina-item-it",
    body: [
      "Couvre les frais de déplacement quotidiens. Le multiplicateur (× 1, × 1,5, × 2…) dépend du client : il est défini sur sa fiche.",
      "Deux barèmes au choix via les onglets internes :",
      "• Classique Z1–Z5 : zones conventionnelles BTP traditionnelles (3,65 € → 14,80 €/jour).",
      "• ACOSS PACA 2025 : grille kilométrique officielle ACOSS pour la région PACA — sélectionnez la tranche km dans la liste déroulante.",
    ],
    fields: [
      { id: "nb_it", desc: "Nombre de jours d'indemnité transport." },
      { id: "mt_it", desc: "Montant unitaire (€/jour). Pré-rempli par la zone ou la tranche km." },
    ],
    zones: {
      label: "Indemnité Transport Classique (€/jour)",
      values: [3.65, 6.42, 8.63, 11.26, 14.8],
    },
    tips: [
      "Bascule Classique → ACOSS si votre client applique le barème ACOSS plutôt que le conventionnel.",
    ],
  },

  // ─────────── RÉSULTATS ───────────
  {
    category: "Résultats",
    title: "Bouton Calculer + Historique + Réinitialiser",
    icon: "🧮",
    tab: "calcul",
    highlight: ".btn-row",
    body: [
      "Trois actions principales sous le formulaire :",
      "• Calculer la marge — force un recalcul complet et fait défiler vers la zone Résultats.",
      "• + Historique — archive la mission courante dans l'historique persistant.",
      "• Réinitialiser — vide complètement le formulaire (avec confirmation).",
      "👉 Pour la suite du tutoriel, on remplit automatiquement un exemple : 14 €/h × 35 h, total facturé 1500 €, petit déplacement.",
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
    setup: EXAMPLE_CALC,
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
      "− Indemnités INA (selon Facturée/Non facturée)",
      "= Marge Brute",
    ],
    setup: EXAMPLE_CALC,
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
    setup: EXAMPLE_CALC,
  },
  {
    category: "Résultats",
    title: "Replier sections individuellement",
    icon: "🪗",
    tab: "calcul",
    highlight: "#res-toggle-btn",
    body: [
      "L'en-tête de la carte Résultats est cliquable : il replie / déplie tout le bloc résultat. Une fois un calcul lancé, des pastilles apparaissent à droite (« Résumé », « Détail », « Chiffres ») pour masquer/afficher chaque sous-section indépendamment :",
      "• Résumé — la jauge marge brute principale.",
      "• Détail — la cascade de calcul.",
      "• Chiffres — les tuiles synthétiques.",
      "Pratique pour ne garder à l'écran que ce qui vous intéresse pendant une négociation client.",
    ],
    setup: EXAMPLE_CALC,
  },

  // ─────────── HISTORIQUE ───────────
  {
    category: "Historique",
    title: "Historique des missions",
    icon: "📜",
    tab: "calcul",
    highlight: "#history-section",
    body: [
      "Chaque clic sur « + Historique » archive la mission courante avec tous ses paramètres et résultats. Vous pouvez recharger une ligne pour la dupliquer ou la modifier.",
      "Le bouton « Effacer l'historique » remet la liste à zéro (avec confirmation).",
      "👉 Le tutoriel ajoute automatiquement la mission de l'exemple à l'historique pour que la zone ait du contenu à afficher.",
    ],
    setup: [...EXAMPLE_CALC, { action: "ensure_history_demo" }],
  },

  // ─────────── ÉQUIPE — MÊME MISSION ───────────
  {
    category: "Équipe — même mission",
    title: "Pourquoi une équipe sur la même mission ?",
    icon: "👷",
    tab: "calcul",
    highlight: "#equipe-card",
    body: [
      "Sur un même chantier, plusieurs intérimaires partagent généralement les mêmes coef, heures et INA — mais chacun a son propre TX horaire et son barème transport.",
      "Cette section permet de saisir une équipe entière en réutilisant les paramètres du formulaire principal, et calcule la marge consolidée pour tout le chantier.",
      "Idéal pour les missions multi-personnes : un seul écran pour 5, 10 ou 20 intérimaires sur la même mission.",
    ],
    tips: [
      "Les paramètres communs (coef, heures, INA, zones) viennent du formulaire en haut de page. Vous ne saisissez par mec que ce qui le distingue.",
    ],
  },
  {
    category: "Équipe — même mission",
    title: "Synthèse compacte de l'équipe",
    icon: "🧮",
    tab: "calcul",
    highlight: "#equipe-card",
    body: [
      "Une fois au moins un intérimaire ajouté, une bande de synthèse apparaît juste sous l'en-tête avec 8 indicateurs consolidés :",
      "• TF : total facturé client.",
      "• MB / % MB : marge brute et son pourcentage.",
      "• Coût moy. / Net moy. / TX moy. : coût agence, net versé moyen, TX moyen.",
      "• Frais véh. : déduction des frais véhicule + carburant déclarés.",
      "• MB nette : marge après déduction de tous les frais véhicule.",
    ],
    tips: [
      "La bande synthèse reste cachée tant que l'équipe est vide — c'est normal. Cliquez « + Ajouter » pour la voir apparaître.",
    ],
  },
  {
    category: "Équipe — même mission",
    title: "Détail par intérimaire (16 colonnes)",
    icon: "📋",
    tab: "calcul",
    highlight: "#eq-main-table",
    body: [
      "Une ligne par intérimaire avec 16 colonnes : Nom · Client · Chantier · TX · Heures · TF · THM · Salaire Brut · INA · 🚗 Véhicule · ⛽ Carburant · MB · % MB · Retenue · Net versé · Zone & Déplacement.",
      "Cliquez sur une ligne pour déplier un panneau détail qui permet de surcharger par mec : zone trajet/transport (Z1-Z5 ou ACOSS), déplacement (Petit/Grand), facturation des INA (✓/✗), retenues, frais véhicule.",
    ],
    tips: [
      "Une retenue (acompte sur paie ou avance) est déduite du Net versé sans toucher au salaire brut ni à la marge.",
      "Les frais véhicule et carburant sont à la charge de l'agence — ils impactent uniquement la « MB nette » de la synthèse.",
    ],
  },
  {
    category: "Équipe — même mission",
    title: "🔗 Partager · 📊 Excel · 📤 Facturation",
    icon: "📤",
    tab: "calcul",
    highlight: "#equipe-card .card-head",
    body: [
      "Cinq actions disponibles dans l'en-tête de la carte Équipe :",
      "• + Ajouter — ajoute une ligne intérimaire (vierge à remplir).",
      "• 🔗 Partager — génère un lien partageable (WhatsApp, e-mail) contenant l'équipe complète encodée. Le destinataire ouvre le lien et retrouve la même équipe.",
      "• 📊 Excel — exporte l'équipe en .xlsx pour archivage ou envoi compta.",
      "• 📤 Facturation mensuelle — envoie l'équipe directement vers l'app Facturation Mensuelle BTP (création automatique du tableau chantier avec les bons mecs et tarifs).",
      "• 🗑 — vide complètement l'équipe (avec confirmation).",
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
      "Créez et modifiez les fiches clients. Chaque fiche stocke ses propres barèmes via 3 sous-onglets :",
      "• INA — multiplicateur d'Indemnité Transport propre au client (× 1, × 1,5, × 2…).",
      "• Heures Sup — mode de facturation HS25/HS50 (× coef ou taux brut majoré).",
      "• ✈️ Chantiers — chantiers récurrents avec leur zone par défaut, pour pré-remplir l'équipe en un clic.",
      "Les fiches sont automatiquement chargées dans l'onglet Calcul via le sélecteur Client.",
    ],
  },

  // ─────────── SAUVEGARDES ───────────
  {
    category: "Onglet Sauvegardes",
    title: "Sauvegarder maintenant + Tout effacer",
    icon: "📌",
    tab: "sauvegardes",
    body: [
      "Le bouton « 📌 Sauvegarder maintenant » crée un point de sauvegarde manuel daté contenant : tous les clients, paramètres, historique et équipe courante.",
      "Le bouton « Tout effacer » vide la liste complète des sauvegardes (avec confirmation).",
    ],
    tips: [
      "Faites une sauvegarde manuelle avant chaque modification importante (changement de tarifs client, refonte d'équipe).",
    ],
  },
  {
    category: "Onglet Sauvegardes",
    title: "Détail & restauration d'une sauvegarde",
    icon: "🔄",
    tab: "sauvegardes",
    body: [
      "Chaque ligne propose 3 actions :",
      "• 👁 Voir le détail — ouvre une carte avec les paramètres techniques, la liste des clients et l'équipe au moment de la sauvegarde, sections repliables.",
      "• 🔄 Restaurer — remplace l'état courant par celui de la sauvegarde (avec confirmation).",
      "• ✕ Supprimer — efface uniquement cette sauvegarde.",
      "Vous pouvez ainsi revenir à un état précis du calculateur sans perdre les autres versions.",
    ],
  },
  {
    category: "Onglet Sauvegardes",
    title: "Exports & imports JSON",
    icon: "💾",
    tab: "sauvegardes",
    body: [
      "Exportez l'intégralité de vos données (clients, paramètres, historique, équipe) dans un fichier JSON unique. Importez ce fichier sur un autre poste pour retrouver votre environnement à l'identique.",
    ],
    tips: [
      "Le fichier JSON peut être versionné dans un dossier partagé (Drive, OneDrive…) pour synchroniser plusieurs postes.",
      "Il sert aussi de plan B : un crash navigateur n'efface pas le JSON.",
    ],
  },

  // ─────────── FIN ───────────
  {
    category: "Fin du tutoriel",
    title: "C'est terminé !",
    icon: "🎉",
    body: [
      "Vous avez fait le tour de toutes les zones de l'application. Vous pouvez maintenant fermer ce panneau et utiliser le calculateur sereinement.",
      "Le tutoriel reste accessible à tout moment via le bouton « Tutoriel » en bas à droite — n'hésitez pas à y revenir si une zone vous échappe.",
    ],
    tips: [
      "L'app est installable comme PWA (Progressive Web App) — bouton « Installer » dans la barre d'URL du navigateur. Une fois installée, elle s'ouvre comme une vraie app native, hors-ligne.",
    ],
  },
];

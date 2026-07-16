import { Language } from '@/types/subscription';

export type Strings = {
  overview: string;
  add: string;
  calendar: string;
  analysis: string;
  settings: string;
  monthly: string;
  yearly: string;
  active: string;
  addSub: string;
  search: string;
  manual: string;
  save: string;
  name: string;
  price: string;
  cycle: string;
  category: string;
  next: string;
  contractStart: string;
  note: string;
  addListSortLabel: string;
  sortGroupAlpha: string;
  sortGroupCategory: string;
  emptyHomeTitle: string;
  emptyHomeBody: string;
  emptyAddTitle: string;
  emptyAddBody: string;
  dailyCostLabel: string;
  monthlyCostLabel: string;
  yearlyCostLabel: string;
  cancelPage: string;
  openCancelPage: string;
  selectPlan: string;
  customPrice: string;
  planEffectiveDate: string;
  editPlan: string;
  subscriptionDetail: string;
  pickMonth: string;
  pickYear: string;
  customPlan: string;
  privacy: string;
  start: string;
  pro: string;
  limit: string;
  saved: string;
  totalMonth: string;
  diagnosis: string;
  language: string;
  vat: string;
  reminders: string;
  export: string;
  biometric: string;
  version: string;
  vatDe: string;
  vatFr: string;
  vatNone: string;
  reminderOff: string;
  reminderDaysBefore: string;
  dataPrivacy: string;
  proBlurb: string;
  proPrice: string;
  categoryBreakdown: string;
  thisMonth: string;
  lastMonth: string;
  topSubscriptions: string;
  spendingTrend: string;
  perDay: string;
  next30Days: string;
  sortDate: string;
  sortCost: string;
  sortAlpha: string;
  delete: string;
  deleteTitle: string;
  deleteMessage: string;
  cancel: string;
  tagline: string;
  privacyBadge: string;
  onboarding1Title: string;
  onboarding1Body: string;
  onboarding2Title: string;
  onboarding2Body: string;
  onboarding3Title: string;
  onboarding3Body: string;
  validationTitle: string;
  validationBody: string;
  cycleMonthly: string;
  cycleQuarterly: string;
  cycleAnnual: string;
  catStreaming: string;
  catMusic: string;
  catProductivity: string;
  catGaming: string;
  catHealth: string;
  catNews: string;
  catOther: string;
  proTrendHint: string;
  rankPosition: string;
  monthBreakdownTotal: string;
  monthBreakdownEmpty: string;
  billingPresetToday: string;
  billingPresetIn7: string;
  billingPreset1st: string;
  billingPreset15th: string;
  billingTapToPick: string;
  billingDone: string;
  diagnosisIntro: string;
  diagnosisEmpty: string;
  diagnosisStart: string;
  diagnosisProgress: string;
  diagnosisNext: string;
  diagnosisFinish: string;
  diagnosisQUsage: string;
  diagnosisUsageDaily: string;
  diagnosisUsageWeekly: string;
  diagnosisUsageRare: string;
  diagnosisQDuplicate: string;
  diagnosisQWorth: string;
  diagnosisWorthYes: string;
  diagnosisWorthMaybe: string;
  diagnosisWorthNo: string;
  diagnosisQForgot: string;
  diagnosisQMiss: string;
  diagnosisMissYes: string;
  diagnosisMissMaybe: string;
  diagnosisMissNo: string;
  diagnosisYes: string;
  diagnosisNo: string;
  diagnosisSummaryTitle: string;
  diagnosisScore: string;
  diagnosisResultKeep: string;
  diagnosisResultReview: string;
  diagnosisResultCancel: string;
  diagnosisOpen: string;
  trendTapHint: string;
  prevMonth: string;
  nextMonth: string;
  currency: string;
  reminderNotificationBody: string;
  paywallTitle: string;
  paywallRestore: string;
  paywallRestoreSuccess: string;
  paywallRestoreNone: string;
  paywallUnavailable: string;
  paywallContinue: string;
  paywallActiveTitle: string;
  paywallActiveBody: string;
  paywallManage: string;
  paywallTerms: string;
  paywallPrivacy: string;
  paywallLegalNote: string;
  paywallLoading: string;
};

export const strings: Record<Language, Strings> = {
  de: {
    overview: 'Übersicht',
    add: 'Hinzufügen',
    calendar: 'Kalender',
    analysis: 'Analyse',
    settings: 'Einstellungen',
    monthly: 'Monatliche Kosten',
    yearly: 'Jährliche Kosten',
    active: 'aktive Abos',
    addSub: 'Abo hinzufügen',
    search: 'Dienst suchen…',
    manual: 'Manuell eingeben',
    save: 'Speichern',
    name: 'Name',
    price: 'Preis',
    cycle: 'Abrechnungszyklus',
    category: 'Kategorie',
    next: 'Vertragsbeginn',
    contractStart: 'Vertragsbeginn',
    note: 'Notiz',
    addListSortLabel: 'Anzeige',
    sortGroupAlpha: 'A–Z',
    sortGroupCategory: 'Nach Kategorie',
    emptyHomeTitle: 'Noch keine Abos',
    emptyHomeBody: 'Füge dein erstes Abo hinzu und behalte alle Kosten im Blick.',
    emptyAddTitle: 'Dienst wählen',
    emptyAddBody: 'Suche einen Anbieter oder tippe auf „Manuell eingeben“.',
    dailyCostLabel: 'Pro Tag',
    monthlyCostLabel: 'Pro Monat',
    yearlyCostLabel: 'Pro Jahr',
    cancelPage: 'Kündigungsseite',
    openCancelPage: 'Kündigung öffnen',
    selectPlan: 'Tarif wählen',
    customPrice: 'Eigener Preis',
    planEffectiveDate: 'Gültig ab',
    editPlan: 'Tarif ändern',
    subscriptionDetail: 'Abo-Details',
    pickMonth: 'Monat',
    pickYear: 'Jahr',
    customPlan: 'Individuell',
    privacy:
      'SubTrack speichert alles nur auf deinem Gerät. Kein Konto, kein Cloud-Sync — deine Abos bleiben bei dir.',
    start: 'Loslegen',
    pro: 'Pro freischalten',
    limit: 'Die Free-Version erlaubt bis zu 5 Abos. Mit Pro trackst du unbegrenzt.',
    saved: 'Gespart',
    totalMonth: 'Fällig diesen Monat',
    diagnosis: 'Abo-Check',
    language: 'Sprache',
    vat: 'MwSt.',
    reminders: 'Erinnerung',
    export: 'CSV exportieren',
    biometric: 'Biometrische Sperre',
    version: 'Version',
    vatDe: '19 % MwSt. (DE)',
    vatFr: '20 % TVA (FR)',
    vatNone: 'Ohne MwSt.',
    reminderOff: 'Aus',
    reminderDaysBefore: 'Tage vorher',
    dataPrivacy: 'Daten & Privatsphäre',
    proBlurb: 'Unbegrenzte Abos, Diagnose, Widget und Export.',
    proPrice: '€1,99/Monat oder €14,99/Jahr',
    categoryBreakdown: 'Nach Kategorie',
    thisMonth: 'Dieser Monat',
    lastMonth: 'Vormonat',
    topSubscriptions: 'Teuerste Abos',
    spendingTrend: 'Ausgaben im Verlauf',
    perDay: '/Tag',
    next30Days: 'Nächste 30 Tage',
    sortDate: 'Datum',
    sortCost: 'Kosten',
    sortAlpha: 'A–Z',
    delete: 'Entfernen',
    deleteTitle: 'Abo entfernen?',
    deleteMessage: '„{name}“ wird aus deiner Übersicht gelöscht.',
    cancel: 'Abbrechen',
    tagline: 'Deine Abos, schön verpackt.',
    privacyBadge: '100 % lokal · DSGVO',
    onboarding1Title: 'Alles an einem Ort',
    onboarding1Body: 'Monatskosten, nächste Abbuchungen und Kategorien — übersichtlich wie eine Abo-Box.',
    onboarding2Title: 'Nichts verpassen',
    onboarding2Body: 'Kalender und Erinnerungen kurz vor der Abbuchung.',
    onboarding3Title: 'Deine Daten bleiben hier',
    onboarding3Body:
      'SubTrack speichert alles nur auf deinem Gerät. Kein Konto, kein Cloud-Sync — deine Abos bleiben bei dir.',
    validationTitle: 'Bitte prüfen',
    validationBody: 'Name und Preis sind erforderlich.',
    cycleMonthly: 'Monatlich',
    cycleQuarterly: 'Vierteljährlich',
    cycleAnnual: 'Jährlich',
    catStreaming: 'Streaming',
    catMusic: 'Musik',
    catProductivity: 'Produktivität',
    catGaming: 'Gaming',
    catHealth: 'Gesundheit',
    catNews: 'Nachrichten',
    catOther: 'Sonstiges',
    proTrendHint: 'Trends, Export und Diagnose mit Pro.',
    rankPosition: 'Platz',
    monthBreakdownTotal: 'gesamt',
    monthBreakdownEmpty: 'Keine Abbuchungen in diesem Monat.',
    billingPresetToday: 'Heute',
    billingPresetIn7: 'In 7 Tagen',
    billingPreset1st: '1. des Monats',
    billingPreset15th: '15. des Monats',
    billingTapToPick: 'Tippen zum Auswählen',
    billingDone: 'Fertig',
    diagnosisIntro:
      'Kurzer Check pro Abo: Nutzung, Doppeltes, Preis — wir sagen dir, was sich lohnt und was zur Kündigung reift.',
    diagnosisEmpty: 'Füge zuerst ein Abo hinzu, dann starte den Abo-Check.',
    diagnosisStart: 'Abo-Check starten',
    diagnosisProgress: 'Abo {progress}',
    diagnosisNext: 'Nächstes Abo',
    diagnosisFinish: 'Auswertung anzeigen',
    diagnosisQUsage: 'Wie oft nutzt du es?',
    diagnosisUsageDaily: 'Täglich',
    diagnosisUsageWeekly: 'Wöchentlich',
    diagnosisUsageRare: 'Selten / kaum',
    diagnosisQDuplicate: 'Hast du ein ähnliches Abo?',
    diagnosisQWorth: 'Ist der Preis es wert?',
    diagnosisWorthYes: 'Ja, absolut',
    diagnosisWorthMaybe: 'Geht so',
    diagnosisWorthNo: 'Nein',
    diagnosisQForgot: 'Hattest du es fast vergessen?',
    diagnosisQMiss: 'Würdest du es vermissen?',
    diagnosisMissYes: 'Ja',
    diagnosisMissMaybe: 'Vielleicht',
    diagnosisMissNo: 'Nein',
    diagnosisYes: 'Ja',
    diagnosisNo: 'Nein',
    diagnosisSummaryTitle: 'Dein Abo-Check',
    diagnosisScore: 'Score',
    diagnosisResultKeep: 'Behalten — passt zu dir',
    diagnosisResultReview: 'Prüfen — vielleicht optimieren',
    diagnosisResultCancel: 'Kündigung empfohlen',
    diagnosisOpen: 'Abo-Check starten',
    trendTapHint: 'Tippe auf einen Balken für Details',
    prevMonth: 'Vormonat',
    nextMonth: 'Nächster Monat',
    currency: 'Währung',
    reminderNotificationBody: '„{name}“ wird bald abgebucht.',
    paywallTitle: 'SubTrack Pro',
    paywallRestore: 'Käufe wiederherstellen',
    paywallRestoreSuccess: 'Käufe wiederhergestellt',
    paywallRestoreNone: 'Keine vorherigen Käufe gefunden',
    paywallUnavailable: 'Store gerade nicht erreichbar. Bitte später erneut versuchen.',
    paywallContinue: 'Weiter',
    paywallActiveTitle: 'Du hast Pro',
    paywallActiveBody: 'Danke, dass du SubTrack unterstützt.',
    paywallManage: 'Abo verwalten',
    paywallTerms: 'Nutzungsbedingungen',
    paywallPrivacy: 'Datenschutz',
    paywallLegalNote:
      'Die Zahlung wird deinem Apple-ID-Konto belastet. Das Abo verlängert sich automatisch, sofern es nicht mindestens 24 Stunden vor Ende der aktuellen Periode gekündigt wird.',
    paywallLoading: 'Lädt…',
  },
  fr: {
    overview: 'Accueil',
    add: 'Ajouter',
    calendar: 'Calendrier',
    analysis: 'Analyse',
    settings: 'Réglages',
    monthly: 'Coût mensuel',
    yearly: 'Coût annuel',
    active: 'abonnements actifs',
    addSub: 'Ajouter un abonnement',
    search: 'Rechercher un service…',
    manual: 'Saisie manuelle',
    save: 'Enregistrer',
    name: 'Nom',
    price: 'Prix',
    cycle: 'Facturation',
    category: 'Catégorie',
    next: 'Début du contrat',
    contractStart: 'Début du contrat',
    note: 'Note',
    addListSortLabel: 'Affichage',
    sortGroupAlpha: 'A–Z',
    sortGroupCategory: 'Par catégorie',
    emptyHomeTitle: 'Aucun abonnement',
    emptyHomeBody: 'Ajoutez votre premier abonnement pour suivre vos dépenses.',
    emptyAddTitle: 'Choisir un service',
    emptyAddBody: 'Recherchez un fournisseur ou saisissez manuellement.',
    dailyCostLabel: 'Par jour',
    monthlyCostLabel: 'Par mois',
    yearlyCostLabel: 'Par an',
    cancelPage: 'Page de résiliation',
    openCancelPage: 'Ouvrir la résiliation',
    selectPlan: 'Choisir une offre',
    customPrice: 'Prix personnalisé',
    planEffectiveDate: 'Valable à partir du',
    editPlan: 'Modifier l’offre',
    subscriptionDetail: 'Détails de l’abonnement',
    pickMonth: 'Mois',
    pickYear: 'Année',
    customPlan: 'Personnalisé',
    privacy:
      'SubTrack garde tout sur votre appareil. Pas de compte, pas de cloud — vos abonnements restent chez vous.',
    start: 'Commencer',
    pro: 'Passer à Pro',
    limit: 'La version gratuite permet 5 abonnements. Pro débloque le suivi illimité.',
    saved: 'Économisé',
    totalMonth: 'Dû ce mois-ci',
    diagnosis: 'Bilan abonnements',
    language: 'Langue',
    vat: 'TVA',
    reminders: 'Rappel',
    export: 'Exporter CSV',
    biometric: 'Verrouillage biométrique',
    version: 'Version',
    vatDe: '19 % TVA (DE)',
    vatFr: '20 % TVA (FR)',
    vatNone: 'Sans TVA',
    reminderOff: 'Désactivé',
    reminderDaysBefore: 'jours avant',
    dataPrivacy: 'Données & confidentialité',
    proBlurb: 'Abonnements illimités, diagnostic, widget et export.',
    proPrice: '1,99 €/mois ou 14,99 €/an',
    categoryBreakdown: 'Par catégorie',
    thisMonth: 'Ce mois-ci',
    lastMonth: 'Mois dernier',
    topSubscriptions: 'Abonnements les plus chers',
    spendingTrend: 'Évolution des dépenses',
    perDay: '/jour',
    next30Days: '30 prochains jours',
    sortDate: 'Date',
    sortCost: 'Coût',
    sortAlpha: 'A–Z',
    delete: 'Supprimer',
    deleteTitle: 'Supprimer l’abonnement ?',
    deleteMessage: '« {name} » sera retiré de votre liste.',
    cancel: 'Annuler',
    tagline: 'Vos abonnements, bien rangés.',
    privacyBadge: '100 % local · RGPD',
    onboarding1Title: 'Tout au même endroit',
    onboarding1Body: 'Coûts mensuels, prochains prélèvements et catégories — comme une box d’abonnements.',
    onboarding2Title: 'Ne rien oublier',
    onboarding2Body: 'Calendrier et rappels avant chaque prélèvement.',
    onboarding3Title: 'Vos données restent ici',
    onboarding3Body:
      'SubTrack garde tout sur votre appareil. Pas de compte, pas de cloud — vos abonnements restent chez vous.',
    validationTitle: 'Vérification',
    validationBody: 'Le nom et le prix sont obligatoires.',
    cycleMonthly: 'Mensuel',
    cycleQuarterly: 'Trimestriel',
    cycleAnnual: 'Annuel',
    catStreaming: 'Streaming',
    catMusic: 'Musique',
    catProductivity: 'Productivité',
    catGaming: 'Jeux',
    catHealth: 'Santé',
    catNews: 'Actualités',
    catOther: 'Autre',
    proTrendHint: 'Tendances, export et diagnostic avec Pro.',
    rankPosition: 'Rang',
    monthBreakdownTotal: 'total',
    monthBreakdownEmpty: 'Aucun prélèvement ce mois-ci.',
    billingPresetToday: "Aujourd'hui",
    billingPresetIn7: 'Dans 7 jours',
    billingPreset1st: '1er du mois',
    billingPreset15th: '15 du mois',
    billingTapToPick: 'Appuyer pour choisir',
    billingDone: 'Terminé',
    diagnosisIntro:
      'Un mini bilan par abonnement : usage, doublons, prix — pour savoir quoi garder et quoi résilier.',
    diagnosisEmpty: 'Ajoutez un abonnement pour lancer le bilan.',
    diagnosisStart: 'Lancer le bilan',
    diagnosisProgress: 'Abonnement {progress}',
    diagnosisNext: 'Suivant',
    diagnosisFinish: 'Voir les résultats',
    diagnosisQUsage: 'À quelle fréquence l’utilisez-vous ?',
    diagnosisUsageDaily: 'Tous les jours',
    diagnosisUsageWeekly: 'Chaque semaine',
    diagnosisUsageRare: 'Rarement',
    diagnosisQDuplicate: 'Avez-vous un service similaire ?',
    diagnosisQWorth: 'Le prix en vaut-il la peine ?',
    diagnosisWorthYes: 'Oui',
    diagnosisWorthMaybe: 'Bof',
    diagnosisWorthNo: 'Non',
    diagnosisQForgot: 'L’aviez-vous presque oublié ?',
    diagnosisQMiss: 'Le regretteriez-vous ?',
    diagnosisMissYes: 'Oui',
    diagnosisMissMaybe: 'Peut-être',
    diagnosisMissNo: 'Non',
    diagnosisYes: 'Oui',
    diagnosisNo: 'Non',
    diagnosisSummaryTitle: 'Résultats du bilan',
    diagnosisScore: 'Score',
    diagnosisResultKeep: 'À garder — bon rapport',
    diagnosisResultReview: 'À revoir — optimiser',
    diagnosisResultCancel: 'Résiliation conseillée',
    diagnosisOpen: 'Lancer le bilan',
    trendTapHint: 'Appuyez sur une barre pour le détail',
    prevMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    currency: 'Devise',
    reminderNotificationBody: '« {name} » sera bientôt prélevé.',
    paywallTitle: 'SubTrack Pro',
    paywallRestore: 'Restaurer les achats',
    paywallRestoreSuccess: 'Achats restaurés',
    paywallRestoreNone: 'Aucun achat précédent trouvé',
    paywallUnavailable: 'Boutique indisponible pour le moment. Réessayez plus tard.',
    paywallContinue: 'Continuer',
    paywallActiveTitle: 'Vous avez Pro',
    paywallActiveBody: 'Merci de soutenir SubTrack.',
    paywallManage: 'Gérer l’abonnement',
    paywallTerms: 'Conditions d’utilisation',
    paywallPrivacy: 'Confidentialité',
    paywallLegalNote:
      'Le paiement sera prélevé sur votre compte Apple ID. L’abonnement se renouvelle automatiquement sauf annulation au moins 24 heures avant la fin de la période en cours.',
    paywallLoading: 'Chargement…',
  },
  en: {
    overview: 'Overview',
    add: 'Add',
    calendar: 'Calendar',
    analysis: 'Analysis',
    settings: 'Settings',
    monthly: 'Monthly spend',
    yearly: 'Yearly spend',
    active: 'active subs',
    addSub: 'Add subscription',
    search: 'Search a service…',
    manual: 'Enter manually',
    save: 'Save',
    name: 'Name',
    price: 'Price',
    cycle: 'Billing cycle',
    category: 'Category',
    next: 'Contract start date',
    contractStart: 'Contract start date',
    note: 'Note',
    addListSortLabel: 'View',
    sortGroupAlpha: 'A–Z',
    sortGroupCategory: 'By category',
    emptyHomeTitle: 'No subscriptions yet',
    emptyHomeBody: 'Add your first subscription to track spending in one place.',
    emptyAddTitle: 'Pick a service',
    emptyAddBody: 'Search for a provider or enter details manually.',
    dailyCostLabel: 'Per day',
    monthlyCostLabel: 'Per month',
    yearlyCostLabel: 'Per year',
    cancelPage: 'Cancellation page',
    openCancelPage: 'Open cancellation page',
    selectPlan: 'Choose a plan',
    customPrice: 'Custom price',
    planEffectiveDate: 'Effective from',
    editPlan: 'Change plan',
    subscriptionDetail: 'Subscription details',
    pickMonth: 'Month',
    pickYear: 'Year',
    customPlan: 'Custom',
    privacy:
      'SubTrack keeps everything on your device. No account, no cloud — your subscriptions stay with you.',
    start: 'Get started',
    pro: 'Upgrade to Pro',
    limit: 'Free supports up to 5 subscriptions. Pro unlocks unlimited tracking.',
    saved: 'Saved',
    totalMonth: 'Due this month',
    diagnosis: 'Subscription check-in',
    language: 'Language',
    vat: 'VAT',
    reminders: 'Reminder',
    export: 'Export CSV',
    biometric: 'Biometric lock',
    version: 'Version',
    vatDe: '19% VAT (DE)',
    vatFr: '20% VAT (FR)',
    vatNone: 'No VAT',
    reminderOff: 'Off',
    reminderDaysBefore: 'days before',
    dataPrivacy: 'Data & privacy',
    proBlurb: 'Unlimited subs, diagnosis, widget, and export.',
    proPrice: '€1.99/month or €14.99/year',
    categoryBreakdown: 'By category',
    thisMonth: 'This month',
    lastMonth: 'Last month',
    topSubscriptions: 'Highest-cost subscriptions',
    spendingTrend: 'Spending over time',
    perDay: '/day',
    next30Days: 'Next 30 days',
    sortDate: 'Date',
    sortCost: 'Cost',
    sortAlpha: 'A–Z',
    delete: 'Remove',
    deleteTitle: 'Remove subscription?',
    deleteMessage: '“{name}” will be removed from your overview.',
    cancel: 'Cancel',
    tagline: 'Your subscriptions, neatly packed.',
    privacyBadge: '100% local · GDPR-friendly',
    onboarding1Title: 'Everything in one place',
    onboarding1Body: 'Monthly spend, upcoming charges, and categories — like unboxing your subs.',
    onboarding2Title: 'Never miss a charge',
    onboarding2Body: 'Calendar and reminders before each payment.',
    onboarding3Title: 'Your data stays here',
    onboarding3Body:
      'SubTrack keeps everything on your device. No account, no cloud — your subscriptions stay with you.',
    validationTitle: 'Please check',
    validationBody: 'Name and price are required.',
    cycleMonthly: 'Monthly',
    cycleQuarterly: 'Quarterly',
    cycleAnnual: 'Annual',
    catStreaming: 'Streaming',
    catMusic: 'Music',
    catProductivity: 'Productivity',
    catGaming: 'Gaming',
    catHealth: 'Health',
    catNews: 'News',
    catOther: 'Other',
    proTrendHint: 'Trends, export, and diagnosis with Pro.',
    rankPosition: 'Rank',
    monthBreakdownTotal: 'total',
    monthBreakdownEmpty: 'No charges in this month.',
    billingPresetToday: 'Today',
    billingPresetIn7: 'In 7 days',
    billingPreset1st: '1st of month',
    billingPreset15th: '15th of month',
    billingTapToPick: 'Tap to pick a date',
    billingDone: 'Done',
    diagnosisIntro:
      'A quick check-in per subscription: usage, duplicates, price — see what to keep and what to cancel.',
    diagnosisEmpty: 'Add a subscription first, then run the check-in.',
    diagnosisStart: 'Start check-in',
    diagnosisProgress: 'Subscription {progress}',
    diagnosisNext: 'Next subscription',
    diagnosisFinish: 'See results',
    diagnosisQUsage: 'How often do you use it?',
    diagnosisUsageDaily: 'Daily',
    diagnosisUsageWeekly: 'Weekly',
    diagnosisUsageRare: 'Rarely',
    diagnosisQDuplicate: 'Do you have a similar service?',
    diagnosisQWorth: 'Is the price worth it?',
    diagnosisWorthYes: 'Yes',
    diagnosisWorthMaybe: 'So-so',
    diagnosisWorthNo: 'No',
    diagnosisQForgot: 'Did you almost forget about it?',
    diagnosisQMiss: 'Would you miss it?',
    diagnosisMissYes: 'Yes',
    diagnosisMissMaybe: 'Maybe',
    diagnosisMissNo: 'No',
    diagnosisYes: 'Yes',
    diagnosisNo: 'No',
    diagnosisSummaryTitle: 'Your check-in results',
    diagnosisScore: 'Score',
    diagnosisResultKeep: 'Keep — good fit',
    diagnosisResultReview: 'Review — room to optimize',
    diagnosisResultCancel: 'Cancel recommended',
    diagnosisOpen: 'Start subscription check-in',
    trendTapHint: 'Tap a bar for a breakdown',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    currency: 'Currency',
    reminderNotificationBody: '"{name}" renews soon.',
    paywallTitle: 'SubTrack Pro',
    paywallRestore: 'Restore purchases',
    paywallRestoreSuccess: 'Purchases restored',
    paywallRestoreNone: 'No previous purchases found',
    paywallUnavailable: 'Store unavailable right now. Please try again later.',
    paywallContinue: 'Continue',
    paywallActiveTitle: "You're on Pro",
    paywallActiveBody: 'Thanks for supporting SubTrack.',
    paywallManage: 'Manage subscription',
    paywallTerms: 'Terms of Use',
    paywallPrivacy: 'Privacy Policy',
    paywallLegalNote:
      'Payment will be charged to your Apple ID account. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.',
    paywallLoading: 'Loading…',
  },
  es: {
    overview: 'Resumen',
    add: 'Añadir',
    calendar: 'Calendario',
    analysis: 'Análisis',
    settings: 'Ajustes',
    monthly: 'Gasto mensual',
    yearly: 'Gasto anual',
    active: 'suscripciones activas',
    addSub: 'Añadir suscripción',
    search: 'Buscar un servicio…',
    manual: 'Introducir a mano',
    save: 'Guardar',
    name: 'Nombre',
    price: 'Precio',
    cycle: 'Ciclo de facturación',
    category: 'Categoría',
    next: 'Inicio del contrato',
    contractStart: 'Inicio del contrato',
    note: 'Nota',
    addListSortLabel: 'Vista',
    sortGroupAlpha: 'A–Z',
    sortGroupCategory: 'Por categoría',
    emptyHomeTitle: 'Sin suscripciones',
    emptyHomeBody: 'Añade tu primera suscripción para controlar el gasto.',
    emptyAddTitle: 'Elige un servicio',
    emptyAddBody: 'Busca un proveedor o introduce los datos a mano.',
    dailyCostLabel: 'Al día',
    monthlyCostLabel: 'Al mes',
    yearlyCostLabel: 'Al año',
    cancelPage: 'Página de cancelación',
    openCancelPage: 'Abrir cancelación',
    selectPlan: 'Elegir plan',
    customPrice: 'Precio personalizado',
    planEffectiveDate: 'Válido desde',
    editPlan: 'Cambiar plan',
    subscriptionDetail: 'Detalles de la suscripción',
    pickMonth: 'Mes',
    pickYear: 'Año',
    customPlan: 'Personalizado',
    privacy:
      'SubTrack guarda todo en tu dispositivo. Sin cuenta ni nube: tus suscripciones se quedan contigo.',
    start: 'Empezar',
    pro: 'Pasar a Pro',
    limit: 'La versión gratuita permite hasta 5 suscripciones. Pro desbloquea el seguimiento ilimitado.',
    saved: 'Ahorrado',
    totalMonth: 'A pagar este mes',
    diagnosis: 'Revisión de suscripciones',
    language: 'Idioma',
    vat: 'IVA',
    reminders: 'Recordatorio',
    export: 'Exportar CSV',
    biometric: 'Bloqueo biométrico',
    version: 'Versión',
    vatDe: '19 % IVA (DE)',
    vatFr: '20 % IVA (FR)',
    vatNone: 'Sin IVA',
    reminderOff: 'Desactivado',
    reminderDaysBefore: 'días antes',
    dataPrivacy: 'Datos y privacidad',
    proBlurb: 'Suscripciones ilimitadas, revisión, widget y exportación.',
    proPrice: '1,99 €/mes o 14,99 €/año',
    categoryBreakdown: 'Por categoría',
    thisMonth: 'Este mes',
    lastMonth: 'Mes anterior',
    topSubscriptions: 'Suscripciones más caras',
    spendingTrend: 'Evolución del gasto',
    perDay: '/día',
    next30Days: 'Próximos 30 días',
    sortDate: 'Fecha',
    sortCost: 'Coste',
    sortAlpha: 'A–Z',
    delete: 'Eliminar',
    deleteTitle: '¿Eliminar suscripción?',
    deleteMessage: '«{name}» se quitará de tu lista.',
    cancel: 'Cancelar',
    tagline: 'Tus suscripciones, bien organizadas.',
    privacyBadge: '100 % local · RGPD',
    onboarding1Title: 'Todo en un solo lugar',
    onboarding1Body:
      'Gasto mensual, próximos cobros y categorías — como abrir tu caja de suscripciones.',
    onboarding2Title: 'No te pierdas ningún cobro',
    onboarding2Body: 'Calendario y avisos antes de cada pago.',
    onboarding3Title: 'Tus datos se quedan aquí',
    onboarding3Body:
      'SubTrack guarda todo en tu dispositivo. Sin cuenta ni nube: tus suscripciones se quedan contigo.',
    validationTitle: 'Revisa los datos',
    validationBody: 'El nombre y el precio son obligatorios.',
    cycleMonthly: 'Mensual',
    cycleQuarterly: 'Trimestral',
    cycleAnnual: 'Anual',
    catStreaming: 'Streaming',
    catMusic: 'Música',
    catProductivity: 'Productividad',
    catGaming: 'Juegos',
    catHealth: 'Salud',
    catNews: 'Noticias',
    catOther: 'Otros',
    proTrendHint: 'Tendencias, exportación y revisión con Pro.',
    rankPosition: 'Puesto',
    monthBreakdownTotal: 'total',
    monthBreakdownEmpty: 'No hay cobros este mes.',
    billingPresetToday: 'Hoy',
    billingPresetIn7: 'En 7 días',
    billingPreset1st: 'Día 1 del mes',
    billingPreset15th: 'Día 15 del mes',
    billingTapToPick: 'Toca para elegir',
    billingDone: 'Listo',
    diagnosisIntro:
      'Una revisión rápida por suscripción: uso, duplicados, precio — qué conservar y qué cancelar.',
    diagnosisEmpty: 'Añade una suscripción y luego lanza la revisión.',
    diagnosisStart: 'Iniciar revisión',
    diagnosisProgress: 'Suscripción {progress}',
    diagnosisNext: 'Siguiente',
    diagnosisFinish: 'Ver resultados',
    diagnosisQUsage: '¿Con qué frecuencia la usas?',
    diagnosisUsageDaily: 'A diario',
    diagnosisUsageWeekly: 'Cada semana',
    diagnosisUsageRare: 'Casi nunca',
    diagnosisQDuplicate: '¿Tienes un servicio parecido?',
    diagnosisQWorth: '¿Vale la pena el precio?',
    diagnosisWorthYes: 'Sí, totalmente',
    diagnosisWorthMaybe: 'Regular',
    diagnosisWorthNo: 'No',
    diagnosisQForgot: '¿Casi se te olvidaba?',
    diagnosisQMiss: '¿La echarías de menos?',
    diagnosisMissYes: 'Sí',
    diagnosisMissMaybe: 'Tal vez',
    diagnosisMissNo: 'No',
    diagnosisYes: 'Sí',
    diagnosisNo: 'No',
    diagnosisSummaryTitle: 'Resultados de la revisión',
    diagnosisScore: 'Puntuación',
    diagnosisResultKeep: 'Conservar — encaja contigo',
    diagnosisResultReview: 'Revisar — hay margen',
    diagnosisResultCancel: 'Conviene cancelar',
    diagnosisOpen: 'Iniciar revisión',
    trendTapHint: 'Toca una barra para ver el detalle',
    prevMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
    currency: 'Moneda',
    reminderNotificationBody: '"{name}" se renovará pronto.',
    paywallTitle: 'SubTrack Pro',
    paywallRestore: 'Restaurar compras',
    paywallRestoreSuccess: 'Compras restauradas',
    paywallRestoreNone: 'No se encontraron compras anteriores',
    paywallUnavailable: 'Tienda no disponible ahora mismo. Inténtalo más tarde.',
    paywallContinue: 'Continuar',
    paywallActiveTitle: 'Ya tienes Pro',
    paywallActiveBody: 'Gracias por apoyar a SubTrack.',
    paywallManage: 'Gestionar suscripción',
    paywallTerms: 'Términos de uso',
    paywallPrivacy: 'Privacidad',
    paywallLegalNote:
      'El pago se cargará a tu cuenta de Apple ID. La suscripción se renueva automáticamente a menos que se cancele al menos 24 horas antes del final del período actual.',
    paywallLoading: 'Cargando…',
  },
};

export function localeForLanguage(lang: Language): string {
  if (lang === 'de') return 'de-DE';
  if (lang === 'fr') return 'fr-FR';
  if (lang === 'es') return 'es-ES';
  return 'en-GB';
}

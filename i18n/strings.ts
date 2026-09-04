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
  cancelPageUnavailable: string;
  openCancelPage: string;
  selectPlan: string;
  customPrice: string;
  planEffectiveDate: string;
  editPlan: string;
  subscriptionDetail: string;
  pickMonth: string;
  pickYear: string;
  customPlan: string;
  currentPlanLabel: string;
  privacy: string;
  start: string;
  pro: string;
  limit: string;
  totalMonth: string;
  diagnosis: string;
  language: string;
  vat: string;
  reminders: string;
  export: string;
  version: string;
  vatDe: string;
  vatFr: string;
  vatNone: string;
  reminderOff: string;
  reminderDaysBefore: string;
  dataPrivacy: string;
  proBlurb: string;
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
  back: string;
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
  dayBreakdownEmpty: string;
  daysUntilTemplate: string;
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
  currencyChangeFailedTitle: string;
  currencyChangeFailedBody: string;
  reminderNotificationTitle: string;
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
  paywallLifetimeNote: string;
  paywallRecommended: string;
  paywallLoading: string;
  paywallDurationMonthly: string;
  paywallDurationYearly: string;
  paywallDurationLifetime: string;
  paywallFeatureBackup: string;
  diagnosisUnlimitedProOnly: string;
  customLogoProOnly: string;
  backupData: string;
  restoreData: string;
  resetData: string;
  resetConfirmTitle: string;
  resetConfirmMessage: string;
  restoreSuccess: string;
  restoreInvalid: string;
  trialEndingNotificationTitle: string;
  trialEndingNotificationBody: string;
  billingTodayNotificationTitle: string;
  billingTodayNotificationBody: string;
  trialEndsTodayNotificationTitle: string;
  trialEndsTodayNotificationBody: string;
  trialFollowUpNotificationTitle: string;
  trialFollowUpNotificationBody: string;
  trialFollowUpTitle: string;
  trialFollowUpBody: string;
  trialFollowUpCancelled: string;
  trialFollowUpContinue: string;
  trialFollowUpLater: string;
  dueToday: string;
  continuePlanTitle: string;
  continuePlanBody: string;
  continuePlanSave: string;
  share: string;
  shareTitle: string;
  shareSubtitle: string;
  shareSubsLabel: string;
  shareCheckupTitle: string;
  shareCta: string;
  shareDiagnosisPrompt: string;
  shareUnavailable: string;
  shareGeneratedBy: string;
  rateTitle: string;
  rateBody: string;
  rateNow: string;
  rateLater: string;
  widgetTitle: string;
  widgetBody: string;
  widgetDiagLabel: string;
  widgetDiagMissing: string;
  widgetDiagUnreachable: string;
  widgetDiagEmpty: string;
  widgetDiagOk: string;
  diagnosisAlreadyDoneTitle: string;
  diagnosisAlreadyDoneBody: string;
  diagnosisViewHistory: string;
  diagnosisHistoryTitle: string;
  diagnosisCancelButton: string;
  diagnosisCancelled: string;
  diagnosisCancelConfirmTitle: string;
  diagnosisCancelConfirmBody: string;
  diagnosisCancelConfirm: string;
  diagnosisSavingsTitle: string;
  diagnosisSavingsMonthly: string;
  diagnosisSavingsYearly: string;
  diagnosisSavingsBreakdown: string;
  diagnosisHistoryCount: string;
  diagnosisHistoryLowLabel: string;
  momVsLastMonth: string;
  freeTrial: string;
  freeTrialDuration: string;
  freeTrialDaysUnit: string;
  freeTrialBadge: string;
  freeTrialEndsLabel: string;
  prevYear: string;
  nextYear: string;
  photoPermissionDenied: string;
  choosePhoto: string;
  analyticsLockedTitle: string;
  analyticsLockedBody: string;
  filterAll: string;
  fxProOnly: string;
  viewTutorial: string;
  analyticsProOnly: string;
  notificationsLabel: string;
  notificationsOn: string;
  notificationsOff: string;
  enableNotificationsBtn: string;
  openSettingsBtn: string;
  manageSubscription: string;
  csvMonthlyEquivalent: string;
  csvStarted: string;
  csvNextBilling: string;
  errorBoundaryTitle: string;
  errorBoundaryBody: string;
  errorBoundaryRetry: string;
  scrollToTop: string;
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
    cancelPageUnavailable: 'Für {name} liegt uns kein direkter Kündigungslink vor. Bitte kündige direkt in der {name}-App oder auf der Website.',
    openCancelPage: 'Kündigung öffnen',
    selectPlan: 'Tarif wählen',
    customPrice: 'Eigener Preis',
    planEffectiveDate: 'Gültig ab',
    editPlan: 'Tarif ändern',
    subscriptionDetail: 'Abo-Details',
    pickMonth: 'Monat',
    pickYear: 'Jahr',
    customPlan: 'Individuell',
    currentPlanLabel: 'aktuell',
    privacy:
      'SubTrack speichert alles nur auf deinem Gerät. Kein Konto, kein Cloud-Sync — deine Abos bleiben bei dir.',
    start: 'Loslegen',
    pro: 'Pro freischalten',
    limit: 'Die Free-Version erlaubt bis zu 5 Abos. Mit Pro trackst du unbegrenzt.',
    totalMonth: 'Fällig diesen Monat',
    diagnosis: 'Abo-Check',
    language: 'Sprache',
    vat: 'MwSt.',
    reminders: 'Erinnerung',
    export: 'CSV exportieren',
    version: 'Version',
    vatDe: '19 % MwSt. (DE)',
    vatFr: '20 % TVA (FR)',
    vatNone: 'Ohne MwSt.',
    reminderOff: 'Aus',
    reminderDaysBefore: 'Tage vorher',
    dataPrivacy: 'Daten & Privatsphäre',
    proBlurb: 'Unbegrenzte Abos, unbegrenzte Diagnosen, Analyse, Echtzeit-Wechselkurse, CSV-Export, Datensicherung und eigene Logos.',
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
    back: 'Zurück',
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
    proTrendHint: 'Verfolge unbegrenzt viele Abos und exportiere deine Daten mit Pro.',
    rankPosition: 'Platz',
    monthBreakdownTotal: 'gesamt',
    monthBreakdownEmpty: 'Keine Abbuchungen in diesem Monat.',
    dayBreakdownEmpty: 'Keine Abbuchung an diesem Tag.',
    daysUntilTemplate: 'in {n} Tagen',
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
    currencyChangeFailedTitle: 'Wechselkurs nicht verfügbar',
    currencyChangeFailedBody: 'Bitte Internetverbindung prüfen und erneut versuchen.',
    reminderNotificationTitle: '{name} – Zahlung in {days} Tagen',
    reminderNotificationBody: '{price} wird abgebucht.',
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
      'Die Zahlung wird deinem Apple-ID-Konto belastet. Das Abo verlängert sich automatisch, sofern es nicht mindestens 24 Stunden vor Ende der aktuellen Periode gekündigt wird. Du kannst jederzeit in den App-Store-Einstellungen kündigen.',
    paywallLifetimeNote: 'Einmalige Zahlung. Kein Abo, keine automatische Verlängerung.',
    paywallRecommended: 'Empfohlen',
    paywallLoading: 'Lädt…',
    paywallDurationMonthly: 'Monatlich',
    paywallDurationYearly: 'Jährlich',
    paywallDurationLifetime: 'Einmalig',
    paywallFeatureBackup: 'Daten sichern und wiederherstellen',
    diagnosisUnlimitedProOnly: 'Unbegrenzte Abo-Diagnosen mit Pro',
    customLogoProOnly: 'Eigenes Logo/Bild für jedes Abo festlegen',
    backupData: 'Daten sichern',
    restoreData: 'Backup wiederherstellen',
    resetData: 'Alle Daten löschen',
    resetConfirmTitle: 'Alle Daten löschen?',
    resetConfirmMessage: 'Entfernt alle erfassten Abos von diesem Gerät. Das kann nicht rückgängig gemacht werden.',
    restoreSuccess: 'Backup wiederhergestellt',
    restoreInvalid: 'Diese Datei ist kein gültiges SubTrack-Backup.',
    trialEndingNotificationTitle: '{name}: Testphase endet am {date}',
    trialEndingNotificationBody: 'Danach wird es kostenpflichtig ({price}).',
    billingTodayNotificationTitle: '{name} – heute fällig',
    billingTodayNotificationBody: '{price} wird heute abgebucht.',
    trialEndsTodayNotificationTitle: '{name}: Testphase endet heute',
    trialEndsTodayNotificationBody: 'Ab morgen kostenpflichtig ({price}).',
    trialFollowUpNotificationTitle: 'Hast du {name} gekündigt?',
    trialFollowUpNotificationBody: 'Die Testphase ist vorbei. Öffne SubTrack und sag uns Bescheid.',
    trialFollowUpTitle: 'Testphase beendet',
    trialFollowUpBody: 'Die kostenlose Testphase von {name} ist vorbei. Hast du gekündigt oder läuft es weiter?',
    trialFollowUpCancelled: 'Ich habe gekündigt',
    trialFollowUpContinue: 'Läuft weiter',
    trialFollowUpLater: 'Später fragen',
    dueToday: 'Heute',
    continuePlanTitle: 'Tarif wählen',
    continuePlanBody: 'Die Testphase von {name} ist vorbei. Wähle den Tarif, den du jetzt zahlst.',
    continuePlanSave: 'Tarif aktualisieren',
    share: 'Teilen',
    shareTitle: 'Meine Abos',
    shareSubtitle: 'Übersicht aus SubTrack',
    shareSubsLabel: 'Abos',
    shareCheckupTitle: 'Ergebnisse des Abo-Checks',
    shareCta: 'Übersicht teilen',
    shareDiagnosisPrompt: 'Ergebnisse teilen?',
    shareUnavailable: 'Teilen ist auf diesem Gerät nicht verfügbar.',
    shareGeneratedBy: 'Erstellt mit SubTrack',
    rateTitle: 'Gefällt dir SubTrack?',
    rateBody: 'Du hast schon 3 Abos angelegt. Eine kurze Bewertung im App Store hilft uns sehr.',
    rateNow: 'SubTrack bewerten',
    rateLater: 'Jetzt nicht',
    widgetTitle: 'Home-Bildschirm-Widget',
    widgetBody: 'Home-Bildschirm gedrückt halten, auf + tippen und nach SubTrack suchen.',
    widgetDiagLabel: 'Widget-Daten',
    widgetDiagMissing: 'In diesem Build nicht verfügbar',
    widgetDiagUnreachable: 'Gemeinsamer Speicher nicht erreichbar',
    widgetDiagEmpty: 'Noch nichts geschrieben',
    widgetDiagOk: '{total} · {n} anstehend',
    diagnosisAlreadyDoneTitle: 'Bereits geprüft',
    diagnosisAlreadyDoneBody: 'Du hast alle Abos schon einmal geprüft. Mit Pro kannst du sie erneut prüfen.',
    diagnosisViewHistory: 'Frühere Ergebnisse ansehen',
    diagnosisHistoryTitle: 'Frühere Ergebnisse',
    diagnosisCancelButton: 'Dieses Abo kündigen',
    diagnosisCancelled: 'Gekündigt',
    diagnosisCancelConfirmTitle: 'Abo kündigen?',
    diagnosisCancelConfirmBody: 'Markiere „{name}“ als gekündigt. Du kannst dies in den Details rückgängig machen.',
    diagnosisCancelConfirm: 'Kündigen',
    diagnosisSavingsTitle: 'Ersparnis durch Kündigungen',
    diagnosisSavingsMonthly: 'Pro Monat',
    diagnosisSavingsYearly: 'Pro Jahr',
    diagnosisSavingsBreakdown: 'Aufschlüsselung',
    diagnosisHistoryCount: '{n} geprüft',
    diagnosisHistoryLowLabel: 'unter 50',
    momVsLastMonth: 'ggü. Vormonat',
    freeTrial: 'Testphase',
    freeTrialDuration: 'Dauer der Testphase',
    freeTrialDaysUnit: 'Tage',
    freeTrialBadge: 'Test',
    freeTrialEndsLabel: 'Testphase endet',
    prevYear: 'Vorheriges Jahr',
    nextYear: 'Nächstes Jahr',
    photoPermissionDenied: 'Zugriff auf Fotos wurde nicht erlaubt.',
    choosePhoto: 'Foto wählen',
    analyticsLockedTitle: 'Analyse mit Pro freischalten',
    analyticsLockedBody: 'Kategorien, Ausgabenverlauf und Ranking siehst du mit SubTrack Pro.',
    filterAll: 'Alle',
    fxProOnly: 'Echtzeit-Wechselkurse sind Teil von Pro.',
    viewTutorial: 'Einführung ansehen',
    analyticsProOnly: 'Kategorien, Trends und Ranking mit Pro',
    notificationsLabel: 'Benachrichtigungen',
    notificationsOn: 'Aktiviert',
    notificationsOff: 'Deaktiviert',
    enableNotificationsBtn: 'Aktivieren',
    openSettingsBtn: 'Einstellungen öffnen',
    manageSubscription: 'Abo verwalten/kündigen',
    csvMonthlyEquivalent: 'Monatlich (umgerechnet)',
    csvStarted: 'Beginn',
    csvNextBilling: 'Nächste Abbuchung',
    errorBoundaryTitle: 'Etwas ist schiefgelaufen',
    errorBoundaryBody: 'SubTrack ist auf einen unerwarteten Fehler gestoßen. Deine Daten sind auf diesem Gerät sicher.',
    errorBoundaryRetry: 'Erneut versuchen',
    scrollToTop: 'Nach oben scrollen',
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
    cancelPageUnavailable: 'Nous n\'avons pas de lien de résiliation direct pour {name}. Merci de résilier directement depuis l\'application ou le site de {name}.',
    openCancelPage: 'Ouvrir la résiliation',
    selectPlan: 'Choisir une offre',
    customPrice: 'Prix personnalisé',
    planEffectiveDate: 'Valable à partir du',
    editPlan: 'Modifier l’offre',
    subscriptionDetail: 'Détails de l’abonnement',
    pickMonth: 'Mois',
    pickYear: 'Année',
    customPlan: 'Personnalisé',
    currentPlanLabel: 'actuel',
    privacy:
      'SubTrack garde tout sur votre appareil. Pas de compte, pas de cloud — vos abonnements restent chez vous.',
    start: 'Commencer',
    pro: 'Passer à Pro',
    limit: 'La version gratuite permet 5 abonnements. Pro débloque le suivi illimité.',
    totalMonth: 'Dû ce mois-ci',
    diagnosis: 'Bilan abonnements',
    language: 'Langue',
    vat: 'TVA',
    reminders: 'Rappel',
    export: 'Exporter CSV',
    version: 'Version',
    vatDe: '19 % TVA (DE)',
    vatFr: '20 % TVA (FR)',
    vatNone: 'Sans TVA',
    reminderOff: 'Désactivé',
    reminderDaysBefore: 'jours avant',
    dataPrivacy: 'Données & confidentialité',
    proBlurb: 'Abonnements illimités, diagnostics illimités, analyse, taux de change en temps réel, export CSV, sauvegarde et logos personnalisés.',
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
    back: 'Retour',
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
    proTrendHint: 'Suivez un nombre illimité d’abonnements et exportez vos données avec Pro.',
    rankPosition: 'Rang',
    monthBreakdownTotal: 'total',
    monthBreakdownEmpty: 'Aucun prélèvement ce mois-ci.',
    dayBreakdownEmpty: 'Aucun prélèvement ce jour-là.',
    daysUntilTemplate: 'dans {n} jours',
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
    currencyChangeFailedTitle: 'Taux de change indisponible',
    currencyChangeFailedBody: 'Vérifiez votre connexion internet et réessayez.',
    reminderNotificationTitle: '{name} – Paiement dans {days} jours',
    reminderNotificationBody: '{price} sera prélevé.',
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
      'Le paiement sera prélevé sur votre compte Apple ID. L’abonnement se renouvelle automatiquement sauf annulation au moins 24 heures avant la fin de la période en cours. Vous pouvez annuler à tout moment dans les réglages de l’App Store.',
    paywallLifetimeNote: 'Paiement unique. Pas d’abonnement, pas de renouvellement.',
    paywallRecommended: 'Recommandé',
    paywallLoading: 'Chargement…',
    paywallDurationMonthly: 'Mensuel',
    paywallDurationYearly: 'Annuel',
    paywallDurationLifetime: 'À vie',
    paywallFeatureBackup: 'Sauvegardez et restaurez vos données',
    diagnosisUnlimitedProOnly: 'Diagnostics d’abonnement illimités avec Pro',
    customLogoProOnly: 'Définissez un logo personnalisé pour chaque abonnement',
    backupData: 'Sauvegarder les données',
    restoreData: 'Restaurer une sauvegarde',
    resetData: 'Supprimer toutes les données',
    resetConfirmTitle: 'Supprimer toutes les données ?',
    resetConfirmMessage: 'Supprime tous vos abonnements suivis sur cet appareil. Action irréversible.',
    restoreSuccess: 'Sauvegarde restaurée',
    restoreInvalid: 'Ce fichier n’est pas une sauvegarde SubTrack valide.',
    trialEndingNotificationTitle: '{name} : essai gratuit jusqu’au {date}',
    trialEndingNotificationBody: 'Ensuite, l’abonnement devient payant ({price}).',
    billingTodayNotificationTitle: '{name} – prélèvement aujourd’hui',
    billingTodayNotificationBody: '{price} sera prélevé aujourd’hui.',
    trialEndsTodayNotificationTitle: '{name} : l’essai gratuit se termine aujourd’hui',
    trialEndsTodayNotificationBody: 'À partir de demain, c’est payant ({price}).',
    trialFollowUpNotificationTitle: 'Avez-vous résilié {name} ?',
    trialFollowUpNotificationBody: 'L’essai gratuit est terminé. Ouvrez SubTrack pour nous le dire.',
    trialFollowUpTitle: 'Essai gratuit terminé',
    trialFollowUpBody: 'L’essai gratuit de {name} est terminé. L’avez-vous résilié ou continuez-vous ?',
    trialFollowUpCancelled: 'Je l’ai résilié',
    trialFollowUpContinue: 'Je continue',
    trialFollowUpLater: 'Plus tard',
    dueToday: 'Auj.',
    continuePlanTitle: 'Choisir la formule',
    continuePlanBody: 'L’essai gratuit de {name} est terminé. Choisissez la formule que vous payez maintenant.',
    continuePlanSave: 'Mettre à jour la formule',
    share: 'Partager',
    shareTitle: 'Mes abonnements',
    shareSubtitle: 'Résumé depuis SubTrack',
    shareSubsLabel: 'Abonnements',
    shareCheckupTitle: 'Résultats du bilan',
    shareCta: 'Partager mon résumé',
    shareDiagnosisPrompt: 'Partager vos résultats ?',
    shareUnavailable: 'Le partage n’est pas disponible sur cet appareil.',
    shareGeneratedBy: 'Créé avec SubTrack',
    rateTitle: 'SubTrack vous plaît ?',
    rateBody: 'Vous avez ajouté 3 abonnements. Une note sur l’App Store nous aide beaucoup.',
    rateNow: 'Noter SubTrack',
    rateLater: 'Pas maintenant',
    widgetTitle: 'Widget écran d’accueil',
    widgetBody: 'Appuyez longuement sur l’écran d’accueil, touchez +, puis cherchez SubTrack.',
    widgetDiagLabel: 'Données du widget',
    widgetDiagMissing: 'Indisponible dans cette version',
    widgetDiagUnreachable: 'Stockage partagé inaccessible',
    widgetDiagEmpty: 'Rien encore écrit',
    widgetDiagOk: '{total} · {n} à venir',
    diagnosisAlreadyDoneTitle: 'Déjà vérifié',
    diagnosisAlreadyDoneBody: 'Vous avez déjà vérifié tous vos abonnements. Passez à Pro pour recommencer.',
    diagnosisViewHistory: 'Voir les résultats précédents',
    diagnosisHistoryTitle: 'Résultats précédents',
    diagnosisCancelButton: 'Résilier cet abonnement',
    diagnosisCancelled: 'Résilié',
    diagnosisCancelConfirmTitle: 'Résilier l’abonnement ?',
    diagnosisCancelConfirmBody: 'Marque « {name} » comme résilié. Vous pourrez annuler cela depuis ses détails.',
    diagnosisCancelConfirm: 'Résilier',
    diagnosisSavingsTitle: 'Économies grâce aux résiliations',
    diagnosisSavingsMonthly: 'Par mois',
    diagnosisSavingsYearly: 'Par an',
    diagnosisSavingsBreakdown: 'Détail',
    diagnosisHistoryCount: '{n} vérifié(s)',
    diagnosisHistoryLowLabel: 'sous 50',
    momVsLastMonth: 'vs mois dernier',
    freeTrial: 'Essai gratuit',
    freeTrialDuration: 'Durée de l’essai',
    freeTrialDaysUnit: 'jours',
    freeTrialBadge: 'Essai',
    freeTrialEndsLabel: 'Fin de l’essai',
    prevYear: 'Année précédente',
    nextYear: 'Année suivante',
    photoPermissionDenied: 'Accès aux photos refusé.',
    choosePhoto: 'Choisir une photo',
    analyticsLockedTitle: 'Débloquez l’analyse avec Pro',
    analyticsLockedBody: 'Catégories, évolution des dépenses et classement avec SubTrack Pro.',
    filterAll: 'Tous',
    fxProOnly: 'Les taux de change en temps réel font partie de Pro.',
    viewTutorial: 'Revoir l’introduction',
    analyticsProOnly: 'Catégories, tendances et classement avec Pro',
    notificationsLabel: 'Notifications',
    notificationsOn: 'Activées',
    notificationsOff: 'Désactivées',
    enableNotificationsBtn: 'Activer',
    openSettingsBtn: 'Ouvrir les réglages',
    manageSubscription: 'Gérer/résilier l’abonnement',
    csvMonthlyEquivalent: 'Équivalent mensuel',
    csvStarted: 'Début',
    csvNextBilling: 'Prochain prélèvement',
    errorBoundaryTitle: 'Un problème est survenu',
    errorBoundaryBody: 'SubTrack a rencontré une erreur inattendue. Vos données restent en sécurité sur cet appareil.',
    errorBoundaryRetry: 'Réessayer',
    scrollToTop: 'Remonter en haut',
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
    cancelPageUnavailable: 'We don\'t have a direct cancellation link for {name}. Please cancel it from the {name} app or website.',
    openCancelPage: 'Open cancellation page',
    selectPlan: 'Choose a plan',
    customPrice: 'Custom price',
    planEffectiveDate: 'Effective from',
    editPlan: 'Change plan',
    subscriptionDetail: 'Subscription details',
    pickMonth: 'Month',
    pickYear: 'Year',
    customPlan: 'Custom',
    currentPlanLabel: 'current',
    privacy:
      'SubTrack keeps everything on your device. No account, no cloud — your subscriptions stay with you.',
    start: 'Get started',
    pro: 'Upgrade to Pro',
    limit: 'Free supports up to 5 subscriptions. Pro unlocks unlimited tracking.',
    totalMonth: 'Due this month',
    diagnosis: 'Subscription check-in',
    language: 'Language',
    vat: 'VAT',
    reminders: 'Reminder',
    export: 'Export CSV',
    version: 'Version',
    vatDe: '19% VAT (DE)',
    vatFr: '20% VAT (FR)',
    vatNone: 'No VAT',
    reminderOff: 'Off',
    reminderDaysBefore: 'days before',
    dataPrivacy: 'Data & privacy',
    proBlurb: 'Unlimited subscriptions, unlimited diagnosis, Analytics, real-time exchange rates, CSV export, data backup, and custom logos.',
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
    back: 'Back',
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
    proTrendHint: 'Track unlimited subscriptions and export your data with Pro.',
    rankPosition: 'Rank',
    monthBreakdownTotal: 'total',
    monthBreakdownEmpty: 'No charges in this month.',
    dayBreakdownEmpty: 'No charge on this day.',
    daysUntilTemplate: 'in {n} days',
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
    currencyChangeFailedTitle: 'Exchange rate unavailable',
    currencyChangeFailedBody: 'Check your internet connection and try again.',
    reminderNotificationTitle: '{name} – payment in {days} days',
    reminderNotificationBody: '{price} will be charged.',
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
      'Payment will be charged to your Apple ID account. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period. You can cancel anytime in App Store settings.',
    paywallLifetimeNote: 'One-time payment. No subscription, no auto-renewal.',
    paywallRecommended: 'Recommended',
    paywallLoading: 'Loading…',
    paywallDurationMonthly: 'Monthly',
    paywallDurationYearly: 'Yearly',
    paywallDurationLifetime: 'Lifetime',
    paywallFeatureBackup: 'Back up and restore your data',
    diagnosisUnlimitedProOnly: 'Unlimited subscription diagnosis checks with Pro',
    customLogoProOnly: 'Set a custom logo/photo for any subscription',
    backupData: 'Back up data',
    restoreData: 'Restore backup',
    resetData: 'Delete all data',
    resetConfirmTitle: 'Delete all data?',
    resetConfirmMessage: 'This removes all tracked subscriptions from this device. This cannot be undone.',
    restoreSuccess: 'Backup restored',
    restoreInvalid: 'This file is not a valid SubTrack backup.',
    trialEndingNotificationTitle: '{name}: free trial ends {date}',
    trialEndingNotificationBody: 'After that it becomes paid ({price}).',
    billingTodayNotificationTitle: '{name} – payment today',
    billingTodayNotificationBody: '{price} is charged today.',
    trialEndsTodayNotificationTitle: '{name}: free trial ends today',
    trialEndsTodayNotificationBody: 'From tomorrow it becomes paid ({price}).',
    trialFollowUpNotificationTitle: 'Did you cancel {name}?',
    trialFollowUpNotificationBody: 'The free trial is over. Open SubTrack to let us know.',
    trialFollowUpTitle: 'Free trial finished',
    trialFollowUpBody: 'The free trial for {name} has ended. Did you cancel it, or are you continuing?',
    trialFollowUpCancelled: 'I cancelled it',
    trialFollowUpContinue: 'I’m continuing',
    trialFollowUpLater: 'Ask me later',
    dueToday: 'Today',
    continuePlanTitle: 'Choose your plan',
    continuePlanBody: 'The free trial for {name} is over. Pick the plan you moved onto.',
    continuePlanSave: 'Update plan',
    share: 'Share',
    shareTitle: 'My subscriptions',
    shareSubtitle: 'Snapshot from SubTrack',
    shareSubsLabel: 'Subscriptions',
    shareCheckupTitle: 'Check-in results',
    shareCta: 'Share my summary',
    shareDiagnosisPrompt: 'Share your results?',
    shareUnavailable: 'Sharing isn’t available on this device.',
    shareGeneratedBy: 'Made with SubTrack',
    rateTitle: 'Enjoying SubTrack?',
    rateBody: 'You’ve added 3 subscriptions. A quick App Store rating helps a lot.',
    rateNow: 'Rate SubTrack',
    rateLater: 'Not now',
    widgetTitle: 'Home Screen widget',
    widgetBody: 'Touch and hold your Home Screen, tap +, then search for SubTrack.',
    widgetDiagLabel: 'Widget data',
    widgetDiagMissing: 'Not available in this build',
    widgetDiagUnreachable: 'Shared storage unreachable',
    widgetDiagEmpty: 'Nothing written yet',
    widgetDiagOk: '{total} · {n} upcoming',
    diagnosisAlreadyDoneTitle: 'Already checked',
    diagnosisAlreadyDoneBody: 'You\'ve already checked all your subscriptions once. Upgrade to Pro to re-check them.',
    diagnosisViewHistory: 'View past results',
    diagnosisHistoryTitle: 'Past results',
    diagnosisCancelButton: 'Cancel this subscription',
    diagnosisCancelled: 'Cancelled',
    diagnosisCancelConfirmTitle: 'Cancel subscription?',
    diagnosisCancelConfirmBody: 'Mark "{name}" as cancelled. You can undo this from its details.',
    diagnosisCancelConfirm: 'Cancel it',
    diagnosisSavingsTitle: 'Savings from cancellations',
    diagnosisSavingsMonthly: 'Per month',
    diagnosisSavingsYearly: 'Per year',
    diagnosisSavingsBreakdown: 'Breakdown',
    diagnosisHistoryCount: '{n} checked',
    diagnosisHistoryLowLabel: 'below 50',
    momVsLastMonth: 'vs last month',
    freeTrial: 'Free trial',
    freeTrialDuration: 'Trial length',
    freeTrialDaysUnit: 'days',
    freeTrialBadge: 'Trial',
    freeTrialEndsLabel: 'Trial ends',
    prevYear: 'Previous year',
    nextYear: 'Next year',
    photoPermissionDenied: 'Photo access was not granted.',
    choosePhoto: 'Choose photo',
    analyticsLockedTitle: 'Unlock Analytics with Pro',
    analyticsLockedBody: 'Category breakdown, spending trends, and rankings with SubTrack Pro.',
    filterAll: 'All',
    fxProOnly: 'Real-time exchange rates are a Pro feature.',
    viewTutorial: 'View tutorial',
    analyticsProOnly: 'Category breakdown, trends, and rankings with Pro',
    notificationsLabel: 'Notifications',
    notificationsOn: 'On',
    notificationsOff: 'Off',
    enableNotificationsBtn: 'Enable',
    openSettingsBtn: 'Open Settings',
    manageSubscription: 'Manage/cancel subscription',
    csvMonthlyEquivalent: 'Monthly equivalent',
    csvStarted: 'Started',
    csvNextBilling: 'Next billing',
    errorBoundaryTitle: 'Something went wrong',
    errorBoundaryBody: 'SubTrack ran into an unexpected error. Your data is safe on this device.',
    errorBoundaryRetry: 'Try again',
    scrollToTop: 'Scroll to top',
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
    cancelPageUnavailable: 'No disponemos de un enlace de cancelación directo para {name}. Cancélalo directamente desde la app o el sitio web de {name}.',
    openCancelPage: 'Abrir cancelación',
    selectPlan: 'Elegir plan',
    customPrice: 'Precio personalizado',
    planEffectiveDate: 'Válido desde',
    editPlan: 'Cambiar plan',
    subscriptionDetail: 'Detalles de la suscripción',
    pickMonth: 'Mes',
    pickYear: 'Año',
    customPlan: 'Personalizado',
    currentPlanLabel: 'actual',
    privacy:
      'SubTrack guarda todo en tu dispositivo. Sin cuenta ni nube: tus suscripciones se quedan contigo.',
    start: 'Empezar',
    pro: 'Pasar a Pro',
    limit: 'La versión gratuita permite hasta 5 suscripciones. Pro desbloquea el seguimiento ilimitado.',
    totalMonth: 'A pagar este mes',
    diagnosis: 'Revisión de suscripciones',
    language: 'Idioma',
    vat: 'IVA',
    reminders: 'Recordatorio',
    export: 'Exportar CSV',
    version: 'Versión',
    vatDe: '19 % IVA (DE)',
    vatFr: '20 % IVA (FR)',
    vatNone: 'Sin IVA',
    reminderOff: 'Desactivado',
    reminderDaysBefore: 'días antes',
    dataPrivacy: 'Datos y privacidad',
    proBlurb: 'Suscripciones ilimitadas, diagnósticos ilimitados, análisis, tipos de cambio en tiempo real, exportación CSV, copia de seguridad y logos personalizados.',
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
    back: 'Atrás',
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
    proTrendHint: 'Sigue suscripciones ilimitadas y exporta tus datos con Pro.',
    rankPosition: 'Puesto',
    monthBreakdownTotal: 'total',
    monthBreakdownEmpty: 'No hay cobros este mes.',
    dayBreakdownEmpty: 'No hay cobro ese día.',
    daysUntilTemplate: 'en {n} días',
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
    currencyChangeFailedTitle: 'Tipo de cambio no disponible',
    currencyChangeFailedBody: 'Comprueba tu conexión a internet e inténtalo de nuevo.',
    reminderNotificationTitle: '{name}: pago en {days} días',
    reminderNotificationBody: 'Se cobrará {price}.',
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
      'El pago se cargará a tu cuenta de Apple ID. La suscripción se renueva automáticamente a menos que se cancele al menos 24 horas antes del final del período actual. Puedes cancelar en cualquier momento desde los ajustes de la App Store.',
    paywallLifetimeNote: 'Pago único. Sin suscripción, sin renovación automática.',
    paywallRecommended: 'Recomendado',
    paywallLoading: 'Cargando…',
    paywallDurationMonthly: 'Mensual',
    paywallDurationYearly: 'Anual',
    paywallDurationLifetime: 'De por vida',
    paywallFeatureBackup: 'Haz copia de seguridad y restaura tus datos',
    diagnosisUnlimitedProOnly: 'Diagnósticos de suscripción ilimitados con Pro',
    customLogoProOnly: 'Configura un logo/foto personalizado para cualquier suscripción',
    backupData: 'Copia de seguridad',
    restoreData: 'Restaurar copia de seguridad',
    resetData: 'Eliminar todos los datos',
    resetConfirmTitle: '¿Eliminar todos los datos?',
    resetConfirmMessage: 'Esto elimina todas las suscripciones registradas en este dispositivo. No se puede deshacer.',
    restoreSuccess: 'Copia de seguridad restaurada',
    restoreInvalid: 'Este archivo no es una copia de seguridad válida de SubTrack.',
    trialEndingNotificationTitle: '{name}: la prueba gratuita termina el {date}',
    trialEndingNotificationBody: 'Después pasará a ser de pago ({price}).',
    billingTodayNotificationTitle: '{name}: pago hoy',
    billingTodayNotificationBody: 'Hoy se cobra {price}.',
    trialEndsTodayNotificationTitle: '{name}: la prueba gratuita termina hoy',
    trialEndsTodayNotificationBody: 'Desde mañana pasa a ser de pago ({price}).',
    trialFollowUpNotificationTitle: '¿Cancelaste {name}?',
    trialFollowUpNotificationBody: 'La prueba gratuita ha terminado. Abre SubTrack para decírnoslo.',
    trialFollowUpTitle: 'Prueba gratuita finalizada',
    trialFollowUpBody: 'La prueba gratuita de {name} ha terminado. ¿La cancelaste o vas a continuar?',
    trialFollowUpCancelled: 'La cancelé',
    trialFollowUpContinue: 'Voy a continuar',
    trialFollowUpLater: 'Preguntar más tarde',
    dueToday: 'Hoy',
    continuePlanTitle: 'Elige tu plan',
    continuePlanBody: 'La prueba gratuita de {name} ha terminado. Elige el plan que pagas ahora.',
    continuePlanSave: 'Actualizar plan',
    share: 'Compartir',
    shareTitle: 'Mis suscripciones',
    shareSubtitle: 'Resumen de SubTrack',
    shareSubsLabel: 'Suscripciones',
    shareCheckupTitle: 'Resultados del chequeo',
    shareCta: 'Compartir mi resumen',
    shareDiagnosisPrompt: '¿Compartir tus resultados?',
    shareUnavailable: 'Compartir no está disponible en este dispositivo.',
    shareGeneratedBy: 'Hecho con SubTrack',
    rateTitle: '¿Te gusta SubTrack?',
    rateBody: 'Ya has añadido 3 suscripciones. Una valoración en la App Store nos ayuda mucho.',
    rateNow: 'Valorar SubTrack',
    rateLater: 'Ahora no',
    widgetTitle: 'Widget en la pantalla de inicio',
    widgetBody: 'Mantén pulsada la pantalla de inicio, toca + y busca SubTrack.',
    widgetDiagLabel: 'Datos del widget',
    widgetDiagMissing: 'No disponible en esta versión',
    widgetDiagUnreachable: 'Almacenamiento compartido inaccesible',
    widgetDiagEmpty: 'Aún no se ha escrito nada',
    widgetDiagOk: '{total} · {n} próximos',
    diagnosisAlreadyDoneTitle: 'Ya revisado',
    diagnosisAlreadyDoneBody: 'Ya revisaste todas tus suscripciones una vez. Pásate a Pro para volver a revisarlas.',
    diagnosisViewHistory: 'Ver resultados anteriores',
    diagnosisHistoryTitle: 'Resultados anteriores',
    diagnosisCancelButton: 'Cancelar esta suscripción',
    diagnosisCancelled: 'Cancelada',
    diagnosisCancelConfirmTitle: '¿Cancelar suscripción?',
    diagnosisCancelConfirmBody: 'Marca "{name}" como cancelada. Puedes deshacerlo desde sus detalles.',
    diagnosisCancelConfirm: 'Cancelar',
    diagnosisSavingsTitle: 'Ahorro por cancelaciones',
    diagnosisSavingsMonthly: 'Al mes',
    diagnosisSavingsYearly: 'Al año',
    diagnosisSavingsBreakdown: 'Desglose',
    diagnosisHistoryCount: '{n} revisada(s)',
    diagnosisHistoryLowLabel: 'bajo 50',
    momVsLastMonth: 'vs mes pasado',
    freeTrial: 'Prueba gratuita',
    freeTrialDuration: 'Duración de la prueba',
    freeTrialDaysUnit: 'días',
    freeTrialBadge: 'Prueba',
    freeTrialEndsLabel: 'La prueba termina',
    prevYear: 'Año anterior',
    nextYear: 'Año siguiente',
    photoPermissionDenied: 'No se concedió acceso a las fotos.',
    choosePhoto: 'Elegir foto',
    analyticsLockedTitle: 'Desbloquea el análisis con Pro',
    analyticsLockedBody: 'Desglose por categorías, evolución del gasto y ranking con SubTrack Pro.',
    filterAll: 'Todas',
    fxProOnly: 'Los tipos de cambio en tiempo real son parte de Pro.',
    viewTutorial: 'Ver introducción',
    analyticsProOnly: 'Categorías, tendencias y ranking con Pro',
    notificationsLabel: 'Notificaciones',
    notificationsOn: 'Activadas',
    notificationsOff: 'Desactivadas',
    enableNotificationsBtn: 'Activar',
    openSettingsBtn: 'Abrir ajustes',
    manageSubscription: 'Gestionar/cancelar suscripción',
    csvMonthlyEquivalent: 'Equivalente mensual',
    csvStarted: 'Inicio',
    csvNextBilling: 'Próximo cobro',
    errorBoundaryTitle: 'Algo salió mal',
    errorBoundaryBody: 'SubTrack encontró un error inesperado. Tus datos están a salvo en este dispositivo.',
    errorBoundaryRetry: 'Intentar de nuevo',
    scrollToTop: 'Desplazarse arriba',
  },
};

export function localeForLanguage(lang: Language): string {
  if (lang === 'de') return 'de-DE';
  if (lang === 'fr') return 'fr-FR';
  if (lang === 'es') return 'es-ES';
  return 'en-GB';
}

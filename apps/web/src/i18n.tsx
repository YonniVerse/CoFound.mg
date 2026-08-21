/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Language = 'fr' | 'mg'

const messages = {
  fr: {
    'language.label': 'Langue',
    'language.fr': 'Français',
    'language.mg': 'Malagasy',
    'signup.backHome': "Retour à l'accueil",
    'signup.title': 'Créer un compte',
    'signup.alreadyFounder': 'Déjà fondateur sur la plateforme ?',
    'signup.signIn': 'Se connecter',
    'signup.firstName': 'Prénom',
    'signup.lastName': 'Nom',
    'signup.email': 'Email universitaire',
    'signup.emailHint': "Utilisez votre email d'école pour la vérification rapide.",
    'signup.school': 'École ou Université',
    'signup.schoolPlaceholder': 'Sélectionnez votre établissement',
    'signup.field': "Filière / Domaine d'études",
    'signup.fieldPlaceholder': 'ex: Informatique, Gestion, Design...',
    'signup.password': 'Mot de passe',
    'signup.confirmPassword': 'Confirmer le mot de passe',
    'signup.termsStart': "J'accepte les",
    'signup.terms': "Conditions d'utilisation",
    'signup.and': 'et la',
    'signup.privacy': 'Politique de confidentialité',
    'signup.submit': 'Créer mon compte fondateur',
    'signup.loading': 'Création en cours...',
    'signup.passwordMismatch': 'Les mots de passe ne correspondent pas.',
    'signup.acceptTerms': 'Vous devez accepter les CGU.',
    'signup.heroTitle': "L'aventure commence avec la bonne équipe.",
    'signup.heroBody': "Rejoignez l'élite entrepreneuriale étudiante de Madagascar. Trouvez les compétences qui vous manquent.",
    'signup.exampleFirstName': 'Hery',
    'signup.exampleLastName': 'Rakoto',
    'signup.exampleEmail': 'hery.rakoto@ecole.mg',
    'signup.schoolOther': 'Autre',
    'signup.schoolPolytechnique': 'École Polytechnique de Madagascar',
    'signup.schoolIscam': 'ISCAM',
    'signup.schoolInscae': 'INSCAE',
    'signup.schoolIag': 'IAG',
    'signup.schoolMedicine': 'Faculté de Médecine',
    'signup.schoolMisa': 'MISA',
    'signup.schoolIst': 'IST',
    /* ── Recherche (M-01 / UI-15) ── */
    'search.title': 'Recherche',
    'search.subtitle': 'Trouvez des projets, des compétences ou des opportunités',
    'search.placeholder': 'Rechercher un projet, une compétence, une opportunité…',
    'search.tab.all': 'Tous les résultats',
    'search.tab.projects': 'Projets',
    'search.tab.talents': 'Talents',
    'search.tab.opportunities': 'Opportunités',
    'search.suggestions.title': 'Recherches populaires',
    'search.suggestions.skills': 'Compétences recherchées',
    'search.suggestions.sectors': 'Secteurs dynamiques',
    'search.empty.noResults': 'Aucun résultat trouvé pour « {query} »',
    'search.empty.tryAgain': 'Essayez avec d’autres mots-clés ou modifiez votre filtre.',
    'search.empty.reset': 'Effacer la recherche',
    'search.loading': 'Recherche en cours…',
    'search.error': 'Impossible d’effectuer la recherche. Vérifiez votre connexion.',
  },
  mg: {
    'language.label': 'Fiteny',
    'language.fr': 'Français',
    'language.mg': 'Malagasy',
    'signup.backHome': 'Hiverina any amin’ny fandraisana',
    'signup.title': 'Mamorona kaonty',
    'signup.alreadyFounder': 'Efa mpanorina eto amin’ny sehatra ?',
    'signup.signIn': 'Hiditra',
    'signup.firstName': 'Anarana',
    'signup.lastName': 'Fanampin’anarana',
    'signup.email': 'Mailaka an’ny oniversite',
    'signup.emailHint': 'Ampiasao ny mailaka an-tsekolinao ho an’ny fanamarinana haingana.',
    'signup.school': 'Sekoly na Oniversite',
    'signup.schoolPlaceholder': 'Fidio ny sekolinao',
    'signup.field': 'Sampam-pianarana / Sehatra',
    'signup.fieldPlaceholder': 'oh: Informatika, Fitantanana, Famolavolana...',
    'signup.password': 'Teny miafina',
    'signup.confirmPassword': 'Hamafiso ny teny miafina',
    'signup.termsStart': 'Manaiky ny',
    'signup.terms': 'Fepetra fampiasana',
    'signup.and': 'sy ny',
    'signup.privacy': 'Politikan’ny tsiambaratelo',
    'signup.submit': 'Mamorona kaontin’ny mpanorina',
    'signup.loading': 'Eo am-pamoronana...',
    'signup.passwordMismatch': 'Tsy mitovy ny teny miafina.',
    'signup.acceptTerms': 'Tsy maintsy manaiky ny fepetra ianao.',
    'signup.heroTitle': 'Manomboka amin’ny ekipa mety ny dia.',
    'signup.heroBody': 'Midira ao amin’ny vondron’ireo mpianatra mpanorina eto Madagasikara. Tadiavo ireo fahaiza-manao ilainao.',
    'signup.exampleFirstName': 'Hery',
    'signup.exampleLastName': 'Rakoto',
    'signup.exampleEmail': 'hery.rakoto@sekoly.mg',
    'signup.schoolOther': 'Hafa',
    'signup.schoolPolytechnique': 'École Polytechnique de Madagascar',
    'signup.schoolIscam': 'ISCAM',
    'signup.schoolInscae': 'INSCAE',
    'signup.schoolIag': 'IAG',
    'signup.schoolMedicine': 'Faculté de Médecine',
    'signup.schoolMisa': 'MISA',
    'signup.schoolIst': 'IST',

    /* ── Auth (E-11) ── */
    'auth.login.title': 'Fidirana',
    'auth.login.subtitle': 'Midira ao amin’ny sehatrao mba hanorina',
    'auth.login.email': 'Adiresy mailaka',
    'auth.login.emailPlaceholder': 'hery.rakoto@sekoly.mg',
    'auth.login.password': 'Teny miafina',
    'auth.login.passwordPlaceholder': '••••••••••••',
    'auth.login.submit': 'Hiditra',
    'auth.login.loading': 'Fidirana…',
    'auth.login.forgotPassword': 'Teny miafina hadino ?',
    'auth.login.noAccount': 'Tsy mbola manana kaonty ?',
    'auth.login.noAccountHint': 'Ny sekolinao no handefa fanasana anao.',
    'auth.login.error.invalidCredentials': 'Mailaka na teny miafina tsy mety.',
    'auth.login.error.accountFrozen': 'Voasakana vonjimaika ny kaontinao.',
    'auth.login.error.accountDisabled': 'Voasakana ny kaontinao.',
    'auth.login.error.generic': 'Nisy olana nitranga. Andramo indray.',

    'auth.forgotPassword.title': 'Teny miafina hadino',
    'auth.forgotPassword.subtitle': 'Ampidiro ny adiresy mailaka mba hahazoana rohy famerenana.',
    'auth.forgotPassword.email': 'Adiresy mailaka',
    'auth.forgotPassword.emailPlaceholder': 'hery.rakoto@sekoly.mg',
    'auth.forgotPassword.submit': 'Handefa ny rohy',
    'auth.forgotPassword.loading': 'Fandefasana…',
    'auth.forgotPassword.success': 'Raha misy io adiresy io, mailaka famerenana no nalefa.',
    'auth.forgotPassword.backToLogin': 'Hiverina amin’ny fidirana',

    'auth.resetPassword.title': 'Teny miafina vaovao',
    'auth.resetPassword.subtitle': 'Misafidiana teny miafina vaovao azo antoka.',
    'auth.resetPassword.password': 'Teny miafina vaovao',
    'auth.resetPassword.passwordPlaceholder': '12 soratra farafahakeliny',
    'auth.resetPassword.confirm': 'Hamafiso ny teny miafina',
    'auth.resetPassword.confirmPlaceholder': 'Avereno soratana ny teny miafina',
    'auth.resetPassword.submit': 'Hanova ny teny miafina',
    'auth.resetPassword.loading': 'Fanovana…',
    'auth.resetPassword.success': 'Voaova ny teny miafina. Afaka miditra ianao izao.',
    'auth.resetPassword.error.mismatch': 'Tsy mitovy ny teny miafina.',
    'auth.resetPassword.error.tooShort': 'Tsy maintsy misy soratra 12 farafahakeliny ny teny miafina.',
    'auth.resetPassword.error.invalidToken': 'Io rohy io dia lany daty na tsy manan-kery.',
    'auth.resetPassword.backToLogin': 'Hiverina amin’ny fidirana',

    'auth.logout': 'Hivoaka',
    'auth.backHome': 'Hiverina any amin’ny fandraisana',

    /* ── Commun ── */
    'common.or': 'na',
    'common.loading': 'Eo am-pidirana…',
    'common.error': 'Nisy olana nitranga.',

    /* ── Recherche (M-01 / UI-15) ── */
    'search.title': 'Fikarohana',
    'search.subtitle': 'Tadiavo ireo tetikasa, fahaiza-manao na fahafahana',
    'search.placeholder': 'Tadiavo ny tetikasa, fahaiza-manao...',
    'search.tab.all': 'Valiny rehetra',
    'search.tab.projects': 'Tetikasa',
    'search.tab.talents': 'Mpanorina',
    'search.tab.opportunities': 'Fahafahana',
    'search.suggestions.title': 'Fikarohana matetika',
    'search.suggestions.skills': 'Fahaiza-manao ilaina',
    'search.suggestions.sectors': 'Sehatra mavitrika',
    'search.empty.noResults': 'Tsy nisy valiny ho an’ny « {query} »',
    'search.empty.tryAgain': 'Andramo amin’ny teny hafa na ovay ny sivana.',
    'search.empty.reset': 'Fafao ny fikarohana',
    'search.loading': 'Eo am-pikarohana…',
    'search.error': 'Tsy afaka nanao fikarohana. Jereo ny fifandraisana.',
  },
} as const

type TranslationKey = keyof typeof messages.fr

type I18nContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = window.localStorage.getItem('cofound-language')
    return stored === 'mg' ? 'mg' : 'fr'
  })

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage)
    window.localStorage.setItem('cofound-language', nextLanguage)
  }

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo<I18nContextValue>(
    () => ({ language, setLanguage, t: (key) => messages[language][key] }),
    [language],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n doit être utilisé dans I18nProvider.')
  return context
}

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n()
  return (
    <label className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
      <span className="sr-only">{t('language.label')}</span>
      <select
        aria-label={t('language.label')}
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className="rounded-md border border-border bg-background px-2 py-1"
      >
        <option value="fr">{t('language.fr')}</option>
        <option value="mg">{t('language.mg')}</option>
      </select>
    </label>
  )
}

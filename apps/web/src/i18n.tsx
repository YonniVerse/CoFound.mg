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

    /* ── Activation (E-10) ── */
    'auth.activation.title': 'Activer votre compte',
    'auth.activation.subtitle': 'Définissez votre mot de passe pour finaliser l’activation de votre compte sur invitation.',
    'auth.activation.password': 'Nouveau mot de passe',
    'auth.activation.passwordPlaceholder': 'Au moins 12 caractères (majuscules, chiffres/symboles)',
    'auth.activation.confirmPassword': 'Confirmer le mot de passe',
    'auth.activation.confirmPasswordPlaceholder': 'Répétez votre mot de passe',
    'auth.activation.acceptTerms': "J'accepte les conditions d'utilisation et la politique de confidentialité.",
    'auth.activation.submit': 'Activer mon compte',
    'auth.activation.loading': 'Activation en cours...',
    'auth.activation.error.invalidToken': 'Ce lien d’activation est invalide ou a expiré. Veuillez contacter votre établissement.',
    'auth.activation.error.passwordLength': 'Le mot de passe doit contenir au moins 12 caractères.',
    'auth.activation.error.passwordMismatch': 'Les deux mots de passe ne correspondent pas.',
    'auth.activation.error.acceptTerms': 'Vous devez accepter les conditions d’utilisation pour continuer.',
    'auth.activation.error.generic': 'Une erreur est survenue lors de l’activation. Veuillez réessayer.',
    'auth.activation.successTitle': 'Compte activé avec succès !',
    'auth.activation.successSubtitle': 'Vous allez être redirigé vers l’étape d’onboarding...',
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

    /* ── Activation (E-10) ── */
    'auth.activation.title': 'Hampandeha ny kaontinao',
    'auth.activation.subtitle': 'Safidio ny teny miafinao mba hamaranana ny fampandehanana ny kaontinao.',
    'auth.activation.password': 'Teny miafina vaovao',
    'auth.activation.passwordPlaceholder': 'Kely indrindra 12 stafa (sorabaventy, isa/marika)',
    'auth.activation.confirmPassword': 'Hamafiso ny teny miafina',
    'auth.activation.confirmPasswordPlaceholder': 'Ataovy indray ny teny miafinao',
    'auth.activation.acceptTerms': 'Manaiky ny fepetra fampiasana sy ny politikan’ny tsiambaratelo aho.',
    'auth.activation.submit': 'Hampandeha ny kaontiko',
    'auth.activation.loading': 'Eo am-pampandehanana...',
    'auth.activation.error.invalidToken': 'Tsy manan-kery na efa lany daty ity rohy ity. Mifandraisa amin’ny sekolinao.',
    'auth.activation.error.passwordLength': 'Tsy maintsy misy stafa 12 kely indrindra ny teny miafina.',
    'auth.activation.error.passwordMismatch': 'Tsy mitovy ny teny miafina roa.',
    'auth.activation.error.acceptTerms': 'Tsy maintsy manaiky ny fepetra ianao mba hitohizana.',
    'auth.activation.error.generic': 'Nisy fahadisoana nitranga. Mba andramo indray.',
    'auth.activation.successTitle': 'Lasa mampandeha soa aman-tsara ny kaontinao !',
    'auth.activation.successSubtitle': 'Hazo mivantana mankany amin’ny dingana famoronana ianao...',

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

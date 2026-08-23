/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

export type Language = "fr" | "mg";

const messages = {
    fr: {
        "language.label": "Langue",
        "language.fr": "Français",
        "language.mg": "Malagasy",
        "signup.backHome": "Retour à l'accueil",
        "signup.title": "Créer un compte",
        "signup.alreadyFounder": "Déjà fondateur sur la plateforme ?",
        "signup.signIn": "Se connecter",
        "signup.firstName": "Prénom",
        "signup.lastName": "Nom",
        "signup.email": "Email universitaire",
        "signup.emailHint":
            "Utilisez votre email d'école pour la vérification rapide.",
        "signup.school": "École ou Université",
        "signup.schoolPlaceholder": "Sélectionnez votre établissement",
        "signup.field": "Filière / Domaine d'études",
        "signup.fieldPlaceholder": "ex: Informatique, Gestion, Design...",
        "signup.password": "Mot de passe",
        "signup.confirmPassword": "Confirmer le mot de passe",
        "signup.termsStart": "J'accepte les",
        "signup.terms": "Conditions d'utilisation",
        "signup.and": "et la",
        "signup.privacy": "Politique de confidentialité",
        "signup.submit": "Créer mon compte fondateur",
        "signup.loading": "Création en cours...",
        "signup.passwordMismatch": "Les mots de passe ne correspondent pas.",
        "signup.acceptTerms": "Vous devez accepter les CGU.",
        "signup.heroTitle": "L'aventure commence avec la bonne équipe.",
        "signup.heroBody":
            "Rejoignez l'élite entrepreneuriale étudiante de Madagascar. Trouvez les compétences qui vous manquent.",
        "signup.exampleFirstName": "Hery",
        "signup.exampleLastName": "Rakoto",
        "signup.exampleEmail": "hery.rakoto@ecole.mg",
        "signup.schoolOther": "Autre",
        "signup.schoolPolytechnique": "École Polytechnique de Madagascar",
        "signup.schoolIscam": "ISCAM",
        "signup.schoolInscae": "INSCAE",
        "signup.schoolIag": "IAG",
        "signup.schoolMedicine": "Faculté de Médecine",
        "signup.schoolMisa": "MISA",
        "signup.schoolIst": "IST",

        /* ── Auth (E-11 & Redesign) ── */
        "auth.login.title": "Content de vous revoir",
        "auth.login.subtitle":
            "Accédez à votre espace cofondateur pour suivre vos projets et connexions.",
        "auth.login.email": "Adresse email",
        "auth.login.emailPlaceholder": "votre.email@domaine.mg",
        "auth.login.password": "Mot de passe",
        "auth.login.passwordPlaceholder": "••••••••••••",
        "auth.login.showPassword": "Afficher le mot de passe",
        "auth.login.hidePassword": "Masquer le mot de passe",
        "auth.login.submit": "Se connecter",
        "auth.login.loading": "Connexion en cours…",
        "auth.login.forgotPassword": "Mot de passe oublié ?",
        "auth.login.noAccount": "Accès sur invitation",
        "auth.login.noAccountHint":
            "Les accès sont distribués par invitation des établissements et programmes partenaires.",
        "auth.login.hero.eyebrow": "COFONDATEURS · PROJETS · IMPACT",
        "auth.login.hero.title": "Les bonnes idées trouvent leur équipe.",
        "auth.login.hero.body":
            "Un espace clair pour créer, rejoindre et faire avancer les projets qui comptent.",
        "auth.login.hero.statProjects": "Projets actifs",
        "auth.login.hero.statTalents": "Talents connectés",
        "auth.login.hero.statImpact": "Impact paritaire",
        "auth.login.hero.brand": "CoFound.mg · Madagascar",
        "auth.login.hero.tagline": "Un espace pour avancer.",
        "auth.login.hero.cardProjectLabel": "Projet en mouvement",
        "auth.login.hero.cardProjectBadge": "Équipe ouverte",
        "auth.login.hero.cardProjectTitle": "Formez une équipe qui avance.",
        "auth.login.hero.cardProjectMeta": "BMC · rôles · compétences",
        "auth.login.hero.cardProjectSkillOne": "Produit",
        "auth.login.hero.cardProjectSkillTwo": "Tech",
        "auth.login.hero.cardProjectSkillThree": "Business",
        "auth.login.hero.cardMatchLabel": "Complémentarité",
        "auth.login.hero.cardMatchTitle": "Des profils qui se répondent",
        "auth.login.hero.cardMatchMeta": "Talents · projets · filières",
        "auth.login.hero.cardImpactLabel": "Impact collectif",
        "auth.login.hero.cardImpactTitle": "50/50 en mouvement",
        "auth.login.hero.cardImpactMeta": "Chaque parcours compte",
        "auth.login.hero.cardTrustLabel": "Cadre de confiance",
        "auth.login.hero.cardTrustTitle": "Pseudonymat & choix",
        "auth.login.hero.cardTrustMeta": "Une rencontre à votre rythme",
        "auth.login.hero.cardExploreLabel": "Explorer",
        "auth.login.hero.cardExploreTitle": "Des idées à construire",
        "auth.login.hero.cardExploreMeta": "Projets · besoins · opportunités",
        "auth.login.hero.cardCommunityLabel": "Communauté",
        "auth.login.hero.cardCommunityTitle": "Avancer ensemble",
        "auth.login.hero.cardCommunityMeta": "Talents · cofondateurs · impact",
        "auth.login.error.invalidCredentials":
            "Identifiants incorrects. Vérifiez votre email et mot de passe.",
        "auth.login.error.accountFrozen":
            "Votre compte est temporairement gelé. Contactez votre référent d’établissement.",
        "auth.login.error.accountDisabled":
            "Ce compte a été désactivé. Veuillez contacter le support.",
        "auth.login.error.generic":
            "Un problème de connexion est survenu. Veuillez rééayer.",

        "auth.forgotPassword.title": "Récupération de compte",
        "auth.forgotPassword.subtitle":
            "Saisissez votre email universitaire. Nous vous enverrons les instructions pour réinitialiser votre mot de passe.",
        "auth.forgotPassword.email": "Adresse email universitaire",
        "auth.forgotPassword.emailPlaceholder": "nom@etablissement.mg",
        "auth.forgotPassword.submit": "Envoyer le lien de réinitialisation",
        "auth.forgotPassword.loading": "Envoi en cours…",
        "auth.forgotPassword.successTitle": "Vérifiez vos emails",
        "auth.forgotPassword.success":
            "Si cette adresse correspond à un compte actif, un lien de réinitialisation vous a été envoyé. Pensez à vérifier vos indésirables.",
        "auth.forgotPassword.backToLogin": "Retour à la connexion",

        "auth.resetPassword.title": "Définir un nouveau mot de passe",
        "auth.resetPassword.subtitle":
            "Choisissez un mot de passe robuste pour sécuriser votre espace cofondateur.",
        "auth.resetPassword.password": "Nouveau mot de passe",
        "auth.resetPassword.passwordPlaceholder": "12 caractères minimum",
        "auth.resetPassword.confirm": "Confirmation du mot de passe",
        "auth.resetPassword.confirmPlaceholder":
            "Retapez votre nouveau mot de passe",
        "auth.resetPassword.submit": "Enregistrer le nouveau mot de passe",
        "auth.resetPassword.loading": "Enregistrement…",
        "auth.resetPassword.successTitle": "Mot de passe mis à jour !",
        "auth.resetPassword.success":
            "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.",
        "auth.resetPassword.error.mismatch":
            "Les deux mots de passe ne sont pas identiques.",
        "auth.resetPassword.error.tooShort":
            "Le mot de passe doit comporter au moins 12 caractères.",
        "auth.resetPassword.error.invalidToken":
            "Ce lien de réinitialisation est expiré ou invalide. Veuillez effectuer une nouvelle demande.",
        "auth.resetPassword.backToLogin": "Se connecter maintenant",

        "auth.strength.weak": "Très faible",
        "auth.strength.fair": "Moyen",
        "auth.strength.good": "Bon",
        "auth.strength.strong": "Robust",
        "auth.strength.ruleLength": "Au moins 12 caractères",
        "auth.strength.ruleMix": "Majuscule, chiffre ou symbole",
        "auth.strength.ruleMatch": "Mots de passe identiques",

        "auth.logout": "Déconnexion",
        "auth.backHome": "Accueil CoFound.mg",

        /* ── Commun ── */
        "common.or": "ou",
        "common.loading": "Chargement…",
        "common.error": "Une erreur est survenue.",

        /* ── Recherche (M-01 / UI-15) ── */
        /* ── Activation (E-10) ── */
        "auth.activation.title": "Activer votre compte",
        "auth.activation.subtitle":
            "Définissez votre mot de passe pour finaliser l’activation de votre compte sur invitation.",
        "auth.activation.password": "Nouveau mot de passe",
        "auth.activation.passwordPlaceholder":
            "Au moins 12 caractères (majuscules, chiffres/symboles)",
        "auth.activation.confirmPassword": "Confirmer le mot de passe",
        "auth.activation.confirmPasswordPlaceholder":
            "Répétez votre mot de passe",
        "auth.activation.acceptTerms":
            "J'accepte les conditions d'utilisation et la politique de confidentialité.",
        "auth.activation.submit": "Activer mon compte",
        "auth.activation.loading": "Activation en cours...",
        "auth.activation.error.invalidToken":
            "Ce lien d’activation est invalide ou a expiré. Veuillez contacter votre établissement.",
        "auth.activation.error.passwordLength":
            "Le mot de passe doit contenir au moins 12 caractères.",
        "auth.activation.error.passwordMismatch":
            "Les deux mots de passe ne correspondent pas.",
        "auth.activation.error.acceptTerms":
            "Vous devez accepter les conditions d’utilisation pour continuer.",
        "auth.activation.error.generic":
            "Une erreur est survenue lors de l’activation. Veuillez réessayer.",
        "auth.activation.successTitle": "Compte activé avec succès !",
        "auth.activation.successSubtitle":
            "Vous allez être redirigé vers l’étape d’onboarding...",
        "settings.eyebrow": "ESPACE PERSONNEL",
        "settings.title": "Paramètres",
        "settings.subtitle":
            "Gère tes préférences et tes consentements en toute transparence.",
        "settings.privacy.title": "Confidentialité et consentements",
        "settings.privacy.description":
            "Tu peux retirer un consentement à tout moment. Le retrait conserve une trace de la décision.",
        "settings.loading": "Chargement…",
        "settings.error":
            "Impossible de charger ou d’enregistrer tes préférences.",
        "settings.version": "Version",
        "settings.notGranted": "Non accordé",
        "settings.consent.profile": "Visibilité du profil",
        "settings.consent.matching": "Suggestions de collaboration",
        "settings.consent.contact": "Contact par les partenaires",
        "settings.consent.analytics": "Analyses agrégées",
        "settings.consent.withdrawConfirm":
            "Retirer ce consentement ? Cette action peut désactiver la fonctionnalité associée.",
        "settings.privacy.withdrawExplanation":
            "Le retrait s’applique aux usages futurs. L’historique légal du consentement est conservé.",
        "settings.backProfile": "Retour à mon profil",
        "legal.navigation": "Documents légaux",
        "legal.terms": "CGU",
        "legal.privacy": "Confidentialité",
        "settings.export.title": "Exporter mes données personnelles",
        "settings.export.description":
            "Demandez une copie portable de vos données. Vous recevrez un lien sécurisé lorsqu’elle sera prête.",
        "settings.export.pending": "Demande en cours…",
        "settings.export.request": "Demander un export",
        "settings.export.status": "État de la demande",
        "account.status.eyebrow": "STATUT DU COMPTE",
        "account.status.loading": "Chargement du statut…",
        "account.status.error": "Impossible de charger le statut du compte.",
        "account.status.active.title": "Votre compte est actif",
        "account.status.active.description":
            "Vous pouvez utiliser les fonctionnalités disponibles dans votre espace.",
        "account.status.frozen.title": "Votre compte est temporairement gelé",
        "account.status.frozen.description":
            "L’accès aux autres fonctionnalités est suspendu pendant cette période. Le motif et la durée sont communiqués par votre référent.",
        "account.status.frozen.appeal":
            "Si vous pensez qu’il s’agit d’une erreur, vous pouvez demander un réexamen.",
        "account.status.frozen.appealAction": "Contacter le support",
        "account.status.leaving.title": "Votre compte est sortant",
        "account.status.leaving.description":
            "Vos projets restent accessibles. Le Feed Talents et Dream Match ne sont plus disponibles.",
        "account.status.alumni.title": "Votre compte est alumni",
        "account.status.alumni.description":
            "Vous pouvez consulter vos projets existants, mais vous ne pouvez plus déposer de candidature.",
        "account.status.endsAt": "Fin prévue",
        "account.status.continue": "Continuer vers mon espace",
        "profile.completionReminder.message":
            "Ton profil est complété à {completion} %. Termine-le pour améliorer ta visibilité.",
        "profile.completionReminder.action": "Continuer",
        "profile.fields.pseudonym": "Pseudonyme",
        "profile.fields.headline": "Présentation courte",
        "profile.fields.bio": "Biographie",
        "profile.fields.field": "Domaine d’études",
        "profile.fields.cohortYear": "Année de promotion",
        "profile.fields.availability": "Disponibilité",
        "profile.fields.goals": "Objectifs",
        "profile.fields.sectors": "Secteurs",
        "search.title": "Recherche",
        "search.subtitle":
            "Trouvez des projets, des compétences ou des opportunités",
        "search.placeholder":
            "Rechercher un projet, une compétence, une opportunité…",
        "search.tab.all": "Tous les résultats",
        "search.tab.projects": "Projets",
        "search.tab.talents": "Talents",
        "search.tab.opportunities": "Opportunités",
        "search.suggestions.title": "Recherches populaires",
        "search.suggestions.skills": "Compétences recherchées",
        "search.suggestions.sectors": "Secteurs dynamiques",
        "search.empty.noResults": "Aucun résultat trouvé pour « {query} »",
        "search.empty.tryAgain":
            "Essayez avec d’autres mots-clés ou modifiez votre filtre.",
        "search.empty.reset": "Effacer la recherche",
        "search.loading": "Recherche en cours…",
        "search.error":
            "Impossible d’effectuer la recherche. Vérifiez votre connexion.",
        "common.retry": "Réessayer la connexion",
        "common.errorCode": "Code d'erreur : {code}",
        "common.profile": "Profil",
        "common.contact": "Contacter",
        "common.femaleProfile": "Profil féminin",
        "common.seeking": "Cherche",
        "common.cohort": "Promo",
        "common.completed": "complété",
        "common.bioMissing": "Biographie non renseignée.",
        "common.availability": "Dispo",
        "common.close": "Fermer",
        "nav.exploreProfiles": "Explorer les profils",
        "nav.method": "La Méthode",
        "nav.impact": "Impact 50/50",
        "nav.login": "Se connecter",
        "nav.join": "Rejoindre l'écosystème",
        "nav.openMenu": "Ouvrir le menu",
        "nav.closeMenu": "Fermer le menu",
        "nav.mobileNavigation": "Navigation mobile",
        "common.cancel": "Annuler",
        "application.title": "Candidater au projet",
        "application.positionOptional": "Poste recherché (optionnel)",
        "application.motivationLabel": "Message de motivation",
        "application.motivationPlaceholder":
            "Présentez brièvement vos compétences, votre expérience et la valeur ajoutée que vous souhaitez apporter à ce projet…",
        "application.characterCount": "caractères (min 10)",
        "application.messageTooShort":
            "Votre message doit contenir au moins 10 caractères.",
        "application.submitError": "Une erreur est survenue lors de l'envoi.",
        "application.submitting": "Envoi…",
        "application.submit": "Envoyer ma candidature",
        "applications.title": "Mes candidatures",
        "applications.subtitle":
            "Suivez l’état de vos candidatures auprès des porteurs de projet CoFound.mg.",
        "applications.all": "Toutes",
        "applications.pending": "En attente",
        "applications.accepted": "Acceptée",
        "applications.rejected": "Refusée",
        "applications.withdrawn": "Retirée",
        "applications.targetPosition": "Poste visé",
        "applications.messageLabel": "Votre message de candidature",
        "applications.rejectionReason": "Motif du refus",
        "applications.appliedOn": "Candidaté le",
        "common.back": "Retour",
        "health.accessDenied": "Accès réservé à OPS_ADMIN ou SUPER_ADMIN.",
        "health.staffConsole": "Console staff",
        "health.title": "Santé produit",
        "health.description":
            "Agrégats plateforme uniquement. Les séries temporelles et cohortes sont réservées à une version ultérieure.",
        "health.projectsByStatus": "Projets par état",
        "health.privacyThreshold": "Seuil de confidentialité appliqué :",
        "health.observations": "observations",
        "projectsPosts.eyebrow": "Feed projet",
        "projectsPosts.title": "Publications du projet",
        "projectsPosts.subtitle":
            "Partagez les avancées et les besoins de l’équipe sans exposer d’identité civile.",
        "projectsPosts.typeLabel": "Type de publication",
        "projectsPosts.messageLabel": "Message",
        "projectsPosts.placeholder": "Partagez une actualité du projet…",
        "projectsPosts.publish": "Publier",
        "projectsPosts.loading": "Chargement des publications…",
        "projectsPosts.empty": "Aucune publication pour le moment.",
        "projectsPosts.publishedBy": "Publié par",
        "projectsPosts.delete": "Supprimer",
        "projectsPosts.loadError":
            "Impossible de charger les publications du projet.",
        "projectsPosts.contentError":
            "Le contenu doit contenir entre 1 et 2 000 caractères.",
        "projectsPosts.createError": "La publication n’a pas pu être créée.",
        "projectsPosts.deleteError":
            "La publication n’a pas pu être supprimée.",
        "projectsPosts.update": "Actualité",
        "projectsPosts.collaborator": "Recherche de collaborateur",
        "projectsPosts.mentorship": "Recherche de mentorat",
        "projectsPosts.funding": "Recherche de financement",
        "dreamMatch.consent":
            "J’accepte que ces préférences soient utilisées pour calculer des suggestions de collaboration. Je peux retirer ce consentement à tout moment.",
        "dreamMatch.saved": "Préférences enregistrées.",
        "dreamMatch.saving": "Enregistrement…",
        "dreamMatch.save": "Enregistrer mes préférences",
        "dreamMatch.promo.eyebrow": "COFOUND.MG POUR VOUS",
        "dreamMatch.promo.title": "Trouvez la complémentarité qui fera avancer votre projet.",
        "dreamMatch.promo.body": "Des profils engagés, des compétences qui se complètent et un espace pensé pour construire ensemble.",
        "dreamMatch.promo.item1": "Des profils complémentaires",
        "dreamMatch.promo.item2": "Des projets qui recrutent",
        "dreamMatch.promo.item3": "Un cadre respectueux et confidentiel",
        "dreamMatch.promo.cta": "Explorer les profils",
        "auth.activation.securityNote":
            "Activation sécurisée par token individuel",
        "auth.forgotPassword.securityNote":
            "Procédure de récupération sécurisée CoFound.mg",
        "auth.resetPassword.securityNote": "Sécurisation de compte CoFound.mg",
        "common.viewProject": "Voir le projet",
        "common.apply": "Postuler",
        "common.viewImpact": "Voir l’impact",
        "landing.explorePool": "Explorer le vivier",
        "landing.freeAccess": "Accès gratuit pour les étudiants",
        "landing.ctaTitle": "Construis ton équipe. Lance ta startup.",
        "landing.ctaBody":
            "Rejoins plus de 800 talents issus de Polytechnique, de l’INSCAE, de la MISA et de l’ISCAM prêts à s’associer.",
        "landing.createProfile": "Créer mon profil fondateur",
        "landing.hero.eyebrow": "L'élite entrepreneuriale étudiante",
        "landing.hero.titleLead": "Ne cherche pas une idée. Trouve ton",
        "landing.hero.titleLine1": "Ne cherche pas une",
        "landing.hero.titleLine2": "idée.",
        "landing.hero.titleLine3": "Trouve ton",
        "landing.hero.titleAccentStart": "Co-",
        "landing.hero.titleAccentEnd": "fondateur.",
        "landing.hero.titleAccent": "Co-fondateur.",
        "landing.hero.body":
            "L'algorithme de CoFound.mg n'associe pas les profils similaires. Il connecte la rigueur technique du codeur avec la vision stratégique du marketeur.",
        "landing.features.eyebrow": "Tout ce dont vous avez besoin",
        "landing.features.title": "Les outils pour réussir",
        "landing.features.body":
            "Une plateforme pensée pour faciliter les rencontres et accélérer vos premiers pas d'entrepreneurs.",
        "landing.how.eyebrow": "Le Pipeline CoFound",
        "landing.how.title":
            "Du profil solo à la startup prête pour l'incubation",
        "landing.forWho.eyebrow": "La loi de la complémentarité",
        "landing.forWho.title":
            "Peu importe ta formation, ta pièce manquante est ici.",
        "landing.forWho.brings": "Superpouvoirs à offrir",
        "landing.forWho.seeks": "Besoins critiques recherchés",
        "landing.inclusion.titleLead": "50% des talents.",
        "landing.inclusion.titleAccent": "Pleinement impliquées.",
        "landing.inclusion.statLabel":
            "Des fondateurs en Afrique sont des femmes.",
        "landing.inclusion.manifesto":
            "« Nous refusons de reproduire les mêmes biais à Madagascar. CoFound supprime les barrières structurelles invisibles dès le premier jour. »",
        "landing.testimonials.eyebrow": "Validé par les étudiants fondateurs",
        "landing.testimonials.title": "Ils ont rencontré la pièce manquante.",
        "landing.testimonials.body":
            "Ils ont rencontré leur moitié business ou technique sur la plateforme.",
        "landing.testimonials.previous": "Témoignage précédent",
        "landing.testimonials.next": "Témoignage suivant",
        "landing.stats.stat-1": "étudiants inscrits",
        "landing.stats.stat-2": "écoles partenaires",
        "landing.stats.stat-3": "startups lancées",
        "landing.heroProfiles.hero-1.role": "Dev Full Stack",
        "landing.heroProfiles.hero-2.role": "Business Strategy",
        "landing.heroProfiles.hero-3.role": "UX Design",
        "landing.heroProfiles.hero-2.skill-2": "Stratégie",
        "landing.steps.step-1.title": "Crée ton profil",
        "landing.steps.step-1.description":
            "Décris tes compétences, ce que tu apportes, et ce que tu cherches.",
        "landing.steps.step-2.title": "Explore ou publie",
        "landing.steps.step-2.description":
            "Publie ton projet ou parcours les profils complémentaires au tien.",
        "landing.steps.step-3.title": "Lance avec ton équipe",
        "landing.steps.step-3.description":
            "Connecte-toi avec tes co-fondateurs et démarrez votre aventure.",
        "landing.profileTypes.type-1.title": "Informatique",
        "landing.profileTypes.type-1.bring-0": "Dev",
        "landing.profileTypes.type-1.bring-1": "Architecture",
        "landing.profileTypes.type-1.seek-0": "Business",
        "landing.profileTypes.type-1.seek-1": "Marketing",
        "landing.profileTypes.type-2.title": "Gestion",
        "landing.profileTypes.type-2.bring-0": "Finance",
        "landing.profileTypes.type-2.bring-1": "Stratégie",
        "landing.profileTypes.type-2.seek-0": "Tech",
        "landing.profileTypes.type-2.seek-1": "Design",
        "landing.profileTypes.type-3.title": "Médecine",
        "landing.profileTypes.type-3.bring-0": "Expertise santé",
        "landing.profileTypes.type-3.seek-0": "Dev mobile",
        "landing.profileTypes.type-3.seek-1": "Data",
        "landing.profileTypes.type-4.title": "Design",
        "landing.profileTypes.type-4.bring-0": "UX/UI",
        "landing.profileTypes.type-4.bring-1": "Branding",
        "landing.profileTypes.type-4.seek-0": "Dev",
        "landing.profileTypes.type-4.seek-1": "Vision produit",
        "landing.profileTypes.type-5.title": "Droit",
        "landing.profileTypes.type-5.bring-0": "Juridique",
        "landing.profileTypes.type-5.bring-1": "Conformité",
        "landing.profileTypes.type-5.seek-0": "Tech",
        "landing.profileTypes.type-5.seek-1": "Gestion",
        "landing.features.feat-1.title": "Matching Complémentaire",
        "landing.features.feat-1.description":
            "L'algorithme vous suggère des profils qui complètent vos compétences pour former des équipes équilibrées.",
        "landing.features.feat-2.title": "Messagerie Intégrée",
        "landing.features.feat-2.description":
            "Prenez contact en un clic et commencez à discuter de votre vision avec vos potentiels co-fondateurs.",
        "landing.features.feat-3.title": "Espaces Projets",
        "landing.features.feat-3.description":
            "Publiez votre idée de startup pour attirer les talents ou parcourez les projets qui recrutent.",
        "landing.features.feat-4.title": "Tableau de Bord Parité",
        "landing.features.feat-4.description":
            "Suivez en temps réel les statistiques d'inclusion et l'impact de la plateforme sur l'écosystème étudiant.",
        "landing.inclusion.inclusion-1.title": "Espace Sécurisé",
        "landing.inclusion.inclusion-1.description":
            "Les étudiantes peuvent rendre leur profil visible uniquement aux femmes dans un premier temps, et candidater en mode anonyme.",
        "landing.inclusion.inclusion-2.title": "Réseau de Mentores",
        "landing.inclusion.inclusion-2.description":
            "Des entrepreneures malgaches établies sont accessibles aux équipes comptant au moins une femme fondatrice.",
        "landing.inclusion.inclusion-3.title": "Tableau de Bord Parité",
        "landing.inclusion.inclusion-3.description":
            "La parité rendue visible en temps réel. Rendre visible crée une pression positive et une fierté collective.",
        "landing.testimonials.testimonial-1.quote":
            "J'avais l'idée, il me manquait le dev. Trouvé Hery en 2 jours. On a lancé notre app agricole 3 mois après.",
        "landing.testimonials.testimonial-1.field": "Gestion",
        "landing.testimonials.testimonial-2.quote":
            "En tant que développeur, je pensais que vendre c'était pas mon truc. Mon co-fondateur trouvé sur CoFound m'a prouvé que ça marchait autrement.",
        "landing.testimonials.testimonial-2.field": "Informatique",
        "landing.testimonials.testimonial-3.quote":
            "L'espace femmes m'a aidée à oser. J'ai rejoint un projet HealthTech en candidatant anonymement. Maintenant je suis CTO.",
        "landing.testimonials.testimonial-3.field": "Design",
        "common.viewProfiles": "Voir les profils",
        "import.spontaneousApplication":
            "Candidature spontanée (aucun poste spécifique)",
        "import.ignoreColumn": "Ignorer cette colonne",
        "import.mappingTitle": "Correspondance des colonnes",
        "import.noAccounts": "Aucun compte n’existe encore.",
        "import.privacyNotice":
            "Le genre peut être importé, mais il ne sera jamais affiché individuellement dans la console. Aucun compte ne sera créé à cette étape.",
        "import.backMapping": "Retour au mapping",
        "import.previewEyebrow": "Prévisualisation",
        "import.previewTitle": "Vérifiez les lignes avant l’application",
        "import.previewDescription":
            "Chaque ligne affiche le résultat prévu. Corrigez le mapping si nécessaire avant de passer à l’application du lot.",
        "import.previewNoMutation":
            "Cette étape ne crée rien et ne modifie aucune donnée. Vous pourrez revenir au mapping sans perdre votre fichier.",
        "import.previewLoading": "Chargement de la prévisualisation…",
        "import.rowsAnalyzed": "lignes analysées",
        "import.toCreate": "À créer",
        "import.toUpdate": "À mettre à jour",
        "import.duplicatesSkipped": "Doublons ignorés",
        "import.errors": "Erreurs",
        "import.rowsDetail": "Détail des lignes",
        "import.showAllRows": "Afficher toutes les lignes",
        "import.showOnlyErrors": "Afficher seulement les erreurs",
        "import.noMatchingRows": "Aucune ligne ne correspond à ce filtre.",
        "import.editMapping": "Modifier le mapping",
        "import.applyBatch": "Passer à l’application",
        "import.previewLoadError":
            "La prévisualisation n’a pas pu être chargée. Vérifiez votre connexion puis réessayez.",
        "import.row": "Ligne",
        "import.noWrite": "Aucune écriture",
        "import.resultCreated": "Sera créé",
        "import.resultUpdated": "Sera mis à jour",
        "import.resultDuplicate": "Doublon ignoré",
        "import.resultError": "Erreur",
        "feed.projectsRecruiting": "Recrutement",
        "feed.allProjects": "Tous les projets",
        "feed.errorTitle": "Impossible de charger les profils de talents",
        "feed.errorMessage":
            "Nous n'avons pas pu récupérer la liste des talents. Cela peut être dû à un problème réseau temporaire ou à une maintenance du serveur.",
        "projects.eyebrow": "Découvrir",
        "projects.title": "Projets qui recrutent",
        "projects.subtitle":
            "Explore des projets pseudonymisés et trouve une équipe qui correspond à tes compétences.",
        "projects.searchPlaceholder": "Rechercher un projet…",
        "projects.searchLabel": "Rechercher un projet",
        "projects.filterLabel": "Filtrer par statut",
        "projects.emptyTitle": "Aucun projet ne correspond à ta recherche.",
        "projects.emptyHint":
            "Essaie un autre mot-clé ou affiche tous les projets.",
    },
    mg: {
        "language.label": "Fiteny",
        "language.fr": "Français",
        "language.mg": "Malagasy",
        "signup.backHome": "Hiverina any amin’ny fandraisana",
        "signup.title": "Mamorona kaonty",
        "signup.alreadyFounder": "Efa mpanorina eto amin’ny sehatra ?",
        "signup.signIn": "Hiditra",
        "signup.firstName": "Anarana",
        "signup.lastName": "Fanampin’anarana",
        "signup.email": "Mailaka an’ny oniversite",
        "signup.emailHint":
            "Ampiasao ny mailaka an-tsekolinao ho an’ny fanamarinana haingana.",
        "signup.school": "Sekoly na Oniversite",
        "signup.schoolPlaceholder": "Fidio ny sekolinao",
        "signup.field": "Sampam-pianarana / Sehatra",
        "signup.fieldPlaceholder":
            "oh: Informatika, Fitantanana, Famolavolana...",
        "signup.password": "Teny miafina",
        "signup.confirmPassword": "Hamafiso ny teny miafina",
        "signup.termsStart": "Manaiky ny",
        "signup.terms": "Fepetra fampiasana",
        "signup.and": "sy ny",
        "signup.privacy": "Politikan’ny tsiambaratelo",
        "signup.submit": "Mamorona kaontin’ny mpanorina",
        "signup.loading": "Eo am-pamoronana...",
        "signup.passwordMismatch": "Tsy mitovy ny teny miafina.",
        "signup.acceptTerms": "Tsy maintsy manaiky ny fepetra ianao.",
        "signup.heroTitle": "Manomboka amin’ny ekipa mety ny dia.",
        "signup.heroBody":
            "Midira ao amin’ny vondron’ireo mpianatra mpanorina eto Madagasikara. Tadiavo ireo fahaiza-manao ilainao.",
        "signup.exampleFirstName": "Hery",
        "signup.exampleLastName": "Rakoto",
        "signup.exampleEmail": "hery.rakoto@sekoly.mg",
        "signup.schoolOther": "Hafa",
        "signup.schoolPolytechnique": "École Polytechnique de Madagascar",
        "signup.schoolIscam": "ISCAM",
        "signup.schoolInscae": "INSCAE",
        "signup.schoolIag": "IAG",
        "signup.schoolMedicine": "Faculté de Médecine",
        "signup.schoolMisa": "MISA",
        "signup.schoolIst": "IST",

        /* ── Auth (E-11 & Redesign) ── */
        "auth.login.title": "Fidirana",
        "auth.login.subtitle":
            "Midira ao amin’ny sehatrao mba hanaraka ny tetikasao sy ny fifandraisanao.",
        "auth.login.email": "Adiresy mailaka",
        "auth.login.emailPlaceholder": "anarana@domaine.mg",
        "auth.login.password": "Teny miafina",
        "auth.login.passwordPlaceholder": "••••••••••••",
        "auth.login.showPassword": "Haneho ny teny miafina",
        "auth.login.hidePassword": "Hanafoana ny teny miafina",
        "auth.login.submit": "Hiditra",
        "auth.login.loading": "Fidirana…",
        "auth.login.forgotPassword": "Teny miafina hadino ?",
        "auth.login.noAccount": "Fidirana amin’ny alalan’ny fanasana",
        "auth.login.noAccountHint":
            "Ny fidirana dia amin’ny alalan’ny fanasana avy amin’ireo sekoly sy fandaharan’asa mpiara-miasa.",
        "auth.login.hero.eyebrow": "MPIARA-MANORINA · TETIKASA · FIANTRAIKANY",
        "auth.login.hero.title": "Ny hevitra tsara dia mahita ny ekipany.",
        "auth.login.hero.body":
            "Sehatra mazava hamoronana, hiarahana ary hampandrosoana tetikasa manan-danja.",
        "auth.login.hero.statProjects": "Tetikasa mavitrika",
        "auth.login.hero.statTalents": "Talenta mifandray",
        "auth.login.hero.statImpact": "Fiantraikany ara-pitoviana",
        "auth.login.hero.brand": "CoFound.mg · Madagasikara",
        "auth.login.hero.tagline": "Sehatra handrosoana.",
        "auth.login.hero.cardProjectLabel": "Tetikasa mandroso",
        "auth.login.hero.cardProjectBadge": "Misokatra ny ekipa",
        "auth.login.hero.cardProjectTitle": "Manangana ekipa handroso.",
        "auth.login.hero.cardProjectMeta": "BMC · andraikitra · fahaiza-manao",
        "auth.login.hero.cardProjectSkillOne": "Vokatra",
        "auth.login.hero.cardProjectSkillTwo": "Teknika",
        "auth.login.hero.cardProjectSkillThree": "Orinasa",
        "auth.login.hero.cardMatchLabel": "Fifamenoana",
        "auth.login.hero.cardMatchTitle": "Talenta mifamaly",
        "auth.login.hero.cardMatchMeta": "Talenta · tetikasa · sampana",
        "auth.login.hero.cardImpactLabel": "Fiantraikany iombonana",
        "auth.login.hero.cardImpactTitle": "50/50 mandroso",
        "auth.login.hero.cardImpactMeta": "Zava-dehibe ny lalana tsirairay",
        "auth.login.hero.cardTrustLabel": "Sehatra azo itokisana",
        "auth.login.hero.cardTrustTitle": "Pseudonymat & safidy",
        "auth.login.hero.cardTrustMeta": "Fifandraisana araka ny hafaingananao",
        "auth.login.hero.cardExploreLabel": "Hitady",
        "auth.login.hero.cardExploreTitle": "Hevitra hatsangana",
        "auth.login.hero.cardExploreMeta": "Tetikasa · filàna · fahafahana",
        "auth.login.hero.cardCommunityLabel": "Vondrom-piarahamonina",
        "auth.login.hero.cardCommunityTitle": "Mandroso miaraka",
        "auth.login.hero.cardCommunityMeta":
            "Talenta · mpiara-manorina · fiantraikany",
        "auth.login.error.invalidCredentials":
            "Mailaka na teny miafina tsy mety.",
        "auth.login.error.accountFrozen": "Voasakana vonjimaika ny kaontinao.",
        "auth.login.error.accountDisabled": "Voasakana ny kaontinao.",
        "auth.login.error.generic": "Nisy olana nitranga. Andramo indray.",

        "auth.forgotPassword.title": "Famerenana ny kaonty",
        "auth.forgotPassword.subtitle":
            "Ampidiro ny adiresy mailaka mba hahazoana rohy famerenana.",
        "auth.forgotPassword.email": "Adiresy mailaka",
        "auth.forgotPassword.emailPlaceholder": "anarana@sekoly.mg",
        "auth.forgotPassword.submit": "Handefa ny rohy",
        "auth.forgotPassword.loading": "Fandefasana…",
        "auth.forgotPassword.successTitle": "Jereo ny mailakao",
        "auth.forgotPassword.success":
            "Raha misy io adiresy io, mailaka famerenana no nalefa.",
        "auth.forgotPassword.backToLogin": "Hiverina amin’ny fidirana",

        "auth.resetPassword.title": "Teny miafina vaovao",
        "auth.resetPassword.subtitle":
            "Misafidiana teny miafina vaovao azo antoka.",
        "auth.resetPassword.password": "Teny miafina vaovao",
        "auth.resetPassword.passwordPlaceholder": "12 soratra farafahakeliny",
        "auth.resetPassword.confirm": "Hamafiso ny teny miafina",
        "auth.resetPassword.confirmPlaceholder":
            "Avereno soratana ny teny miafina",
        "auth.resetPassword.submit": "Hanova ny teny miafina",
        "auth.resetPassword.loading": "Fanovana…",
        "auth.resetPassword.successTitle": "Voaova ny teny miafina !",
        "auth.resetPassword.success":
            "Voaova ny teny miafina. Afaka miditra ianao izao.",
        "auth.resetPassword.error.mismatch": "Tsy mitovy ny teny miafina.",
        "auth.resetPassword.error.tooShort":
            "Tsy maintsy misy soratra 12 farafahakeliny ny teny miafina.",
        "auth.resetPassword.error.invalidToken":
            "Io rohy io dia lany daty na tsy manan-kery.",
        "auth.resetPassword.backToLogin": "Hiditra izao",

        "auth.strength.weak": "Kely",
        "auth.strength.fair": "Koraokandro",
        "auth.strength.good": "Tsara",
        "auth.strength.strong": "Matanjaka",
        "auth.strength.ruleLength": "Soratra 12 farafahakeliny",
        "auth.strength.ruleMix": "Sorabaventy, isa na famantarana",
        "auth.strength.ruleMatch": "Teny miafina mitovy",

        "auth.logout": "Hivoaka",
        "auth.backHome": "Fandraisana CoFound.mg",

        /* ── Commun ── */
        "common.or": "na",
        "common.loading": "Eo am-pidirana…",
        "common.error": "Nisy olana nitranga.",

        /* ── Recherche (M-01 / UI-15) ── */
        /* ── Activation (E-10) ── */
        "auth.activation.title": "Hampandeha ny kaontinao",
        "auth.activation.subtitle":
            "Safidio ny teny miafinao mba hamaranana ny fampandehanana ny kaontinao.",
        "auth.activation.password": "Teny miafina vaovao",
        "auth.activation.passwordPlaceholder":
            "Kely indrindra 12 stafa (sorabaventy, isa/marika)",
        "auth.activation.confirmPassword": "Hamafiso ny teny miafina",
        "auth.activation.confirmPasswordPlaceholder":
            "Ataovy indray ny teny miafinao",
        "auth.activation.acceptTerms":
            "Manaiky ny fepetra fampiasana sy ny politikan’ny tsiambaratelo aho.",
        "auth.activation.submit": "Hampandeha ny kaontiko",
        "auth.activation.loading": "Eo am-pampandehanana...",
        "auth.activation.error.invalidToken":
            "Tsy manan-kery na efa lany daty ity rohy ity. Mifandraisa amin’ny sekolinao.",
        "auth.activation.error.passwordLength":
            "Tsy maintsy misy stafa 12 kely indrindra ny teny miafina.",
        "auth.activation.error.passwordMismatch":
            "Tsy mitovy ny teny miafina roa.",
        "auth.activation.error.acceptTerms":
            "Tsy maintsy manaiky ny fepetra ianao mba hitohizana.",
        "auth.activation.error.generic":
            "Nisy fahadisoana nitranga. Mba andramo indray.",
        "auth.activation.successTitle":
            "Lasa mampandeha soa aman-tsara ny kaontinao !",
        "auth.activation.successSubtitle":
            "Hazo mivantana mankany amin’ny dingana famoronana ianao...",

        "settings.eyebrow": "TOERANA MANOKANA",
        "settings.title": "Fikirana",
        "settings.subtitle":
            "Tantano mangarahara ny safidinao sy ny fanekenao.",
        "settings.privacy.title": "Tsiambaratelo sy fanekena",
        "settings.privacy.description":
            "Afaka manaisotra fanekena ianao amin’ny fotoana rehetra. Voatahiry ny dian’ny fanapahan-kevitra.",
        "settings.loading": "Eo am-pikirakirana…",
        "settings.error": "Tsy azo alaina na tehirizina ny safidinao.",
        "settings.version": "Dika",
        "settings.notGranted": "Tsy nekena",
        "settings.consent.profile": "Fahitana ny profil",
        "settings.consent.matching": "Soso-kevitra fiaraha-miasa",
        "settings.consent.contact":
            "Fifandraisana avy amin’ny mpiara-miombon’antoka",
        "settings.consent.analytics": "Fanadihadiana mitambatra",
        "settings.consent.withdrawConfirm":
            "Esorina ve ity fanekena ity? Mety hampijanona ny asa mifandray aminy izany.",
        "settings.privacy.withdrawExplanation":
            "Mihatra amin’ny fampiasana ho avy ny fisintonana. Voatahiry ny tantaran’ny fanekena.",
        "settings.backProfile": "Hiverina any amin’ny mombamomba ahy",
        "legal.navigation": "Antontan-taratasy ara-dalàna",
        "legal.terms": "Fepetra fampiasana",
        "legal.privacy": "Tsiambaratelo",
        "settings.export.title": "Hanondrana ny angon-drakitra manokana",
        "settings.export.description":
            "Mangataha kopia azo afindra amin’ny angon-drakitrao. Hahazo rohy azo antoka ianao rehefa vonona izany.",
        "settings.export.pending": "Eo am-pangatahana…",
        "settings.export.request": "Mangataka fanondranana",
        "settings.export.status": "Satan’ny fangatahana",
        "account.status.eyebrow": "TOETRY NY KAONTY",
        "account.status.loading": "Eo am-pamakiana ny toetra…",
        "account.status.error": "Tsy azo vakiana ny toetry ny kaonty.",
        "account.status.active.title": "Miasa ny kaontinao",
        "account.status.active.description":
            "Afaka mampiasa ireo asa misy ao amin’ny sehatrao ianao.",
        "account.status.frozen.title": "Najanona vonjimaika ny kaontinao",
        "account.status.frozen.description":
            "Najanona mandritra ity fotoana ity ny fidirana amin’ireo asa hafa. Hahazo ny antony sy ny faharetana avy amin’ny mpanondro anao ianao.",
        "account.status.frozen.appeal":
            "Raha heverinao fa misy hadisoana, afaka mangataka fandinihana indray ianao.",
        "account.status.frozen.appealAction": "Hifandray amin’ny fanohanana",
        "account.status.leaving.title": "Miala amin’ny sekoly ny kaontinao",
        "account.status.leaving.description":
            "Mbola azo jerena ny tetikasanao. Tsy misy intsony ny Feed Talents sy Dream Match.",
        "account.status.alumni.title": "Kaonty alumni ny anao",
        "account.status.alumni.description":
            "Afaka mijery ireo tetikasa efa misy ianao, saingy tsy afaka mandefa fangatahana intsony.",
        "account.status.endsAt": "Daty fiafarana kasaina",
        "account.status.continue": "Tohizo mankany amin’ny sehatra",
        "profile.completionReminder.message":
            "Feno {completion} % ny profil-nao. Fenoy izany mba hanatsarana ny fahitanao.",
        "profile.completionReminder.action": "Tohizo",
        "profile.fields.pseudonym": "Anarana solon’anarana",
        "profile.fields.headline": "Fampahafantarana fohy",
        "profile.fields.bio": "Mombamomba",
        "profile.fields.field": "Sehatra fianarana",
        "profile.fields.cohortYear": "Taonan’ny andiany",
        "profile.fields.availability": "Fotoana azo ampiasaina",
        "profile.fields.goals": "Tanjona",
        "profile.fields.sectors": "Sehatra",
        "search.title": "Fikarohana",
        "search.subtitle": "Tadiavo ireo tetikasa, fahaiza-manao na fahafahana",
        "search.placeholder": "Tadiavo ny tetikasa, fahaiza-manao...",
        "search.tab.all": "Valiny rehetra",
        "search.tab.projects": "Tetikasa",
        "search.tab.talents": "Mpanorina",
        "search.tab.opportunities": "Fahafahana",
        "search.suggestions.title": "Fikarohana matetika",
        "search.suggestions.skills": "Fahaiza-manao ilaina",
        "search.suggestions.sectors": "Sehatra mavitrika",
        "search.empty.noResults": "Tsy nisy valiny ho an’ny « {query} »",
        "search.empty.tryAgain": "Andramo amin’ny teny hafa na ovay ny sivana.",
        "search.empty.reset": "Fafao ny fikarohana",
        "search.loading": "Eo am-pikarohana…",
        "search.error": "Tsy afaka nanao fikarohana. Jereo ny fifandraisana.",
        "common.retry": "Andramo indray ny fifandraisana",
        "common.errorCode": "Kaody diso: {code}",
        "common.profile": "Mombamomba",
        "common.contact": "Mifandray",
        "common.femaleProfile": "Mombamomba vehivavy",
        "common.seeking": "Mitady",
        "common.cohort": "Promo",
        "common.completed": "feno",
        "common.bioMissing": "Tsy mbola misy tantaram-piainana.",
        "common.availability": "Fotoana azo ampiasaina",
        "common.close": "Hanidy",
        "nav.exploreProfiles": "Hijery ireo mpanorina",
        "nav.method": "Ny fomba fiasa",
        "nav.impact": "Fiantraikany 50/50",
        "nav.login": "Hiditra",
        "nav.join": "Hiditra amin’ny tontolo iombonana",
        "nav.openMenu": "Hanokatra ny menio",
        "nav.closeMenu": "Hanidy ny menio",
        "nav.mobileNavigation": "Fitetezana amin’ny finday",
        "common.cancel": "Hanafoana",
        "application.title": "Hangataka amin’ity tetikasa ity",
        "application.positionOptional": "Toerana tadiavina (tsy voatery)",
        "application.motivationLabel": "Hafatra fanentanana",
        "application.motivationPlaceholder":
            "Lazao fohifohy ny fahaizanao, ny traikefanao ary ny sanda tianao entina amin’ity tetikasa ity…",
        "application.characterCount": "tarehintsoratra (farafahakeliny 10)",
        "application.messageTooShort":
            "Tokony ahitana tarehintsoratra 10 farafahakeliny ny hafatrao.",
        "application.submitError": "Nisy olana nandritra ny fandefasana.",
        "application.submitting": "Eo am-pandefasana…",
        "application.submit": "Handefa ny fangatahako",
        "applications.title": "Ireo fangatahako",
        "applications.subtitle":
            "Araho ny satan’ireo fangatahanao amin’ireo mpanorina tetikasa ao amin’ny CoFound.mg.",
        "applications.all": "Rehetra",
        "applications.pending": "Miandry",
        "applications.accepted": "Nekena",
        "applications.rejected": "Nolavina",
        "applications.withdrawn": "Nesorina",
        "applications.targetPosition": "Toerana kendrena",
        "applications.messageLabel": "Hafatra fangatahanao",
        "applications.rejectionReason": "Antony nandavana",
        "applications.appliedOn": "Nangatahana ny",
        "common.back": "Hiverina",
        "health.accessDenied":
            "Ho an’ny OPS_ADMIN na SUPER_ADMIN ihany ny fidirana.",
        "health.staffConsole": "Console staff",
        "health.title": "Fahasalamana ny vokatra",
        "health.description":
            "Angona fitambaran’ny sehatra ihany. Ny andiam-potoana sy ny vondrona dia ho an’ny kinova manaraka.",
        "health.projectsByStatus": "Tetikasa araka ny sata",
        "health.privacyThreshold": "Tokonam-piarovana nampiharina:",
        "health.observations": "fandinihana",
        "projectsPosts.eyebrow": "Feed tetikasa",
        "projectsPosts.title": "Famoahana momba ny tetikasa",
        "projectsPosts.subtitle":
            "Zarao ny fandrosoana sy ny filàn’ny ekipa nefa tsy mampiseho ny maha-izy azy.",
        "projectsPosts.typeLabel": "Karazana famoahana",
        "projectsPosts.messageLabel": "Hafatra",
        "projectsPosts.placeholder": "Zarao ny vaovao momba ny tetikasa…",
        "projectsPosts.publish": "Havoaka",
        "projectsPosts.loading": "Eo am-pamakiana ny famoahana…",
        "projectsPosts.empty": "Tsy mbola misy famoahana.",
        "projectsPosts.publishedBy": "Navoakan’i",
        "projectsPosts.delete": "Hamafa",
        "projectsPosts.loadError":
            "Tsy azo alaina ny famoahana momba ny tetikasa.",
        "projectsPosts.contentError":
            "Tokony ho eo anelanelan’ny tarehintsoratra 1 sy 2 000 ny votoaty.",
        "projectsPosts.createError": "Tsy azo noforonina ny famoahana.",
        "projectsPosts.deleteError": "Tsy azo nofafana ny famoahana.",
        "projectsPosts.update": "Vaovao",
        "projectsPosts.collaborator": "Mitady mpiara-miasa",
        "projectsPosts.mentorship": "Mitady mpanoro hevitra",
        "projectsPosts.funding": "Mitady famatsiam-bola",
        "dreamMatch.consent":
            "Manaiky aho fa hampiasaina amin’ny fanombanana ny fiaraha-miasa ireo safidy ireo. Afaka manaisotra izany fanekena izany aho amin’ny fotoana rehetra.",
        "dreamMatch.saved": "Voatahiry ny safidy.",
        "dreamMatch.saving": "Eo am-pitahirizana…",
        "dreamMatch.save": "Hitahiry ny safidiko",
        "dreamMatch.promo.eyebrow": "COFOUND.MG HO ANAO",
        "dreamMatch.promo.title": "Tadiavo ny fifamenoana hampandroso ny tetikasanao.",
        "dreamMatch.promo.body": "Mpanorina mazoto, fahaiza-manao mifameno ary sehatra natao hananganana miaraka.",
        "dreamMatch.promo.item1": "Profil mifameno",
        "dreamMatch.promo.item2": "Tetikasa mitady mpikambana",
        "dreamMatch.promo.item3": "Sehatra manaja sy mitahiry tsiambaratelo",
        "dreamMatch.promo.cta": "Hijery ireo profil",
        "auth.activation.securityNote":
            "Fampahavitrihana azo antoka amin’ny token manokana",
        "auth.forgotPassword.securityNote":
            "Fomba azo antoka hamerenana ny kaonty CoFound.mg",
        "auth.resetPassword.securityNote": "Fiarovana ny kaonty CoFound.mg",
        "common.viewProject": "Hijery ny tetikasa",
        "common.apply": "Hangataka",
        "common.viewImpact": "Hijery ny fiantraikany",
        "landing.explorePool": "Hijery ireo mpanorina",
        "landing.freeAccess": "Fidirana maimaim-poana ho an’ny mpianatra",
        "landing.ctaTitle": "Amboary ny ekipanao. Atombohy ny startup-nao.",
        "landing.ctaBody":
            "Miaraha amin’ireo mpanorina mihoatra ny 800 avy amin’ny Polytechnique, INSCAE, MISA ary ISCAM.",
        "landing.createProfile": "Hamorona ny mombamomba ahy",
        "landing.hero.eyebrow": "Ireo mpianatra mpanorina ambony",
        "landing.hero.titleLead": "Aza mitady hevitra fotsiny. Tadiavo ny ",
        "landing.hero.titleLine1": "Aza mitady hevitra",
        "landing.hero.titleLine2": "fotsiny.",
        "landing.hero.titleLine3": "Tadiavo ny",
        "landing.hero.titleAccentStart": "mpiara-",
        "landing.hero.titleAccentEnd": "mpanorina anao.",
        "landing.hero.titleAccent": "mpiara-mpanorina anao.",
        "landing.hero.body":
            "Ny algorithman’ny CoFound.mg dia mampifandray ny fahaiza-manao ara-teknikan’ny mpandrindra kaody amin’ny fahitana stratejikan’ny mpandraharaha.",
        "landing.features.eyebrow": "Izay rehetra ilainao",
        "landing.features.title": "Ireo fitaovana hahombiazana",
        "landing.features.body":
            "Sehatra natao hanamora ny fihaonana sy hanafaingana ny dingana voalohany amin’ny maha-mpandraharaha.",
        "landing.how.eyebrow": "Ny Pipeline CoFound",
        "landing.how.title":
            "Avy amin’ny profil tokana mankany amin’ny startup vonona hiroborobo",
        "landing.forWho.eyebrow": "Ny herin’ny fifamenoana",
        "landing.forWho.title":
            "Na inona na inona fianaranao, eto ny ampahany tsy ampy aminao.",
        "landing.forWho.brings": "Hery entinao",
        "landing.forWho.seeks": "Filàna tadiavina",
        "landing.inclusion.titleLead": "50%-n’ny talenta.",
        "landing.inclusion.titleAccent": "Mandray anjara tanteraka.",
        "landing.inclusion.statLabel": "Ny mpanorina any Afrika dia vehivavy.",
        "landing.inclusion.manifesto":
            "« Tsy manaiky hamerina ireo fitongilanana mitovy eto Madagasikara izahay. CoFound manala ireo sakana tsy hita maso hatrany am-piandohana. »",
        "landing.testimonials.eyebrow": "Nankatoavin’ireo mpianatra mpanorina",
        "landing.testimonials.title": "Nahita ilay ampahany tsy ampy izy ireo.",
        "landing.testimonials.body":
            "Nahita ny mpiara-miasa ara-barotra na ara-teknika tao amin’ny sehatra izy ireo.",
        "landing.testimonials.previous": "Hevitra teo aloha",
        "landing.testimonials.next": "Hevitra manaraka",
        "landing.stats.stat-1": "mpianatra voasoratra",
        "landing.stats.stat-2": "sekoly mpiara-miombon’antoka",
        "landing.stats.stat-3": "startup natomboka",
        "landing.heroProfiles.hero-1.role": "Dev Full Stack",
        "landing.heroProfiles.hero-2.role": "Business Strategy",
        "landing.heroProfiles.hero-3.role": "UX Design",
        "landing.heroProfiles.hero-2.skill-2": "Paikady",
        "landing.steps.step-1.title": "Mamorona ny profil-nao",
        "landing.steps.step-1.description":
            "Lazao ny fahaizanao, izay entinao, ary izay tadiavinao.",
        "landing.steps.step-2.title": "Mikaroka na mamoaka",
        "landing.steps.step-2.description":
            "Avoahy ny tetikasanao na tadiavo ireo profil mifameno aminao.",
        "landing.steps.step-3.title": "Atombohy miaraka amin’ny ekipanao",
        "landing.steps.step-3.description":
            "Mifandraisa amin’ireo mpiara-mpanorinao ary atombohy ny dianareo.",
        "landing.profileTypes.type-1.title": "Informatika",
        "landing.profileTypes.type-1.bring-0": "Dev",
        "landing.profileTypes.type-1.bring-1": "Architecture",
        "landing.profileTypes.type-1.seek-0": "Business",
        "landing.profileTypes.type-1.seek-1": "Marketing",
        "landing.profileTypes.type-2.title": "Fitantanana",
        "landing.profileTypes.type-2.bring-0": "Finance",
        "landing.profileTypes.type-2.bring-1": "Paikady",
        "landing.profileTypes.type-2.seek-0": "Tech",
        "landing.profileTypes.type-2.seek-1": "Design",
        "landing.profileTypes.type-3.title": "Fitsaboana",
        "landing.profileTypes.type-3.bring-0": "Fahaizana ara-pahasalamana",
        "landing.profileTypes.type-3.seek-0": "Dev mobile",
        "landing.profileTypes.type-3.seek-1": "Data",
        "landing.profileTypes.type-4.title": "Design",
        "landing.profileTypes.type-4.bring-0": "UX/UI",
        "landing.profileTypes.type-4.bring-1": "Branding",
        "landing.profileTypes.type-4.seek-0": "Dev",
        "landing.profileTypes.type-4.seek-1": "Fahitana vokatra",
        "landing.profileTypes.type-5.title": "Lalàna",
        "landing.profileTypes.type-5.bring-0": "Ara-dalàna",
        "landing.profileTypes.type-5.bring-1": "Fanarahan-dalàna",
        "landing.profileTypes.type-5.seek-0": "Tech",
        "landing.profileTypes.type-5.seek-1": "Fitantanana",
        "landing.features.feat-1.title": "Fampifandraisana mifameno",
        "landing.features.feat-1.description":
            "Ny algorithma dia manolotra profil mameno ny fahaizanao mba hamoronana ekipa voalanjalanja.",
        "landing.features.feat-2.title": "Hafatra tafiditra",
        "landing.features.feat-2.description":
            "Mifandraisa amin’ny tsindry iray ary resaho ny fahitanao miaraka amin’ireo mety ho mpiara-mpanorina.",
        "landing.features.feat-3.title": "Toeran’ny tetikasa",
        "landing.features.feat-3.description":
            "Avoahy ny hevitrao hanintonana talenta na tadiavo ireo tetikasa mitady ekipa.",
        "landing.features.feat-4.title": "Tabilao fitovian-jo",
        "landing.features.feat-4.description":
            "Araho mivantana ny antontan’isa momba ny fampidirana sy ny fiantraikan’ny sehatra amin’ny tontolon’ny mpianatra.",
        "landing.inclusion.inclusion-1.title": "Toerana azo antoka",
        "landing.inclusion.inclusion-1.description":
            "Afaka asehon’ny mpianatra vehivavy amin’ny vehivavy ihany aloha ny profil-ny ary afaka mangataka amin’ny fomba tsy mitonona anarana.",
        "landing.inclusion.inclusion-2.title":
            "Tambajotran’ny mpanoro hevitra vehivavy",
        "landing.inclusion.inclusion-2.description":
            "Ireo mpandraharaha vehivavy malagasy efa miorina dia afaka manampy ekipa misy vehivavy mpanorina.",
        "landing.inclusion.inclusion-3.title": "Tabilao fitovian-jo",
        "landing.inclusion.inclusion-3.description":
            "Aseho mivantana ny fitovian-jo. Ny fahitana izany dia mamorona fanerena tsara sy rehareha iombonana.",
        "landing.testimonials.testimonial-1.quote":
            "Nanana hevitra aho, fa nila dev. Hery no hitako tao anatin’ny 2 andro. Natombokay 3 volana tatỳ aoriana ny app momba ny fambolena.",
        "landing.testimonials.testimonial-1.field": "Fitantanana",
        "landing.testimonials.testimonial-2.quote":
            "Amin’ny maha-mpandrindra kaody ahy, noheveriko fa tsy ho ahy ny fivarotana. Nasehon’ny mpiara-mpanorina hitako tao CoFound fa azo atao amin’ny fomba hafa izany.",
        "landing.testimonials.testimonial-2.field": "Informatika",
        "landing.testimonials.testimonial-3.quote":
            "Nanampy ahy ho sahy ny toerana ho an’ny vehivavy. Niditra tamin’ny tetikasa HealthTech aho tamin’ny fangatahana tsy mitonona anarana. Ankehitriny aho CTO.",
        "landing.testimonials.testimonial-3.field": "Design",
        "common.viewProfiles": "Hijery ny mombamomba",
        "import.spontaneousApplication":
            "Fangatahana ankapobeny (tsy misy toerana manokana)",
        "import.ignoreColumn": "Aza ampiasaina ity tsanganana ity",
        "import.mappingTitle": "Fifandraisan’ny tsanganana",
        "import.noAccounts": "Tsy mbola misy kaonty.",
        "import.privacyNotice":
            "Azo ampidirina ny lahy sy vavy, saingy tsy haseho tsirairay ao amin’ny console izany. Tsy misy kaonty hoforonina amin’ity dingana ity.",
        "import.backMapping": "Hiverina amin’ny mapping",
        "import.previewEyebrow": "Topi-maso",
        "import.previewTitle": "Hamarino ny andalana alohan’ny fampiharana",
        "import.previewDescription":
            "Asehoy ny vokatra andrasana isaky ny andalana. Ahitsio ny mapping raha ilaina alohan’ny hampiharana ny andiany.",
        "import.previewNoMutation":
            "Tsy mamorona na manova angona ity dingana ity. Afaka miverina amin’ny mapping ianao nefa tsy very ny rakitra.",
        "import.previewLoading": "Eo am-pamakiana ny topi-maso…",
        "import.rowsAnalyzed": "andalana nodinihina",
        "import.toCreate": "Hamoronina",
        "import.toUpdate": "Havaozina",
        "import.duplicatesSkipped": "Dika mitovy tsy noraisina",
        "import.errors": "Hadisoana",
        "import.rowsDetail": "Antsipirian’ny andalana",
        "import.showAllRows": "Asehoy ny andalana rehetra",
        "import.showOnlyErrors": "Asehoy ny hadisoana ihany",
        "import.noMatchingRows":
            "Tsy misy andalana mifanaraka amin’ity sivana ity.",
        "import.editMapping": "Hanova ny mapping",
        "import.applyBatch": "Hampihatra ny andiany",
        "import.previewLoadError":
            "Tsy azo alaina ny topi-maso. Jereo ny fifandraisana ary andramo indray.",
        "import.row": "Andalana",
        "import.noWrite": "Tsy misy fanoratana",
        "import.resultCreated": "Hamoronina",
        "import.resultUpdated": "Havaozina",
        "import.resultDuplicate": "Dika mitovy tsy noraisina",
        "import.resultError": "Hadisoana",
        "feed.projectsRecruiting": "Fandraisana mpikambana",
        "feed.allProjects": "Tetikasa rehetra",
        "feed.errorTitle": "Tsy azo alaina ny mombamomba ny mpanorina",
        "feed.errorMessage":
            "Tsy afaka naka ny lisitry ny mpanorina izahay. Mety noho ny olana vonjimaika amin’ny tambajotra na fikojakojana ny mpizara izany.",
        "projects.eyebrow": "Hijery",
        "projects.title": "Tetikasa mandray mpikambana",
        "projects.subtitle":
            "Diniho ireo tetikasa tsy mampiseho anarana ary mitadiava ekipa mifanaraka amin’ny fahaizanao.",
        "projects.searchPlaceholder": "Mitadiava tetikasa…",
        "projects.searchLabel": "Mitadiava tetikasa",
        "projects.filterLabel": "Sivano araka ny sata",
        "projects.emptyTitle":
            "Tsy misy tetikasa mifanaraka amin’ny fikarohanao.",
        "projects.emptyHint":
            "Andramo teny hafa na asehoy ny tetikasa rehetra.",
    },
} as const;

type TranslationKey = keyof typeof messages.fr;

type I18nContextValue = {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        const stored = window.localStorage.getItem("cofound-language");
        return stored === "mg" ? "mg" : "fr";
    });

    const setLanguage = (nextLanguage: Language) => {
        setLanguageState(nextLanguage);
        window.localStorage.setItem("cofound-language", nextLanguage);
    };

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    const value = useMemo<I18nContextValue>(
        () => ({ language, setLanguage, t: (key) => messages[language][key] }),
        [language],
    );

    return (
        <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
    );
}

export function useI18n(): I18nContextValue {
    const context = useContext(I18nContext);
    if (!context)
        throw new Error("useI18n doit être utilisé dans I18nProvider.");
    return context;
}

export function LanguageSwitcher() {
    const { language, setLanguage, t } = useI18n();
    return (
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="sr-only">{t("language.label")}</span>
            <select
                aria-label={t("language.label")}
                value={language}
                onChange={(event) =>
                    setLanguage(event.target.value as Language)
                }
                className="rounded-md border border-border bg-background px-2 py-1"
            >
                <option value="fr">{t("language.fr")}</option>
                <option value="mg">{t("language.mg")}</option>
            </select>
        </label>
    );
}

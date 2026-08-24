import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

type LegalDocument = 'terms' | 'privacy'

const documents: Record<LegalDocument, { eyebrow: string; title: string; intro: string; sections: Array<{ title: string; paragraphs: string[] }> }> = {
  terms: {
    eyebrow: 'Document contractuel',
    title: 'Conditions générales d’utilisation',
    intro: 'Ces conditions encadrent l’accès à CoFound.mg, plateforme de mise en relation pseudonymisée entre étudiants, porteurs de projets et partenaires.',
    sections: [
      { title: '1. Objet et acceptation', paragraphs: ['L’utilisation de CoFound.mg suppose l’acceptation des présentes conditions et des règles de confidentialité associées. Les comptes sont activés à partir d’une invitation vérifiée et doivent être utilisés par leur titulaire.', 'La plateforme facilite la découverte de compétences, la constitution d’équipes et le partage d’opportunités. Elle ne garantit ni la réussite d’un projet, ni l’obtention d’un financement, ni une relation contractuelle entre membres.'] },
      { title: '2. Pseudonymat et comportement attendu', paragraphs: ['Les profils présentés dans les feeds sont pseudonymisés. Les membres ne doivent pas tenter de réidentifier une personne, publier des données privées, harceler, discriminer ou contourner les mécanismes de signalement et de blocage.', 'Toute utilisation abusive peut entraîner la limitation, le gel ou la fermeture du compte, selon les règles de modération et les voies de recours communiquées.'] },
      { title: '3. Contenus et projets', paragraphs: ['Chaque membre reste responsable des contenus, projets, candidatures et messages qu’il publie. Il garantit disposer des droits nécessaires et s’engage à ne pas déposer de contenu illicite, trompeur ou portant atteinte aux droits d’autrui.', 'CoFound.mg peut retirer un contenu signalé ou manifestement contraire aux règles, tout en conservant les éléments nécessaires à la sécurité et à l’audit des actions sensibles.'] },
      { title: '4. Portabilité et fin de relation', paragraphs: ['Si un établissement cesse d’utiliser la plateforme, ses membres ne perdent ni leurs données personnelles ni leurs projets. Le badge ou la certification liée à l’établissement peut cesser d’être disponible, mais les données exportables restent accessibles selon la procédure prévue dans les paramètres.', 'La suppression ou la fermeture d’un compte est traitée conformément à la politique de confidentialité, aux obligations de conservation et aux nécessités de sécurité.'] },
      { title: '5. Disponibilité et évolution', paragraphs: ['CoFound.mg peut évoluer, être temporairement interrompu pour maintenance ou adapter ses fonctionnalités pour des raisons de sécurité, de conformité ou de fiabilité. Les changements importants sont documentés et, lorsque nécessaire, soumis à une nouvelle acceptation.'] },
    ],
  },
  privacy: {
    eyebrow: 'Protection des données',
    title: 'Politique de confidentialité',
    intro: 'Cette politique décrit les données utilisées par CoFound.mg, les finalités, les contrôles de visibilité et les moyens d’exercer les droits des personnes.',
    sections: [
      { title: '1. Données traitées', paragraphs: ['La plateforme traite les données nécessaires à l’activation, à l’authentification, au profil, aux candidatures, aux projets, aux consentements, aux exports et à la sécurité. Les données d’identité privée sont séparées des projections pseudonymisées.', 'Les statistiques produit sont agrégées et soumises à un seuil de confidentialité. Le genre n’est pas affiché individuellement dans les feeds ou les consoles établissement.'] },
      { title: '2. Finalités et consentements', paragraphs: ['Les données sont utilisées pour fournir les fonctionnalités demandées, sécuriser les comptes, administrer les établissements et améliorer le service dans les limites documentées. Les consentements facultatifs sont séparés, explicites, non pré-cochés et révocables depuis les paramètres.', 'Le retrait d’un consentement arrête l’usage concerné pour les traitements futurs, sous réserve des obligations légales, de la sécurité et de la preuve des actions déjà réalisées.'] },
      { title: '3. Visibilité et confidentialité', paragraphs: ['Les feeds exposent uniquement les attributs prévus par le modèle de visibilité. Les noms civils, coordonnées privées et autres éléments d’identité ne sont pas publiés dans les surfaces pseudonymisées.', 'Les accès administratifs et les consultations sensibles sont restreints par rôle et journalisés. Les logs excluent les mots de passe, cookies, jetons et données personnelles non nécessaires.'] },
      { title: '4. Conservation et sous-traitants', paragraphs: ['Les données sont conservées pendant la durée nécessaire aux finalités, à la sécurité, à la résolution des litiges et aux obligations applicables. Les sauvegardes sont chiffrées, stockées hors machine et restaurées vers une base de contrôle distincte.', 'Les prestataires techniques autorisés ne reçoivent que les données nécessaires à leur service et sont soumis aux garanties contractuelles appropriées.'] },
      { title: '5. Droits et portabilité', paragraphs: ['Depuis les paramètres, une personne peut consulter ses consentements, les retirer et demander un export de ses données personnelles dans un format exploitable. Toute demande complémentaire peut être adressée au contact de confidentialité communiqué par l’établissement ou l’équipe CoFound.mg.', 'Une demande d’effacement peut être limitée lorsque la conservation est nécessaire à la sécurité, à la preuve, à la prévention des abus ou à une obligation légale.'] },
    ],
  },
}

export default function LegalPage() {
  const { document = 'terms' } = useParams<{ document: LegalDocument }>()
  const legalDocument = documents[document as LegalDocument] ?? documents.terms
  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-6 py-10 sm:px-10">
        <article className="mx-auto max-w-3xl space-y-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Retour à l’accueil</Link>
          <header className="space-y-3 border-b border-border pb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">{legalDocument.eyebrow}</p>
            <h1 className="font-heading text-3xl font-black tracking-tight sm:text-4xl">{legalDocument.title}</h1>
            <p className="text-muted-foreground leading-7">{legalDocument.intro}</p>
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-primary" />Version produit à faire relire et valider par le conseil juridique avant publication contractuelle.</p>
          </header>
          <div className="space-y-8">
            {legalDocument.sections.map((section) => <section key={section.title} className="space-y-3"><h2 className="text-xl font-bold">{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph} className="leading-7 text-muted-foreground">{paragraph}</p>)}</section>)}
          </div>
          <footer className="border-t border-border pt-6 text-sm text-muted-foreground">Dernière mise à jour produit : 22 août 2026 · <Link className="text-primary hover:underline" to={document === 'terms' ? '/legal/privacy' : '/legal/terms'}>{document === 'terms' ? 'Voir la politique de confidentialité' : 'Voir les CGU'}</Link></footer>
        </article>
      </main>
    </DashboardLayout>
  )
}

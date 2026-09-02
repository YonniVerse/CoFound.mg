import type { Prisma } from '@prisma/client'
import {
  PrismaClient,
  AccountStatus,
  AffiliationStatus,
  ApplicationStatus,
  OrganizationCapabilityName,
  OrganizationRole,
  OrganizationType,
  PlatformRole,
  PostType,
  ProjectRole,
  ProjectStatus,
  TaskStatus,
} from '@prisma/client'

const prisma = new PrismaClient()
const DEMO_PREFIX = 'demo-'

async function seedDemo(): Promise<void> {
  console.log('Début du seeding de démonstration CoFound.mg...')

  await prisma.$transaction(async (tx) => {
    // 1. Référentiels (Secteurs, Régions, Filières, Compétences)
    const sectors = await Promise.all([
      tx.sector.upsert({ where: { slug: 'agriculture' }, update: { labelKey: 'reference.sector.agriculture', sortOrder: 10, isActive: true }, create: { slug: 'agriculture', labelKey: 'reference.sector.agriculture', sortOrder: 10 } }),
      tx.sector.upsert({ where: { slug: 'education' }, update: { labelKey: 'reference.sector.education', sortOrder: 20, isActive: true }, create: { slug: 'education', labelKey: 'reference.sector.education', sortOrder: 20 } }),
      tx.sector.upsert({ where: { slug: 'health' }, update: { labelKey: 'reference.sector.health', sortOrder: 30, isActive: true }, create: { slug: 'health', labelKey: 'reference.sector.health', sortOrder: 30 } }),
      tx.sector.upsert({ where: { slug: 'finance' }, update: { labelKey: 'reference.sector.finance', sortOrder: 40, isActive: true }, create: { slug: 'finance', labelKey: 'reference.sector.finance', sortOrder: 40 } }),
      tx.sector.upsert({ where: { slug: 'digital' }, update: { labelKey: 'reference.sector.digital', sortOrder: 50, isActive: true }, create: { slug: 'digital', labelKey: 'reference.sector.digital', sortOrder: 50 } }),
      tx.sector.upsert({ where: { slug: 'environment' }, update: { labelKey: 'reference.sector.environment', sortOrder: 60, isActive: true }, create: { slug: 'environment', labelKey: 'reference.sector.environment', sortOrder: 60 } }),
      tx.sector.upsert({ where: { slug: 'tourism' }, update: { labelKey: 'reference.sector.tourism', sortOrder: 70, isActive: true }, create: { slug: 'tourism', labelKey: 'reference.sector.tourism', sortOrder: 70 } }),
      tx.sector.upsert({ where: { slug: 'creative-industries' }, update: { labelKey: 'reference.sector.creativeIndustries', sortOrder: 80, isActive: true }, create: { slug: 'creative-industries', labelKey: 'reference.sector.creativeIndustries', sortOrder: 80 } }),
    ])

    const regions = await Promise.all([
      tx.region.upsert({ where: { slug: 'diana' }, update: { labelKey: 'reference.region.diana', countryCode: 'MG', isActive: true }, create: { slug: 'diana', labelKey: 'reference.region.diana', countryCode: 'MG' } }),
      tx.region.upsert({ where: { slug: 'analamanga' }, update: { labelKey: 'reference.region.analamanga', countryCode: 'MG', isActive: true }, create: { slug: 'analamanga', labelKey: 'reference.region.analamanga', countryCode: 'MG' } }),
      tx.region.upsert({ where: { slug: 'atsinanana' }, update: { labelKey: 'reference.region.atsinanana', countryCode: 'MG', isActive: true }, create: { slug: 'atsinanana', labelKey: 'reference.region.atsinanana', countryCode: 'MG' } }),
      tx.region.upsert({ where: { slug: 'haute-matsiatra' }, update: { labelKey: 'reference.region.hauteMatsiatra', countryCode: 'MG', isActive: true }, create: { slug: 'haute-matsiatra', labelKey: 'reference.region.hauteMatsiatra', countryCode: 'MG' } }),
      tx.region.upsert({ where: { slug: 'boeny' }, update: { labelKey: 'reference.region.boeny', countryCode: 'MG', isActive: true }, create: { slug: 'boeny', labelKey: 'reference.region.boeny', countryCode: 'MG' } }),
      tx.region.upsert({ where: { slug: 'atsimo-andrefana' }, update: { labelKey: 'reference.region.atsimoAndrefana', countryCode: 'MG', isActive: true }, create: { slug: 'atsimo-andrefana', labelKey: 'reference.region.atsimoAndrefana', countryCode: 'MG' } }),
      tx.region.upsert({ where: { slug: 'sava' }, update: { labelKey: 'reference.region.sava', countryCode: 'MG', isActive: true }, create: { slug: 'sava', labelKey: 'reference.region.sava', countryCode: 'MG' } }),
    ])

    const fields = await Promise.all([
      tx.field.upsert({ where: { slug: 'computer-science' }, update: { labelKey: 'reference.field.computerScience', sortOrder: 10, isActive: true }, create: { slug: 'computer-science', labelKey: 'reference.field.computerScience', sortOrder: 10 } }),
      tx.field.upsert({ where: { slug: 'economics' }, update: { labelKey: 'reference.field.economics', sortOrder: 30, isActive: true }, create: { slug: 'economics', labelKey: 'reference.field.economics', sortOrder: 30 } }),
      tx.field.upsert({ where: { slug: 'management' }, update: { labelKey: 'reference.field.management', sortOrder: 40, isActive: true }, create: { slug: 'management', labelKey: 'reference.field.management', sortOrder: 40 } }),
      tx.field.upsert({ where: { slug: 'engineering' }, update: { labelKey: 'reference.field.engineering', sortOrder: 60, isActive: true }, create: { slug: 'engineering', labelKey: 'reference.field.engineering', sortOrder: 60 } }),
      tx.field.upsert({ where: { slug: 'agriculture' }, update: { labelKey: 'reference.field.agriculture', sortOrder: 80, isActive: true }, create: { slug: 'agriculture', labelKey: 'reference.field.agriculture', sortOrder: 80 } }),
    ])

    const skills = await Promise.all([
      tx.skill.upsert({ where: { slug: 'frontend' }, update: { labelKey: 'reference.skill.frontend', category: 'technical', sortOrder: 10, isActive: true }, create: { slug: 'frontend', labelKey: 'reference.skill.frontend', category: 'technical', sortOrder: 10 } }),
      tx.skill.upsert({ where: { slug: 'backend' }, update: { labelKey: 'reference.skill.backend', category: 'technical', sortOrder: 20, isActive: true }, create: { slug: 'backend', labelKey: 'reference.skill.backend', category: 'technical', sortOrder: 20 } }),
      tx.skill.upsert({ where: { slug: 'mobile' }, update: { labelKey: 'reference.skill.mobile', category: 'technical', sortOrder: 30, isActive: true }, create: { slug: 'mobile', labelKey: 'reference.skill.mobile', category: 'technical', sortOrder: 30 } }),
      tx.skill.upsert({ where: { slug: 'design' }, update: { labelKey: 'reference.skill.design', category: 'creative', sortOrder: 50, isActive: true }, create: { slug: 'design', labelKey: 'reference.skill.design', category: 'creative', sortOrder: 50 } }),
      tx.skill.upsert({ where: { slug: 'marketing' }, update: { labelKey: 'reference.skill.marketing', category: 'business', sortOrder: 60, isActive: true }, create: { slug: 'marketing', labelKey: 'reference.skill.marketing', category: 'business', sortOrder: 60 } }),
      tx.skill.upsert({ where: { slug: 'finance' }, update: { labelKey: 'reference.skill.finance', category: 'business', sortOrder: 70, isActive: true }, create: { slug: 'finance', labelKey: 'reference.skill.finance', category: 'business', sortOrder: 70 } }),
      tx.skill.upsert({ where: { slug: 'project-management' }, update: { labelKey: 'reference.skill.projectManagement', category: 'support', sortOrder: 100, isActive: true }, create: { slug: 'project-management', labelKey: 'reference.skill.projectManagement', category: 'support', sortOrder: 100 } }),
    ])

    const sectorMap = new Map(sectors.map((s) => [s.slug, s.id]))
    const regionMap = new Map(regions.map((r) => [r.slug, r.id]))
    const fieldMap = new Map(fields.map((f) => [f.slug, f.id]))
    const skillMap = new Map(skills.map((sk) => [sk.slug, sk.id]))

    // 2. Organisations & Établissements
    const institution = await tx.organization.upsert({
      where: { id: `${DEMO_PREFIX}institution` },
      update: { name: 'Université d’Antsiranana (UNA / ESPA)', type: OrganizationType.INSTITUTION, verificationStatus: 'VERIFIED', description: 'Établissement supérieur partenaire de démonstration.' },
      create: { id: `${DEMO_PREFIX}institution`, name: 'Université d’Antsiranana (UNA / ESPA)', type: OrganizationType.INSTITUTION, verificationStatus: 'VERIFIED', description: 'Établissement supérieur partenaire de démonstration.' },
    })

    const partner = await tx.organization.upsert({
      where: { id: `${DEMO_PREFIX}partner` },
      update: { name: 'NextA Incubateur Madagascar', type: OrganizationType.INCUBATOR, verificationStatus: 'VERIFIED', description: 'Accélérateur et incubateur de jeunes entreprises novatrices.' },
      create: { id: `${DEMO_PREFIX}partner`, name: 'NextA Incubateur Madagascar', type: OrganizationType.INCUBATOR, verificationStatus: 'VERIFIED', description: 'Accélérateur et incubateur de jeunes entreprises novatrices.' },
    })

    // 3. Utilisateurs & Profils de talents (10 Étudiants)
    const talentsData = [
      { id: `${DEMO_PREFIX}talent-hery`, email: 'hery.andria@cofound.mg', firstName: 'Hery', lastName: 'Andrianina', pseudo: 'Hery Tech', region: 'diana', field: 'engineering', headline: 'Ingénieur mécatronique & Solaire', mainSkills: ['backend', 'project-management'] },
      { id: `${DEMO_PREFIX}talent-toky`, email: 'toky.ramah@cofound.mg', firstName: 'Toky', lastName: 'Ramaharo', pseudo: 'Toky Dev', region: 'analamanga', field: 'computer-science', headline: 'Développeur Backend & Fintech', mainSkills: ['backend', 'finance'] },
      { id: `${DEMO_PREFIX}talent-fara`, email: 'fara.rakoto@cofound.mg', firstName: 'Fara', lastName: 'Rakotondrabe', pseudo: 'Fara Business', region: 'atsinanana', field: 'management', headline: 'Gestionnaire de projets & Commerce', mainSkills: ['marketing', 'project-management'] },
      { id: `${DEMO_PREFIX}talent-soafara`, email: 'soafara.rasoa@cofound.mg', firstName: 'Soafara', lastName: 'Rasoanaivo', pseudo: 'Soafara Agro', region: 'haute-matsiatra', field: 'agriculture', headline: 'Ingénieure Agronome & Bio-économie', mainSkills: ['project-management'] },
      { id: `${DEMO_PREFIX}talent-tahina`, email: 'tahina.randria@cofound.mg', firstName: 'Tahina', lastName: 'Randriamanga', pseudo: 'Tahina Eco', region: 'analamanga', field: 'engineering', headline: 'Entrepreneur environnemental & Recyclage', mainSkills: ['project-management', 'finance'] },
      { id: `${DEMO_PREFIX}talent-mialy`, email: 'mialy.randria@cofound.mg', firstName: 'Mialy', lastName: 'Randriambelo', pseudo: 'Mialy UI', region: 'analamanga', field: 'computer-science', headline: 'Designer UX/UI & Web', mainSkills: ['frontend', 'design'] },
      { id: `${DEMO_PREFIX}talent-arisoa`, email: 'arisoa.raj@cofound.mg', firstName: 'Arisoa', lastName: 'Rajaonarison', pseudo: 'Arisoa Med', region: 'diana', field: 'engineering', headline: 'Médecin & Innovatrice MedTech', mainSkills: ['project-management'] },
      { id: `${DEMO_PREFIX}talent-lovasoa`, email: 'lovasoa.rat@cofound.mg', firstName: 'Lovasoa', lastName: 'Ratsimba', pseudo: 'Lovasoa Marine', region: 'atsimo-andrefana', field: 'agriculture', headline: 'Chercheur en Algoculture', mainSkills: ['project-management'] },
      { id: `${DEMO_PREFIX}talent-fitiana`, email: 'fitiana.razafy@cofound.mg', firstName: 'Fitiana', lastName: 'Razafy', pseudo: 'Fitiana Tour', region: 'diana', field: 'management', headline: 'Spécialiste Écotourisme', mainSkills: ['marketing'] },
      { id: `${DEMO_PREFIX}talent-valisoa`, email: 'valisoa.rabem@cofound.mg', firstName: 'Valisoa', lastName: 'Rabemananjara', pseudo: 'Valisoa Edu', region: 'haute-matsiatra', field: 'economics', headline: 'Pédagogue & Conceptrice multimédia', mainSkills: ['design', 'communication'] },
    ]

    const usersMap = new Map<string, { userId: string; profileId: string }>()

    for (const tData of talentsData) {
      const user = await tx.user.upsert({
        where: { email: tData.email },
        update: { status: AccountStatus.ACTIVE, platformRole: PlatformRole.TALENT, activatedAt: new Date('2026-01-10T00:00:00Z') },
        create: { id: tData.id, email: tData.email, status: AccountStatus.ACTIVE, platformRole: PlatformRole.TALENT, activatedAt: new Date('2026-01-10T00:00:00Z'), locale: 'fr' },
      })

      const profile = await tx.talentProfile.upsert({
        where: { userId: user.id },
        update: { pseudonym: tData.pseudo, fieldId: fieldMap.get(tData.field), cohortYear: 2025, headline: tData.headline, completion: 95, visibleInTalentFeed: true },
        create: { userId: user.id, pseudonym: tData.pseudo, avatarSeed: user.id, fieldId: fieldMap.get(tData.field), cohortYear: 2025, headline: tData.headline, completion: 95, visibleInTalentFeed: true },
      })

      await tx.talentIdentity.upsert({
        where: { userId: user.id },
        update: { firstName: tData.firstName, lastName: tData.lastName, regionId: regionMap.get(tData.region) },
        create: { userId: user.id, firstName: tData.firstName, lastName: tData.lastName, regionId: regionMap.get(tData.region) },
      })

      await tx.affiliation.upsert({
        where: { userId_organizationId: { userId: user.id, organizationId: institution.id } },
        update: { status: AffiliationStatus.ACTIVE, isCertifying: true, fieldId: fieldMap.get(tData.field), cohortYear: 2025 },
        create: { userId: user.id, organizationId: institution.id, status: AffiliationStatus.ACTIVE, isCertifying: true, fieldId: fieldMap.get(tData.field), cohortYear: 2025 },
      })

      for (const skSlug of tData.mainSkills) {
        const skId = skillMap.get(skSlug)
        if (skId) {
          await tx.talentSkill.upsert({
            where: { talentId_skillId: { talentId: profile.id, skillId: skId } },
            update: { level: 3 },
            create: { talentId: profile.id, skillId: skId, level: 3 },
          })
        }
      }

      usersMap.set(tData.id, { userId: user.id, profileId: profile.id })
    }

    // Staff User & Partner capability
    const staffUser = await tx.user.upsert({
      where: { email: `${DEMO_PREFIX}staff@cofound.mg` },
      update: { status: AccountStatus.ACTIVE, platformRole: PlatformRole.STAFF, staffRole: 'OPS_ADMIN' },
      create: { id: `${DEMO_PREFIX}staff`, email: `${DEMO_PREFIX}staff@cofound.mg`, status: AccountStatus.ACTIVE, platformRole: PlatformRole.STAFF, staffRole: 'OPS_ADMIN', locale: 'fr' },
    })
    await tx.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: institution.id, userId: staffUser.id } },
      update: { role: OrganizationRole.ORG_ADMIN },
      create: { organizationId: institution.id, userId: staffUser.id, role: OrganizationRole.ORG_ADMIN },
    })
    await tx.organizationCapability.upsert({
      where: { organizationId_capability: { organizationId: partner.id, capability: OrganizationCapabilityName.PUBLISH_OPPORTUNITY } },
      update: { grantedById: staffUser.id },
      create: { organizationId: partner.id, capability: OrganizationCapabilityName.PUBLISH_OPPORTUNITY, grantedById: staffUser.id },
    })

    // Helper BMC Generator
    const createBmc = (summary: string) => ({
      customerSegments: { content: `Particuliers et professionnels ciblés : ${summary}`, isPublic: true },
      valuePropositions: { content: `Proposition de valeur unique apportée par la solution CoFound : ${summary}`, isPublic: true },
      channels: { content: 'Vente directe, réseau d’agents locaux, partenariats académiques et application mobile.', isPublic: true },
      customerRelationships: { content: 'Accompagnement de proximité, support technique et communauté utilisateur.', isPublic: true },
      revenueStreams: { content: 'Vente d’équipements, abonnements mensuels d’usage, commissions d’intermédiation.', isPublic: true },
      keyResources: { content: 'Équipe multidisciplinaire, brevets/prototypes, infrastructures scolaires et universitaires.', isPublic: true },
      keyActivities: { content: 'Recherche & développement, déploiement terrain, maintenance et formation des usagers.', isPublic: true },
      keyPartners: { content: 'Université d’Antsiranana, incubateurs locaux, coopératives agricoles et ministères.', isPublic: true },
      costStructure: { content: 'R&D, achat de composants, déploiement opérationnel et frais d’équipe.', isPublic: true },
    })

    // 4. Projets de démonstration (12 projets réalistes)
    const projectsData = [
      {
        id: `${DEMO_PREFIX}agridrop`,
        title: 'AgriDrop Madagascar',
        pitch: 'Système d’irrigation goutte-à-goutte connecté et à énergie solaire pour l’agriculture paysanne du Nord.',
        status: ProjectStatus.RECRUITING,
        sector: 'agriculture',
        region: 'diana',
        ownerId: `${DEMO_PREFIX}talent-hery`,
        members: [{ id: `${DEMO_PREFIX}talent-soafara`, role: ProjectRole.MEMBER, function: 'Agronome terrain' }],
        postType: PostType.SEEKING_COLLABORATOR,
        postContent: 'AgriDrop recherche un(e) développeur(se) IoT pour finaliser le contrôleur de pompage solaire à Antsiranana !',
        hasBmc: true,
      },
      {
        id: `${DEMO_PREFIX}madakredit`,
        title: 'MadaKredit Digital',
        pitch: 'Plateforme de micro-crédit rotatif et tontine communautaire via Mobile Money pour les commerçants informels.',
        status: ProjectStatus.ACTIVE,
        sector: 'finance',
        region: 'analamanga',
        ownerId: `${DEMO_PREFIX}talent-toky`,
        members: [
          { id: `${DEMO_PREFIX}talent-mialy`, role: ProjectRole.MEMBER, function: 'Lead UI/UX' },
          { id: `${DEMO_PREFIX}talent-fara`, role: ProjectRole.MEMBER, function: 'Responsable conformité' },
        ],
        postType: PostType.UPDATE,
        postContent: 'Phase de test réussie à Isotry ! Plus de 3 millions MGA de tontines gérées sans aucun retard de paiement.',
        hasBmc: true,
      },
      {
        id: `${DEMO_PREFIX}ecoplast`,
        title: 'EcoPlast Diego',
        pitch: 'Collecte et transformation des déchets plastiques urbains en pavés autobloquants écologiques.',
        status: ProjectStatus.ACTIVE,
        sector: 'environment',
        region: 'diana',
        ownerId: `${DEMO_PREFIX}talent-tahina`,
        members: [
          { id: `${DEMO_PREFIX}talent-hery`, role: ProjectRole.MEMBER, function: 'Ingénieur Matériaux' },
          { id: `${DEMO_PREFIX}talent-arisoa`, role: ProjectRole.MEMBER, function: 'Sécurité & Impact' },
        ],
        postType: PostType.SEEKING_FUNDING,
        postContent: 'EcoPlast cherche 10 millions MGA pour l’acquisition d’une broyeuse plastique industrielle à Antsiranana.',
        hasBmc: true,
      },
      {
        id: `${DEMO_PREFIX}vangovango`,
        title: 'Vangovango Crafts',
        pitch: 'Marketplace équitable connectant les artisans du raphia et bois précieux aux acheteurs internationaux.',
        status: ProjectStatus.RECRUITING,
        sector: 'creative-industries',
        region: 'atsinanana',
        ownerId: `${DEMO_PREFIX}talent-fara`,
        members: [],
        postType: PostType.SEEKING_COLLABORATOR,
        postContent: 'Vangovango cherche un(e) responsable e-commerce & export passionné(e) par l’artisanat malgache.',
        hasBmc: true,
      },
      {
        id: `${DEMO_PREFIX}somasoma`,
        title: 'SomaSoma EduTech',
        pitch: 'Application mobile d’apprentissage ludo-éducatif hors-ligne en langue malgache pour le primaire.',
        status: ProjectStatus.RECRUITING,
        sector: 'education',
        region: 'haute-matsiatra',
        ownerId: `${DEMO_PREFIX}talent-valisoa`,
        members: [{ id: `${DEMO_PREFIX}talent-mialy`, role: ProjectRole.MEMBER, function: 'Développeuse Mobile' }],
        postType: PostType.SEEKING_MENTORSHIP,
        postContent: 'Nous recherchons un mentor expérimenté dans le secteur EdTech et l’édition scolaire en Afrique.',
        hasBmc: true,
      },
      {
        id: `${DEMO_PREFIX}madacare`,
        title: 'MadaCare Télémédecine',
        pitch: 'Kit de consultation et pré-diagnostic médical à distance pour les centres de santé isolés.',
        status: ProjectStatus.RECRUITING,
        sector: 'health',
        region: 'diana',
        ownerId: `${DEMO_PREFIX}talent-arisoa`,
        members: [
          { id: `${DEMO_PREFIX}talent-toky`, role: ProjectRole.MEMBER, function: 'Architecte Système' },
          { id: `${DEMO_PREFIX}talent-hery`, role: ProjectRole.MEMBER, function: 'Concepteur Hardware' },
        ],
        postType: PostType.SEEKING_FUNDING,
        postContent: 'MadaCare sollicite des subventions pour déployer 3 bornes médicales pilotes dans la région SAVA.',
        hasBmc: true,
      },
      {
        id: `${DEMO_PREFIX}bioalgae`,
        title: 'BioAlgae Toliara',
        pitch: 'Valorisation des algues marines du Sud-Ouest en engrais biologiques pour la riziculture.',
        status: ProjectStatus.ACTIVE,
        sector: 'environment',
        region: 'atsimo-andrefana',
        ownerId: `${DEMO_PREFIX}talent-lovasoa`,
        members: [{ id: `${DEMO_PREFIX}talent-soafara`, role: ProjectRole.MEMBER, function: 'Agronome' }],
        postType: PostType.UPDATE,
        postContent: 'Les essais sur parcelles de riz à Tuléar montrent une hausse de rendement de 22% sans intrants chimiques !',
        hasBmc: true,
      },
      {
        id: `${DEMO_PREFIX}solatrik`,
        title: 'Solatrik Enerjy',
        pitch: 'Kits solaires intelligents avec modèle Pay-As-You-Go pour l’électrification des zones rurales.',
        status: ProjectStatus.ACTIVE,
        sector: 'digital',
        region: 'analamanga',
        ownerId: `${DEMO_PREFIX}talent-hery`,
        members: [
          { id: `${DEMO_PREFIX}talent-toky`, role: ProjectRole.MEMBER, function: 'Lead IoT' },
          { id: `${DEMO_PREFIX}talent-tahina`, role: ProjectRole.MEMBER, function: 'Responsable Logistique' },
          { id: `${DEMO_PREFIX}talent-fara`, role: ProjectRole.MEMBER, function: 'Commerciale' },
        ],
        postType: PostType.UPDATE,
        postContent: '120 foyers équipés à Manjakandriana ! Taux de remboursement par SMS de 98%.',
        hasBmc: true,
      },
      {
        id: `${DEMO_PREFIX}nosybe-ecotour`,
        title: 'NosyBe EcoTour',
        pitch: 'Circuits touristiques communautaires zéro-carbone guidés par les habitants locaux.',
        status: ProjectStatus.ACTIVE,
        sector: 'tourism',
        region: 'diana',
        ownerId: `${DEMO_PREFIX}talent-fitiana`,
        members: [{ id: `${DEMO_PREFIX}talent-fara`, role: ProjectRole.MEMBER, function: 'Partenariats' }],
        postType: PostType.SEEKING_MENTORSHIP,
        postContent: 'NosyBe EcoTour cherche un mentor spécialisé en hôtellerie et tourisme responsable.',
        hasBmc: true,
      },
      {
        id: `${DEMO_PREFIX}vanillachain`,
        title: 'VanillaChain SAVA',
        pitch: 'Traçabilité transparente de la gousse de vanille par QR code de la plantation à l’exportateur.',
        status: ProjectStatus.RECRUITING,
        sector: 'digital',
        region: 'sava',
        ownerId: `${DEMO_PREFIX}talent-fara`,
        members: [{ id: `${DEMO_PREFIX}talent-toky`, role: ProjectRole.MEMBER, function: 'Développeur Blockchain' }],
        postType: PostType.SEEKING_COLLABORATOR,
        postContent: 'Nous recrutons un(e) enquêteur(trice) terrain à Sambava pour la numérisation des coopératives.',
        hasBmc: true,
      },
      {
        id: `${DEMO_PREFIX}misaotra`,
        title: 'Misaotra Services',
        pitch: 'Plateforme de micro-services et petits boulots étudiants pour soutenir l’autonomie financière.',
        status: ProjectStatus.DRAFT,
        sector: 'digital',
        region: 'analamanga',
        ownerId: `${DEMO_PREFIX}talent-mialy`,
        members: [],
        hasBmc: false, // DRAFT status requires no BMC
      },
      {
        id: `${DEMO_PREFIX}gasybee`,
        title: 'GasyBee Miel Pur',
        pitch: 'Coopérative apicole bio produisant du miel d’eucalyptus et de forêt certifié sans résidus.',
        status: ProjectStatus.PAUSED,
        sector: 'agriculture',
        region: 'haute-matsiatra',
        ownerId: `${DEMO_PREFIX}talent-soafara`,
        members: [{ id: `${DEMO_PREFIX}talent-valisoa`, role: ProjectRole.MEMBER, function: 'Gestion' }],
        hasBmc: true,
      },
    ]

    for (const pData of projectsData) {
      const owner = usersMap.get(pData.ownerId)
      if (!owner) continue

      const project = await tx.project.upsert({
        where: { id: pData.id },
        update: {
          title: pData.title,
          pitch: pData.pitch,
          status: pData.status,
          sectorId: sectorMap.get(pData.sector),
          regionId: regionMap.get(pData.region),
          publishedAt: pData.status !== ProjectStatus.DRAFT ? new Date('2026-02-01T00:00:00Z') : null,
        },
        create: {
          id: pData.id,
          title: pData.title,
          pitch: pData.pitch,
          status: pData.status,
          sectorId: sectorMap.get(pData.sector),
          regionId: regionMap.get(pData.region),
          createdById: owner.userId,
          publishedAt: pData.status !== ProjectStatus.DRAFT ? new Date('2026-02-01T00:00:00Z') : null,
        },
      })

      // Owner Member
      await tx.projectMember.upsert({
        where: { projectId_userId: { projectId: project.id, userId: owner.userId } },
        update: { role: ProjectRole.OWNER, functionalRole: 'Fondateur / CEO' },
        create: { projectId: project.id, userId: owner.userId, role: ProjectRole.OWNER, functionalRole: 'Fondateur / CEO' },
      })

      // Additional Members
      for (const mem of pData.members) {
        const memUser = usersMap.get(mem.id)
        if (!memUser) continue
        await tx.projectMember.upsert({
          where: { projectId_userId: { projectId: project.id, userId: memUser.userId } },
          update: { role: mem.role, functionalRole: mem.function },
          create: { projectId: project.id, userId: memUser.userId, role: mem.role, functionalRole: mem.function },
        })
      }

      // Business Model Canvas for non-draft projects
      if (pData.hasBmc) {
        const bmcBlocks = createBmc(pData.pitch)
        await tx.businessModelCanvas.upsert({
          where: { projectId: project.id },
          update: { blocks: bmcBlocks as unknown as Prisma.InputJsonValue, completion: 100, updatedById: owner.userId },
          create: { projectId: project.id, blocks: bmcBlocks as unknown as Prisma.InputJsonValue, completion: 100, updatedById: owner.userId },
        })
      }

      // Feed Post if defined
      if (pData.postType && pData.postContent) {
        await tx.post.upsert({
          where: { id: `${pData.id}-post` },
          update: {
            projectId: project.id,
            authorId: owner.profileId,
            type: pData.postType,
            content: pData.postContent,
            sectorId: sectorMap.get(pData.sector),
          },
          create: {
            id: `${pData.id}-post`,
            projectId: project.id,
            authorId: owner.profileId,
            type: pData.postType,
            content: pData.postContent,
            sectorId: sectorMap.get(pData.sector),
          },
        })
      }

      // Open Positions for RECRUITING projects
      if (pData.status === ProjectStatus.RECRUITING) {
        const position = await tx.openPosition.upsert({
          where: { id: `${pData.id}-pos-1` },
          update: {
            projectId: project.id,
            title: 'Membre d’équipe passionné',
            description: `Nous recherchons un talent complémentaire pour faire grandir ${pData.title}.`,
            expectedHours: 10,
            isOpen: true,
          },
          create: {
            id: `${pData.id}-pos-1`,
            projectId: project.id,
            title: 'Membre d’équipe passionné',
            description: `Nous recherchons un talent complémentaire pour faire grandir ${pData.title}.`,
            expectedHours: 10,
            isOpen: true,
          },
        })

        // Candidate Application
        const applicantUser = usersMap.get(`${DEMO_PREFIX}talent-mialy`)
        if (applicantUser && applicantUser.userId !== owner.userId) {
          await tx.application.upsert({
            where: {
              projectId_applicantId_status: {
                projectId: project.id,
                applicantId: applicantUser.userId,
                status: ApplicationStatus.PENDING,
              },
            },
            update: {
              positionId: position.id,
              message: `Bonjour, je suis très intéressé(e) par le projet ${pData.title} et souhaite y apporter mes compétences.`,
            },
            create: {
              projectId: project.id,
              positionId: position.id,
              applicantId: applicantUser.userId,
              message: `Bonjour, je suis très intéressé(e) par le projet ${pData.title} et souhaite y apporter mes compétences.`,
              status: ApplicationStatus.PENDING,
            },
          })
        }
      }

      // Tasks for ACTIVE projects
      if (pData.status === ProjectStatus.ACTIVE) {
        await tx.task.upsert({
          where: { id: `${pData.id}-task-1` },
          update: {
            projectId: project.id,
            title: 'Validation des prototypes et tests terrain',
            description: 'Réaliser la série d’essais auprès de la première cohorte d’utilisateurs.',
            status: TaskStatus.DOING,
            assigneeId: owner.userId,
          },
          create: {
            id: `${pData.id}-task-1`,
            projectId: project.id,
            title: 'Validation des prototypes et tests terrain',
            description: 'Réaliser la série d’essais auprès de la première cohorte d’utilisateurs.',
            status: TaskStatus.DOING,
            assigneeId: owner.userId,
          },
        })

        await tx.task.upsert({
          where: { id: `${pData.id}-task-2` },
          update: {
            projectId: project.id,
            title: 'Présentation aux partenaires institutionnels',
            description: 'Dossier de candidature préparé pour la revue d’incubation.',
            status: TaskStatus.TODO,
          },
          create: {
            id: `${pData.id}-task-2`,
            projectId: project.id,
            title: 'Présentation aux partenaires institutionnels',
            description: 'Dossier de candidature préparé pour la revue d’incubation.',
            status: TaskStatus.TODO,
          },
        })
      }
    }

    console.log('Seeding de démonstration CoFound.mg complété avec succès !')
  })
}

seedDemo()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error: unknown) => {
    console.error('Erreur lors du seeding de démonstration:', error)
    await prisma.$disconnect()
    process.exitCode = 1
  })

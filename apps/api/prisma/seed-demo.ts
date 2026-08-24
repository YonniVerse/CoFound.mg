import { PrismaClient, OrganizationCapabilityName, OrganizationRole, OrganizationType, PlatformRole, ProjectRole, ProjectStatus, OpportunityStatus, OpportunityType, AccountStatus, AffiliationStatus } from '@prisma/client'

const prisma = new PrismaClient()
const DEMO_PREFIX = 'demo-'

async function seedDemo(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const [field, sector, region] = await Promise.all([
      tx.field.upsert({ where: { slug: `${DEMO_PREFIX}informatique` }, update: { labelKey: 'demo.field.computing', sortOrder: 900, isActive: true }, create: { slug: `${DEMO_PREFIX}informatique`, labelKey: 'demo.field.computing', sortOrder: 900 } }),
      tx.sector.upsert({ where: { slug: `${DEMO_PREFIX}impact-digital` }, update: { labelKey: 'demo.sector.digitalImpact', sortOrder: 900, isActive: true }, create: { slug: `${DEMO_PREFIX}impact-digital`, labelKey: 'demo.sector.digitalImpact', sortOrder: 900 } }),
      tx.region.upsert({ where: { slug: `${DEMO_PREFIX}analamanga` }, update: { labelKey: 'demo.region.analamanga', countryCode: 'MG', isActive: true }, create: { slug: `${DEMO_PREFIX}analamanga`, labelKey: 'demo.region.analamanga', countryCode: 'MG' } }),
    ])

    const institution = await tx.organization.upsert({ where: { id: `${DEMO_PREFIX}institution` }, update: { name: 'Établissement Démonstration', type: OrganizationType.INSTITUTION, verificationStatus: 'VERIFIED', description: 'Données reconstructibles pour la démonstration.' }, create: { id: `${DEMO_PREFIX}institution`, name: 'Établissement Démonstration', type: OrganizationType.INSTITUTION, verificationStatus: 'VERIFIED', description: 'Données reconstructibles pour la démonstration.' } })
    const partner = await tx.organization.upsert({ where: { id: `${DEMO_PREFIX}partner` }, update: { name: 'Partenaire Démonstration', type: OrganizationType.COMPANY, verificationStatus: 'VERIFIED', description: 'Partenaire de démonstration.' }, create: { id: `${DEMO_PREFIX}partner`, name: 'Partenaire Démonstration', type: OrganizationType.COMPANY, verificationStatus: 'VERIFIED', description: 'Partenaire de démonstration.' } })

    const staff = await tx.user.upsert({ where: { email: `${DEMO_PREFIX}staff@cofound.mg` }, update: { status: AccountStatus.ACTIVE, platformRole: PlatformRole.STAFF, staffRole: 'OPS_ADMIN' }, create: { id: `${DEMO_PREFIX}staff`, email: `${DEMO_PREFIX}staff@cofound.mg`, status: AccountStatus.ACTIVE, platformRole: PlatformRole.STAFF, staffRole: 'OPS_ADMIN', locale: 'fr' } })
    const talent = await tx.user.upsert({ where: { email: `${DEMO_PREFIX}talent@cofound.mg` }, update: { status: AccountStatus.ACTIVE, platformRole: PlatformRole.TALENT, activatedAt: new Date('2026-01-15T00:00:00Z') }, create: { id: `${DEMO_PREFIX}talent`, email: `${DEMO_PREFIX}talent@cofound.mg`, status: AccountStatus.ACTIVE, platformRole: PlatformRole.TALENT, activatedAt: new Date('2026-01-15T00:00:00Z'), locale: 'fr' } })
    const partnerUser = await tx.user.upsert({ where: { email: `${DEMO_PREFIX}partner@cofound.mg` }, update: { status: AccountStatus.ACTIVE, platformRole: PlatformRole.ORG_MEMBER }, create: { id: `${DEMO_PREFIX}partner-user`, email: `${DEMO_PREFIX}partner@cofound.mg`, status: AccountStatus.ACTIVE, platformRole: PlatformRole.ORG_MEMBER, locale: 'fr' } })

    await tx.talentProfile.upsert({ where: { userId: talent.id }, update: { pseudonym: 'Talenta Demo', fieldId: field.id, cohortYear: 2026, headline: 'Projet numérique à impact', completion: 90, visibleInTalentFeed: true }, create: { userId: talent.id, pseudonym: 'Talenta Demo', avatarSeed: `${DEMO_PREFIX}talent`, fieldId: field.id, cohortYear: 2026, headline: 'Projet numérique à impact', completion: 90, visibleInTalentFeed: true } })
    await tx.talentIdentity.upsert({ where: { userId: talent.id }, update: { firstName: 'Demo', lastName: 'Talent', regionId: region.id }, create: { userId: talent.id, firstName: 'Demo', lastName: 'Talent', regionId: region.id } })

    await tx.organizationMember.upsert({ where: { organizationId_userId: { organizationId: institution.id, userId: staff.id } }, update: { role: OrganizationRole.ORG_ADMIN }, create: { organizationId: institution.id, userId: staff.id, role: OrganizationRole.ORG_ADMIN } })
    await tx.organizationMember.upsert({ where: { organizationId_userId: { organizationId: partner.id, userId: partnerUser.id } }, update: { role: OrganizationRole.ORG_ADMIN }, create: { organizationId: partner.id, userId: partnerUser.id, role: OrganizationRole.ORG_ADMIN } })
    await tx.affiliation.upsert({ where: { userId_organizationId: { userId: talent.id, organizationId: institution.id } }, update: { status: AffiliationStatus.ACTIVE, isCertifying: true, fieldId: field.id, cohortYear: 2026, changedById: staff.id }, create: { userId: talent.id, organizationId: institution.id, status: AffiliationStatus.ACTIVE, isCertifying: true, fieldId: field.id, cohortYear: 2026, changedById: staff.id } })
    await tx.organizationCapability.upsert({ where: { organizationId_capability: { organizationId: partner.id, capability: OrganizationCapabilityName.PUBLISH_OPPORTUNITY } }, update: { grantedById: staff.id }, create: { organizationId: partner.id, capability: OrganizationCapabilityName.PUBLISH_OPPORTUNITY, grantedById: staff.id } })

    const project = await tx.project.upsert({ where: { id: `${DEMO_PREFIX}project` }, update: { title: 'Projet Démonstration', pitch: 'Une solution numérique pour faciliter l’accès aux opportunités.', status: ProjectStatus.RECRUITING, sectorId: sector.id, regionId: region.id, publishedAt: new Date('2026-02-01T00:00:00Z') }, create: { id: `${DEMO_PREFIX}project`, title: 'Projet Démonstration', pitch: 'Une solution numérique pour faciliter l’accès aux opportunités.', status: ProjectStatus.RECRUITING, sectorId: sector.id, regionId: region.id, createdById: talent.id, publishedAt: new Date('2026-02-01T00:00:00Z') } })
    await tx.projectMember.upsert({ where: { projectId_userId: { projectId: project.id, userId: talent.id } }, update: { role: ProjectRole.OWNER }, create: { projectId: project.id, userId: talent.id, role: ProjectRole.OWNER } })
    await tx.opportunity.upsert({ where: { id: `${DEMO_PREFIX}opportunity` }, update: { organizationId: partner.id, type: OpportunityType.CALL_FOR_APPLICATIONS, title: 'Appel Démonstration', description: 'Une opportunité reconstructible pour la recette.', status: OpportunityStatus.PUBLISHED, deadline: new Date('2026-12-31T00:00:00Z'), seats: 10 }, create: { id: `${DEMO_PREFIX}opportunity`, organizationId: partner.id, type: OpportunityType.CALL_FOR_APPLICATIONS, title: 'Appel Démonstration', description: 'Une opportunité reconstructible pour la recette.', status: OpportunityStatus.PUBLISHED, deadline: new Date('2026-12-31T00:00:00Z'), seats: 10 } })
  })
}

seedDemo().then(() => prisma.$disconnect()).catch(async (error: unknown) => { console.error(error); await prisma.$disconnect(); process.exitCode = 1 })

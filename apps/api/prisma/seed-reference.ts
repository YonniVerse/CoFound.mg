import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const skills = [
  ['frontend', 'reference.skill.frontend', 'technical', 10],
  ['backend', 'reference.skill.backend', 'technical', 20],
  ['mobile', 'reference.skill.mobile', 'technical', 30],
  ['data', 'reference.skill.data', 'technical', 40],
  ['design', 'reference.skill.design', 'creative', 50],
  ['marketing', 'reference.skill.marketing', 'business', 60],
  ['finance', 'reference.skill.finance', 'business', 70],
  ['legal', 'reference.skill.legal', 'support', 80],
  ['communication', 'reference.skill.communication', 'support', 90],
  ['project-management', 'reference.skill.projectManagement', 'support', 100],
] as const

const fields = [
  ['computer-science', 'reference.field.computerScience', 10],
  ['law', 'reference.field.law', 20],
  ['economics', 'reference.field.economics', 30],
  ['management', 'reference.field.management', 40],
  ['communication', 'reference.field.communication', 50],
  ['engineering', 'reference.field.engineering', 60],
  ['design', 'reference.field.design', 70],
  ['agriculture', 'reference.field.agriculture', 80],
] as const

const sectors = [
  ['agriculture', 'reference.sector.agriculture', 10],
  ['education', 'reference.sector.education', 20],
  ['health', 'reference.sector.health', 30],
  ['finance', 'reference.sector.finance', 40],
  ['digital', 'reference.sector.digital', 50],
  ['environment', 'reference.sector.environment', 60],
  ['tourism', 'reference.sector.tourism', 70],
  ['creative-industries', 'reference.sector.creativeIndustries', 80],
] as const

const regions = [
  ['analamanga', 'reference.region.analamanga'],
  ['diana', 'reference.region.diana'],
  ['sava', 'reference.region.sava'],
  ['haute-matsiatra', 'reference.region.hauteMatsiatra'],
  ['boeny', 'reference.region.boeny'],
  ['atsinanana', 'reference.region.atsinanana'],
] as const

async function seedReferenceData(): Promise<void> {
  for (const [slug, labelKey, category, sortOrder] of skills) {
    await prisma.skill.upsert({
      where: { slug },
      update: { labelKey, category, sortOrder, isActive: true },
      create: { slug, labelKey, category, sortOrder },
    })
  }

  for (const [slug, labelKey, sortOrder] of fields) {
    await prisma.field.upsert({
      where: { slug },
      update: { labelKey, sortOrder, isActive: true },
      create: { slug, labelKey, sortOrder },
    })
  }

  for (const [slug, labelKey, sortOrder] of sectors) {
    await prisma.sector.upsert({
      where: { slug },
      update: { labelKey, sortOrder, isActive: true },
      create: { slug, labelKey, sortOrder },
    })
  }

  for (const [slug, labelKey] of regions) {
    await prisma.region.upsert({
      where: { slug },
      update: { labelKey, countryCode: 'MG', isActive: true },
      create: { slug, labelKey, countryCode: 'MG' },
    })
  }
}

seedReferenceData()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error: unknown) => {
    console.error(error)
    await prisma.$disconnect()
    process.exitCode = 1
  })

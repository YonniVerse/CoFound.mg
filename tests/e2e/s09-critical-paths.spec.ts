import { test, expect, type Page } from '@playwright/test'

const talentEmail = process.env.E2E_TALENT_EMAIL ?? 'demo-talent@cofound.mg'
const talentPassword = process.env.E2E_TALENT_PASSWORD
const institutionEmail = process.env.E2E_INSTITUTION_EMAIL ?? 'demo-staff@cofound.mg'
const institutionPassword = process.env.E2E_INSTITUTION_PASSWORD
const partnerEmail = process.env.E2E_PARTNER_EMAIL ?? 'demo-partner@cofound.mg'
const partnerPassword = process.env.E2E_PARTNER_PASSWORD

async function login(page: Page, email: string, password: string | undefined) {
  test.skip(!password, `Mot de passe E2E manquant pour ${email}`)
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/mot de passe|password/i).fill(password!)
  await page.getByRole('button', { name: /se connecter|connexion|login/i }).click()
  await expect(page).not.toHaveURL(/\/login$/)
}

test.describe('S-09 — parcours critiques', () => {
  test('activation → profil → candidature', async ({ page }) => {
    const activationToken = process.env.E2E_ACTIVATION_TOKEN
    test.skip(!activationToken, 'Jeton d’activation E2E manquant')
    await page.goto(`/activation/${activationToken}`)
    await expect(page.getByRole('heading')).toBeVisible()
    await expect(page.getByRole('button', { name: /activer|continuer/i })).toBeVisible()
    await page.getByRole('button', { name: /activer|continuer/i }).click()
    await expect(page).toHaveURL(/onboarding|profile|feed/)

    await login(page, talentEmail, talentPassword)
    await page.goto('/profile/me')
    await expect(page.getByRole('heading')).toBeVisible()
    await page.goto('/projects')
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('import → invitation', async ({ page }) => {
    await login(page, institutionEmail, institutionPassword)
    await page.goto('/institution/imports/new')
    await expect(page.getByRole('heading')).toBeVisible()
    await expect(page.getByRole('main')).toContainText(/import|fichier|colonnes/i)
    await page.goto('/institution/members')
    await expect(page.getByRole('heading')).toBeVisible()
    await expect(page.getByRole('main')).toContainText(/membre|inviter/i)
  })

  test('partenaire → opportunité', async ({ page }) => {
    await login(page, partnerEmail, partnerPassword)
    await page.goto('/opportunities')
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('main')).toContainText(/opportunit|appel|offre/i)
  })
})

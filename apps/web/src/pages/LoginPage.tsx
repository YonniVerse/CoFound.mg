import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, ShieldCheck, ArrowUpRight, Network } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogoSVG } from '@/components/ui/LogoSVG'
import { LanguageSwitcher, useI18n } from '@/i18n'
import { useAuth } from '@/hooks/useAuth'
import { ApiClientError } from '@/lib/api-client'

export default function LoginPage() {
  const { t } = useI18n()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login(email.trim(), password)
      navigate('/feed', { replace: true })
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          setError(t('auth.login.error.invalidCredentials'))
        } else if (err.status === 403) {
          setError(
            err.messageKey.includes('frozen')
              ? t('auth.login.error.accountFrozen')
              : t('auth.login.error.accountDisabled'),
          )
        } else {
          setError(t('auth.login.error.generic'))
        }
      } else {
        setError(t('auth.login.error.generic'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background font-sans">
      {/* LEFT COLUMN: Form Container */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative z-10">
        {/* Top Header Navigation */}
        <header className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t('auth.backHome')}
          </Link>
          <LanguageSwitcher />
        </header>

        {/* Main Form Center */}
        <main className="my-auto py-8 max-w-md w-full mx-auto space-y-6">
          {/* Brand Identity & Heading */}
          <div className="space-y-3">
            <Link to="/" aria-label="CoFound.mg" className="inline-block">
              <LogoSVG className="h-10 w-auto" />
            </Link>

            <div className="space-y-1.5">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {t('auth.login.title')}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {t('auth.login.subtitle')}
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 p-3.5 text-xs sm:text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span className="font-medium leading-snug">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="login-email" className="text-xs font-semibold text-foreground">
                {t('auth.login.email')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={t('auth.login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-lg border-border bg-card pl-9 text-xs shadow-2xs focus-visible:ring-2 focus-visible:ring-primary sm:text-sm"
                  aria-invalid={error ? true : undefined}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="text-xs font-semibold text-foreground">
                  {t('auth.login.password')}
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder={t('auth.login.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-10 text-xs sm:text-sm rounded-xl border-border bg-card shadow-2xs focus-visible:ring-2 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 h-9 w-full gap-1.5 rounded-lg px-3.5 text-xs font-medium shadow-none transition-colors sm:text-sm"
            >
              {isSubmitting ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  {t('auth.login.loading')}
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  {t('auth.login.submit')}
                </>
              )}
            </Button>
          </form>

          {/* Subtle SaaS Access Note */}
          <div className="pt-4 border-t border-border/60 flex items-start gap-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-muted-foreground/70 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="font-medium text-foreground">{t('auth.login.noAccount')}</span> — {t('auth.login.noAccountHint')}
            </p>
          </div>
        </main>

        {/* Bottom Footer */}
        <footer className="text-xs text-muted-foreground/70 text-center lg:text-left">
          © {new Date().getFullYear()} CoFound.mg · Tous droits réservés.
        </footer>
      </div>

      {/* RIGHT COLUMN: Composition thématique inspirée de la référence */}
      <div className="relative hidden min-h-screen overflow-hidden border-l border-border lg:col-span-6 lg:flex lg:items-center lg:justify-center xl:col-span-7">
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-primary via-impact to-secondary" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:4rem_4rem]"
        />
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/30" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-24 h-96 w-96 rounded-full border border-white/20" />

        <div className="relative z-10 min-h-[680px] w-full max-w-2xl px-8 py-10 text-foreground lg:px-10">
          <div className="flex items-center justify-end text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/25 bg-white/15 backdrop-blur-sm">
              <Network className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
          </div>

          <div className="relative mt-8 min-h-[620px]">
            <div aria-hidden="true" className="absolute left-8 top-8 h-44 w-44 rounded-full bg-white/20 blur-3xl" />

            {/* Grande card principale : l’espace où une équipe prend forme */}
            <div className="relative z-20 mx-auto w-[calc(100%-4rem)] max-w-[32rem] rounded-2xl border border-white/70 bg-background p-5 shadow-2xl sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-black text-primary-foreground shadow-sm">
                    C
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {t('auth.login.hero.cardProjectLabel')}
                    </p>
                    <h2 className="mt-1 font-heading text-xl font-black leading-tight text-foreground sm:text-2xl">
                      {t('auth.login.hero.cardProjectTitle')}
                    </h2>
                    <p className="mt-1 truncate text-xs font-medium text-muted-foreground sm:text-sm">
                      {t('auth.login.hero.cardProjectMeta')}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-md bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary sm:text-xs">
                  {t('auth.login.hero.cardProjectBadge')}
                </span>
              </div>

              <p className="mt-7 max-w-lg text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
                {t('auth.login.hero.body')}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {["auth.login.hero.cardProjectSkillOne", "auth.login.hero.cardProjectSkillTwo", "auth.login.hero.cardProjectSkillThree"].map((key) => (
                  <span key={key} className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    {t(key as 'auth.login.hero.cardProjectSkillOne' | 'auth.login.hero.cardProjectSkillTwo' | 'auth.login.hero.cardProjectSkillThree')}
                  </span>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 border-t border-border/60 pt-5">
                <div className="rounded-lg border border-border/70 bg-muted/40 p-3">
                  <p className="text-2xl font-black text-primary">01</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">{t('auth.login.hero.statProjects')}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/40 p-3">
                  <p className="text-2xl font-black text-secondary">02</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">{t('auth.login.hero.statTalents')}</p>
                </div>
              </div>
            </div>

            {/* Cards flottantes : des repères vivants autour de l’écosystème */}
            <div className="animate-cof-float-slow absolute -left-1 top-4 z-30 hidden w-44 -rotate-6 rounded-xl border border-border/80 bg-background p-4 shadow-xl sm:block">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('auth.login.hero.cardExploreLabel')}</span>
                <ArrowUpRight className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <p className="mt-5 font-heading text-base font-black leading-tight text-foreground">{t('auth.login.hero.cardExploreTitle')}</p>
              <p className="mt-2 text-xs font-medium leading-snug text-muted-foreground">{t('auth.login.hero.cardExploreMeta')}</p>
              <div className="mt-4 flex gap-1">
                <span className="h-1.5 flex-1 rounded-full bg-primary" />
                <span className="h-1.5 flex-1 rounded-full bg-primary/50" />
                <span className="h-1.5 flex-1 rounded-full bg-primary/20" />
              </div>
            </div>

            <div className="animate-cof-float absolute -right-1 top-20 z-30 hidden w-48 rotate-3 rounded-xl border border-border/80 bg-background p-4 shadow-xl sm:block">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('auth.login.hero.cardMatchLabel')}</span>
                <ArrowUpRight className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <p className="mt-5 font-heading text-base font-black leading-tight text-foreground">{t('auth.login.hero.cardMatchTitle')}</p>
              <p className="mt-2 text-xs font-medium text-muted-foreground">{t('auth.login.hero.cardMatchMeta')}</p>
              <div className="mt-4 flex gap-1">
                <span className="h-1.5 flex-1 rounded-full bg-primary" />
                <span className="h-1.5 flex-1 rounded-full bg-primary/60" />
                <span className="h-1.5 flex-1 rounded-full bg-primary/25" />
              </div>
            </div>

            <div className="animate-cof-float-slow absolute -right-2 top-72 z-30 hidden w-44 rotate-[-4deg] rounded-xl border border-white/30 bg-primary p-4 text-primary-foreground shadow-xl sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/75">{t('auth.login.hero.cardCommunityLabel')}</p>
              <p className="mt-5 font-heading text-xl font-black leading-none">{t('auth.login.hero.cardCommunityTitle')}</p>
              <p className="mt-2 text-xs font-medium leading-snug text-primary-foreground/75">{t('auth.login.hero.cardCommunityMeta')}</p>
              <div className="mt-4 flex -space-x-1">
                <span className="h-6 w-6 rounded-full border-2 border-primary bg-secondary" />
                <span className="h-6 w-6 rounded-full border-2 border-primary bg-impact" />
                <span className="h-6 w-6 rounded-full border-2 border-primary bg-background" />
              </div>
            </div>

            <div className="animate-cof-float absolute -bottom-1 left-1 z-30 w-48 -rotate-3 rounded-xl border border-white/30 bg-secondary p-4 text-secondary-foreground shadow-xl">
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-75">{t('auth.login.hero.cardImpactLabel')}</p>
              <p className="mt-5 font-heading text-2xl font-black leading-none">{t('auth.login.hero.cardImpactTitle')}</p>
              <p className="mt-2 text-xs font-medium opacity-80">{t('auth.login.hero.cardImpactMeta')}</p>
              <div className="mt-4 h-1.5 w-full rounded-full bg-secondary-foreground/20"><div className="h-full w-3/4 rounded-full bg-secondary-foreground" /></div>
            </div>

            <div className="animate-cof-float-slow absolute -bottom-5 right-3 z-30 w-48 rotate-2 rounded-xl border border-border/80 bg-background p-4 shadow-xl">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">{t('auth.login.hero.cardTrustLabel')}</span>
              </div>
              <p className="mt-5 font-heading text-base font-black leading-tight text-foreground">{t('auth.login.hero.cardTrustTitle')}</p>
              <p className="mt-2 text-xs font-medium text-muted-foreground">{t('auth.login.hero.cardTrustMeta')}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

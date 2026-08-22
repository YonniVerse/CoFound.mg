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
    <div className="grid h-screen grid-cols-1 overflow-hidden bg-background font-sans lg:grid-cols-12">
      {/* LEFT COLUMN: Form Container */}
      <div className="relative z-10 flex min-h-0 flex-col justify-between overflow-hidden p-6 sm:p-10 lg:col-span-6 lg:p-14 xl:col-span-5">
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
        <main className="my-auto w-full max-w-md space-y-6 py-8 mx-auto">
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

        <div className="relative z-10 flex h-full min-h-0 w-full max-w-2xl flex-col px-6 py-8 text-foreground lg:px-10 lg:py-10">
          <div className="flex items-center justify-end text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/25 bg-white/15 backdrop-blur-sm">
              <Network className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
          </div>

          <div className="relative mt-6 min-h-0 flex-1">
            <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 h-full w-full" viewBox="0 0 560 680" preserveAspectRatio="none" fill="none">
              <path d="M172 104 C 244 152, 264 196, 286 262" stroke="var(--primary)" strokeWidth="2" strokeDasharray="6 8" className="opacity-70" />
              <path d="M392 226 C 360 274, 334 300, 300 340" stroke="var(--secondary)" strokeWidth="2" strokeDasharray="6 8" className="opacity-70" />
              <path d="M282 386 C 250 432, 232 468, 194 522" stroke="var(--impact)" strokeWidth="2" strokeDasharray="6 8" className="opacity-65" />
              <path d="M358 434 C 374 482, 394 520, 420 568" stroke="var(--primary)" strokeWidth="2" strokeDasharray="6 8" className="opacity-60" />
              <circle cx="286" cy="262" r="5" fill="var(--primary)" />
              <circle cx="300" cy="340" r="5" fill="var(--secondary)" />
              <circle cx="194" cy="522" r="5" fill="var(--impact)" />
            </svg>

            {/* Projet principal */}
            <div className="absolute left-[3%] top-[2%] z-10 flex h-[31%] w-[48%] max-w-xs min-w-0 flex-col rounded-2xl border border-border/80 bg-card p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-base font-black text-primary-foreground shadow-sm">C</div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-primary sm:text-[10px]">{t('auth.login.hero.cardProjectLabel')}</p>
                  <h2 className="mt-1 max-w-full break-words font-heading text-[clamp(0.95rem,1.45vw,1.2rem)] font-black leading-[1.08] text-foreground">{t('auth.login.hero.cardProjectTitle')}</h2>
                  <p className="mt-1 break-words text-[10px] font-medium leading-tight text-muted-foreground sm:text-xs">{t('auth.login.hero.cardProjectMeta')}</p>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                <span className="min-w-0 truncate rounded-md bg-primary/10 px-2 py-1 text-[9px] font-semibold text-primary">{t('auth.login.hero.cardProjectBadge')}</span>
                <span className="shrink-0 text-[10px] font-semibold text-secondary">01</span>
              </div>
            </div>

            {/* Exploration */}
            <div className="absolute right-[3%] top-[12%] z-10 flex h-[22%] w-[48%] max-w-xs min-w-0 rotate-3 flex-col rounded-2xl border border-border/80 bg-card p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:rotate-0 hover:shadow-xl sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('auth.login.hero.cardExploreLabel')}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              </div>
              <p className="mt-auto break-words font-heading text-base font-black leading-tight text-foreground sm:text-lg">{t('auth.login.hero.cardExploreTitle')}</p>
              <p className="mt-2 break-words text-xs font-medium leading-snug text-muted-foreground">{t('auth.login.hero.cardExploreMeta')}</p>
              <div className="mt-3 flex gap-1"><span className="h-1.5 flex-1 rounded-full bg-primary" /><span className="h-1.5 flex-1 rounded-full bg-primary/50" /><span className="h-1.5 flex-1 rounded-full bg-primary/20" /></div>
            </div>

            {/* Complémentarité */}
            <div className="absolute left-[5%] top-[35%] z-10 flex h-[22%] w-[48%] max-w-xs min-w-0 -rotate-2 flex-col rounded-2xl border border-border/80 bg-card p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:rotate-0 hover:shadow-xl sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('auth.login.hero.cardMatchLabel')}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              </div>
              <p className="mt-auto break-words font-heading text-base font-black leading-tight text-foreground sm:text-lg">{t('auth.login.hero.cardMatchTitle')}</p>
              <p className="mt-2 break-words text-xs font-medium leading-snug text-muted-foreground">{t('auth.login.hero.cardMatchMeta')}</p>
              <div className="mt-3 flex gap-1"><span className="h-1.5 flex-1 rounded-full bg-primary" /><span className="h-1.5 flex-1 rounded-full bg-primary/60" /><span className="h-1.5 flex-1 rounded-full bg-primary/25" /></div>
            </div>

            {/* Communauté */}
            <div className="absolute right-[4%] top-[39%] z-10 flex h-[21%] w-[48%] max-w-xs min-w-0 rotate-2 flex-col rounded-2xl border border-border/80 border-t-4 border-t-primary bg-card p-4 text-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:rotate-0 hover:shadow-xl sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{t('auth.login.hero.cardCommunityLabel')}</p>
              <p className="mt-auto break-words font-heading text-lg font-black leading-tight text-foreground sm:text-xl">{t('auth.login.hero.cardCommunityTitle')}</p>
              <p className="mt-2 break-words text-xs font-medium leading-snug text-muted-foreground">{t('auth.login.hero.cardCommunityMeta')}</p>
              <div className="mt-3 flex -space-x-1"><span className="h-6 w-6 rounded-full border-2 border-card bg-secondary" /><span className="h-6 w-6 rounded-full border-2 border-card bg-impact" /><span className="h-6 w-6 rounded-full border-2 border-card bg-background" /></div>
            </div>

            {/* Impact collectif */}
            <div className="absolute bottom-[12%] left-[3%] z-10 flex h-[20%] w-[48%] max-w-xs min-w-0 -rotate-3 flex-col rounded-2xl border border-border/80 border-t-4 border-t-secondary bg-card p-4 text-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:rotate-0 hover:shadow-xl sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">{t('auth.login.hero.cardImpactLabel')}</p>
              <p className="mt-auto break-words font-heading text-xl font-black leading-tight text-foreground sm:text-2xl">{t('auth.login.hero.cardImpactTitle')}</p>
              <p className="mt-2 break-words text-xs font-medium text-muted-foreground">{t('auth.login.hero.cardImpactMeta')}</p>
              <div className="mt-3 h-1.5 w-full rounded-full bg-secondary/20"><div className="h-full w-3/4 rounded-full bg-secondary" /></div>
            </div>

            {/* Cadre de confiance */}
            <div className="absolute bottom-[7%] right-[3%] z-10 flex h-[20%] w-[48%] max-w-xs min-w-0 rotate-2 flex-col rounded-2xl border border-border/80 bg-card p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:rotate-0 hover:shadow-xl sm:p-5">
              <div className="flex items-center gap-2 text-primary"><ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="text-[10px] font-semibold uppercase tracking-wider">{t('auth.login.hero.cardTrustLabel')}</span></div>
              <p className="mt-auto break-words font-heading text-base font-black leading-tight text-foreground sm:text-lg">{t('auth.login.hero.cardTrustTitle')}</p>
              <p className="mt-2 break-words text-xs font-medium leading-snug text-muted-foreground">{t('auth.login.hero.cardTrustMeta')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

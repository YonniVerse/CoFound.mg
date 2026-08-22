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
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={t('auth.login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border border-border/80 bg-card pl-10 pr-4 text-sm font-medium shadow-2xs transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 sm:text-sm"
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
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder={t('auth.login.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border border-border/80 bg-card pl-10 pr-12 text-sm font-medium shadow-2xs transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
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

      {/* RIGHT COLUMN: Composition thématique cohérente avec le landing */}
      <div className="relative hidden min-h-0 overflow-hidden bg-linear-to-br from-primary via-impact to-secondary lg:col-span-6 lg:flex lg:items-center lg:justify-center xl:col-span-7">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-20 h-full w-14 text-background"
          viewBox="0 0 56 900"
          preserveAspectRatio="none"
          fill="none"
        >
          <path d="M0 0H34C52 78 8 156 34 244C54 330 10 418 34 510C56 596 8 684 34 776C48 830 42 866 24 900H0Z" fill="currentColor" />
          <path d="M34 0C52 78 8 156 34 244C54 330 10 418 34 510C56 596 8 684 34 776C48 830 42 866 24 900" stroke="var(--border)" strokeWidth="1.5" />
        </svg>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full text-white/25"
          viewBox="0 0 800 900"
          preserveAspectRatio="none"
          fill="none"
        >
          <path d="M-80 160 C 120 20, 250 300, 470 170 S 700 50, 900 210" stroke="currentColor" strokeWidth="2" />
          <path d="M-100 470 C 140 300, 280 590, 520 430 S 730 300, 920 510" stroke="currentColor" strokeWidth="1.5" />
          <path d="M-100 760 C 160 590, 310 860, 560 700 S 760 600, 920 770" stroke="currentColor" strokeWidth="2" />
        </svg>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.14)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_55%,transparent_100%)] opacity-60"
        />

        <div className="relative z-10 flex h-full min-h-0 w-full max-w-2xl flex-col px-6 py-8 text-foreground lg:px-10 lg:py-10">
          <div className="flex items-center justify-end text-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card shadow-2xs">
              <Network className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-6 grid min-h-0 flex-1 grid-cols-2 grid-rows-[1.2fr_1fr_1fr] gap-4 pb-2">
            {/* Exploration : première card sur les deux colonnes */}
              <div className="col-span-2 flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-primary/40 bg-card/95 p-4 shadow-xl shadow-foreground/15 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-5">
              <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('auth.login.hero.cardExploreLabel')}</span><ArrowUpRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /></div>
              <p className="mt-auto line-clamp-2 break-words font-heading text-xl font-black leading-tight text-foreground sm:text-2xl">{t('auth.login.hero.cardExploreTitle')}</p>
              <p className="mt-2 line-clamp-2 break-words text-xs font-medium leading-snug text-muted-foreground sm:text-sm">{t('auth.login.hero.cardExploreMeta')}</p>
              <div className="mt-3 flex gap-1"><span className="h-1.5 flex-1 rounded-full bg-primary" /><span className="h-1.5 flex-1 rounded-full bg-primary/50" /><span className="h-1.5 flex-1 rounded-full bg-primary/20" /></div>
            </div>

            {/* Complémentarité */}
              <div className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-impact/45 bg-impact-light/95 p-4 shadow-xl shadow-foreground/15 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-5">
              <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('auth.login.hero.cardMatchLabel')}</span><ArrowUpRight className="h-4 w-4 shrink-0 text-impact" aria-hidden="true" /></div>
              <p className="mt-auto line-clamp-2 break-words font-heading text-base font-black leading-tight text-foreground sm:text-lg">{t('auth.login.hero.cardMatchTitle')}</p>
              <p className="mt-2 line-clamp-2 break-words text-xs font-medium leading-snug text-muted-foreground">{t('auth.login.hero.cardMatchMeta')}</p>
              <div className="mt-3 flex gap-1"><span className="h-1.5 flex-1 rounded-full bg-impact" /><span className="h-1.5 flex-1 rounded-full bg-impact/60" /><span className="h-1.5 flex-1 rounded-full bg-impact/25" /></div>
            </div>

            {/* Communauté */}
              <div className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-primary-foreground/45 bg-primary p-4 text-primary-foreground shadow-xl shadow-foreground/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/80">{t('auth.login.hero.cardCommunityLabel')}</p>
              <p className="mt-auto line-clamp-2 break-words font-heading text-lg font-black leading-tight text-primary-foreground sm:text-xl">{t('auth.login.hero.cardCommunityTitle')}</p>
              <p className="mt-2 line-clamp-2 break-words text-xs font-medium leading-snug text-primary-foreground/80">{t('auth.login.hero.cardCommunityMeta')}</p>
              <div className="mt-3 flex -space-x-1"><span className="h-6 w-6 rounded-full border-2 border-primary bg-secondary" /><span className="h-6 w-6 rounded-full border-2 border-primary bg-impact" /><span className="h-6 w-6 rounded-full border-2 border-primary bg-primary-foreground" /></div>
            </div>

            {/* Impact collectif */}
              <div className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-destructive-foreground/45 bg-destructive p-4 text-destructive-foreground shadow-xl shadow-foreground/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-destructive-foreground/85">{t('auth.login.hero.cardImpactLabel')}</p>
              <p className="mt-auto line-clamp-2 break-words font-heading text-xl font-black leading-tight text-destructive-foreground sm:text-2xl">{t('auth.login.hero.cardImpactTitle')}</p>
              <div className="mt-3 h-1.5 w-full rounded-full bg-destructive-foreground/25"><div className="h-full w-3/4 rounded-full bg-destructive-foreground" /></div>
            </div>

            {/* Cadre de confiance */}
              <div className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-4 shadow-xl shadow-foreground/15 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-5">
              <div className="flex items-center gap-2 text-primary"><ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="text-[10px] font-semibold uppercase tracking-wider">{t('auth.login.hero.cardTrustLabel')}</span></div>
              <p className="mt-auto line-clamp-2 break-words font-heading text-base font-black leading-tight text-foreground sm:text-lg">{t('auth.login.hero.cardTrustTitle')}</p>
              <p className="mt-2 line-clamp-2 break-words text-xs font-medium leading-snug text-muted-foreground">{t('auth.login.hero.cardTrustMeta')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

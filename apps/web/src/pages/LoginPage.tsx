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

      {/* RIGHT COLUMN: Composition éditoriale, sans image */}
      <div className="relative hidden min-h-screen overflow-hidden border-l border-border bg-foreground lg:col-span-6 lg:flex lg:items-center lg:justify-center xl:col-span-7">
        {/* Grille de fond : repère visuel discret, sans dépendance à un asset */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:4rem_4rem]"
        />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-background/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full border border-primary/30" />

        <div className="relative z-10 flex min-h-[calc(100vh-5rem)] w-full max-w-2xl flex-col justify-between rounded-2xl border border-background/15 bg-background/[0.06] p-8 text-background shadow-2xl backdrop-blur-sm lg:p-10">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-background/60">
              {t('auth.login.hero.eyebrow')}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-background/15 bg-background/10">
              <Network className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
          </div>

          <div className="relative py-10">
            <div aria-hidden="true" className="absolute -left-8 top-2 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative max-w-xl">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {t('auth.login.hero.brand')}
              </p>
              <h2 className="max-w-lg font-heading text-4xl font-black leading-[0.98] tracking-[-0.05em] text-background sm:text-5xl lg:text-6xl">
                {t('auth.login.hero.title')}
              </h2>
              <p className="mt-6 max-w-md text-sm font-medium leading-relaxed text-background/70 sm:text-base">
                {t('auth.login.hero.body')}
              </p>

              <div className="mt-10 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
                {["auth.login.hero.statProjects", "auth.login.hero.statTalents", "auth.login.hero.statImpact"].map((key, index) => (
                  <div key={key} className="rounded-xl border border-background/15 bg-background/[0.06] p-4">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-lg font-black text-background/90">0{index + 1}</span>
                      <ArrowUpRight className="h-4 w-4 text-primary" aria-hidden="true" />
                    </div>
                    <p className="text-xs font-medium leading-snug text-background/65">{t(key as 'auth.login.hero.statProjects' | 'auth.login.hero.statTalents' | 'auth.login.hero.statImpact')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-background/15 pt-5 text-xs font-medium text-background/55">
            <span>{t('auth.login.hero.brand')}</span>
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" /> {t('auth.login.hero.tagline')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

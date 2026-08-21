import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, ShieldCheck, Sparkles, Users, Award } from 'lucide-react'
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
        <main className="my-auto py-8 max-w-md w-full mx-auto space-y-8">
          {/* Brand Identity & Heading */}
          <div className="space-y-4">
            <Link to="/" aria-label="CoFound.mg" className="inline-block">
              <LogoSVG className="h-11 w-auto" />
            </Link>

            <div className="space-y-2">
              <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                {t('auth.login.title')}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {t('auth.login.subtitle')}
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <span className="font-medium leading-snug">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-sm font-semibold text-foreground">
                {t('auth.login.email')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={t('auth.login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 text-sm rounded-xl border-border bg-card shadow-2xs focus-visible:ring-2 focus-visible:ring-primary"
                  aria-invalid={error ? true : undefined}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="text-sm font-semibold text-foreground">
                  {t('auth.login.password')}
                </Label>
                <Link
                  to="/mot-de-passe-oublie"
                  className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder={t('auth.login.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-11 h-12 text-sm rounded-xl border-border bg-card shadow-2xs focus-visible:ring-2 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200 gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
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

          {/* Invitation Info Box (Decision D1) */}
          <div className="rounded-xl bg-muted/60 border border-border/80 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>{t('auth.login.noAccount')}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('auth.login.noAccountHint')}
            </p>
          </div>
        </main>

        {/* Bottom Footer */}
        <footer className="text-xs text-muted-foreground/70 text-center lg:text-left">
          © {new Date().getFullYear()} CoFound.mg · Tous droits réservés.
        </footer>
      </div>

      {/* RIGHT COLUMN: Visual Hero (Desktop only) */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative bg-slate-950 flex-col justify-between p-12 overflow-hidden">
        {/* Ambient Radial Lighting Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Embedded 3D Illustration */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity hover:opacity-50 transition-opacity duration-700 bg-cover bg-center"
             style={{ backgroundImage: `url('/images/auth-hero.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-1" />

        {/* Floating Top Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1.5 border border-white/15 text-white text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-secondary" />
            <span>L'écosystème d'innovation universitaire</span>
          </div>
        </div>

        {/* Floating Bottom Card & Stats */}
        <div className="relative z-10 space-y-6 max-w-xl">
          {/* Glassmorphic Metrics Card */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-6 shadow-2xl space-y-4">
            <h3 className="text-white font-heading text-lg font-bold">
              "Ne cherche pas une idée. Trouve ton co-fondateur."
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              L'algorithme de CoFound.mg associe la rigueur technique des développeurs et designers avec la vision des profils business.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-white font-black text-xl">
                  <Users className="h-4 w-4 text-primary-light" />
                  1 200+
                </div>
                <div className="text-[11px] text-white/70 font-medium">Talents certifiés</div>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-white font-black text-xl">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  98%
                </div>
                <div className="text-[11px] text-white/70 font-medium">Matching précis</div>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-white font-black text-xl">
                  <Award className="h-4 w-4 text-emerald-400" />
                  50/50
                </div>
                <div className="text-[11px] text-white/70 font-medium">Engagement Parité</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

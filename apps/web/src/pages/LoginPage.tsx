import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react'
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
                  className="pl-9 h-10 text-xs sm:text-sm rounded-xl border-border bg-card shadow-2xs focus-visible:ring-2 focus-visible:ring-primary"
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
              className="w-full h-10 rounded-xl text-sm font-semibold shadow-xs hover:shadow-sm transition-all duration-200 gap-2 mt-1"
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

      {/* RIGHT COLUMN: Image Area (Desktop only) with same Geometric Grid Background as Forgot Password */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative p-6 sm:p-8 lg:p-10 bg-background items-center justify-center overflow-hidden border-l border-border">
        {/* Background Geometric Grid Pattern (Same as Forgot Password) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

        <div className="w-full h-full rounded-2xl overflow-hidden relative border border-border/80 shadow-sm z-10">
          <img
            src="/images/auth-hero.webp"
            alt="CoFound.mg Innovation & Collaboration"
            width={1024}
            height={1024}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>
    </div>
  )
}

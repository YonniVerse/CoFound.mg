import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send, CheckCircle2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogoSVG } from '@/components/ui/LogoSVG'
import { LanguageSwitcher, useI18n } from '@/i18n'
import { apiClient } from '@/lib/api-client'

export default function ForgotPasswordPage() {
  const { t } = useI18n()

  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await apiClient.post('/auth/password-reset/request', {
        email: email.trim(),
      })
    } catch {
      /* Protection contre l'énumération de comptes :
         Affichage identique du succès que l'email existe ou non. */
    }

    setIsSuccess(true)
    setIsSubmitting(false)
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background font-sans">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_65%_at_50%_20%,#000_45%,transparent_100%)] opacity-50"
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <Link
          to="/login"
          className="group inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t('auth.forgotPassword.backToLogin')}
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xs sm:p-8">
          <div className="space-y-3">
            <Link to="/" aria-label="CoFound.mg" className="inline-block">
              <LogoSVG className="h-10 w-auto" />
            </Link>

            <div className="space-y-1.5">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {isSuccess ? t('auth.forgotPassword.successTitle') : t('auth.forgotPassword.title')}
              </h1>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {isSuccess ? t('auth.forgotPassword.success') : t('auth.forgotPassword.subtitle')}
              </p>
            </div>
          </div>

          {isSuccess ? (
            <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-2xs sm:p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </div>

              <Button asChild className="mt-6 h-9 w-full gap-1.5 rounded-lg px-3.5 text-xs font-medium shadow-none transition-colors sm:text-sm">
                <Link to="/login">
                  <ArrowLeft className="h-4 w-4" />
                  {t('auth.forgotPassword.backToLogin')}
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email" className="text-xs font-semibold text-foreground">
                  {t('auth.forgotPassword.email')}
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    required
                    placeholder={t('auth.forgotPassword.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl border border-border/80 bg-background pl-10 pr-4 text-sm font-medium shadow-2xs transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 h-9 w-full gap-1.5 rounded-lg px-3.5 text-xs font-medium shadow-none transition-colors sm:text-sm"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    {t('auth.forgotPassword.loading')}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {t('auth.forgotPassword.submit')}
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 flex items-start gap-2.5 border-t border-border/60 pt-4 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
            <p className="leading-relaxed">{t('auth.forgotPassword.securityNote')}</p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 px-6 py-6 text-center text-xs text-muted-foreground/70 sm:px-10">
        © {new Date().getFullYear()} CoFound.mg · Tous droits réservés.
      </footer>
    </div>
  )
}

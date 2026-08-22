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
    <div className="min-h-screen flex flex-col justify-between bg-background relative overflow-hidden font-sans">
      {/* Background Geometric Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

      {/* Top Header */}
      <header className="flex items-center justify-between px-6 sm:px-10 py-6 relative z-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t('auth.forgotPassword.backToLogin')}
        </Link>
        <LanguageSwitcher />
      </header>

      {/* Main Centered Card Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Brand Logo */}
          <div className="flex justify-center">
            <Link to="/" aria-label="CoFound.mg">
              <LogoSVG className="h-10 w-auto" />
            </Link>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border bg-card shadow-lg p-6 sm:p-8 space-y-6">
            {isSuccess ? (
              /* Success State */
              <div className="space-y-5 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>

                <div className="space-y-1.5">
                  <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                    {t('auth.forgotPassword.successTitle')}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {t('auth.forgotPassword.success')}
                  </p>
                </div>

                <div className="pt-2">
                  <Button asChild className="w-full h-10 rounded-xl text-sm font-semibold gap-2">
                    <Link to="/login">
                      <ArrowLeft className="h-4 w-4" />
                      {t('auth.forgotPassword.backToLogin')}
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              /* Form State */
              <div className="space-y-5">
                <div className="text-center space-y-1.5">
                  <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {t('auth.forgotPassword.title')}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {t('auth.forgotPassword.subtitle')}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="forgot-email" className="text-xs font-semibold text-foreground">
                      {t('auth.forgotPassword.email')}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="forgot-email"
                        type="email"
                        autoComplete="email"
                        autoFocus
                        required
                        placeholder={t('auth.forgotPassword.emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 h-10 text-xs sm:text-sm rounded-xl border-border bg-card shadow-2xs focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 rounded-xl text-sm font-semibold shadow-xs hover:shadow-sm transition-all duration-200 gap-2"
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

                <div className="pt-2 text-center border-t border-border">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {t('auth.forgotPassword.backToLogin')}
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>{t('auth.forgotPassword.securityNote')}</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-xs text-muted-foreground/70 text-center py-6 relative z-10">
        © {new Date().getFullYear()} CoFound.mg · Écosystème Entrepreneurial Étudiant
      </footer>
    </div>
  )
}

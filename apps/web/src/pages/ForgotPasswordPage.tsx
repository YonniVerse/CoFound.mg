import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react'
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
      /* On ne distingue pas « adresse inconnue » de « adresse connue »
         pour ne pas révéler l'existence d'un compte. */
    }

    setIsSuccess(true)
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          to="/connexion"
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('auth.forgotPassword.backToLogin')}
        </Link>
        <LanguageSwitcher />
      </header>

      {/* Centered card */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/" aria-label="CoFound.mg">
              <LogoSVG className="h-10 w-auto" />
            </Link>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border bg-card shadow-lg p-8 space-y-6">
            {/* Heading */}
            <div className="text-center space-y-1.5">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                {t('auth.forgotPassword.title')}
              </h1>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {t('auth.forgotPassword.subtitle')}
              </p>
            </div>

            {isSuccess ? (
              /* Success state */
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    {t('auth.forgotPassword.success')}
                  </p>
                </div>
                <Button variant="outline" size="md" asChild className="w-full">
                  <Link to="/connexion">
                    <ArrowLeft className="h-4 w-4" />
                    {t('auth.forgotPassword.backToLogin')}
                  </Link>
                </Button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">
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
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="md"
                  disabled={isSubmitting}
                  className="w-full gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
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
          </div>
        </div>
      </main>
    </div>
  )
}

import { useState, type FormEvent } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Lock, ArrowLeft, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogoSVG } from '@/components/ui/LogoSVG'
import { LanguageSwitcher, useI18n } from '@/i18n'
import { apiClient, ApiClientError } from '@/lib/api-client'

export default function ResetPasswordPage() {
  const { t } = useI18n()
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (password.length < 12) {
      setError(t('auth.resetPassword.error.tooShort'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('auth.resetPassword.error.mismatch'))
      return
    }

    if (!token) {
      setError(t('auth.resetPassword.error.invalidToken'))
      return
    }

    setIsSubmitting(true)

    try {
      await apiClient.post('/auth/password-reset/complete', {
        token,
        password,
      })
      setIsSuccess(true)
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 400 || err.status === 404) {
          setError(t('auth.resetPassword.error.invalidToken'))
        } else {
          setError(t('common.error'))
        }
      } else {
        setError(t('common.error'))
      }
    } finally {
      setIsSubmitting(false)
    }
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
          {t('auth.resetPassword.backToLogin')}
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
                {t('auth.resetPassword.title')}
              </h1>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {t('auth.resetPassword.subtitle')}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isSuccess ? (
              /* Success state */
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    {t('auth.resetPassword.success')}
                  </p>
                </div>
                <Button size="md" onClick={() => navigate('/connexion')} className="w-full">
                  {t('auth.resetPassword.backToLogin')}
                </Button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reset-password">
                    {t('auth.resetPassword.password')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="reset-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={12}
                      placeholder={t('auth.resetPassword.passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reset-confirm">
                    {t('auth.resetPassword.confirm')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="reset-confirm"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={12}
                      placeholder={t('auth.resetPassword.confirmPlaceholder')}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      {t('auth.resetPassword.loading')}
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      {t('auth.resetPassword.submit')}
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

import { useState, type FormEvent } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowLeft, KeyRound, AlertCircle, CheckCircle2, Check, X, ShieldCheck } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Real-time password criteria evaluation
  const hasMinLength = password.length >= 12
  const hasMix = /[A-Z]/.test(password) && (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password))
  const isMatching = password.length > 0 && password === confirmPassword

  const getStrengthScore = () => {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score += 1
    if (hasMinLength) score += 1
    if (hasMix) score += 1
    if (password.length >= 16) score += 1
    return score
  }

  const strengthScore = getStrengthScore()

  const getStrengthLabel = () => {
    if (strengthScore <= 1) return { label: t('auth.strength.weak'), color: 'bg-destructive' }
    if (strengthScore === 2) return { label: t('auth.strength.fair'), color: 'bg-amber-500' }
    if (strengthScore === 3) return { label: t('auth.strength.good'), color: 'bg-emerald-500' }
    return { label: t('auth.strength.strong'), color: 'bg-primary' }
  }

  const strength = getStrengthLabel()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!hasMinLength) {
      setError(t('auth.resetPassword.error.tooShort'))
      return
    }

    if (!isMatching) {
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
    <div className="min-h-screen flex flex-col justify-between bg-background relative overflow-hidden font-sans">
      {/* Background Geometric Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

      {/* Top Header */}
      <header className="flex items-center justify-between px-6 sm:px-10 py-6 relative z-10">
        <Link
          to="/connexion"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t('auth.resetPassword.backToLogin')}
        </Link>
        <LanguageSwitcher />
      </header>

      {/* Main Centered Card Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Brand Logo */}
          <div className="flex justify-center">
            <Link to="/" aria-label="CoFound.mg">
              <LogoSVG className="h-11 w-auto" />
            </Link>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border bg-card shadow-xl p-8 sm:p-10 space-y-6">
            {isSuccess ? (
              /* Success State */
              <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto text-primary">
                  <CheckCircle2 className="h-7 w-7" />
                </div>

                <div className="space-y-2">
                  <h1 className="font-heading text-2xl font-bold text-foreground">
                    {t('auth.resetPassword.successTitle')}
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('auth.resetPassword.success')}
                  </p>
                </div>

                <div className="pt-2">
                  <Button size="lg" onClick={() => navigate('/connexion')} className="w-full h-12 rounded-xl font-semibold gap-2">
                    {t('auth.resetPassword.backToLogin')}
                  </Button>
                </div>
              </div>
            ) : (
              /* Form State */
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {t('auth.resetPassword.title')}
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('auth.resetPassword.subtitle')}
                  </p>
                </div>

                {/* Error Banner */}
                {error && (
                  <div
                    role="alert"
                    className="flex flex-col gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                      <span className="font-medium leading-snug">{error}</span>
                    </div>
                    {error === t('auth.resetPassword.error.invalidToken') && (
                      <Link
                        to="/mot-de-passe-oublie"
                        className="text-xs font-bold underline hover:no-underline ml-7 transition-colors"
                      >
                        Demander un nouveau lien de réinitialisation
                      </Link>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* New Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="reset-password" className="text-sm font-semibold text-foreground">
                      {t('auth.resetPassword.password')}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="reset-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        placeholder={t('auth.resetPassword.passwordPlaceholder')}
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

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">Robustesse :</span>
                          <span className="font-bold text-foreground">{strength.label}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 h-1.5">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`h-full rounded-full transition-colors duration-300 ${
                                strengthScore >= step ? strength.color : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="reset-confirm" className="text-sm font-semibold text-foreground">
                      {t('auth.resetPassword.confirm')}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="reset-confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        placeholder={t('auth.resetPassword.confirmPlaceholder')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-11 h-12 text-sm rounded-xl border-border bg-card shadow-2xs focus-visible:ring-2 focus-visible:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label={showConfirmPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Real-time Checklist */}
                  <div className="rounded-xl bg-muted/50 border border-border/80 p-3.5 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      {hasMinLength ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                      <span className={hasMinLength ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        {t('auth.strength.ruleLength')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasMix ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                      <span className={hasMix ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        {t('auth.strength.ruleMix')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMatching ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                      <span className={isMatching ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        {t('auth.strength.ruleMatch')}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || !hasMinLength || !isMatching}
                    className="w-full h-12 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200 gap-2"
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
              </div>
            )}
          </div>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Sécurisation de compte CoFound.mg</span>
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

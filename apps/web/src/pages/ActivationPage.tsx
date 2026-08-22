import { useState, type FormEvent } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowLeft, KeyRound, AlertCircle, CheckCircle2, Check, X, ShieldCheck, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { LogoSVG } from '@/components/ui/LogoSVG'
import { LanguageSwitcher, useI18n } from '@/i18n'
import { useAuth } from '@/hooks/useAuth'
import { apiClient, ApiClientError } from '@/lib/api-client'

export default function ActivationPage() {
  const { t, language } = useI18n()
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { setAccessToken } = useAuth()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
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
    if (strengthScore <= 1) return { label: 'Faible', color: 'bg-destructive' }
    if (strengthScore === 2) return { label: 'Moyen', color: 'bg-amber-500' }
    if (strengthScore === 3) return { label: 'Bon', color: 'bg-emerald-500' }
    return { label: 'Très fort', color: 'bg-primary' }
  }

  const strength = getStrengthLabel()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!token) {
      setError(t('auth.activation.error.invalidToken'))
      return
    }

    if (!hasMinLength) {
      setError(t('auth.activation.error.passwordLength'))
      return
    }

    if (!isMatching) {
      setError(t('auth.activation.error.passwordMismatch'))
      return
    }

    if (!acceptTerms) {
      setError(t('auth.activation.error.acceptTerms'))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await apiClient.post<{ accessToken: string }>('/auth/activate', {
        token,
        password,
        locale: language,
        acceptTerms: true,
      })

      if (response?.accessToken) {
        setAccessToken(response.accessToken)
      }

      setIsSuccess(true)

      // Automatically navigate to onboarding after activation
      setTimeout(() => {
        navigate('/onboarding', { replace: true })
      }, 2000)
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401 || err.status === 400 || err.code === 'TOKEN_EXPIRED') {
          setError(t('auth.activation.error.invalidToken'))
        } else {
          setError(t('auth.activation.error.generic'))
        }
      } else {
        setError(t('auth.activation.error.generic'))
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
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t('signup.backHome')}
        </Link>
        <LanguageSwitcher />
      </header>

      {/* Main Content Area */}
      <main className="my-auto py-8 px-4 sm:px-6 relative z-10 w-full max-w-md mx-auto">
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
          {/* Header Identity */}
          <div className="text-center space-y-3">
            <Link to="/" aria-label="CoFound.mg" className="inline-block">
              <LogoSVG className="h-10 w-auto mx-auto" />
            </Link>
            <div className="space-y-1.5">
              <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
                <UserCheck className="h-6 w-6 text-primary shrink-0" />
                {t('auth.activation.title')}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {t('auth.activation.subtitle')}
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

          {/* Success Banner */}
          {isSuccess ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in-95 duration-400">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-foreground">
                  {t('auth.activation.successTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('auth.activation.successSubtitle')}
                </p>
              </div>
              <div className="pt-2">
                <Button
                  onClick={() => navigate('/onboarding', { replace: true })}
                  className="w-full h-10 rounded-xl text-sm font-semibold"
                >
                  Continuer vers l'onboarding
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="activation-password" className="text-xs font-semibold text-foreground">
                  {t('auth.activation.password')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="activation-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={t('auth.activation.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-10 text-xs sm:text-sm rounded-xl border-border bg-card focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Robustesse du mot de passe :</span>
                    <span className="font-semibold text-foreground">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full transition-all duration-300 ${strengthScore >= 1 ? strength.color : 'bg-transparent'} w-1/4`}
                    />
                    <div
                      className={`h-full transition-all duration-300 ${strengthScore >= 2 ? strength.color : 'bg-transparent'} w-1/4`}
                    />
                    <div
                      className={`h-full transition-all duration-300 ${strengthScore >= 3 ? strength.color : 'bg-transparent'} w-1/4`}
                    />
                    <div
                      className={`h-full transition-all duration-300 ${strengthScore >= 4 ? strength.color : 'bg-transparent'} w-1/4`}
                    />
                  </div>

                  {/* Requirements Checklist */}
                  <div className="grid grid-cols-1 gap-1 pt-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {hasMinLength ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                      )}
                      <span className={hasMinLength ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        Au moins 12 caractères
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hasMix ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                      )}
                      <span className={hasMix ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        Mélange de majuscules et chiffres/symboles
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="activation-confirm-password" className="text-xs font-semibold text-foreground">
                  {t('auth.activation.confirmPassword')}
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="activation-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder={t('auth.activation.confirmPasswordPlaceholder')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 pr-10 h-10 text-xs sm:text-sm rounded-xl border-border bg-card focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && !isMatching && (
                  <p className="text-[11px] text-destructive font-medium pt-0.5">
                    {t('auth.activation.error.passwordMismatch')}
                  </p>
                )}
              </div>

              {/* Accept Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-2">
                <Checkbox
                  id="accept-terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="accept-terms"
                  className="text-xs text-muted-foreground leading-relaxed cursor-pointer font-normal"
                >
                  {t('auth.activation.acceptTerms')}
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !hasMinLength || !isMatching || !acceptTerms}
                className="w-full h-10 rounded-xl text-sm font-semibold shadow-xs hover:shadow-sm transition-all duration-200 gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    {t('auth.activation.loading')}
                  </>
                ) : (
                  t('auth.activation.submit')
                )}
              </Button>
            </form>
          )}

          {/* Security Note */}
          <div className="pt-3 border-t border-border flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span>Activation sécurisée par token individuel</span>
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

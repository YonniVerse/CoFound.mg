import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send, CheckCircle2, ShieldCheck, ArrowUpRight, Network } from 'lucide-react'
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
    <div className="grid h-screen grid-cols-1 overflow-hidden bg-background font-sans lg:grid-cols-12">
      {/* LEFT COLUMN: Recovery form */}
      <div className="relative z-10 flex min-h-0 flex-col justify-between overflow-hidden p-6 sm:p-10 lg:col-span-6 lg:p-14 xl:col-span-5">
        <header className="flex items-center justify-between">
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t('auth.forgotPassword.backToLogin')}
          </Link>
          <LanguageSwitcher />
        </header>

        <main className="my-auto mx-auto w-full max-w-md space-y-6 py-8">
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
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-2xs sm:p-6">
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="h-11 rounded-xl border border-border/80 bg-card pl-10 pr-4 text-sm font-medium shadow-2xs transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 sm:text-sm"
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

          <div className="flex items-start gap-2.5 border-t border-border/60 pt-4 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
            <p className="leading-relaxed">{t('auth.forgotPassword.securityNote')}</p>
          </div>
        </main>

        <footer className="text-center text-xs text-muted-foreground/70 lg:text-left">
          © {new Date().getFullYear()} CoFound.mg · Tous droits réservés.
        </footer>
      </div>

      {/* RIGHT COLUMN: Shared thematic composition with LoginPage */}
      <div className="relative hidden min-h-0 overflow-hidden bg-linear-to-br from-primary via-impact to-secondary lg:col-span-6 lg:flex lg:items-center lg:justify-center xl:col-span-7">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-20 h-full w-14 text-background"
          viewBox="0 0 56 900"
          preserveAspectRatio="none"
          fill="none"
        >
          <path d="M0 0H16C40 75 40 150 16 225C-8 300 -8 375 16 450C40 525 40 600 16 675C-8 750 -8 825 16 900H0Z" fill="currentColor" />
          <path d="M16 0C40 75 40 150 16 225C-8 300 -8 375 16 450C40 525 40 600 16 675C-8 750 -8 825 16 900" stroke="var(--border)" strokeWidth="1.5" />
        </svg>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full text-white/25"
          viewBox="0 0 800 900"
          preserveAspectRatio="none"
          fill="none"
        >
          <path d="M-80 160 C 120 20, 250 300, 470 170 S 700 50, 900 210" stroke="currentColor" strokeWidth="2" />
          <path d="M-100 760 C 160 590, 310 860, 560 700 S 760 600, 920 770" stroke="currentColor" strokeWidth="2" />
        </svg>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.14)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_55%,transparent_100%)] opacity-60"
        />

        <div className="relative z-10 flex h-full min-h-0 w-full max-w-2xl flex-col px-8 py-10 text-foreground lg:px-14 lg:py-12">
          <div className="flex items-center justify-end text-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card shadow-2xs">
              <Network className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-6 grid min-h-0 flex-1 grid-cols-2 grid-rows-[1.2fr_1fr_1fr] gap-4 pb-2">
            <div className="col-span-2 flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-primary/40 bg-card/95 p-4 shadow-xl shadow-foreground/15 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-5">
              <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('auth.login.hero.cardExploreLabel')}</span><ArrowUpRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /></div>
              <p className="mt-auto line-clamp-2 break-words font-heading text-xl font-black leading-tight text-foreground sm:text-2xl">{t('auth.login.hero.cardExploreTitle')}</p>
              <p className="mt-2 line-clamp-2 break-words text-xs font-medium leading-snug text-muted-foreground sm:text-sm">{t('auth.login.hero.cardExploreMeta')}</p>
              <div className="mt-3 flex gap-1"><span className="h-1.5 flex-1 rounded-full bg-primary" /><span className="h-1.5 flex-1 rounded-full bg-primary/50" /><span className="h-1.5 flex-1 rounded-full bg-primary/20" /></div>
            </div>

            <div className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-impact/45 bg-impact-light/95 p-4 shadow-xl shadow-foreground/15 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-5">
              <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('auth.login.hero.cardMatchLabel')}</span><ArrowUpRight className="h-4 w-4 shrink-0 text-impact" aria-hidden="true" /></div>
              <p className="mt-auto line-clamp-2 break-words font-heading text-base font-black leading-tight text-foreground sm:text-lg">{t('auth.login.hero.cardMatchTitle')}</p>
              <p className="mt-2 line-clamp-2 break-words text-xs font-medium leading-snug text-muted-foreground">{t('auth.login.hero.cardMatchMeta')}</p>
              <div className="mt-3 flex gap-1"><span className="h-1.5 flex-1 rounded-full bg-impact" /><span className="h-1.5 flex-1 rounded-full bg-impact/60" /><span className="h-1.5 flex-1 rounded-full bg-impact/25" /></div>
            </div>

            <div className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-primary-foreground/45 bg-primary p-4 text-primary-foreground shadow-xl shadow-foreground/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/80">{t('auth.login.hero.cardCommunityLabel')}</p>
              <p className="mt-auto line-clamp-2 break-words font-heading text-lg font-black leading-tight text-primary-foreground sm:text-xl">{t('auth.login.hero.cardCommunityTitle')}</p>
              <p className="mt-2 line-clamp-2 break-words text-xs font-medium leading-snug text-primary-foreground/80">{t('auth.login.hero.cardCommunityMeta')}</p>
              <div className="mt-3 flex -space-x-1"><span className="h-6 w-6 rounded-full border-2 border-primary bg-secondary" /><span className="h-6 w-6 rounded-full border-2 border-primary bg-impact" /><span className="h-6 w-6 rounded-full border-2 border-primary bg-primary-foreground" /></div>
            </div>

            <div className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-destructive-foreground/45 bg-destructive p-4 text-destructive-foreground shadow-xl shadow-foreground/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-destructive-foreground/85">{t('auth.login.hero.cardImpactLabel')}</p>
              <p className="mt-auto line-clamp-2 break-words font-heading text-xl font-black leading-tight text-destructive-foreground sm:text-2xl">{t('auth.login.hero.cardImpactTitle')}</p>
              <div className="mt-3 h-1.5 w-full rounded-full bg-destructive-foreground/25"><div className="h-full w-3/4 rounded-full bg-destructive-foreground" /></div>
            </div>

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

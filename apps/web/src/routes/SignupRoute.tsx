import SignupPage from "@/pages/SignupPage";
import { I18nProvider } from "@/i18n";

export default function SignupRoute() {
  return (
    <I18nProvider>
      <SignupPage />
    </I18nProvider>
  );
}

import { Link } from "react-router-dom";
import { Mail, Heart, ExternalLink } from "lucide-react";
import {  LogoSVG } from "../ui/LogoSVG";
import { LogoIconSVG } from "../ui/LogoIconSVG";

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const navigation = {
  categories: [
    {
      id: "cofound",
      name: "CoFound.mg",
      sections: [
        {
          id: "plateforme",
          name: "Plateforme",
          items: [
            { name: "Explorer les talents", href: "/projects" },
            { name: "Devenir Fondateur", href: "/signup" },
            { name: "Espace Incubateurs", href: "/incubators" },
          ],
        },
        {
          id: "engagement",
          name: "Engagement",
          items: [
            { name: "Charte Mixité 50/50", href: "/impact" },
            { name: "Universités Partenaires", href: "/schools" },
          ],
        },
        {
          id: "legal",
          name: "Légal",
          items: [
            { name: "Conditions d'utilisation", href: "#terms" },
            { name: "Confidentialité des données", href: "#privacy" },
          ],
        },
      ],
    },
  ],
};

const Underline = `hover:-translate-y-1 border border-border rounded-xl p-2.5 transition-transform bg-background shadow-xs`;

export function Footer() {
  return (
    <footer className="border-t border-border px-4 mx-auto w-full bg-muted/30">
      <div className="relative mx-auto grid max-w-7xl items-center justify-center gap-6 p-10 pb-0 md:flex flex-col">
        <Link to="/" className="flex items-center group transition-opacity hover:opacity-90">
          <LogoSVG className="hidden md:block h-20 w-auto" />
          <LogoIconSVG className="block md:hidden h-18 w-auto" />
        </Link>
        <p className="bg-transparent text-center text-sm leading-relaxed text-muted-foreground md:text-center max-w-3xl">
          Bienvenue sur CoFound.mg, où la créativité rencontre la stratégie pour donner vie à votre vision. Nous sommes passionnés par la connexion des esprits brillants. Notre mission est d'autonomiser les étudiants et futurs fondateurs pour qu'ils se démarquent sur le marché. Propulsez la prochaine génération de licornes malgaches en connectant les compétences complémentaires au niveau universitaire.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="border-b border-border"> </div>
        <div className="py-10">
          {navigation.categories.map((category) => (
            <div
              key={category.name}
              className="grid grid-cols-1 sm:grid-cols-3 flex-row justify-between gap-6 leading-6 md:flex w-full"
            >
              {category.sections.map((section) => (
                <div key={section.name} className="flex-1 text-center md:text-left">
                  <h3 className="font-heading font-bold text-foreground mb-4">{section.name}</h3>
                  <ul
                    role="list"
                    className="flex flex-col space-y-2"
                  >
                    {section.items.map((item) => (
                      <li key={item.name} className="flow-root">
                        <Link
                          to={item.href}
                          className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="border-b border-border"> </div>
      </div>

      <div className="flex flex-wrap justify-center gap-y-6">
        <div className="flex flex-wrap items-center justify-center gap-6 gap-y-4 px-6">
          <a
            aria-label="Mail"
            href="mailto:contact@cofound.mg"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <Mail strokeWidth={1.5} className="h-5 w-5 text-foreground" />
          </a>
          <a
            aria-label="Twitter"
            href="https://x.com/cofound_mg"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <TwitterIcon className="h-5 w-5 text-foreground" />
          </a>
          <a
            aria-label="Instagram"
            href="https://www.instagram.com/cofound.mg/"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <InstagramIcon className="h-5 w-5 text-foreground" />
          </a>
          <a
            aria-label="LinkedIn"
            href="https://www.linkedin.com/company/cofound-mg"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <LinkedinIcon className="h-5 w-5 text-foreground" />
          </a>
        </div>
      </div>

      <div className="mx-auto mb-10 mt-10 flex flex-col justify-between text-center text-xs md:max-w-7xl">
        <div className="flex flex-row items-center justify-center gap-1 text-muted-foreground font-medium">
          <span> © </span>
          <span>{new Date().getFullYear()}</span>
          <span>Made with</span>
          <Heart className="text-destructive mx-1 h-4 w-4 animate-pulse fill-destructive" />
          <span> by </span>
          <span className="hover:text-primary cursor-pointer text-foreground transition-colors">
            <Link
              aria-label="Home"
              className="font-bold inline-flex items-center gap-1"
              to="/"
            >
              CoFound.mg <ExternalLink className="h-3 w-3" />
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

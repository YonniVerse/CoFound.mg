import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sun,
  Moon,
  ArrowUp,
  Mail,
  Instagram,
  Linkedin,
  Twitter,
  Heart
} from "lucide-react";

function handleScrollTop() {
  window.scroll({
    top: 0,
    behavior: "smooth",
  });
}

// Local Theme Toggle Component
const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "light";
  });

  const toggleTheme = (newTheme: "light" | "dark") => {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setTheme(newTheme);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center rounded-full border border-dotted border-slate-300 dark:border-slate-800 p-1 bg-white dark:bg-slate-900 shadow-2xs">
        <button
          onClick={() => toggleTheme("light")}
          className={`mr-3 rounded-full p-2 transition-colors ${
            theme === "light" 
              ? "bg-slate-950 text-white" 
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <Sun className="h-4 w-4" strokeWidth={1.5} />
          <span className="sr-only">Light</span>
        </button>

        <button 
          type="button" 
          onClick={handleScrollTop}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 transition-colors"
        >
          <ArrowUp className="h-3 w-3" />
          <span className="sr-only">Top</span>
        </button>

        <button
          onClick={() => toggleTheme("dark")}
          className={`ml-3 rounded-full p-2 transition-colors ${
            theme === "dark" 
              ? "bg-slate-950 text-white dark:bg-slate-800" 
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <Moon className="h-4 w-4" strokeWidth={1.5} />
          <span className="sr-only">Dark</span>
        </button>
      </div>
    </div>
  );
};

const navigation = {
  categories: [
    {
      id: "platform",
      name: "CoFound.mg",
      sections: [
        {
          id: "explore",
          name: "Plateforme",
          items: [
            { name: "Explorer les talents", href: "/projects" },
            { name: "Devenir Fondateur", href: "/signup" },
            { name: "Espace Incubateurs", href: "/incubators" },
          ],
        },
        {
          id: "impact",
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

const Underline = `hover:-translate-y-1 border border-dotted border-slate-300 dark:border-slate-800 rounded-xl p-2.5 transition-transform text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white`;

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-900 px-4 py-12 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
      <div className="relative mx-auto grid max-w-7xl items-center justify-center gap-6 pb-6 md:flex border-b border-dotted border-slate-200 dark:border-slate-900">
        <Link to="/" className="flex items-center justify-center shrink-0">
          <span className="font-sans font-black text-xl tracking-tight text-slate-950 dark:text-white">CoFound</span>
          <span className="font-sans text-xl font-black text-indigo-500">.mg</span>
        </Link>
        <p className="bg-transparent text-center text-xs leading-5 text-slate-500 dark:text-slate-400 md:text-left max-w-4xl">
          Propulser la prochaine génération de licornes malgaches en connectant les compétences complémentaires au niveau universitaire. 
          Nous croyons en la force de la parité et de la complémentarité pour structurer l'avenir de l'écosystème entrepreneurial de Madagascar. 
          Inspiré par les plus hauts standards du Y Combinator.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="py-4">
          {navigation.categories.map((category) => (
            <div
              key={category.id}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 leading-6 text-center md:text-left"
            >
              {category.sections.map((section) => (
                <div key={section.id} className="flex flex-col items-center md:items-start">
                  <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-slate-900 dark:text-white mb-4">
                    {section.name}
                  </h4>
                  <ul role="list" className="flex flex-col space-y-2.5">
                    {section.items.map((item) => (
                      <li key={item.name} className="flow-root">
                        <Link
                          to={item.href}
                          className="text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
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
        <div className="border-b border-dotted border-slate-200 dark:border-slate-900 mt-8"></div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            aria-label="Mail"
            href="mailto:contact@cofound.mg"
            className={Underline}
          >
            <Mail strokeWidth={1.5} className="h-4 w-4" />
          </a>
          <a
            aria-label="Twitter"
            href="https://x.com/cofound_mg"
            target="_blank"
            rel="noreferrer"
            className={Underline}
          >
            <Twitter className="h-4 w-4" />
          </a>
          <a
            aria-label="Instagram"
            href="https://instagram.com/cofound_mg"
            target="_blank"
            rel="noreferrer"
            className={Underline}
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            aria-label="LinkedIn"
            href="https://linkedin.com/company/cofound-mg"
            target="_blank"
            rel="noreferrer"
            className={Underline}
          >
            <Linkedin className="h-4 w-4" />
          </a>
        </div>
        
        <ThemeToggle />
      </div>

      <div className="mx-auto mt-8 flex flex-col justify-between text-center text-xs max-w-7xl border-t border-slate-100 dark:border-slate-900 pt-6">
        <div className="flex flex-row items-center justify-center gap-1 text-slate-500 dark:text-slate-500 font-medium">
          <span>© {new Date().getFullYear()} CoFound.mg. Fait avec</span>
          <Heart className="text-red-500 mx-1 h-3.5 w-3.5 animate-pulse fill-red-500" />
          <span>pour l'écosystème entrepreneurial de Madagascar.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

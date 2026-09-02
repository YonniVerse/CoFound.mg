import { Link, useLocation } from 'react-router-dom'
import {
  Compass,
  Lightbulb,
  LayoutGrid,
  FileText,
  Calculator,
  Mic,
  Users,
  CheckSquare,
  MessageSquare,
  Download,
  Eye,
  Inbox,
} from 'lucide-react'

interface ProjectNavTabsProps {
  projectId: string
}

export function ProjectNavTabs({ projectId }: ProjectNavTabsProps) {
  const location = useLocation()
  const currentPath = location.pathname

  const tabs = [
    { label: 'Général', href: `/projects/${projectId}`, icon: Eye, exact: true },
    { label: 'Parcours', href: `/projects/${projectId}/journey`, icon: Compass },
    { label: 'Design Thinking', href: `/projects/${projectId}/design-thinking`, icon: Lightbulb },
    { label: 'BMC Strategyzer', href: `/projects/${projectId}/bmc`, icon: LayoutGrid },
    { label: 'Business Plan', href: `/projects/${projectId}/business-plan`, icon: FileText },
    { label: 'Finances', href: `/projects/${projectId}/finances`, icon: Calculator },
    { label: 'Pitch', href: `/projects/${projectId}/pitch`, icon: Mic },
    { label: 'Équipe', href: `/projects/${projectId}/team`, icon: Users },
    { label: 'Candidatures', href: `/projects/${projectId}/applications`, icon: Inbox },
    { label: 'Tâches', href: `/projects/${projectId}/tasks`, icon: CheckSquare },
    { label: 'Publications', href: `/projects/${projectId}/posts`, icon: MessageSquare },
    { label: 'Discussion', href: `/projects/${projectId}/channel`, icon: MessageSquare },
    { label: 'Export', href: `/projects/${projectId}/export`, icon: Download },
  ]

  return (
    <div className="w-full overflow-x-auto border-b border-border/80 bg-card/60 backdrop-blur-xs">
      <nav className="mx-auto flex w-full max-w-[1400px] gap-1 px-4 sm:px-10" aria-label="Navigation de l'espace projet">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? currentPath === tab.href
            : currentPath === tab.href || currentPath.startsWith(tab.href + '/')
          const Icon = tab.icon

          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-semibold transition-colors sm:text-sm ${
                isActive
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} aria-hidden="true" />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

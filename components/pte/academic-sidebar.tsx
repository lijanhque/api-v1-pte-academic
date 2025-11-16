'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  MessageCircle,
  Mic,
  Newspaper,
  PenSquare,
  Settings,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

interface AcademicSidebarItem {
  title: string
  href: string
  icon: React.ReactNode
}

const sidebarItems: AcademicSidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/pte/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'Practice',
    href: '/pte/academic/practice',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: 'Section Tests',
    href: '/pte/academic/practice/section-tests',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: 'Speaking',
    href: '/pte/academic/practice/section-tests/speaking',
    icon: <Mic className="h-5 w-5" />,
  },
  {
    title: 'Writing',
    href: '/pte/academic/practice/section-tests/writing',
    icon: <PenSquare className="h-5 w-5" />,
  },
  {
    title: 'Reading',
    href: '/pte/academic/practice/section-tests/reading',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: 'Listening',
    href: '/pte/academic/practice/section-tests/listening',
    icon: <Headphones className="h-5 w-5" />,
  },
  {
    title: 'Templates',
    href: '/pte/templates',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: 'Analytics',
    href: '/pte/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: 'Community',
    href: '/pte/community',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'Study Center',
    href: '/pte/study-center',
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    title: 'Blog',
    href: '/blog',
    icon: <Newspaper className="h-5 w-5" />,
  },
  {
    title: 'Messages',
    href: '/pte/academic/messages',
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    title: 'Time Management',
    href: '/pte/academic/time',
    icon: <Clock className="h-5 w-5" />,
  },
  {
    title: 'Settings',
    href: '/pte/academic/settings',
    icon: <Settings className="h-5 w-5" />,
  },
]

export function AcademicSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/pte/dashboard') {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-4">
        <Link
          href="/pte/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <span className="text-lg">Academic</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-auto py-4">
        <ul className="space-y-1 px-2">
          {sidebarItems.map((item) => (
            <li key={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  'hover:bg-accent hover:text-accent-foreground w-full justify-start gap-3 rounded-lg px-3 py-2 text-left',
                  isActive(item.href) && 'bg-muted text-foreground'
                )}
                asChild
              >
                <Link href={item.href}>
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t p-4">
        <div className="bg-muted flex items-center gap-3 rounded-lg p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-800">
            <span className="font-bold">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Academic Dashboard</p>
            <p className="text-muted-foreground text-xs">PTE Academic</p>
          </div>
        </div>
      </div>
    </div>
  )
}

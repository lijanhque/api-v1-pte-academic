'use client';

import Link from 'next/link';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  FileText, 
  Users, 
  GraduationCap,
  BarChart3,
  Settings,
  Home,
  MessageCircle,
  Clock
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface AcademicSidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const sidebarItems: AcademicSidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/pte/academic/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'Courses',
    href: '/pte/academic/courses',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: 'Schedule',
    href: '/pte/academic/schedule',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: 'Assignments',
    href: '/pte/academic/assignments',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: 'Grades',
    href: '/pte/academic/grades',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: 'Classmates',
    href: '/pte/academic/classmates',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'Resources',
    href: '/pte/academic/library',
    icon: <GraduationCap className="h-5 w-5" />,
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
];

export function AcademicSidebar() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/pte/academic/dashboard" className="flex items-center gap-2 font-semibold">
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
                  'w-full justify-start gap-3 rounded-lg px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground',
                  'data-[active=true]:bg-muted data-[active=true]:text-foreground'
                )}
                asChild
                data-active={window.location.pathname === item.href}
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
        <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-800">
            <span className="font-bold">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Academic Dashboard</p>
            <p className="text-xs text-muted-foreground">PTE Academic</p>
          </div>
        </div>
      </div>
    </div>
  );
}
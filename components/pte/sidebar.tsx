'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  IconLayoutDashboard,
  IconBook,
  IconFileCheck,
  IconFileText,
  IconSchool,
  IconSparkles,
  IconRobot,
  IconBookmark,
  IconMicrophone,
  IconHeadphones,
  IconUsers,
  IconHelp,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/pte/dashboard', icon: IconLayoutDashboard },
  { 
    name: 'Practice', 
    href: '/pte/practice',
    icon: IconBook,
    children: [
      { name: 'Full Tests', href: '/pte/practice/full-tests' },
      { name: 'Section Tests', href: '/pte/practice/section-tests' },
      { name: 'Test History', href: '/pte/practice/history' },
    ]
  },
  { name: 'Mock Tests', href: '/pte/mock-tests', icon: IconFileCheck },
  { name: 'Templates', href: '/pte/templates', icon: IconFileText },
  { name: 'Study Center', href: '/pte/study-center', icon: IconSchool },
  { name: 'Smart Prep', href: '/pte/smart-prep', icon: IconSparkles },
  { name: 'AI Coach', href: '/pte/ai-coach', icon: IconRobot },
  { name: 'Vocab Books', href: '/pte/vocab-books', icon: IconBookmark },
  { name: 'Shadowing', href: '/pte/shadowing', icon: IconMicrophone },
  { name: 'PTE MP3', href: '/pte/mp3', icon: IconHeadphones },
  { name: 'Community', href: '/pte/community', icon: IconUsers },
  { name: 'Support', href: '/pte/support', icon: IconHelp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background transition-transform">
      <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
        {/* Logo */}
        <div className="mb-6 flex items-center px-3">
          <Link href="/pte/dashboard" className="flex items-center gap-2">
            <Image src="/asset/logo.png" alt="Logo" width={32} height={32} className="rounded-full" />
            <span className="text-xl font-bold">Pedagogist's PTE</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
                
                {/* Sub-navigation */}
                {item.children && isActive && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          'block rounded-lg px-3 py-2 text-sm transition-colors',
                          pathname === child.href
                            ? 'text-primary font-medium'
                            : 'text-muted-foreground hover:text-accent-foreground'
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* CTA Section */}
        <div className="mt-auto border-t pt-4">
          <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-4">
            <p className="mb-2 text-sm font-semibold">Unlock Premium Access</p>
            <p className="mb-3 text-xs text-muted-foreground">
              Get access to all features and tools to help you succeed
            </p>
            <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Go Premium
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
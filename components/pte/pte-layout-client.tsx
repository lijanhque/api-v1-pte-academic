'use client'

import { AcademicProvider } from '@/components/pte/academic-context'
import { PTEProvider } from '@/components/pte/pte-context'
import { PTEContextSwitcher } from '@/components/pte/context-switcher'
import { PTEAppSidebar } from '@/components/pte/pte-app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

/**
 * Layout component that wraps its content with PTE, Academic, and Sidebar providers and renders the application sidebar, header (breadcrumb and context switcher), and main content area.
 *
 * @param children - The content to render inside the layout's main content area.
 * @returns The layout element containing the sidebar, header, and main content area that includes `children`.
 */
export function PTELayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <PTEProvider>
      <AcademicProvider>
        <SidebarProvider>
          <PTEAppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/pte/dashboard">
                      PTE
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="ml-auto">
                <PTEContextSwitcher />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </AcademicProvider>
    </PTEProvider>
  )
}
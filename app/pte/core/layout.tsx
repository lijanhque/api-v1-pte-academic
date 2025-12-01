/**
 * Layout wrapper that renders its children without modification.
 *
 * @returns A React fragment containing the provided `children`.
 */
export default function PTECoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
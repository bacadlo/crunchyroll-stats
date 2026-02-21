import { ProtectedAppShell } from '@/components/ProtectedAppShell';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>;
}

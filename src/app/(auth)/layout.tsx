import { OnboardingDialog } from '@/components/onboarding/OnboardingDialog';
import { validateSession } from 'auth';
import { Navbar } from '@/components/sections/navbar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateSession();
  const needsOnboarding = !!session?.user?.onboard;

  return (
    <main>
      <Navbar session={session} />
      <OnboardingDialog
        open={needsOnboarding}
      />
      {children}
    </main>
  );
}

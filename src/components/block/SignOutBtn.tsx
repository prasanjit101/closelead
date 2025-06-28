'use client';

import { signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function SignOutBtn() {
  const router = useRouter();
  return <Button variant={'destructive'} className={'cursor-pointer'} onClick={async () => await signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push("/"); // redirect to login page
      },
    },
  })}>Sign Out</Button>;
}

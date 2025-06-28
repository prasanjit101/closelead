'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FaGoogle } from 'react-icons/fa';
import { signInGoogle } from '@/lib/auth-client';
import { env } from '@/env';
import { Logo } from './block/Logo';

export function LoginForm({
  className,
  redirectUrl,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  redirectUrl?: string;
}) {

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3 font-bold">
            <Logo />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <p className="">
            Just a step away from resolving all your frustations with managing your projects.
          </p>
          <Button
            onClick={() => signInGoogle({ callbackURL: redirectUrl ?? env.NEXT_PUBLIC_APP_URL })}
            size={'lg'}
            variant={'default'}
            className="w-full"
          >
            <FaGoogle />
            Login with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

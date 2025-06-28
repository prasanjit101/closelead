'use client';

import { MoveRight, PhoneCall } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

export const Hero = () => {
  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Badge variant={'outline'} className='rounded-full'>
              beta
            </Badge>
          </div>
          <div className="flex gap-6 flex-col">
            <h1 className="text-4xl md:text-6xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-primary">Your project management tool that manages itself</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                ai first, automated
              </span>
            </h1>

            <h2 className="text-lg leading-relaxed max-w-xl text-center mx-auto">
              Auto assign tasks, prioritize, auto-fill fields, and auto manage your team.
            </h2>
          </div>
          <div className="flex flex-row gap-3">
            <Link
              href={'https://tally.so/r/wQjYxg'}
              target="_blank"
              rel='noopener noreferrer'
              className={cn(
                'gap-4',
                buttonVariants({ size: 'lg', variant: 'outline' }),
              )}
            >
              Contact us <PhoneCall className="w-4 h-4" />
              {/* Stay Updated <FaXTwitter className="w-4 h-4" /> */}
            </Link>
            <Link
              href={'/login'}
              className={cn('gap-4', buttonVariants({ size: 'lg' }))}
            >
              Try now <MoveRight className="w-4 h-4" />
            </Link>
          </div>
          {/* <iframe
            className="w-[700px] h-[400px] my-10 mx-auto"
            src="https://www.youtube.com/embed/OYqf-cwt0_g?si=J2CFRaFaNcJnLLK_"
            title="Product Demo Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe> */}
        </div>
      </div>
    </div>
  );
};

"use client";

import { MoveRight, PhoneCall } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

export const Hero = () => {
  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center gap-8 py-20 lg:py-40">
          <div>
            <Badge variant={"outline"} className="rounded-full">
              beta
            </Badge>
          </div>
          <div className="flex flex-col gap-6">
            <h1 className="font-regular max-w-2xl text-center text-4xl tracking-tighter md:text-6xl">
              <span className="text-primary">
                Your solution to automate lead qualification and booking - a high-value client acquisition tool.
              </span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                It filters out high-value leads that are more likely to close and helps you convert them effectively.
              </span>
            </h1>

            <h2 className="mx-auto max-w-xl text-center text-lg leading-relaxed">
              Auto assign tasks, prioritize, auto-fill fields, and auto manage
              your team.
            </h2>
          </div>
          <div className="flex flex-row gap-3">
            <Link
              href={"https://tally.so/r/wQjYxg"}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "gap-4",
                buttonVariants({ size: "lg", variant: "outline" }),
              )}
            >
              Contact us <PhoneCall className="h-4 w-4" />
              {/* Stay Updated <FaXTwitter className="w-4 h-4" /> */}
            </Link>
            <Link
              href={"/login"}
              className={cn("gap-4", buttonVariants({ size: "lg" }))}
            >
              Try now <MoveRight className="h-4 w-4" />
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

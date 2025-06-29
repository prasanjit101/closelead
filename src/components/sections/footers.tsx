import { ExternalLink } from "lucide-react";
import Link from "next/link";

export interface Footer1Items {
  title: string;
  href?: string;
  description: string;
  external?: boolean;
  items?: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export const Footer1 = () => {
  const navigationItems = [
    {
      title: "Twitter",
      href: "https://x.com/jit_infinity",
      external: true,
    },
    {
      title: "LinkedIn",
      href: "https://www.linkedin.com/in/prasanjit-dutta-82004b18b/",
      external: true,
    },
  ];

  return (
    <div
      id="footer"
      className="mt-20 flex w-full items-center justify-between bg-black p-4 px-20 text-white"
    >
      <Link
        href={"https://directory.byjit.com"}
        rel="noopener noreferrer"
        target="_blank"
        className="text-sm"
      >
        Made by Jit with ❤️
      </Link>
      <div className="flex space-x-4">
        {navigationItems?.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            target={item.external ? "_blank" : "_self"}
            className="flex gap-1"
            rel={item.external ? "noopener noreferrer" : undefined}
          >
            {item.title}
            <ExternalLink className="h-4 w-4" />
          </Link>
        ))}
      </div>
    </div>
  );
};

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
  return (
    <div className="container mx-auto px-20 py-8 border-t border-gray-100">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-md overflow-hidden">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <rect width="100" height="100" fill="#f3f4f6" />
              <text x="50" y="50" fontSize="40" textAnchor="middle" dominantBaseline="middle" fill="#6b7280">?</text>
            </svg>
          </div>
          <div>
            <p className="font-medium">Got a question?</p>
            <div className="flex items-center gap-1 text-sm">
              <span>DM me on</span>
              <a href="https://www.linkedin.com/in/prasanjit-dutta-82004b18b/" className="underline">LinkedIn</a>,
              <a href="https://x.com/jit_infinity" className="underline">Twitter</a>
              <span>or by</span>
              <a href="mailto:rely.prasanjit@gmail.com" className="underline">Email</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

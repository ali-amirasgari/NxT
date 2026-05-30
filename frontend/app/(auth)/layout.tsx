import { Typography } from "@/components/ui/typography";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-md">
        <Typography as="div" className="mb-6 text-center">
          <Typography
            as="div"
            className="text-2xl font-black tracking-widest text-foreground"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            NxT
          </Typography>
          <Typography
            as="div"
            className="mt-1 text-sm text-muted-foreground"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Commit. Prove. Resolve.
          </Typography>
        </Typography>
        {children}
      </div>
    </div>
  );
}


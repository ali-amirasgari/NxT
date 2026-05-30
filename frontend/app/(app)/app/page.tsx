import { Typography } from "@/components/ui/typography";

export default function AppHomePage() {
  return (
    <div className="space-y-2">
      <Typography as="h1" variant="h2" className="border-b-0 pb-0">
        App
      </Typography>
      <Typography as="p" className="text-muted-foreground">
        This is the internal app area (desktop sidebar + mobile bottom nav).
      </Typography>
    </div>
  );
}


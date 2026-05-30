import { Typography } from "@/components/ui/typography";

export default function ProfilePage() {
  return (
    <div className="space-y-2">
      <Typography as="h1" variant="h2" className="border-b-0 pb-0">
        Profile
      </Typography>
      <Typography as="p" className="text-muted-foreground">
        Profile page placeholder.
      </Typography>
    </div>
  );
}


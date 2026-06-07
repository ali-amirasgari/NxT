type ProfileStatProps = {
  value: string;
  label: string;
};

export function ProfileStat({ value, label }: ProfileStatProps) {
  return (
    <div className="min-w-0 text-center">
      <Typography
        as="div"
        variant="large"
        align="center"
        className="text-lg font-black leading-6 text-foreground"
      >
        {value}
      </Typography>
      <Typography
        as="span"
        variant="small"
        align="center"
        className="block text-[10px] font-medium leading-4 text-muted-foreground"
      >
        {label}
      </Typography>
    </div>
  );
}
import { Typography } from "@/components/ui/typography";

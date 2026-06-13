import { Icon } from "@iconify/react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Switch } from "@/components/ui/switch";

type ProfileSettingRowProps = {
  icon: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function ProfileSettingRow({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
}: ProfileSettingRowProps) {
  return (
    <Item
      variant="outline"
      className="min-h-[72px] flex-nowrap rounded-[18px] border-border bg-card px-4 py-3.5"
    >
      <ItemMedia variant="icon" className="text-primary">
        <Icon icon={icon} className="size-[22px]" aria-hidden="true" />
      </ItemMedia>
      <ItemContent className="min-w-0 gap-0.5">
        <ItemTitle className="text-sm font-semibold leading-5 text-foreground">
          {title}
        </ItemTitle>
        <ItemDescription className="line-clamp-1 text-[11px] leading-4 text-muted-foreground">
          {description}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-label={title}
          className="h-6 w-[42px] border-border data-checked:bg-primary data-unchecked:bg-muted [&_[data-slot=switch-thumb]]:size-[18px]"
        />
      </ItemActions>
    </Item>
  );
}

"use client";

import { Icon } from "@iconify/react";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export function ChatComposer({
  placeholder,
  sendLabel,
  attachLabel,
  onSend,
}: {
  placeholder: string;
  sendLabel: string;
  attachLabel: string;
  onSend: (message: string) => void;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = value.trim();
    if (!message) return;
    onSend(message);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup className="h-12 rounded-2xl border-input bg-card shadow-none">
        <InputGroupInput
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="px-4 text-sm"
        />
        <InputGroupAddon align="inline-end" className="gap-2 pe-4">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={attachLabel}
            className="size-[30px] rounded-full bg-muted text-primary hover:bg-muted"
          >
            <Icon icon="solar:add-circle-linear" className="size-4" />
          </Button>
          <Button
            type="submit"
            size="icon-sm"
            aria-label={sendLabel}
            disabled={!value.trim()}
            className="h-[34px] w-[38px] rounded-full text-white"
          >
            <Icon icon="solar:arrow-right-up-linear" className="size-4" />
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}

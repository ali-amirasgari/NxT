"use client";

import { Icon } from "@iconify/react";
import {
  ChangeEvent,
  FormEvent,
  useId,
  useRef,
  useState,
} from "react";

import type { ChatAttachment } from "@/apis/types/chat";
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
  removeAttachmentLabel,
  invalidAttachmentLabel,
  attachmentTooLargeLabel,
  onSend,
  onSendAttachment,
}: {
  placeholder: string;
  sendLabel: string;
  attachLabel: string;
  removeAttachmentLabel: string;
  invalidAttachmentLabel: string;
  attachmentTooLargeLabel: string;
  onSend: (message: string) => void;
  onSendAttachment: (attachment: ChatAttachment) => void;
}) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [attachment, setAttachment] = useState<ChatAttachment>();
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = value.trim();

    if (attachment) {
      onSendAttachment(attachment);
      setAttachment(undefined);
      setValue("");
      setError("");
      return;
    }

    if (!message) return;
    onSend(message);
    setValue("");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    const imageExtensions = [
      "avif",
      "gif",
      "jpeg",
      "jpg",
      "png",
      "svg",
      "webp",
    ];
    const isImage =
      file.type.startsWith("image/") ||
      Boolean(extension && imageExtensions.includes(extension));
    const isPdf = file.type === "application/pdf" || extension === "pdf";
    const isExcel =
      file.type === "application/vnd.ms-excel" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      extension === "xls" ||
      extension === "xlsx";

    if (!isImage && !isPdf && !isExcel) {
      setAttachment(undefined);
      setError(invalidAttachmentLabel);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAttachment(undefined);
      setError(attachmentTooLargeLabel);
      return;
    }

    const resolvedMimeType =
      file.type ||
      (isImage
        ? extension === "svg"
          ? "image/svg+xml"
          : `image/${extension === "jpg" ? "jpeg" : extension}`
        : isPdf
          ? "application/pdf"
          : extension === "xls"
            ? "application/vnd.ms-excel"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;

      setAttachment({
        name: file.name,
        dataUrl: reader.result.replace(
          /^data:[^;]*;/,
          `data:${resolvedMimeType};`,
        ),
        mimeType: resolvedMimeType,
      });
      setError("");
    };
    reader.readAsDataURL(file);
  }

  function removeAttachment() {
    setAttachment(undefined);
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {attachment ? (
        <div className="flex items-center gap-3 rounded-2xl border border-input bg-card p-2.5">
          {attachment.mimeType.startsWith("image/") ? (
            // Temporary frontend upload uses a local data URL.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={attachment.dataUrl}
              alt=""
              className="size-12 rounded-xl object-cover"
            />
          ) : (
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon
                icon={
                  attachment.mimeType === "application/pdf"
                    ? "solar:file-text-bold"
                    : "solar:document-bold"
                }
                className="size-6"
              />
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {attachment.name}
          </span>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            tone="neutral"
            aria-label={removeAttachmentLabel}
            onClick={removeAttachment}
            className="rounded-full"
          >
            <Icon icon="solar:close-circle-linear" className="size-5" />
          </Button>
        </div>
      ) : null}

      {error ? <p className="px-1 text-xs text-destructive">{error}</p> : null}

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
            onClick={() => fileInputRef.current?.click()}
            className="size-[30px] rounded-full bg-muted text-primary hover:bg-muted"
          >
            <Icon icon="solar:add-circle-linear" className="size-4" />
          </Button>
          <input
            ref={fileInputRef}
            id={fileInputId}
            type="file"
            accept="image/*,.pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
            className="sr-only"
          />
          <Button
            type="submit"
            size="icon-sm"
            aria-label={sendLabel}
            disabled={!value.trim() && !attachment}
            className="h-[34px] w-[38px] rounded-full text-white"
          >
            <Icon icon="solar:arrow-right-up-linear" className="size-4" />
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}

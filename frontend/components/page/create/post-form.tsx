"use client";

import { Icon } from "@iconify/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import type { PostRecord } from "@/components/global/app-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Typography } from "@/components/ui/typography";
import { savePost } from "@/lib/content-storage";

export function PostForm({
  initialPost,
  goalTitle,
  labels,
}: {
  initialPost?: PostRecord;
  goalTitle?: string;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [caption, setCaption] = useState(initialPost?.caption ?? "");
  const [fileName, setFileName] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = savePost({
      id: initialPost?.id,
      author: initialPost?.author ?? "Alex Carter",
      authorInitial: initialPost?.authorInitial ?? "A",
      meta: goalTitle
        ? `${goalTitle} · verified proof`
        : (initialPost?.meta ?? "Goal update · verified proof"),
      title: title.trim(),
      caption: caption.trim() || labels.defaultCaption,
      likes: initialPost?.likes ?? "0 likes",
      comments: initialPost?.comments ?? "View all 0 comments",
      timestamp: initialPost?.timestamp ?? "Just now",
      mediaTone: initialPost?.mediaTone ?? "primary",
    });

    router.push(`/app/posts/${saved.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {goalTitle ? (
        <Card className="gap-0 rounded-2xl bg-primary/10 py-0 shadow-none ring-primary/20">
          <CardContent className="flex items-center gap-3 p-4">
            <Icon
              icon="solar:target-bold"
              className="size-5 text-primary"
              aria-hidden="true"
            />
            <div>
              <Typography as="p" variant="small" className="text-sm">
                {goalTitle}
              </Typography>
              <Typography as="p" variant="muted" className="mt-0.5 text-xs">
                {labels.stakeReminder}
              </Typography>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="post-title">{labels.title}</Label>
        <Input
          id="post-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          placeholder={labels.titlePlaceholder}
          className="h-11 rounded-2xl bg-card px-3.5"
        />
      </div>

      <Label
        htmlFor="proof-media"
        className="flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-primary/50 bg-primary/5 p-6 text-center transition-colors hover:bg-primary/10"
      >
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Icon icon="solar:camera-add-bold" className="size-6" aria-hidden="true" />
        </span>
        <Typography as="span" variant="large" className="mt-4">
          {fileName || labels.upload}
        </Typography>
        <Typography as="span" variant="muted" className="mt-1 text-xs">
          {labels.uploadHint}
        </Typography>
        <Input
          id="proof-media"
          type="file"
          accept="image/*,video/*"
          className="sr-only"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
        />
      </Label>

      <div className="space-y-2">
        <Label htmlFor="post-caption">{labels.note}</Label>
        <Textarea
          id="post-caption"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder={labels.notePlaceholder}
          className="min-h-24 rounded-2xl bg-card px-3.5"
        />
      </div>

      <Card className="gap-0 rounded-2xl bg-muted py-0 shadow-none ring-0">
        <CardContent className="flex gap-3 p-4">
          <Icon
            icon="solar:magic-stick-3-bold"
            className="mt-0.5 size-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div>
            <Typography as="p" variant="small" className="text-sm">
              {labels.validator}
            </Typography>
            <Typography as="p" variant="muted" className="mt-1 text-xs leading-5">
              {labels.validatorHint}
            </Typography>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={!title.trim()}
        className="h-12 w-full rounded-2xl font-bold"
      >
        <Icon icon="solar:verified-check-bold" className="size-5" aria-hidden="true" />
        {initialPost ? labels.save : labels.submit}
      </Button>
    </form>
  );
}

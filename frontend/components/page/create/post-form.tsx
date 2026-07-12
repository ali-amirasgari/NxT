"use client";

import { Icon } from "@iconify/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  useCreatePostMutation,
  useUpdatePostMutation,
  useCategoriesQuery,
} from "@/apis/queries/social/queries";
import type { Post, PostMediaType, PostPayload } from "@/apis/types/social";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Typography } from "@/components/ui/typography";

export function PostForm({
  initialPost,
  goalId,
  goalTitle,
  labels,
}: {
  initialPost?: Post;
  goalId?: number;
  goalTitle?: string;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const createPost = useCreatePostMutation();
  const updatePost = useUpdatePostMutation(initialPost?.id ?? 0);
  const { data: categories = [] } = useCategoriesQuery();

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [caption, setCaption] = useState(initialPost?.caption ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(
    initialPost?.category?.id ?? initialPost?.category_id ?? null,
  );
  const [categoryOpen, setCategoryOpen] = useState(false);

  const selectedCategory = categories.find((item) => item.id === categoryId);
  const isPending = createPost.isPending || updatePost.isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const mediaType: PostMediaType = file
      ? file.type.startsWith("video")
        ? "video"
        : "image"
      : (initialPost?.media_type ?? "none");

    const payload: PostPayload = {
      title: trimmedTitle,
      caption: caption.trim(),
      category_id: categoryId,
      visibility: initialPost?.visibility ?? "public",
      media_type: mediaType,
      media_tone: initialPost?.media_tone ?? "primary",
    };

    if (!initialPost && goalId) {
      payload.goal_id = goalId;
    }

    const onError = () => toast.error(labels.error);

    if (initialPost) {
      updatePost.mutate(
        { payload, media: file },
        {
          onSuccess: (post) => router.push(`/app/posts/${post.id}`),
          onError,
        },
      );
    } else {
      createPost.mutate(
        { payload, media: file },
        {
          onSuccess: (post) => router.push(`/app/posts/${post.id}`),
          onError,
        },
      );
    }
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
          onChange={(event) => {
            const selected = event.target.files?.[0] ?? null;
            setFile(selected);
            setFileName(selected?.name ?? "");
          }}
        />
      </Label>

      <div className="space-y-2">
        <Label>{labels.category}</Label>
        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              tone="neutral"
              className="h-11 w-full justify-between rounded-2xl bg-card px-3.5"
            >
              <span className="flex items-center gap-2">
                <Icon
                  icon="solar:tag-linear"
                  className="size-4 text-primary"
                  aria-hidden="true"
                />
                {selectedCategory?.name ?? labels.categoryPlaceholder}
              </span>
              <Icon
                icon="solar:alt-arrow-down-linear"
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[358px] rounded-2xl p-1">
            <Command>
              <CommandInput placeholder={labels.categorySearch} />
              <CommandList>
                <CommandEmpty>{labels.noCategory}</CommandEmpty>
                <CommandGroup>
                  {categories.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.name}
                      onSelect={() => {
                        setCategoryId((current) =>
                          current === item.id ? null : item.id,
                        );
                        setCategoryOpen(false);
                      }}
                      data-checked={categoryId === item.id}
                    >
                      <Icon
                        icon="solar:tag-linear"
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      {item.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

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

      {!initialPost && !file ? (
        <Typography as="p" variant="muted" className="text-center text-xs">
          {labels.requireMedia}
        </Typography>
      ) : null}

      <Button
        type="submit"
        disabled={!title.trim() || isPending || (!initialPost && !file)}
        className="h-12 w-full rounded-2xl font-bold"
      >
        <Icon icon="solar:verified-check-bold" className="size-5" aria-hidden="true" />
        {initialPost ? labels.save : labels.submit}
      </Button>
    </form>
  );
}

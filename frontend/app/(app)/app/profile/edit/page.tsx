"use client";

import { Icon } from "@iconify/react";
import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useMeQuery, useUpdateMeMutation } from "@/apis/queries/users/queries";
import { ProfilePageHeader } from "@/components/page/profile/profile-page-header";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { profileSchema, type ProfileFormValues } from "@/validations/profile-validation";

export default function EditProfilePage() {
  const t = useTranslations("app.editProfile");
  const router = useRouter();
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { data: user, isLoading } = useMeQuery();
  const updateProfile = useUpdateMeMutation();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.display_name ?? "",
      bio: user?.bio ?? "",
    },
  });

  async function handleSubmit(values: ProfileFormValues) {
    try {
      await updateProfile.mutateAsync({
        display_name: values.name,
        bio: values.bio,
      });
      toast.success(t("updated"));
      router.push("/app/profile");
    } catch {
      toast.error(t("updateError"));
    }
  }

  const submitButton = (
    <Button
      type="submit"
      form="edit-profile-form"
      variant="ghost"
      tone="primary"
      size="sm"
      className="font-semibold"
      disabled={updateProfile.isPending}
    >
      {t("save")}
    </Button>
  );

  if (isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-[390px] flex-col gap-4 px-1 md:max-w-3xl">
        <ProfilePageHeader title={t("title")} backLabel={t("back")} />
        <Skeleton className="mt-2 h-[92px] rounded-[18px]" />
        <Skeleton className="mx-auto size-[98px] rounded-full" />
        <Skeleton className="h-[46px] rounded-2xl" />
        <Skeleton className="h-[46px] rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </section>
    );
  }

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-[390px] flex-col px-1 md:max-w-3xl">
      <ProfilePageHeader title={t("title")} backLabel={t("back")} action={submitButton} />

      <form
        id="edit-profile-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-1 flex-col"
      >
        <input ref={bannerInputRef} type="file" accept="image/*" hidden />
        <input ref={avatarInputRef} type="file" accept="image/*" hidden />

        <Button
          type="button"
          variant="outline"
          tone="primary"
          onClick={() => bannerInputRef.current?.click()}
          className="mt-2 h-[92px] w-full flex-col gap-2 rounded-[18px] border-border bg-card text-xs font-semibold shadow-none hover:bg-accent"
        >
          <Icon icon="solar:camera-linear" className="size-7" aria-hidden="true" />
          {t("changeBanner")}
        </Button>

        <Button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          className="mx-auto mt-6 size-[98px] flex-col gap-1 rounded-full border-4 border-background text-[10px] font-semibold shadow-[0_10px_18px_-6px_rgba(0,0,0,0.2)]"
        >
          <Icon icon="solar:camera-bold" className="size-7" aria-hidden="true" />
          {t("profilePhoto")}
        </Button>

        <FieldGroup className="mt-8 gap-4">
          <Field data-invalid={Boolean(form.formState.errors.name)}>
            <FieldLabel
              htmlFor="profile-name"
              className="text-[10px] font-bold text-muted-foreground"
            >
              {t("name")}
            </FieldLabel>
            <Input
              id="profile-name"
              {...form.register("name")}
              className="h-[46px] rounded-2xl border-border bg-card px-[15px] text-[13px] text-foreground"
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>

          {user ? (
            <Field>
              <FieldLabel
                htmlFor="profile-username"
                className="text-[10px] font-bold text-muted-foreground"
              >
                {t("username")}
              </FieldLabel>
              <Input
                id="profile-username"
                value={`@${user.username}`}
                readOnly
                disabled
                className="h-[46px] rounded-2xl border-border bg-muted/40 px-[15px] text-[13px] text-muted-foreground"
              />
            </Field>
          ) : null}

          <Field data-invalid={Boolean(form.formState.errors.bio)}>
            <FieldLabel
              htmlFor="profile-bio"
              className="text-[10px] font-bold text-muted-foreground"
            >
              {t("bio")}
            </FieldLabel>
            <Textarea
              id="profile-bio"
              {...form.register("bio")}
              className="min-h-16 resize-none rounded-2xl border-border bg-card px-[15px] py-3 text-[13px] leading-[18px] text-foreground"
            />
            <FieldError errors={[form.formState.errors.bio]} />
          </Field>
        </FieldGroup>

        <Button
          type="submit"
          size="lg"
          disabled={updateProfile.isPending}
          className="mt-auto h-12 w-full rounded-xl text-sm font-semibold"
        >
          {t("update")}
        </Button>
      </form>
    </section>
  );
}

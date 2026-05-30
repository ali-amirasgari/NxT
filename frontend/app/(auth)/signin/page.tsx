"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";

import { useLoginMutation } from "@/apis/queries/auth/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { signinSchema, type SigninFormValues } from "@/validations/auth-validation";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useLoginMutation();

  const onSubmit = (values: SigninFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Typography as="div" className="text-lg font-semibold">
            Sign in
          </Typography>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
                <FieldError>{errors.email?.message}</FieldError>
              </FieldContent>
            </Field>

            <Field>
              <FieldContent>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="pr-10"
                    aria-invalid={Boolean(errors.password)}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <FieldError>{errors.password?.message}</FieldError>
              </FieldContent>
            </Field>
          </FieldGroup>

          {loginMutation.error ? (
            <FieldError>
              {loginMutation.error instanceof Error
                ? loginMutation.error.message
                : "Unable to sign in. Please try again."}
            </FieldError>
          ) : null}

          <div className="flex gap-2">
            <Button
              className="flex-1"
              type="submit"
              variant="default"
              tone="primary"
              loading={loginMutation.isPending || isSubmitting}
              disabled={loginMutation.isPending || isSubmitting}
            >
              Continue
            </Button>
            <Button type="button" variant="outline" tone="neutral" asChild>
              <Link href="/landing">Back</Link>
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <Typography as="p" className="text-sm text-muted-foreground">
          No account?{" "}
          <Typography asChild tone="primary" className="underline underline-offset-4">
            <Link href="/signup">Create one</Link>
          </Typography>
        </Typography>
      </CardFooter>
    </Card>
  );
}


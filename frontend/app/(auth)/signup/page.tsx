"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";

import { useRegisterMutation } from "@/apis/queries/auth/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { signupSchema, type SignupFormValues } from "@/validations/auth-validation";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useRegisterMutation();

  const onSubmit = (values: SignupFormValues) => {
    registerMutation.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Typography as="div" className="text-lg font-semibold">
            Create account
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
                    autoComplete="new-password"
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

            <Field>
              <FieldContent>
                <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className="pr-10"
                    aria-invalid={Boolean(errors.confirmPassword)}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <FieldError>{errors.confirmPassword?.message}</FieldError>
              </FieldContent>
            </Field>
          </FieldGroup>

          {registerMutation.error ? (
            <FieldError>
              {registerMutation.error instanceof Error
                ? registerMutation.error.message
                : "Unable to create account. Please try again."}
            </FieldError>
          ) : null}

          <Button
            type="submit"
            variant="default"
            tone="primary"
            className="w-full font-bold"
            loading={registerMutation.isPending || isSubmitting}
            disabled={registerMutation.isPending || isSubmitting}
          >
            Sign Up
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <Typography as="p" className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Typography asChild tone="primary" className="underline underline-offset-4">
            <Link href="/signin">Sign in</Link>
          </Typography>
        </Typography>
      </CardFooter>
    </Card>
  );
}


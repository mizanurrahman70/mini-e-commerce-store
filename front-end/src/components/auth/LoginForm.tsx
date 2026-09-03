"use client";

// Login form. Submits credentials to AuthContext.login (which calls the server
// action that sets the httpOnly cookie) then redirects. Validation errors are
// shown inline under each field.

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; form?: string }>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!identifier.trim()) nextErrors.identifier = "Email or username is required";
    if (!password) nextErrors.password = "Password is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    const ok = await login({ identifier: identifier.trim(), password });
    setPending(false);

    if (ok) {
      const redirectTo = searchParams.get("redirect") ?? "/";
      router.push(redirectTo);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {errors.form && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {errors.form}
        </p>
      )}

      <Field label="Email or username" error={errors.identifier}>
        <Input
          type="text"
          autoComplete="username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          invalid={!!errors.identifier}
          placeholder="you@example.com"
        />
      </Field>

      <Field label="Password" error={errors.password}>
        <Input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          invalid={!!errors.password}
          placeholder="••••••••"
        />
      </Field>

      <Button type="submit" isLoading={pending} className="w-full">
        Sign in
      </Button>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-indigo-600 hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}

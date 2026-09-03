"use client";

// Registration form. Submits to AuthContext.register (which sets the httpOnly
// cookie via a server action) then redirects. Validation errors are inline.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

interface Errors {
  username?: string;
  email?: string;
  password?: string;
  form?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Errors = {};
    if (!username.trim()) nextErrors.username = "Username is required";
    if (!/.+@.+\..+/.test(email)) nextErrors.email = "Enter a valid email address";
    if (password.length < 6) nextErrors.password = "Password must be at least 6 characters";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    const ok = await register({ username: username.trim(), email: email.trim(), password });
    setPending(false);

    if (ok) {
      router.push("/");
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

      <Field label="Username" error={errors.username}>
        <Input
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          invalid={!!errors.username}
          placeholder="johndoe"
        />
      </Field>

      <Field label="Email" error={errors.email}>
        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          invalid={!!errors.email}
          placeholder="you@example.com"
        />
      </Field>

      <Field label="Password" error={errors.password}>
        <Input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          invalid={!!errors.password}
          placeholder="At least 6 characters"
        />
      </Field>

      <Button type="submit" isLoading={pending} className="w-full">
        Create account
      </Button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

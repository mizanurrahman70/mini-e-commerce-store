import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card, CardContent } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <Card className="w-full">
        <CardContent>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500">
            Join to start shopping and placing orders.
          </p>
          <div className="mt-6">
            <RegisterForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";


import Link from "next/link";
import { User as UserIcon, Shield, KeyRound, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePermission } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ListSkeleton } from "@/components/ui/Skeleton";

// Human-friendly label + tone per resource for the permission breakdown.
const RESOURCE_LABELS: Record<string, { label: string; tone: Parameters<typeof Badge>[0]["tone"] }> = {
  product: { label: "Products", tone: "indigo" },
  order: { label: "Orders", tone: "info" },
  review: { label: "Reviews", tone: "success" },
  category: { label: "Categories", tone: "warning" },
  user: { label: "Users", tone: "danger" },
};

const ACTION_LABELS: Record<string, string> = {
  read: "View",
  create: "Create",
  update: "Edit",
  delete: "Delete",
};

function ProfileContent() {
  const { user, role, permissions, isLoading } = useAuth();
  const canVendor = usePermission("product", "create");
  const canAdmin = usePermission("user", "read");

  if (isLoading) {
    return <ListSkeleton rows={5} />;
  }

  if (!user) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <CardContent className="py-10">
          <h2 className="text-lg font-semibold text-gray-900">You&apos;re not signed in</h2>
          <p className="mt-1 text-sm text-gray-500">
            Log in to view your profile, role and permissions.
          </p>
          <Link
            href="/login?redirect=/profile"
            className="mt-4 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Log in
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Group the backend permission keys (e.g. "product:create") by resource.
  const grouped: { resource: string; actions: string[] }[] = [];
  if (permissions) {
    const byResource = new Map<string, Set<string>>();
    for (const key of permissions) {
      const sep = key.indexOf(":");
      const resource = sep === -1 ? "other" : key.slice(0, sep);
      const action = sep === -1 ? key : key.slice(sep + 1);
      if (!byResource.has(resource)) byResource.set(resource, new Set());
      byResource.get(resource)!.add(action);
    }
    for (const [resource, actions] of byResource) {
      grouped.push({ resource, actions: [...actions].sort() });
    }
    grouped.sort((a, b) => a.resource.localeCompare(b.resource));
  }

  return (
    <div className="space-y-6">
      {/* Account */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <UserIcon className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {user.username ?? "User"}
              </h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <Badge tone="indigo" className="capitalize">
              {role ?? "authenticated"}
            </Badge>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Member since
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                {formatDate(user.createdAt) || "—"}
              </dd>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Account status
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                <span className="inline-flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  {user.blocked ? "Blocked" : user.confirmed === false ? "Unconfirmed" : "Active"}
                </span>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Permissions — straight from Strapi role config */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-indigo-600" />
            <CardTitle>Your permissions</CardTitle>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            These come from your role&apos;s configuration in Strapi (Settings &rarr;
            Roles). Only actions allowed for the <span className="font-medium">{role ?? "authenticated"}</span>{" "}
            role are shown.
          </p>

          {permissions && grouped.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {grouped.map(({ resource, actions }) => {
                const meta = RESOURCE_LABELS[resource] ?? {
                  label: resource.charAt(0).toUpperCase() + resource.slice(1),
                  tone: "neutral" as const,
                };
                return (
                  <div key={resource} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">
                        {meta.label}
                      </span>
                      <Badge tone={meta.tone}>{actions.length}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {actions.map((action) => (
                        <span
                          key={action}
                          className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                        >
                          {ACTION_LABELS[action] ?? action}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
              No additional permissions are enabled for this role.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Role-based shortcuts (UX only — security enforced server-side) */}
      {(canVendor || canAdmin) && (
        <Card>
          <CardContent>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-indigo-600" />
              <CardTitle>Dashboard access</CardTitle>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {canVendor && (
                <Link
                  href="/vendor/dashboard"
                  className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Vendor dashboard
                </Link>
              )}
              {canAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                  Admin dashboard
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <p className="mt-1 text-sm text-gray-500">
        Your account details and the permissions granted to you.
      </p>
      <div className="mt-8">
        <ProfileContent />
      </div>
    </div>
  );
}

// Admin: user list. Admin-only (protected by proxy.ts). Shows each user's
// email, name, role and status.

import { Suspense } from "react";
import { getServerJwt } from "@/lib/server";
import { getUsers, roleName } from "@/lib/strapi/users";
import { Badge } from "@/components/ui/Badge";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDate } from "@/lib/format";

async function Users() {
  const jwt = await getServerJwt();
  if (!jwt) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        Not authenticated.
      </div>
    );
  }

  const result = await getUsers(jwt);
  if (result.error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h3 className="font-semibold text-amber-800">Unable to load users</h3>
        <p className="mt-1 text-sm text-amber-700">{result.error} Please try again shortly.</p>
      </div>
    );
  }

  const users = result.data ?? [];
  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        No users found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3">User</th>
            <th className="hidden px-4 py-3 sm:table-cell">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="hidden px-4 py-3 md:table-cell">Status</th>
            <th className="hidden px-4 py-3 md:table-cell">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((u) => {
            const role = roleName(u);
            return (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                      {(u.username ?? u.email ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">{u.username ?? "—"}</span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-sm text-gray-600 sm:table-cell">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge tone={role === "admin" ? "indigo" : role === "vendor" ? "info" : "default"}>
                    {role}
                  </Badge>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <Badge tone={u.blocked ? "danger" : "success"}>
                    {u.blocked ? "Blocked" : "Active"}
                  </Badge>
                </td>
                <td className="hidden px-4 py-3 text-sm text-gray-500 md:table-cell">
                  {formatDate(u.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      <p className="mt-1 text-sm text-gray-500">
        Everyone with an account on your store.
      </p>
      <Card className="mt-8" padding="none">
        <CardContent>
          <Suspense fallback={<ListSkeleton rows={6} />}>
            <Users />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";

export function NavAuthButtons() {
  const { isSignedIn } = useAuth();
  if (isSignedIn) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          Dashboard
        </Link>
        <UserButton />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-4">
      <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
      <Link href="/sign-up" className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
        Get started free
      </Link>
    </div>
  );
}


"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn, LogOut, UserRound } from "lucide-react";

import { clientAuth, useSession } from "@/lib/clientAuth";
import PriceTicker from "./PriceTicker";

// Category data type
type Category = {
  id: string;
  slug: string;
  nameBn: string;
  icon: string;
};

// Category API endpoint
const CATEGORY_API =
  "https://openapi.programming-hero.com/api/bazardor/categories";

export default function Navbar() {
  const pathname = usePathname();

  // Get the current authentication session
  const { data: session, isPending } = useSession();
  const user = session?.user;

  // Store categories and the current date
  const [categories, setCategories] = useState<Category[]>([]);
  const [date, setDate] = useState("");

  // Fetch categories when the component loads
  useEffect(() => {
    const controller = new AbortController();

    async function fetchCategories() {
      try {
        const response = await fetch(CATEGORY_API, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const result: unknown = await response.json();

        // Extract categories from the API response
        let categoryData: unknown = [];

        if (Array.isArray(result)) {
          categoryData = result;
        } else if (
          typeof result === "object" &&
          result !== null &&
          "data" in result
        ) {
          categoryData = result.data;
        }

        if (Array.isArray(categoryData)) {
          setCategories(categoryData as Category[]);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name !== "AbortError"
        ) {
          console.error("Category fetch error:", error);
        }
      }
    }

    fetchCategories();

    return () => controller.abort();
  }, []);

  // Format the current date in Bangla
  useEffect(() => {
    const today = new Intl.DateTimeFormat("bn-BD", {
      timeZone: "Asia/Dhaka",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());

    setDate(today);
  }, []);

  // Handle user sign out
  async function handleSignOut() {
    try {
      await clientAuth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#E1EAE2] bg-white shadow-sm">

      {/* First Row: Logo and Authentication */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4">

        {/* Website Logo and Date */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl" aria-hidden="true">
            🛒
          </span>

          <div>
            <h1 className="text-xl font-bold text-[#078B43]">
              বাজার দর
            </h1>

            <p className="text-xs text-[#778078]">
              {date || "বাংলাদেশের বাজারদর"}
            </p>
          </div>
        </Link>

        {/* Authentication Buttons */}
        <div className="flex items-center gap-2">
          {isPending ? (
            <p className="text-sm text-[#778078]">
              অপেক্ষা করুন...
            </p>
          ) : user ? (
            <>
              {/* Profile Link */}
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg border border-[#DCE8DF] px-3 py-2 text-sm font-medium text-[#078B43] transition hover:bg-[#F1F6F1]"
              >
                <UserRound size={18} />

                <span className="hidden sm:inline">
                  {user.name || "প্রোফাইল"}
                </span>
              </Link>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-lg bg-[#078B43] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#067638]"
              >
                <LogOut size={17} />

                <span className="hidden sm:inline">
                  সাইন আউট
                </span>
              </button>
            </>
          ) : (
            <>
              {/* Sign In Link */}
              <Link
                href="/sign-in"
                className="flex items-center gap-1 rounded-lg border border-[#DCE8DF] px-3 py-2 text-sm font-medium text-[#078B43] transition hover:bg-[#F1F6F1]"
              >
                <LogIn size={16} />
                সাইন ইন
              </Link>

              {/* Sign Up Link */}
              <Link
                href="/sign-up"
                className="rounded-lg bg-[#078B43] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#067638]"
              >
                সাইন আপ
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Second Row: Category Navigation */}
      <nav
        aria-label="পণ্যের ক্যাটাগরি"
        className="mx-auto flex max-w-7xl gap-2 overflow-x-auto border-t border-[#E1EAE2] px-4 py-3"
      >
        {categories.map((category) => {
          const href = `/category/${category.slug}`;

          // Check whether the current category is active
          const isActive =
            pathname === href ||
            pathname.startsWith(`${href}/`);

          return (
            <Link
              key={category.id}
              href={href}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-[#078B43] text-white shadow-sm"
                  : "text-[#465249] hover:bg-[#F1F6F1] hover:text-[#078B43]"
              }`}
            >
              {category.icon} {category.nameBn}
            </Link>
          );
        })}
      </nav>

      {/* Third Row: Product Price Ticker */}
      <PriceTicker />

    </header>
  );
}

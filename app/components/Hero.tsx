"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  const [today, setToday] = useState("");

  // Get the current date in Bangla.
  useEffect(() => {
    const formattedDate = new Intl.DateTimeFormat("bn-BD", {
      timeZone: "Asia/Dhaka",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());

    setToday(formattedDate);
  }, []);

  return (
    <section className="bg-[#F1F6F1] px-4 py-5 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col-reverse items-center justify-between gap-5 overflow-hidden rounded-2xl border border-[#E1EAE2] bg-[#FBFDFB] px-5 py-7 sm:px-8 md:min-h-[230px] md:flex-row md:gap-8 md:py-4">
        {/* Left Content */}
        <div className="w-full md:max-w-[72%] mb-20">
          {/* Date Badge */}
          <span className="inline-block rounded-full bg-[#E2F2E8] px-3 py-1 text-xs font-semibold text-[#16834A]">
            {today || "আজকের বাজারদর"}
          </span>

          {/* Main Heading */}
          <h1 className="mt-2 text-2xl font-extrabold leading-tight text-[#202A23] sm:text-3xl">
            আজকের বাজারের দাম এক নজরে
          </h1>

          {/* Subtitle */}
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#778078]">
            চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম — বাজারভিত্তিক
            বিস্তারিত, গড়, সর্বনিম্ন-সর্বোচ্চ এবং দামের পরিবর্তন এক জায়গায়।
          </p>

          {/* Primary CTA */}
          <Link
            href="#সব-পণ্য"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#078B43] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_3px_0_#056B35] transition-all duration-200 hover:bg-[#067638] hover:shadow-[0_2px_0_#056B35] active:translate-y-0.5 active:shadow-none"
          >
            সব পণ্য দেখুন
          </Link>
        </div>

        {/* Right Hero Image */}
        <div className="flex w-full shrink-0 items-center justify-center md:w-[280px]">
          <Image
            src="/bazar-hero.png"
            alt="তাজা ফল ও সবজির বাজার"
            width={350}
            height={280}
            priority
            className="h-[200px] w-[240px] object-contain sm:h-[230px] sm:w-[270px] md:h-[260px] md:w-[300px]"
          />
        </div>
      </div>
    </section>
  );
}

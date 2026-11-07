export default function Footer() {
  return (
    <footer className="border-t border-[#E1EAE2] shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-center sm:px-6 md:flex-row md:text-left">
        {/* Left Content */}
        <p className="text-sm font-semibold text-[#778078]">
          বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।
        </p>

        {/* Right Disclaimer */}
        <p className="text-xs leading-relaxed text-[#778078] sm:text-sm">
          সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।
        </p>
      </div>
    </footer>
  );
}

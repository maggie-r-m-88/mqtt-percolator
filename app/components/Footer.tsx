"use client";

export default function FooterAttribution() {
  return (
    <div className="flex items-center gap-3 text-xs text-slate-300 bg-slate-800 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50 shadow-lg">
      <span>
        Built by{" "}
        <a
          href="https://maggie-martin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-[#E19B25] transition-colors font-semibold"
        >
          Maggie Martin
        </a>
      </span>

      <span className="opacity-40">•</span>

      <a
        href="https://github.com/maggie-r-m-88/mqtt-percolator"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-[#E19B25] transition-colors font-semibold"
      >
        Source Code
      </a>
    </div>
  );
}

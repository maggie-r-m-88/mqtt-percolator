"use client";

import { useState } from "react";
import { MOKA_CONTENT } from "../../lib/infoContent";
import { Info, X } from "lucide-react";

export default function FooterAttribution() {
    const [showModal, setShowModal] = useState(false);

    const stepColors: Record<string, string> = {
        idle: "bg-slate-500",
        heating: "bg-orange-500",
        brewing: "bg-blue-500",
        finished: "bg-emerald-500",
    };

    const steps = Object.entries(MOKA_CONTENT);

    return (
        <>
            {/* Footer */}
            <div className="flex items-center gap-3 text-xs text-slate-300 bg-slate-800 backdrop-blur-md px-3 md:px-4 py-1 md:py-2 rounded-full border border-slate-700/50 shadow-lg">
                <span >
                    Built by{" "}
                    <a
                        href="https://maggie-martin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-[#E19B25] transition-colors font-semibold"
                    >
                        Maggie<span className="hidden md:inline"> Martin</span>
                    </a>
                </span>

                <span className="hidden sm:block opacity-40">•</span>

                {/* Desktop: text link */}
                <a
                    href="https://github.com/maggie-r-m-88/mqtt-percolator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline hover:text-[#E19B25] transition-colors font-semibold"
                >
                    Source Code
                </a>

                {/* Mobile: GitHub icon */}
                <a
                    href="https://github.com/maggie-r-m-88/mqtt-percolator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sm:hidden p-2 rounded-full border border-slate-600 hover:bg-slate-700 transition"
                    aria-label="Source Code on GitHub"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-github-icon"
                    >
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                        <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                </a>

                <span className="lg:hidden opacity-40">•</span>
                {/* Mobile-only info button */}
                <button
                    onClick={() => setShowModal(true)}
                    className="ml-auto lg:hidden p-1 rounded-full hover:bg-slate-700 transition"
                    aria-label="Show Moka Process Info"
                >
                    <Info className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-700"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>

                        <h2 className="text-white font-bold mb-4 text-center">
                            Moka Pot Process
                        </h2>

                        {/* Timeline */}
                        <div className="relative pl-6">
                            {/* Gray vertical line */}
                            <div className="absolute top-0 left-3 w-0.5 h-full bg-slate-600"></div>

                            {steps.map(([key, step], i) => (
                                <div key={i} className="relative mb-8 last:mb-0 flex items-start">
                                    {/* Dot */}
                                    <div
                                        className={`absolute left-[-1rem] w-3 h-3 rounded-full ${stepColors[key]}`}
                                    />

                                    {/* Text */}
                                    <div className="ml-4">
                                        <h3 className="text-white font-semibold text-sm mb-2">{step.title}</h3>
                                        <p className="text-slate-300 text-sm leading-relaxed">
                                            {step.body}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

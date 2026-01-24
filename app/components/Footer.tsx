'use client';

import { useState } from "react";
import { MOKA_CONTENT } from "../../lib/infoContent";
import { Info, X } from "lucide-react";

export default function FooterAttribution() {
    const [showModal, setShowModal] = useState(false);

    const steps = Object.values(MOKA_CONTENT);

    return (
        <>
            {/* Footer */}
            <div className="flex items-center gap-3 text-xs md:text-sm text-slate-800 py-1 md:py-2">
                <span>
                    Built by{" "}
                    <a
                        href="https://maggie-martin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-900 hover:text-[#E19B25] transition-colors font-semibold"
                    >
                        Maggie
                    </a>
                </span>

                <span className="hidden lg:inline opacity-40">•</span>

                <a
                    href="https://github.com/maggie-r-m-88/mqtt-percolator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden lg:inline text-slate-900 hover:text-[#E19B25] transition-colors font-semibold"
                >
                    Source Code
                </a>

                <a
                    href="https://github.com/maggie-r-m-88/mqtt-percolator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lg:hidden p-1 hover:text-[#E19B25] transition-colors"
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

                <button
                    onClick={() => setShowModal(true)}
                    className="lg:hidden p-1 rounded-full transition ml-auto"
                    aria-label="Show Moka Process Info"
                >
                    <Info className="w-5 h-5 text-slate-800 hover:text-[#E19B25]" />
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
                    <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-5 relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-700"
                        >
                            <X className="w-5 h-5 text-slate-800" />
                        </button>

                        <h2 className="text-slate-800 font-bold my-6 text-center">
                            Moka Pot Process
                        </h2>

                        {/* Steps (no timeline styling) */}
                        <div className="flex flex-col gap-6">
                            {steps.map((step, i) => (
                                <div key={i} className="p-4 bg-slate-100/70 rounded-lg">
                                    <h3 className="text-slate-800 font-semibold text-sm mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-slate-700 text-sm leading-relaxed">
                                        {step.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

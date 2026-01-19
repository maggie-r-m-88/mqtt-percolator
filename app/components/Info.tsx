"use client";

import { MokaState } from "@/app/page";

type Props = {
  state: MokaState | null;
  pressure: number | null;
};

const CONTENT: Record<MokaState, { title: string; body: string }> = {
  idle: {
    title: "Moka Pot Ready",
    body: "Fill the bottom chamber with water, add coffee to the basket, and place the pot on heat to begin brewing.",
  },
  heating: {
    title: "Heating Water",
    body: "Water in the lower chamber is heating up. As temperature rises, pressure begins to build.",
  },
  brewing: {
    title: "Brewing Coffee",
    body: "Pressure forces hot water up through the coffee grounds and into the upper chamber.",
  },
  finished: {
    title: "Coffee Ready",
    body: "Brewing is complete. Remove from heat and enjoy your coffee.",
  },
};

export default function MokaProcessInfo({ state, pressure }: Props) {
  // 🔑 Always resolve to a valid state
  const safeState: MokaState = state ?? "idle";
  const { title, body } = CONTENT[safeState];

  return (
    <div className="w-80 bg-slate-800/70 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 shadow-xl">
      <h3 className="text-white font-semibold text-lg mb-2">
        {title}
      </h3>

      <p className="text-slate-300 text-sm leading-relaxed">
        {body}
      </p>

      {pressure !== null && safeState !== "idle" && (
        <p className="mt-3 text-xs text-slate-400">
          Pressure: <span className="text-orange-400 font-medium">
            {pressure.toFixed(2)} bar
          </span>
        </p>
      )}
    </div>
  );
}

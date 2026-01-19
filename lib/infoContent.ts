export const MOKA_CONTENT: Record<string, { title: string; body: string }> = {
  idle: {
    title: "System at Rest",
    body:
      "The moka pot is at ambient temperature and pressure. Water remains in the lower chamber, and no fluid flow occurs until external heat is applied.",
  },
  heating: {
    title: "Thermal Expansion & Pressure Build-Up",
    body:
      "Heat increases the temperature of the water and trapped air in the lower chamber. As vapor pressure rises in this sealed volume, internal pressure increases while the liquid remains below boiling.",
  },
  brewing: {
    title: "Pressure-Driven Extraction",
    body:
      "Once internal pressure exceeds the hydrostatic resistance of the coffee bed, hot water is forced upward through the grounds. Soluble compounds are extracted as fluid flows into the upper chamber.",
  },
  finished: {
    title: "Pressure Equalization",
    body:
      "Water in the lower chamber has been displaced, and pressure rapidly equalizes through the safety valve and upper outlet. Extraction ceases and the brewed coffee stabilizes in the upper chamber.",
  },
};

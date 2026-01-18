import { getFrontendMqttClient } from "./mqttClientFrontend";

/* ---------------- GLOBAL SINGLETON ---------------- */
declare global {
  var frontendMokaSimulator:
    | {
        interval: NodeJS.Timeout | null;
        isRunning: boolean;
        temperature: number;
        pressure: number;
        coffeeVolume: number;
        state: "idle" | "heating" | "brewing" | "finished";
      }
    | undefined;
}

if (!global.frontendMokaSimulator) {
  global.frontendMokaSimulator = {
    interval: null,
    isRunning: false,
    temperature: 20,
    pressure: 0,
    coffeeVolume: 0,
    state: "idle",
  };
}

const sim = global.frontendMokaSimulator;

/* ---------------- SIMULATION CONSTANTS ---------------- */
const TICK_MS = 200;
const TOTAL_TICKS = 20_000 / TICK_MS; // 20 seconds total

const TEMP_DELTA = (95 - 20) / TOTAL_TICKS;
const COFFEE_DELTA = 100 / TOTAL_TICKS;

/* ---------------- PUBLISH HELPERS ---------------- */
function publish(topic: string, value: string | number) {
  const client = getFrontendMqttClient();
  client.publish(`moka/${topic}`, String(value), { qos: 1, retain: true });
}

function publishAll() {
  publish("temperature", sim.temperature.toFixed(2));
  publish("pressure", sim.pressure.toFixed(2));
  publish("coffee_volume", sim.coffeeVolume.toFixed(1));
  publish("state", sim.state);
}

/* ---------------- CONTROL FUNCTIONS ---------------- */
export function startSimulation() {
  // If already running and not finished, ignore
  if (sim.isRunning && sim.state !== "finished") {
    console.log("⚠️ Start ignored — Moka pot already running (frontend mode)");
    publishAll();
    return;
  }

  console.log("▶️ Starting moka simulation (frontend mode)");

  // Reset values before starting
  sim.temperature = 20;
  sim.pressure = 0;
  sim.coffeeVolume = 0;
  sim.state = "heating";
  sim.isRunning = true;

  publishAll();

  sim.interval = setInterval(() => {
    // Temperature rise
    if (sim.temperature < 95) sim.temperature += TEMP_DELTA;

    // Pressure calculation
    sim.pressure = Math.min(1.5, Math.max(0, (sim.temperature - 50) / 30));

    // Brewing logic
    if (sim.pressure >= 1.0 && sim.coffeeVolume < 100) {
      sim.coffeeVolume += COFFEE_DELTA;
      sim.state = "brewing";
    }

    // Finish logic
    if (sim.coffeeVolume >= 100) {
      sim.coffeeVolume = 100;
      sim.state = "finished";
      stopSimulation(true);
      return;
    }

    publishAll();
  }, TICK_MS);
}

export function stopSimulation(fromFinish = false) {
  console.log("⏹️ stopSimulation called (frontend mode)");

  if (sim.interval) {
    clearInterval(sim.interval);
    sim.interval = null;
  }

  if (fromFinish) {
    console.log("✅ Brew finished — holding final state (frontend mode)");
    sim.isRunning = false;
    publishAll();
    return;
  }

  // HARD RESET
  sim.temperature = 20;
  sim.pressure = 0;
  sim.coffeeVolume = 0;
  sim.state = "idle";
  sim.isRunning = false;

  publishAll();
}

export function resetSimulation() {
  console.log("🔄 resetSimulation called (frontend mode)");

  if (sim.interval) {
    clearInterval(sim.interval);
    sim.interval = null;
  }

  sim.temperature = 20;
  sim.pressure = 0;
  sim.coffeeVolume = 0;
  sim.state = "idle";
  sim.isRunning = false;

  publishAll();
}


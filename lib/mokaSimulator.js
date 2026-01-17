require("dotenv").config();
const mqtt = require("mqtt");

/* ---------------- ENV ---------------- */
const CLIENT_ID = "moka-simulator";
const BROKER_URL = process.env.HIVEMQ_BROKER_URL;
const USERNAME = process.env.HIVEMQ_USERNAME;
const PASSWORD = process.env.HIVEMQ_PASSWORD;

if (!BROKER_URL || !USERNAME || !PASSWORD) {
  throw new Error("Missing HiveMQ environment variables");
}

/* ---------------- MQTT CONNECTION ---------------- */

const client = mqtt.connect(BROKER_URL, {
  clientId: CLIENT_ID,
  username: USERNAME,
  password: PASSWORD,
  clean: false,
  reconnectPeriod: 1000,
});

client.on("connect", () => {
  console.log("✅ MQTT backend connected");
});

/* ---------------- GLOBAL SINGLETON ---------------- */

if (!global.mokaSimulator) {
  global.mokaSimulator = {
    interval: null,
    temperature: 20,
    pressure: 0,
    coffeeVolume: 0,
    state: "idle",
  };
}

const sim = global.mokaSimulator;

/* ---------------- SIMULATION CONSTANTS ---------------- */

const TICK_MS = 200;
const TOTAL_TICKS = 20_000 / TICK_MS; // 20 seconds total

const TEMP_DELTA = (95 - 20) / TOTAL_TICKS;
const COFFEE_DELTA = 100 / TOTAL_TICKS;

/* ---------------- PUBLISH HELPER ---------------- */

function publish(topic, value) {
  client.publish(`moka/${topic}`, String(value), {
    qos: 1,
    retain: true,
  });
}

function publishAll() {
  publish("temperature", sim.temperature.toFixed(2));
  publish("pressure", sim.pressure.toFixed(2));
  publish("coffee_volume", sim.coffeeVolume.toFixed(1));
  publish("state", sim.state);
}

/* ---------------- CONTROL FUNCTIONS ---------------- */

function startSimulation() {
  // --- Reset to initial values first ---
  sim.temperature = 20;
  sim.pressure = 0;
  sim.coffeeVolume = 0;
  sim.state = "heating";

  publishAll(); // update frontend immediately

  // If a simulation is already running, clear it first
  if (sim.interval) {
    clearInterval(sim.interval);
    sim.interval = null;
  }

  console.log("▶️ Starting moka simulation");

  sim.interval = setInterval(() => {
    // --- Temperature rise ---
    if (sim.temperature < 95) {
      sim.temperature += TEMP_DELTA;
    }

    // --- Pressure calculation ---
    sim.pressure = Math.min(
      1.5,
      Math.max(0, (sim.temperature - 50) / 30)
    );

    // --- Brewing logic ---
    if (sim.pressure >= 1.0 && sim.coffeeVolume < 100) {
      sim.coffeeVolume += COFFEE_DELTA;
      sim.state = "brewing";
    }

    if (sim.coffeeVolume >= 100) {
      sim.coffeeVolume = 100;
      sim.state = "finished";

      stopSimulation(true); // freeze at final state
      return;
    }

    // --- Publish updates each tick ---
    publishAll();
  }, TICK_MS);
}


function stopSimulation(fromFinish = false) {
  console.log("⏹️ stopSimulation called");

  if (sim.interval) {
    clearInterval(sim.interval);
    sim.interval = null;
  }

  if (fromFinish) {
    // --- Finished: freeze final values ---
    console.log("✅ Brew finished — holding final state");
    publishAll(); // send final update once
    return;
  }

  // --- Manual stop: reset everything ---
  sim.temperature = 20;
  sim.pressure = 0;
  sim.coffeeVolume = 0;
  sim.state = "idle";

  publishAll();
}


function resetSimulation() {
  console.log("🔄 resetSimulation called");

  if (sim.interval) {
    clearInterval(sim.interval);
    sim.interval = null;
  }

  sim.temperature = 20;
  sim.pressure = 0;
  sim.coffeeVolume = 0;
  sim.state = "idle";

  publishAll();
}

/* ---------------- EXPORTS ---------------- */

module.exports = {
  startSimulation,
  stopSimulation,
  resetSimulation,
};

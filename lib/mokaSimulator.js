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
  clean: false, // persistent session
  reconnectPeriod: 1000,
});

client.on("connect", () => {
  console.log("✅ MQTT backend connected");
});

client.on("reconnect", () => {
  console.log("🔁 MQTT backend reconnecting");
});

client.on("error", (err) => {
  console.error("❌ MQTT error", err);
});

/* ---------------- GLOBAL SINGLETON ---------------- */

if (!global.mokaSimulator) {
  global.mokaSimulator = {
    interval: null,
    cooldownInterval: null,
    temperature: 20,
    pressure: 0,
    coffeeVolume: 0,
    state: "heating",
  };
}

const sim = global.mokaSimulator;

/* ---------------- SIMULATION CONSTANTS ---------------- */

const TICK_MS = 200;
const TOTAL_TICKS = 60_000 / TICK_MS;

const TEMP_DELTA = (95 - 20) / TOTAL_TICKS;
const COFFEE_DELTA = 100 / TOTAL_TICKS;

/* ---------------- PUBLISH HELPER ---------------- */

function publish(topic, value) {
  client.publish(`moka/${topic}`, String(value), {
    qos: 1,
    retain: true, // ✅ ensures frontend gets latest value on reconnect
  });
}


/* ---------------- CONTROL FUNCTIONS ---------------- */

function startSimulation() {
  if (sim.interval) {
    console.log("⚠️ Simulation already running");
    return;
  }

  console.log("▶️ Starting moka simulation");

  sim.interval = setInterval(() => {
    if (sim.temperature < 95) {
      sim.temperature += TEMP_DELTA;
    }

    sim.pressure = Math.min(
      1.5,
      Math.max(0, (sim.temperature - 50) / 30)
    );

    if (sim.pressure >= 1.0 && sim.coffeeVolume < 100) {
      sim.coffeeVolume += COFFEE_DELTA;
      sim.state = "brewing";
    } else if (sim.coffeeVolume >= 100) {
      sim.state = "finished";
    } else {
      sim.state = "heating";
    }

    publish("temperature", sim.temperature.toFixed(2));
    publish("pressure", sim.pressure.toFixed(2));
    publish("coffee_volume", sim.coffeeVolume.toFixed(1));
    publish("state", sim.state);

    if (sim.coffeeVolume >= 100) {
      stopSimulation();
    }
  }, TICK_MS);
}

function stopSimulation() {
  console.log("⏹️ stopSimulation called");
  console.log("Current state:", {
    interval: sim.interval ? "running" : "null",
    cooldownInterval: sim.cooldownInterval ? "running" : "null",
    temperature: sim.temperature,
    pressure: sim.pressure,
    coffeeVolume: sim.coffeeVolume,
    state: sim.state,
  });

  // Stop main simulation interval
  if (sim.interval) {
    console.log("⏹️ Stopping moka simulation");
    clearInterval(sim.interval);
    sim.interval = null;
  } else {
    console.log("⚠️ No simulation running");
  }

  // Avoid multiple cooldown intervals
  if (sim.cooldownInterval) {
    console.log("⚠️ Cooldown already running, skipping");
    return;
  }

  console.log("❄️ Starting cooldown");

  sim.cooldownInterval = setInterval(() => {
    // Cool temperature toward ambient
    if (sim.temperature > 20) sim.temperature -= 0.5;
    if (sim.temperature < 20) sim.temperature = 20;

    // Pressure tracks temperature
    sim.pressure = Math.min(
      1.5,
      Math.max(0, (sim.temperature - 50) / 30)
    );

    // Coffee volume drains if pressure is very low
    if (sim.pressure <= 0.1 && sim.coffeeVolume > 0) {
      sim.coffeeVolume -= 0.5;
      if (sim.coffeeVolume < 0) sim.coffeeVolume = 0;
    }

    // Update state
    if (sim.coffeeVolume === 0 && sim.temperature === 20) {
      sim.state = "idle"; // fully cooled
      clearInterval(sim.cooldownInterval);
      sim.cooldownInterval = null;
      console.log("❄️ Cooldown complete, system idle");
    } else if (sim.pressure > 0) {
      sim.state = "finished"; // still warm
    } else {
      sim.state = "idle"; // cooled but coffee remains
    }

    // Publish retained values for frontend
    publish("temperature", sim.temperature.toFixed(2));
    publish("pressure", sim.pressure.toFixed(2));
    publish("coffee_volume", sim.coffeeVolume.toFixed(1));
    publish("state", sim.state);
  }, TICK_MS); // same tick as simulation
}

function resetSimulation() {
  console.log("🔄 resetSimulation called");
  console.log("Before reset:", {
    interval: sim.interval ? "running" : "null",
    cooldownInterval: sim.cooldownInterval ? "running" : "null",
    temperature: sim.temperature,
    pressure: sim.pressure,
    coffeeVolume: sim.coffeeVolume,
    state: sim.state,
  });

  // Stop main simulation interval
  if (sim.interval) {
    console.log("Clearing main interval");
    clearInterval(sim.interval);
    sim.interval = null;
  }

  // Stop cooldown interval
  if (sim.cooldownInterval) {
    console.log("Clearing cooldown interval");
    clearInterval(sim.cooldownInterval);
    sim.cooldownInterval = null;
  }

  // Reset state
  sim.temperature = 20;
  sim.pressure = 0;
  sim.coffeeVolume = 0;
  sim.state = "heating"; // or "idle" if you prefer

  console.log("After reset:", {
    temperature: sim.temperature,
    pressure: sim.pressure,
    coffeeVolume: sim.coffeeVolume,
    state: sim.state,
  });

  // Publish retained messages so frontend updates immediately
  publish("temperature", sim.temperature.toFixed(2));
  publish("pressure", sim.pressure.toFixed(2));
  publish("coffee_volume", sim.coffeeVolume.toFixed(1));
  publish("state", sim.state);

  console.log("✅ Reset complete and published to MQTT");
}


/* ---------------- EXPORTS ---------------- */

module.exports = {
  startSimulation,
  stopSimulation,
  resetSimulation,
};

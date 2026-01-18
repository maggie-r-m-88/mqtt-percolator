"use client";

import { Client } from "paho-mqtt";

export type MokaState = "heating" | "brewing" | "finished" | "idle";

/* ---------------- ENV ---------------- */
const CLIENT_ID = "moka-simulator";
const USERNAME = process.env.NEXT_PUBLIC_HIVEMQ_USERNAME!;
const PASSWORD = process.env.NEXT_PUBLIC_HIVEMQ_PASSWORD!;
const WSS_URL = process.env.NEXT_PUBLIC_HIVEMQ_BROKER_URL!;

/* ---------------- GLOBAL SIMULATION ---------------- */
interface MokaSimulator {
  interval: number | null;
  isRunning: boolean;
  temperature: number;
  pressure: number;
  coffeeVolume: number;
  state: MokaState;
}

// Singleton simulator
if (!globalThis.mokaSimulator) {
  globalThis.mokaSimulator = {
    interval: null,
    isRunning: false,
    temperature: 20,
    pressure: 0,
    coffeeVolume: 0,
    state: "idle",
  } as MokaSimulator;
}
const sim: MokaSimulator = globalThis.mokaSimulator;

/* ---------------- SIMULATION CONSTANTS ---------------- */
const TICK_MS = 200;
const TOTAL_TICKS = 20_000 / TICK_MS;
const TEMP_DELTA = (95 - 20) / TOTAL_TICKS;
const COFFEE_DELTA = 100 / TOTAL_TICKS;

/* ---------------- MQTT CLIENT ---------------- */
let client: Client | null = null;
let connected = false;
let queue: Array<[string, string | number]> = []; // messages waiting for connection

export function initMokaPublisher(onConnect?: () => void) {
  if (client) return client;

  client = new Client(WSS_URL, CLIENT_ID);

  client.onConnectionLost = () => {
    console.warn("⚡ MQTT disconnected");
    connected = false;
  };

  client.connect({
    useSSL: true,
    userName: USERNAME,
    password: PASSWORD,
    cleanSession: false,
    onSuccess: () => {
      console.log("✅ MQTT Publisher connected");
      connected = true;

      // flush queued messages
      queue.forEach(([topic, value]) => client!.publish(topic, String(value)));
      queue = [];

      if (onConnect) onConnect();
    },
    onFailure: (err) => {
      console.error("❌ MQTT connection failed:", err);
    },
  });

  return client;
}

/* ---------------- PUBLISH HELPERS ---------------- */
function publish(topic: string, value: string | number) {
  if (!client || !connected) {
    // queue messages until connected
    queue.push([`moka/${topic}`, value]);
    console.warn("⚠️ MQTT not connected yet, queuing:", topic, value);
    return;
  }

  client.publish(`moka/${topic}`, String(value));
}

function publishAll() {
  publish("temperature", sim.temperature.toFixed(2));
  publish("pressure", sim.pressure.toFixed(2));
  publish("coffee_volume", sim.coffeeVolume.toFixed(1));
  publish("state", sim.state);
}

/* ---------------- SIMULATION ---------------- */
function runSimulation() {
  if (sim.isRunning && sim.state !== "finished") {
    publishAll();
    return;
  }

  sim.temperature = 20;
  sim.pressure = 0;
  sim.coffeeVolume = 0;
  sim.state = "heating";
  sim.isRunning = true;

  publishAll();

  sim.interval = window.setInterval(() => {
    if (sim.temperature < 95) sim.temperature += TEMP_DELTA;

    sim.pressure = Math.min(1.5, Math.max(0, (sim.temperature - 50) / 30));

    if (sim.pressure >= 1.0 && sim.coffeeVolume < 100) {
      sim.coffeeVolume += COFFEE_DELTA;
      sim.state = "brewing";
    }

    if (sim.coffeeVolume >= 100) {
      sim.coffeeVolume = 100;
      sim.state = "finished";
      stopSimulation(true);
      return;
    }

    publishAll();
  }, TICK_MS);
}

export function startSimulation() {
  initMokaPublisher(() => {
    runSimulation();
  });
}

export function stopSimulation(fromFinish = false) {
  if (sim.interval) {
    clearInterval(sim.interval);
    sim.interval = null;
  }

  if (fromFinish) {
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
  stopSimulation(false);
}

/* ---------------- API-LIKE WRAPPERS ---------------- */
export function start() {
  startSimulation();
  return Promise.resolve({ status: "started" });
}

export function stop() {
  stopSimulation();
  return Promise.resolve({ status: "stopped" });
}

export function reset() {
  resetSimulation();
  return Promise.resolve({ status: "reset" });
}

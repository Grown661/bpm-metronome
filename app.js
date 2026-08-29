"use strict";

// --- State ---------------------------------------------------------------
let audioCtx = null;
let running = false;
let bpm = 120;
let beatsPerBar = 4;
let currentBeat = 0;        // Beat, der als naechstes geplant wird (0-basiert)
let nextNoteTime = 0;       // AudioContext-Zeit des naechsten Klicks
let schedulerId = null;

const LOOKAHEAD_MS = 25;    // Wie oft der Scheduler laeuft
const SCHEDULE_AHEAD = 0.1; // Wie weit im Voraus geplant wird (Sekunden)

// Tap-Tempo
let tapTimes = [];
const TAP_RESET_MS = 2000;  // Pause > 2 s setzt die Messung zurueck
const TAP_MAX_SAMPLES = 8;

// --- DOM -----------------------------------------------------------------
const bpmValue = document.getElementById("bpmValue");
const bpmSlider = document.getElementById("bpmSlider");
const timeSig = document.getElementById("timeSig");
const startStopBtn = document.getElementById("startStopBtn");
const tapBtn = document.getElementById("tapBtn");
const beatIndicator = document.getElementById("beatIndicator");

// --- Beat-Anzeige --------------------------------------------------------
function buildBeatDots() {
  beatIndicator.innerHTML = "";
  for (let i = 0; i < beatsPerBar; i++) {
    const dot = document.createElement("div");
    dot.className = "beat-dot";
    beatIndicator.appendChild(dot);
  }
}

function flashDot(beatIndex, isAccent) {
  const dots = beatIndicator.children;
  for (const d of dots) d.classList.remove("active", "accent");
  const dot = dots[beatIndex];
  if (!dot) return;
  dot.classList.add("active");
  if (isAccent) dot.classList.add("accent");
}

// --- Audio ---------------------------------------------------------------
function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function scheduleClick(time, isAccent) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.value = isAccent ? 1600 : 1000;
  gain.gain.setValueAtTime(isAccent ? 0.5 : 0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + 0.06);
}

function scheduler() {
  while (nextNoteTime < audioCtx.currentTime + SCHEDULE_AHEAD) {
    const beat = currentBeat;
    const isAccent = beat === 0;
    scheduleClick(nextNoteTime, isAccent);

    // Visuelles Feedback zum richtigen Zeitpunkt ausloesen
    const delayMs = Math.max(0, (nextNoteTime - audioCtx.currentTime) * 1000);
    setTimeout(() => { if (running) flashDot(beat, isAccent); }, delayMs);

    nextNoteTime += 60 / bpm;
    currentBeat = (currentBeat + 1) % beatsPerBar;
  }
}

// --- Start / Stop --------------------------------------------------------
function start() {
  ensureAudio();
  running = true;
  currentBeat = 0;
  nextNoteTime = audioCtx.currentTime + 0.08;
  schedulerId = setInterval(scheduler, LOOKAHEAD_MS);
  startStopBtn.textContent = "Stop";
  startStopBtn.classList.add("running");
}

function stop() {
  running = false;
  clearInterval(schedulerId);
  schedulerId = null;
  startStopBtn.textContent = "Start";
  startStopBtn.classList.remove("running");
  for (const d of beatIndicator.children) d.classList.remove("active", "accent");
}

// --- BPM setzen ----------------------------------------------------------
function setBpm(value) {
  bpm = Math.min(240, Math.max(40, Math.round(value)));
  bpmValue.textContent = bpm;
  bpmSlider.value = bpm;
}

// --- Tap-Tempo -----------------------------------------------------------
function tap() {
  const now = performance.now();
  if (tapTimes.length && now - tapTimes[tapTimes.length - 1] > TAP_RESET_MS) {
    tapTimes = [];
  }
  tapTimes.push(now);
  if (tapTimes.length > TAP_MAX_SAMPLES) tapTimes.shift();

  if (tapTimes.length >= 2) {
    const intervals = [];
    for (let i = 1; i < tapTimes.length; i++) {
      intervals.push(tapTimes[i] - tapTimes[i - 1]);
    }
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    setBpm(60000 / avg);
  }
}

// --- Events --------------------------------------------------------------
bpmSlider.addEventListener("input", () => setBpm(Number(bpmSlider.value)));

timeSig.addEventListener("change", () => {
  beatsPerBar = Number(timeSig.value);
  currentBeat = 0;
  buildBeatDots();
});

startStopBtn.addEventListener("click", () => (running ? stop() : start()));
tapBtn.addEventListener("click", tap);

// Leertaste = Start/Stop, T = Tap
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && e.target.tagName !== "BUTTON") {
    e.preventDefault();
    running ? stop() : start();
  } else if (e.key.toLowerCase() === "t") {
    tap();
  }
});

// --- Init ----------------------------------------------------------------
buildBeatDots();
setBpm(120);

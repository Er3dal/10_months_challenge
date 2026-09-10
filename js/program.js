// All the program's content and the logic that tailors it to a person.
import { addDays, TODAY } from './lib/dates.js';

export const PHASES = [
  { n: 1, name: 'Foundation', span: 'Months 1–3', job: 'Habit, movement quality, strength base, fat loss. No explosive work yet.' },
  { n: 2, name: 'Build', span: 'Months 4–6', job: 'Push strength harder, fuller range, add interval conditioning.' },
  { n: 3, name: 'Transition', span: 'Months 7–8', job: 'Leaner and stronger — now earn explosive work, done fresh.' },
  { n: 4, name: 'Performance', span: 'Months 9–10', job: 'Put it together: power, speed, conditioning, strength held.' },
];

export const phaseForMonth = (m) => m <= 3 ? PHASES[0] : m <= 6 ? PHASES[1] : m <= 8 ? PHASES[2] : PHASES[3];

export const MOBILITY = [
  'Wall ankle stretch — 30s ×2/side',
  'Deep supported squat hold — 30–60s ×2',
  'Half-kneeling hip flexor — 30s ×2/side',
  'Hamstring stretch — 30s ×2/side',
  'Glute figure-4 — 30s ×2/side',
  '90/90 hip stretch — 30s/side',
  'Cat-cow — 8–10 reps',
  'Seated spinal twist — 20s/side',
];

export const SUPPS = [
  { id: 'creatine', label: 'Creatine', note: '3–5g' },
  { id: 'vitd', label: 'Vitamin D', note: '1–2k IU' },
  { id: 'whey', label: 'Whey', note: 'as needed' },
];

// Manual daily step entry — no phone/health-app integration is possible from
// a plain static web app (Apple HealthKit has no web API; Google Fit's API
// is being retired and its replacement, Health Connect, is native-app-only).
export const STEP_GOAL = 10000;

export const TEMPLATES = {
  legsA: { label: 'Legs A', ex: ['Leg press', 'Goblet / box squat', 'Leg extension', 'Calf raise'] },
  legsB: { label: 'Legs B', ex: ['Hip thrust', 'Leg curl', 'Split squat', 'Leg press (feet high)', 'Calf raise'] },
  push: { label: 'Upper — Push', ex: ['Chest press', 'Shoulder press', 'Triceps pushdown', 'Plank'] },
  pull: { label: 'Upper — Pull', ex: ['Lat pulldown', 'Seated row', 'Biceps curl', 'Face pull'] },
  power: { label: 'Power (Phase 3+)', ex: ['Box jumps (step down)', 'Broad jumps', 'Med-ball throws'] },
};

const ACTIVITY = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };

// Builds a calorie/protein/phase plan from a person's stats. Includes guardrails:
// under-18 or already-lean profiles are held at maintenance rather than pushed
// into a deficit, and there is a hard calorie floor.
export function generateProgram(p) {
  const { weight: kg, height: cm, age, sex, activity } = p;
  const bmr = Math.round(10 * kg + 6.25 * cm - 5 * age + (sex === 'female' ? -161 : 5));
  const tdee = Math.round(bmr * (ACTIVITY[activity] || 1.55));
  const bmi = kg / Math.pow(cm / 100, 2);
  const floor = sex === 'female' ? 1400 : 1600;

  let cut, mode, note = '';
  if (age < 18) {
    cut = tdee; mode = 'maintain';
    note = 'Under 18 — this plan holds you at maintenance and skips a deficit. Please run any weight-loss goal past a doctor or coach first.';
  } else if (bmi < 19) {
    cut = tdee; mode = 'maintain';
    note = 'Your numbers are already lean — no deficit set. Focus on strength, mobility and eating around maintenance to build athletic muscle.';
  } else {
    cut = Math.max(floor, Math.round((tdee - 500) / 10) * 10); mode = 'cut';
  }

  const maintenance = Math.round(tdee / 10) * 10;
  const protein = Math.min(240, Math.max(90, Math.round((1.8 * kg) / 5) * 5));
  const start = p.startDate || TODAY;
  const offsets = [0, 90, 180, 240];
  const ends = [90, 180, 240, 300];
  const phases = PHASES.map((ph, i) => ({ ...ph, from: addDays(start, offsets[i]), to: addDays(start, ends[i]) }));

  return {
    bmr, tdee, cut, maintenance, surplus: maintenance + 180, protein, mode, note,
    bmi: Math.round(bmi * 10) / 10, start, steps: '8,000–10,000',
    phases, generatedAt: TODAY,
  };
}

// The plan's nutrition isn't one flat number for all 10 months — it follows
// the phase map: Phases 1-2 hold a moderate deficit, Phase 3 eases back
// toward maintenance, Phase 4 sits at maintenance (with a slight surplus
// offered as an optional choice, not forced). Protein stays constant
// throughout — it's the priority in every phase. This is the single place
// that turns a program + a phase number into today's actual kcal/macro
// target, so the Plan tab, Progress tab and Food tab all stay in sync.
export function targetForPhase(program, phaseN) {
  const { cut, maintenance, protein, surplus, mode } = program;

  if (mode !== 'cut') {
    const { fat, carbs } = splitMacros(maintenance, protein);
    return { kcal: maintenance, protein, fat, carbs, tag: 'hold steady', hint: program.note };
  }

  let kcal, tag, hint;
  if (phaseN <= 2) {
    kcal = cut; tag = '0.4–0.6 kg down';
    hint = 'Stalled 2–3 weeks? Trim about 200 kcal or add walking. Feeling wrecked? Eat a bit more.';
  } else if (phaseN === 3) {
    kcal = Math.round(((cut + maintenance) / 2) / 10) * 10; tag = 'easing to maintenance';
    hint = `You're lean enough to ease up — let calories drift from ${cut.toLocaleString()} toward ${maintenance.toLocaleString()} over these two months rather than in one jump.`;
  } else {
    kcal = maintenance; tag = 'maintenance · optional surplus';
    hint = `Hold roughly steady while your lifts, power and conditioning climb — that's recomposition. Want to keep adding muscle now you're lean? An optional slight surplus (~${surplus.toLocaleString()} kcal) works too.`;
  }
  const { fat, carbs } = splitMacros(kcal, protein);
  return { kcal, protein, fat, carbs, tag, hint };
}

// fat ~25% of calories (a sensible floor); carbs fill the rest around the
// fixed protein target.
function splitMacros(kcal, protein) {
  const fat = Math.round((0.25 * kcal) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { fat, carbs };
}

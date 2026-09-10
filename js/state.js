// Central app state + the only functions allowed to mutate saved data.
// Every mutator persists then calls notify() so the UI re-renders.
import { getAccount, getProfile, getSession, setSession, loadData, saveData } from './accounts.js';
import { TODAY, addDays, daysBetween } from './lib/dates.js';
import { phaseForMonth, targetForPhase, STEP_GOAL } from './program.js';

export const state = {
  screen: 'auth',   // 'auth' | 'app'
  authTab: 'login', // 'login' | 'create'
  user: null,
  data: null,       // { daily, weights, workouts }
  tab: 'today',     // 'today' | 'plan' | 'progress' | 'train'
  ui: {},           // transient view state (open history row, active session)
};

let onChange = () => {};
export const setOnChange = (fn) => { onChange = fn; };
export const notify = () => onChange();

export function boot() {
  const u = getSession();
  if (u && getAccount(u)) { state.user = u; state.data = loadData(u); state.screen = 'app'; }
}

export function signIn(user) {
  setSession(user);
  state.user = user;
  state.data = loadData(user);
  state.screen = 'app';
  state.tab = 'today';
  state.ui = {};
  onChange();
}

export function signOut() {
  setSession('');
  Object.assign(state, { user: null, data: null, screen: 'auth', authTab: 'login', ui: {} });
  onChange();
}

export const profile = () => getProfile(state.user);

// Day/month/phase for an arbitrary date, given a profile — shared by
// planNow() (today) and streak() (every day it walks back over).
function planFor(pr, d) {
  const day = Math.max(1, daysBetween(pr.startDate, d) + 1);
  const month = Math.min(10, Math.max(1, Math.floor((day - 1) / 30) + 1));
  return { day, month, phase: phaseForMonth(month) };
}

export function planNow() {
  return planFor(profile(), TODAY);
}

// The six things a day needs for the streak to count it: mobility done, the
// two daily supplements (creatine + vitamin D — whey is "as needed" so it's
// not required), weight logged, food logged at or under that day's calorie
// goal, and steps (manually entered — no phone/health-app can be read from a
// plain static web app) at or over the daily step goal.
function dayChecklist(d) {
  const day = state.data.daily[d] || {};
  const weights = state.data.weights;
  const food = (state.data.food || {})[d] || [];
  const stepsLogged = (state.data.steps || {})[d];
  const pr = profile();
  const kcalGoal = targetForPhase(pr.program, planFor(pr, d).phase.n).kcal;
  const kcal = food.reduce((a, f) => a + (f.kcal || 0), 0);

  return [
    { key: 'mobility', label: 'Mobility', ok: !!day.mobility },
    { key: 'creatine', label: 'Creatine', ok: !!day.creatine },
    { key: 'vitd', label: 'Vitamin D', ok: !!day.vitd },
    { key: 'weight', label: 'Weigh-in', ok: weights.some((w) => w.date === d) },
    { key: 'kcal', label: 'Calories', ok: food.length > 0 && kcal <= kcalGoal },
    { key: 'steps', label: 'Steps', ok: stepsLogged != null && stepsLogged >= STEP_GOAL },
  ];
}

// Today's checklist breakdown, for the "N of 6 today" dots.
export function todayChecklist() {
  return dayChecklist(TODAY);
}

export function streak() {
  const done = (d) => dayChecklist(d).every((c) => c.ok);
  let d = TODAY, s = 0;
  if (!done(d)) d = addDays(d, -1);
  while (done(d)) { s++; d = addDays(d, -1); }
  return s;
}

function persist() { if (state.user) saveData(state.user, state.data); }

export function setDaily(field, value) {
  const cur = state.data.daily[TODAY] || {};
  state.data.daily[TODAY] = { ...cur, [field]: value };
  persist(); onChange();
}

export function logWeight(kg) {
  const W = state.data.weights.filter((r) => r.date !== TODAY);
  W.push({ date: TODAY, kg });
  W.sort((a, b) => a.date.localeCompare(b.date));
  state.data.weights = W;
  persist(); onChange();
}

// Manual step entry for today — overwritten on each log (steps only climb
// through the day, so there's no need for the once-a-day overwrite guard
// weight logging uses).
export function logSteps(n) {
  state.data.steps = { ...(state.data.steps || {}), [TODAY]: n };
  persist(); onChange();
}

// Which of the four Today layouts to render — a per-account preference.
export function setTodayStyle(style) {
  state.data.settings = { ...state.data.settings, todayStyle: style };
  persist(); onChange();
}

export function addWorkout(w) { state.data.workouts.unshift(w); persist(); onChange(); }
export function deleteWorkout(id) { state.data.workouts = state.data.workouts.filter((w) => w.id !== id); persist(); onChange(); }

// --- food / macros ---
export const foodToday = () => state.data.food[TODAY] || [];

export function addFood(entry) {
  const id = String(Date.now()) + Math.random().toString(36).slice(2, 6);
  state.data.food[TODAY] = [...foodToday(), { ...entry, id }];
  persist(); onChange();
}
export function deleteFood(id) {
  state.data.food[TODAY] = foodToday().filter((f) => f.id !== id);
  persist(); onChange();
}
export function foodTotals() {
  return foodToday().reduce((a, f) => ({
    kcal: a.kcal + (f.kcal || 0), protein: a.protein + (f.protein || 0),
    carbs: a.carbs + (f.carbs || 0), fat: a.fat + (f.fat || 0),
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}

// --- my foods (saved custom foods) ---
export const myFoods = () => state.data.myfoods || [];

export function saveMyFood(food) {
  const id = 'mf' + Date.now() + Math.random().toString(36).slice(2, 5);
  const clean = { id, name: food.name, kcal: food.kcal || 0, protein: food.protein || 0, carbs: food.carbs || 0, fat: food.fat || 0 };
  // de-dupe by name (case-insensitive): replace an existing saved food of the same name
  const rest = myFoods().filter((f) => f.name.toLowerCase() !== clean.name.toLowerCase());
  state.data.myfoods = [clean, ...rest].slice(0, 200);
  persist(); onChange();
}
export function deleteMyFood(id) {
  state.data.myfoods = myFoods().filter((f) => f.id !== id);
  persist(); onChange();
}

// Most-recently-logged distinct foods, newest first — for one-tap re-logging.
export function recentFoods(n = 8) {
  const seen = new Set(), out = [];
  const days = Object.keys(state.data.food || {}).sort().reverse();
  for (const d of days) {
    const arr = state.data.food[d] || [];
    for (let i = arr.length - 1; i >= 0; i--) {
      const f = arr[i], key = (f.name || '').toLowerCase();
      if (key && !seen.has(key)) { seen.add(key); out.push(f); if (out.length >= n) return out; }
    }
  }
  return out;
}

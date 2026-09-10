// Today tab — picks one of four interchangeable display styles (a per-account
// preference) and renders it. All four styles share the same underlying data
// and the same interactive elements (#mob, [data-s], #wq/#wqb, #sq/#sqb,
// #drillT/#drills) so this file's wiring works regardless of which one is on
// screen.
import { state, setDaily, streak, todayChecklist, setTodayStyle } from '../state.js';
import { attemptLogWeight } from '../lib/weightPrompt.js';
import { attemptLogSteps } from '../lib/stepsPrompt.js';
import { STEP_GOAL } from '../program.js';
import { TODAY } from '../lib/dates.js';
import { $, val } from '../lib/dom.js';
import { renderCards } from './today/cards.js';
import { renderGrid } from './today/grid.js';
import { renderChecklist } from './today/checklist.js';
import { renderFocus } from './today/focus.js';

const STYLES = [
  ['cards', 'Cards', renderCards],
  ['grid', 'Grid', renderGrid],
  ['checklist', 'Checklist', renderChecklist],
  ['focus', 'Focus', renderFocus],
];

export function renderToday(v) {
  const d = state.data.daily[TODAY] || {};
  const s = streak();
  const weights = state.data.weights;
  const last = weights[weights.length - 1];
  const loggedToday = !!(last && last.date === TODAY);
  const checklist = todayChecklist();
  const stepsToday = (state.data.steps || {})[TODAY];
  const style = (state.data.settings && state.data.settings.todayStyle) || 'cards';
  const entry = STYLES.find((x) => x[0] === style) || STYLES[0];

  const ctx = {
    d, s, last, loggedToday, todayKg: loggedToday ? last.kg : null,
    weights, checklist, stepsToday, stepGoal: STEP_GOAL,
  };

  v.innerHTML = `
    <div class="tabs" style="margin-bottom:14px">${STYLES.map(([id, label]) =>
      `<button data-style="${id}" class="${id === entry[0] ? 'on' : ''}">${label}</button>`
    ).join('')}</div>
    ${entry[2](ctx)}`;

  v.querySelectorAll('[data-style]').forEach((b) => {
    b.onclick = () => setTodayStyle(b.dataset.style);
  });

  const mob = $('mob');
  if (mob) mob.onclick = () => setDaily('mobility', !d.mobility);
  const drillT = $('drillT');
  if (drillT) drillT.onclick = (e) => {
    const el = $('drills'); const open = el.hidden; el.hidden = !open;
    e.currentTarget.setAttribute('aria-expanded', String(open));
  };
  v.querySelectorAll('[data-s]').forEach((c) => { c.onclick = () => setDaily(c.dataset.s, !d[c.dataset.s]); });
  const wqb = $('wqb');
  if (wqb) wqb.onclick = () => attemptLogWeight(val('wq'));
  const sqb = $('sqb');
  if (sqb) sqb.onclick = () => attemptLogSteps(val('sq'));
}

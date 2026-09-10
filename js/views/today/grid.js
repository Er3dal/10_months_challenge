// Today tab — "Grid" style (Option B): everything at a glance in compact
// tiles, less scrolling. The streak trades its hero moment for a
// utilitarian dashboard layout.
import { SUPPS } from '../../program.js';

export function renderGrid(ctx) {
  const { d, s, last, loggedToday, todayKg, stepsToday, stepGoal } = ctx;
  const done = SUPPS.filter((su) => d[su.id]).length;

  return `
    <div class="today-grid">
      <div class="tg-hero">
        <div>
          <div class="tg-num cond">${s}</div>
          <div class="tg-word">day${s === 1 ? '' : 's'} streak</div>
        </div>
        <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#7fd1a8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c3.5 0 6-2.2 6-5.6 0-2.6-1.7-4.6-3-6.9-.3 1.7-1 2.9-2 3.9.2-3.4-1-6.1-3.5-8.4-1.8 2.7-2.5 5-2.5 7.4 0 3.2 1.3 5 2 5.9-1-.3-2-1.4-2.3-2.8C6 12 6 14.4 6 15.4 6 19.4 8.5 22 12 22z"/></svg>
      </div>

      <div class="tg-tile">
        <div class="tg-label">Mobility</div>
        <button class="toggle sm ${d.mobility ? 'on' : ''}" id="mob">${d.mobility ? '✓ Done' : 'Mark done'}</button>
      </div>

      <div class="tg-tile">
        <div class="tg-label">Weight</div>
        ${loggedToday
          ? `<div class="tg-weight">${todayKg}<span> kg</span></div>`
          : `<div class="inline sm"><input id="wq" inputmode="decimal" placeholder="kg"><button class="btn" id="wqb">Log</button></div>`}
        ${last && !loggedToday ? `<div class="tg-label" style="margin-top:8px;margin-bottom:0">last: ${last.kg}kg</div>` : ''}
      </div>

      <div class="tg-tile">
        <div class="tg-label">Steps · goal ${stepGoal.toLocaleString()}</div>
        <div class="tg-weight">${stepsToday != null ? stepsToday.toLocaleString() : '—'}</div>
        <div class="inline sm"><input id="sq" inputmode="numeric" placeholder="e.g. 8400"><button class="btn" id="sqb">Log</button></div>
      </div>

      <div class="tg-tile">
        <div class="tg-label">Supplements · ${done}/${SUPPS.length}</div>
        <div class="tg-chips">
          ${SUPPS.map((su) => `<button class="chip sm ${d[su.id] ? 'on' : ''}" data-s="${su.id}"><b>${d[su.id] ? '✓ ' : ''}${su.label}</b></button>`).join('')}
        </div>
      </div>
    </div>`;
}

// Today tab — "Checklist" style (Option C): reframes Today as a to-do list
// on a timeline, a clear sense of progress through the day. The streak
// becomes a small badge rather than the headline.
import { MOBILITY, SUPPS } from '../../program.js';

export function renderChecklist(ctx) {
  const { d, s, last, loggedToday, stepsToday, stepGoal } = ctx;
  const stepsOk = stepsToday != null && stepsToday >= stepGoal;

  const rows = [
    { id: 'mob', label: 'Mobility routine', sub: '10 min · warm', done: !!d.mobility, mob: true },
    ...SUPPS.map((su) => ({ key: su.id, label: su.label, sub: su.note, done: !!d[su.id] })),
  ];

  return `
    <div class="stack">
      <div class="cl-badge">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c3.5 0 6-2.2 6-5.6 0-2.6-1.7-4.6-3-6.9-.3 1.7-1 2.9-2 3.9.2-3.4-1-6.1-3.5-8.4-1.8 2.7-2.5 5-2.5 7.4 0 3.2 1.3 5 2 5.9-1-.3-2-1.4-2.3-2.8C6 12 6 14.4 6 15.4 6 19.4 8.5 22 12 22z"/></svg>
        <span class="cl-badge-n cond">${s}-day streak</span>
        <span class="cl-badge-w">— keep it going</span>
      </div>

      <div class="cl-list">
        ${rows.map((r) => `
          <div class="cl-row">
            <button class="cl-dot ${r.done ? 'on' : ''}" ${r.mob ? 'id="mob"' : `data-s="${r.key}"`}>${r.done ? checkIcon() : ''}</button>
            <div class="cl-body">
              <div class="cl-title">${r.label}</div>
              <div class="cl-sub">${r.sub}${r.done ? ' — done' : ''}</div>
            </div>
          </div>`).join('')}
        <div class="cl-row">
          <div class="cl-dot ${loggedToday ? 'on' : ''}">${loggedToday ? checkIcon() : ''}</div>
          <div class="cl-body">
            <div class="cl-title">Weigh-in</div>
            ${loggedToday
              ? `<div class="cl-sub">${last.kg}kg logged today</div>`
              : `<div class="cl-sub" style="margin-bottom:8px">Not logged yet today</div>
                 <div class="inline sm"><input id="wq" inputmode="decimal" placeholder="e.g. 96.4"><button class="btn" id="wqb">Log</button></div>`}
          </div>
        </div>
        <div class="cl-row">
          <div class="cl-dot ${stepsOk ? 'on' : ''}">${stepsOk ? checkIcon() : ''}</div>
          <div class="cl-body">
            <div class="cl-title">Steps</div>
            <div class="cl-sub" style="margin-bottom:8px">${stepsToday != null ? `${stepsToday.toLocaleString()} logged` : 'Not logged yet today'} · goal ${stepGoal.toLocaleString()}</div>
            <div class="inline sm"><input id="sq" inputmode="numeric" placeholder="e.g. 8400" value="${stepsToday != null ? stepsToday : ''}"><button class="btn" id="sqb">Log</button></div>
          </div>
        </div>
      </div>

      <button class="link" id="drillT" aria-expanded="false">▸ The 8 mobility drills</button>
      <ul class="drills" id="drills" hidden>${MOBILITY.map((x) => `<li>${x}</li>`).join('')}</ul>
    </div>`;
}

function checkIcon() {
  return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>`;
}

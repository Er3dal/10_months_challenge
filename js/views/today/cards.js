// Today tab — "Cards" style (Option A): a dark streak hero with a dot row
// showing how many of today's requirements are checked off, then a stack of
// cards for mobility, supplements, weigh-in and steps.
import { MOBILITY, SUPPS } from '../../program.js';

export function renderCards(ctx) {
  const { d, s, last, loggedToday, checklist, stepsToday, stepGoal } = ctx;
  const doneCount = checklist.filter((c) => c.ok).length;

  return `
    <div class="stack">
      <div class="hero">
        <div class="hero-num cond">${s}</div>
        <div>
          <div class="hero-word cond">day${s === 1 ? '' : 's'} in a row</div>
          <div class="hero-sub">Mobility is the one daily rule. This number is the whole game.</div>
        </div>
      </div>
      <div class="trail">${checklist.map((c, i) => `<span class="trail-dot ${i < doneCount ? 'on' : ''}"></span>`).join('')}</div>
      <div class="hint" style="margin-top:-6px">${doneCount} of ${checklist.length} checked today</div>

      <div class="card">
        <div class="card-top"><h3>Today's mobility</h3><span class="tag">10 min · warm</span></div>
        <button class="toggle ${d.mobility ? 'on' : ''}" id="mob">${d.mobility ? '✓ Done today' : 'Mark done'}</button>
        <button class="link" id="drillT" aria-expanded="false">▸ The 8 drills</button>
        <ul class="drills" id="drills" hidden>${MOBILITY.map((x) => `<li>${x}</li>`).join('')}</ul>
      </div>

      <div class="card">
        <div class="card-top"><h3>Supplements</h3></div>
        <div class="chips">
          ${SUPPS.map((su) => `<button class="chip ${d[su.id] ? 'on' : ''}" data-s="${su.id}"><b>${d[su.id] ? '✓ ' : ''}${su.label}</b><small>${su.note}</small></button>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-top"><h3>Weight</h3>${last ? `<span class="tag">last: ${last.kg}kg</span>` : ''}</div>
        ${loggedToday
          ? `<p class="hint">${last.kg}kg logged today.</p>`
          : `<div class="inline"><input id="wq" inputmode="decimal" placeholder="e.g. 96.4"><button class="btn" id="wqb">Log</button></div>
             <p class="hint">Weigh 2–3 mornings a week. Trends win, not single days.</p>`}
      </div>

      <div class="card">
        <div class="card-top"><h3>Steps</h3><span class="tag">goal ${stepGoal.toLocaleString()}</span></div>
        <div class="inline"><input id="sq" inputmode="numeric" placeholder="e.g. 8400" value="${stepsToday != null ? stepsToday : ''}"><button class="btn" id="sqb">Log</button></div>
        <p class="hint">${stepsToday != null ? `${stepsToday.toLocaleString()} steps logged today.` : "No health app can be read from a website, so this one's manual."}</p>
      </div>
    </div>`;
}

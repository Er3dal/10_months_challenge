// Today tab — "Focus" style (Option D): borderless, spacious, oversized
// type. Calmer and more premium, at the cost of a taller, more scrolly page.
import { MOBILITY, SUPPS } from '../../program.js';

export function renderFocus(ctx) {
  const { d, s, last, loggedToday, stepsToday, stepGoal } = ctx;

  return `
    <div class="fc-hero">
      <div class="fc-num cond">${s}</div>
      <div class="fc-word">day${s === 1 ? '' : 's'} in a row</div>
      <div class="fc-sub">Mobility is the one daily rule. Everything else is built on showing up here first.</div>
    </div>

    <div class="fc-section">
      <div class="fc-h">Mobility</div>
      <div class="fc-sub2">10 minutes, warm — the 8 drills</div>
      <button class="fc-action" id="mob">${d.mobility ? '✓ Done for today' : 'Mark done for today'}</button>
      <div style="margin-top:14px">
        <button class="link" id="drillT" aria-expanded="false">▸ The 8 drills</button>
        <ul class="drills" id="drills" hidden>${MOBILITY.map((x) => `<li>${x}</li>`).join('')}</ul>
      </div>
    </div>

    <div class="fc-section">
      <div class="fc-h">Supplements</div>
      <div class="fc-supp-list">
        ${SUPPS.map((su) => `
          <button class="fc-supp-row" data-s="${su.id}">
            <span>${su.label} · ${su.note}</span>
            <span class="fc-check ${d[su.id] ? 'on' : ''}">${d[su.id] ? '✓' : '○'}</span>
          </button>`).join('')}
      </div>
    </div>

    <div class="fc-section">
      <div class="fc-h">Weight</div>
      <div class="fc-sub2">${last ? `last: ${last.kg}kg` : 'no weigh-ins yet'}</div>
      ${loggedToday
        ? `<p class="hint">${last.kg}kg logged today.</p>`
        : `<div class="fc-weight-row">
             <input id="wq" inputmode="decimal" placeholder="e.g. 96.4">
             <button class="fc-link-btn" id="wqb">Log →</button>
           </div>`}
    </div>

    <div class="fc-section">
      <div class="fc-h">Steps</div>
      <div class="fc-sub2">goal ${stepGoal.toLocaleString()} · no health app can be read from a website, so this one's manual</div>
      <div class="fc-weight-row">
        <input id="sq" inputmode="numeric" placeholder="e.g. 8400" value="${stepsToday != null ? stepsToday : ''}">
        <button class="fc-link-btn" id="sqb">Log →</button>
      </div>
    </div>`;
}

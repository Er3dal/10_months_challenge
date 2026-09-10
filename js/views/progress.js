import { state, profile, planNow } from '../state.js';
import { attemptLogWeight } from '../lib/weightPrompt.js';
import { chartSVG } from '../chart.js';
import { targetForPhase } from '../program.js';
import { daysBetween } from '../lib/dates.js';
import { $, val } from '../lib/dom.js';

export function renderProgress(v) {
  const W = state.data.weights, pr = profile();
  // Start is your account's starting weight — fixed at signup, never derived
  // from the log, so it can never drift or get overwritten by a later weigh-in.
  const start = pr.weight;
  const last = W.length ? W[W.length - 1].kg : null;
  const change = last != null ? Math.round((last - start) * 10) / 10 : null;

  // Per-week rate: total change since your fixed start date/weight, spread
  // over the real calendar days elapsed — accurate from just a few logged
  // days in (no need for a full week of entries). But on day 0/1 there's
  // essentially no elapsed time to extrapolate from, so a single early
  // weigh-in would get blown up into a wild rate (e.g. -2kg in one day
  // reads as -14kg/week) — wait for a few real days before showing this.
  let weekly = null;
  if (W.length) {
    const latest = W[W.length - 1];
    const days = daysBetween(pr.startDate, latest.date);
    if (days >= 3) weekly = Math.round(((latest.kg - start) / (days / 7)) * 100) / 100;
  }
  const pl = planNow();
  const t = targetForPhase(pr.program, pl.phase.n);

  v.innerHTML = `
    <div class="stack">
      <div class="stat-grid">
        <div class="stat"><small>Start</small><b>${start}kg</b></div>
        <div class="stat"><small>Now</small><b>${last != null ? last + 'kg' : '—'}</b></div>
        <div class="stat"><small>Change</small><b class="${change < 0 ? 'good' : ''}">${change != null ? (change > 0 ? '+' : '') + change + 'kg' : '—'}</b></div>
        <div class="stat"><small>Per week</small><b>${weekly != null ? (weekly > 0 ? '+' : '') + weekly + 'kg' : '—'}</b></div>
      </div>

      <div class="card">
        <div class="card-top"><h3>Bodyweight</h3><span class="tag">${t.tag}</span></div>
        <div>${W.length < 2
          ? `<div class="empty">Log a couple of weigh-ins to see your trend. The faint line is each reading; the bold green line is your 7-day average — that’s the one to watch.</div>`
          : chartSVG(W)}</div>
        <div class="inline" style="margin-top:12px"><input id="wp" inputmode="decimal" placeholder="Add a weigh-in (kg)"><button class="btn" id="wpb">Log</button></div>
      </div>

      <div class="card soft"><p class="hint">${t.hint}</p></div>
    </div>`;

  $('wpb').onclick = () => attemptLogWeight(val('wp'));
}

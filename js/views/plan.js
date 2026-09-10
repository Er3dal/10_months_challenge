import { profile, planNow } from '../state.js';
import { PHASES, targetForPhase } from '../program.js';
import { pretty } from '../lib/dates.js';

export function renderPlan(v) {
  const pr = profile(), g = pr.program, pl = planNow();
  const t = targetForPhase(g, pl.phase.n);
  const calLabel = g.mode !== 'cut' ? 'Daily target (maintenance)'
    : pl.phase.n <= 2 ? 'Daily target (fat-loss)'
    : pl.phase.n === 3 ? 'Daily target (easing to maintenance)'
    : 'Daily target (maintenance)';

  v.innerHTML = `
    <div class="stack">
      <div class="card">
        <div class="card-top"><h3>${calLabel}</h3><span class="tag">${t.tag}</span></div>
        <div class="big-cal cond">${t.kcal.toLocaleString()} kcal</div>
        <div>
          <div class="kv"><span>Protein</span><b>${t.protein} g / day</b></div>
          <div class="kv"><span>Carbs</span><b>${t.carbs} g / day</b></div>
          <div class="kv"><span>Fat</span><b>${t.fat} g / day</b></div>
          <div class="kv"><span>Maintenance</span><b>${g.maintenance.toLocaleString()} kcal</b></div>
          <div class="kv"><span>Est. TDEE</span><b>${g.tdee.toLocaleString()} kcal</b></div>
          <div class="kv"><span>Steps</span><b>${g.steps} / day</b></div>
        </div>
        <p class="hint">${t.hint} Carbs especially around training; fats moderate. These are starting points — adjust by your weekly-average scale trend.</p>
      </div>

      <div class="card">
        <div class="card-top"><h3>Your details</h3></div>
        <div class="kv"><span>Sex · Age</span><b>${pr.sex === 'female' ? 'Female' : 'Male'} · ${pr.age}</b></div>
        <div class="kv"><span>Height · Weight</span><b>${pr.height}cm · ${pr.weight}kg</b></div>
        <div class="kv"><span>BMI at start</span><b>${g.bmi}</b></div>
        <div class="kv"><span>Start date</span><b>${pretty(g.start)}</b></div>
      </div>

      <div class="card">
        <div class="card-top"><h3>The four phases</h3></div>
        ${PHASES.map((ph) => `
          <div class="phase-row ${pl.phase.n === ph.n ? 'active' : ''}">
            <span class="n cond">${ph.n}</span>
            <div><b>${ph.name}</b> <span class="m">· ${ph.span}</span><p>${ph.job}</p></div>
          </div>`).join('')}
      </div>

      <div class="card soft">
        <div class="card-top"><h3>The part that decides it</h3></div>
        <p class="hint">Consistency across 10 months — still showing up in months 7, 8, 9, 10, when most people drift off. Fix the range, build the base, earn the power, fuel the work, sleep, show up.</p>
      </div>
    </div>`;
}

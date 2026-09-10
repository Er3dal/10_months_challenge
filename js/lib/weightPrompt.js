// Guards against double-logging weight on the same day. Weight can only be
// logged once per calendar day — if today's entry already exists, this pops
// a confirm dialog instead of silently overwriting it, and lets the user
// edit today's already-logged value in a highlighted field.
import { state, logWeight } from '../state.js';
import { TODAY } from './dates.js';

export function attemptLogWeight(raw) {
  const n = parseFloat(raw);
  if (isNaN(n)) return;

  const existing = state.data.weights.find((w) => w.date === TODAY);
  if (!existing || existing.kg === n) { logWeight(n); return; }

  openOverwriteModal(existing.kg, n);
}

function openOverwriteModal(oldKg, attemptedKg) {
  const host = document.createElement('div');
  host.className = 'modal-backdrop';
  host.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Already logged today">
      <h3>Already logged today</h3>
      <p class="modal-msg">You already logged <b>${oldKg}kg</b> today. Weight can only be logged once a day — edit today's entry below instead:</p>
      <label class="field">
        <span>Today's weight (kg)</span>
        <input id="wmInput" class="modal-highlight" inputmode="decimal" value="${attemptedKg}">
      </label>
      <div class="modal-actions">
        <button class="btn ghost" id="wmCancel">Cancel</button>
        <button class="btn" id="wmSave">Update</button>
      </div>
    </div>`;
  document.body.appendChild(host);

  const input = host.querySelector('#wmInput');
  input.focus();
  input.select();

  const close = () => { host.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  host.addEventListener('click', (e) => { if (e.target === host) close(); });
  host.querySelector('#wmCancel').onclick = close;
  host.querySelector('#wmSave').onclick = () => {
    const v = parseFloat(input.value);
    if (!isNaN(v)) { logWeight(v); close(); }
  };
}

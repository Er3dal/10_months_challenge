// Guards against double-logging steps on the same day — mirrors
// weightPrompt.js. Clicking "Log" a second time today doesn't silently
// overwrite; it pops a confirm dialog and lets the user edit today's
// already-logged value in a highlighted field, same as weight.
import { state, logSteps } from '../state.js';
import { TODAY } from './dates.js';

export function attemptLogSteps(raw) {
  const n = parseInt(String(raw).trim(), 10);
  if (isNaN(n) || n < 0) return;

  const existing = (state.data.steps || {})[TODAY];
  if (existing == null || existing === n) { logSteps(n); return; }

  openOverwriteModal(existing, n);
}

function openOverwriteModal(oldSteps, attemptedSteps) {
  const host = document.createElement('div');
  host.className = 'modal-backdrop';
  host.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Already logged today">
      <h3>Already logged today</h3>
      <p class="modal-msg">You already logged <b>${oldSteps.toLocaleString()} steps</b> today. Edit today's entry below instead:</p>
      <label class="field">
        <span>Today's steps</span>
        <input id="smInput" class="modal-highlight" inputmode="numeric" value="${attemptedSteps}">
      </label>
      <div class="modal-actions">
        <button class="btn ghost" id="smCancel">Cancel</button>
        <button class="btn" id="smSave">Update</button>
      </div>
    </div>`;
  document.body.appendChild(host);

  const input = host.querySelector('#smInput');
  input.focus();
  input.select();

  const close = () => { host.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  host.addEventListener('click', (e) => { if (e.target === host) close(); });
  host.querySelector('#smCancel').onclick = close;
  host.querySelector('#smSave').onclick = () => {
    const v = parseInt(input.value, 10);
    if (!isNaN(v) && v >= 0) { logSteps(v); close(); }
  };
}

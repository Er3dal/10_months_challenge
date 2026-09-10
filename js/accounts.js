// Account + per-user data storage. Everything lives in this browser only.
import { jget, jset, store } from './lib/storage.js';

const ACCOUNTS_KEY = 'ftp_accounts';
const SESSION_KEY = 'ftp_session';
const dataKey = (u) => 'ftp_data_' + u;

export const getAccounts = () => jget(ACCOUNTS_KEY, {});
export const saveAccounts = (a) => jset(ACCOUNTS_KEY, a);
export const getAccount = (u) => getAccounts()[u] || null;
export const getProfile = (u) => { const a = getAccount(u); return a ? a.profile : null; };

export const getSession = () => store.get(SESSION_KEY);
export const setSession = (u) => store.set(SESSION_KEY, u || '');

// Spread stored data over the defaults so accounts created before a new field
// existed (e.g. `food`) still get it filled in. `settings` is merged one
// level deeper so an account saved before a new setting existed (e.g.
// todayStyle) still gets that one default filled in, without losing any
// other settings already saved.
export const loadData = (u) => {
  const stored = jget(dataKey(u), {});
  return {
    daily: {}, weights: [], workouts: [], food: {}, myfoods: [], steps: {},
    settings: { todayStyle: 'cards' },
    ...stored,
    settings: { todayStyle: 'cards', ...(stored.settings || {}) },
  };
};
export const saveData = (u, d) => jset(dataKey(u), d);

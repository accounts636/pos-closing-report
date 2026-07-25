let CURRENT_USER = null;
let DENOMS = [];
let PAYMENT_METHODS = [];

const PAYMENT_LABELS = { cash: 'Cash', card: 'Card', credit: 'Credit', talabat: 'Talabat', deliveroo: 'Deliveroo', noon: 'Noon', careem: 'Careem', other: 'Other' };

function money(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDenom(d) {
  return d >= 1 ? `AED ${d}` : `AED ${d.toFixed(2)}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function init() {
  document.getElementById('topbarLogo').src = LOGO_DATA_URI;

  const meRes = await fetch('/api/auth/me');
  const meData = await meRes.json();
  if (!meData.user) { window.location.href = '/login.html'; return; }
  CURRENT_USER = meData.user;

  document.getElementById('whoami').textContent = `${CURRENT_USER.name} · ${CURRENT_USER.role}`;
  if (CURRENT_USER.role === 'admin') {
    document.getElementById('adminLink').classList.remove('hidden');
    document.getElementById('staffFilterWrap').classList.remove('hidden');
    loadStaffFilter();
  }

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login.html';
  });

  document.getElementById('entry_date').value = todayISO();

  const denomRes = await fetch('/api/entries/denominations');
  const denomData = await denomRes.json();
  DENOMS = denomData.denominations;
  PAYMENT_METHODS = denomData.payment_methods;
  renderDenomGrid();
  renderPaySummary();

  wireAuthAutofill();
  ['opening_float', 'cash_received', 'petty_cash', 'cash_deposit'].forEach(id => {
    document.getElementById(id).addEventListener('input', recalcTotals);
  });
  recalcTotals();

  document.getElementById('entryForm').addEventListener('submit', submitEntry);
  document.getElementById('applyFilters').addEventListener('click', () => loadEntries());
  document.getElementById('clearFilters').addEventListener('click', () => {
    document.getElementById('filterFrom').value = '';
    document.getElementById('filterTo').value = '';
    document.getElementById('filterUser').value = '';
    loadEntries();
  });

  loadEntries();
}

function renderDenomGrid() {
  const grid = document.getElementById('denomGrid');
  grid.innerHTML = '';
  DENOMS.forEach(d => {
    const cell = document.createElement('div');
    cell.className = 'denom-cell';
    const noteOrCoin = d >= 5 ? 'note' : 'coin';
    cell.innerHTML = `
      <div class="label"><span>${fmtDenom(d)}</span><span class="sub">${noteOrCoin} × qty</span></div>
      <input type="number" min="0" step="1" data-denom="${d}" value="" placeholder="0">
    `;
    grid.appendChild(cell);
  });
  grid.querySelectorAll('input').forEach(inp => inp.addEventListener('input', recalcTotals));
}

function renderPaySummary() {
  const body = document.getElementById('paySummaryBody');
  body.innerHTML = '';
  PAYMENT_METHODS.forEach(key => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="method-name">${PAYMENT_LABELS[key] || key}</td>
      <td><input type="number" step="0.01" min="0" data-pos="${key}" value="0"></td>
      <td><input type="number" step="0.01" min="0" data-actual="${key}" value="0"></td>
      <td class="diff-cell" data-diff="${key}">0.00</td>
    `;
    body.appendChild(row);
  });
  body.querySelectorAll('input').forEach(inp => inp.addEventListener('input', recalcTotals));
}

function collectDenominations() {
  const out = {};
  document.querySelectorAll('#denomGrid input[data-denom]').forEach(inp => {
    out[inp.dataset.denom] = Number(inp.value) || 0;
  });
  return out;
}

function collectPaySummary() {
  const out = {};
  PAYMENT_METHODS.forEach(key => {
    const pos = Number(document.querySelector(`[data-pos="${key}"]`).value) || 0;
    const actual = Number(document.querySelector(`[data-actual="${key}"]`).value) || 0;
    out[key] = { pos, actual };
  });
  return out;
}

function recalcTotals() {
  const pay = collectPaySummary();
  let posTotal = 0, actualTotal = 0;
  PAYMENT_METHODS.forEach(key => {
    const { pos, actual } = pay[key];
    const diff = actual - pos;
    const cell = document.querySelector(`[data-diff="${key}"]`);
    cell.textContent = money(diff);
    cell.style.color = diff === 0 ? '' : (diff > 0 ? '#3F6B4E' : '#A83A2E');
    posTotal += pos;
    actualTotal += actual;
  });
  document.getElementById('paySummaryPosTotal').textContent = money(posTotal);
  document.getElementById('paySummaryActualTotal').textContent = money(actualTotal);
  const diffTotal = actualTotal - posTotal;
  const diffTotalCell = document.getElementById('paySummaryDiffTotal');
  diffTotalCell.textContent = money(diffTotal);
  diffTotalCell.style.color = diffTotal === 0 ? '' : (diffTotal > 0 ? '#3F6B4E' : '#A83A2E');

  const denom = collectDenominations();
  let counted = 0;
  for (const d of DENOMS) counted += (Number(denom[d]) || 0) * d;
  document.getElementById('countedTotal').textContent = `AED ${money(counted)}`;

  const posCashSales = pay['cash'].pos;
  const float = Number(document.getElementById('opening_float').value) || 0;
  const cashReceived = Number(document.getElementById('cash_received').value) || 0;
  const pettyCash = Number(document.getElementById('petty_cash').value) || 0;
  const cashDeposit = Number(document.getElementById('cash_deposit').value) || 0;
  const expectedCash = float + cashReceived - pettyCash - cashDeposit;
  const shortExcess = counted - expectedCash;

  document.getElementById('posCashSalesDisplay').textContent = `AED ${money(posCashSales)}`;
  document.getElementById('expectedCashDisplay').textContent = `AED ${money(expectedCash)}`;

  const banner = document.getElementById('shortExcessBanner');
  const label = document.getElementById('shortExcessLabel');
  const value = document.getElementById('shortExcessValue');
  value.textContent = `AED ${money(Math.abs(shortExcess))}`;
  if (shortExcess === 0) {
    label.textContent = 'Balanced';
    banner.style.background = 'linear-gradient(135deg, #3A0F21 0%, #5C1A35 100%)';
  } else if (shortExcess > 0) {
    label.textContent = 'Excess';
    banner.style.background = 'linear-gradient(135deg, #234a37 0%, #3F6B4E 100%)';
  } else {
    label.textContent = 'Short';
    banner.style.background = 'linear-gradient(135deg, #6b2019 0%, #A83A2E 100%)';
  }
}

function wireAuthAutofill() {
  document.getElementById('cashier_name').addEventListener('input', (e) => {
    const prepared = document.getElementById('prepared_by');
    if (!prepared.dataset.touched) prepared.value = e.target.value;
  });
  document.getElementById('prepared_by').addEventListener('input', (e) => { e.target.dataset.touched = '1'; });
  document.getElementById('supervisor_name').addEventListener('input', (e) => {
    const verified = document.getElementById('verified_by');
    if (!verified.dataset.touched) verified.value = e.target.value;
  });
  document.getElementById('verified_by').addEventListener('input', (e) => { e.target.dataset.touched = '1'; });
}

async function submitEntry(e) {
  e.preventDefault();
  const errorBox = document.getElementById('formError');
  const successBox = document.getElementById('formSuccess');
  errorBox.style.display = 'none';
  successBox.style.display = 'none';

  const payload = {
    company: document.getElementById('company').value,
    outlet: document.getElementById('outlet').value,
    entry_date: document.getElementById('entry_date').value,
    shift: document.getElementById('shift').value,
    pos_counter: document.getElementById('pos_counter').value,
    cashier_name: document.getElementById('cashier_name').value,
    supervisor_name: document.getElementById('supervisor_name').value,
    pay_summary: collectPaySummary(),
    denominations: collectDenominations(),
    opening_float: document.getElementById('opening_float').value,
    cash_received: document.getElementById('cash_received').value,
    petty_cash: document.getElementById('petty_cash').value,
    cash_deposit: document.getElementById('cash_deposit').value,
    notes: document.getElementById('notes').value,
    prepared_by: document.getElementById('prepared_by').value,
    verified_by: document.getElementById('verified_by').value,
    received_by: document.getElementById('received_by').value,
  };

  try {
    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not save entry');

    successBox.textContent = 'Closing saved. You can download the PDF report from the records below.';
    successBox.style.display = 'block';
    document.getElementById('entryForm').reset();
    document.getElementById('company').value = 'Bettergrow Holding Company';
    document.getElementById('entry_date').value = todayISO();
    document.getElementById('prepared_by').dataset.touched = '';
    document.getElementById('verified_by').dataset.touched = '';
    renderDenomGrid();
    renderPaySummary();
    recalcTotals();
    loadEntries();
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.style.display = 'block';
  }
}

async function loadStaffFilter() {
  const res = await fetch('/api/users');
  if (!res.ok) return;
  const data = await res.json();
  const sel = document.getElementById('filterUser');
  data.users.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.textContent = u.name;
    sel.appendChild(opt);
  });
}

async function loadEntries() {
  const params = new URLSearchParams();
  const from = document.getElementById('filterFrom').value;
  const to = document.getElementById('filterTo').value;
  const userId = document.getElementById('filterUser') ? document.getElementById('filterUser').value : '';
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (userId) params.set('user_id', userId);

  const res = await fetch('/api/entries?' + params.toString());
  const data = await res.json();
  renderStats(data.entries);
  renderLedger(data.entries);
}

function renderStats(entries) {
  const totalSales = entries.reduce((s, e) => s + e.actual_total, 0);
  const totalCounted = entries.reduce((s, e) => s + e.total_counted, 0);
  const totalShortExcess = entries.reduce((s, e) => s + e.short_excess, 0);
  const wrap = document.getElementById('statCards');
  wrap.innerHTML = `
    <div class="stat-card"><div class="stat-label">Closings</div><div class="stat-value">${entries.length}</div></div>
    <div class="stat-card"><div class="stat-label">Total Sales</div><div class="stat-value">AED ${money(totalSales)}</div></div>
    <div class="stat-card"><div class="stat-label">Cash Counted</div><div class="stat-value">AED ${money(totalCounted)}</div></div>
    <div class="stat-card"><div class="stat-label">Net Short/(Excess)</div><div class="stat-value">AED ${money(totalShortExcess)}</div></div>
  `;
}

function renderLedger(entries) {
  const wrap = document.getElementById('ledgerWrap');
  if (entries.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><h3>No closings yet</h3><p>Entries you save will show up here, ready to export as a PDF report.</p></div>`;
    return;
  }

  const rows = entries.map(e => {
    const varTag = e.short_excess === 0 ? '<span class="tag tag-balanced">Balanced</span>'
      : e.short_excess > 0 ? `<span class="tag tag-over">+AED ${money(e.short_excess)}</span>`
      : `<span class="tag tag-short">-AED ${money(Math.abs(e.short_excess))}</span>`;

    const canDelete = CURRENT_USER.role === 'admin' || e.user_id === CURRENT_USER.id;

    return `
      <tr>
        <td>${e.entry_date}</td>
        <td>${e.outlet || '-'}</td>
        <td>${e.shift || '-'}</td>
        <td>${e.staff_name}</td>
        <td class="num">${money(e.actual_total)}</td>
        <td>${varTag}</td>
        <td>
          <div class="actions-row">
            <a class="btn btn-outline btn-sm" href="/api/pdf/${e.id}" target="_blank">PDF</a>
            ${canDelete ? `<button class="btn btn-danger btn-sm" data-delete="${e.id}" type="button">Delete</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  wrap.innerHTML = `
    <div style="overflow-x:auto;">
    <table class="ledger">
      <thead>
        <tr><th>Date</th><th>Outlet</th><th>Shift</th><th>Staff</th><th>Total Sales</th><th>Short/(Excess)</th><th></th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    </div>
  `;

  wrap.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this closing record? This cannot be undone.')) return;
      await fetch(`/api/entries/${btn.dataset.delete}`, { method: 'DELETE' });
      loadEntries();
    });
  });
}

init();

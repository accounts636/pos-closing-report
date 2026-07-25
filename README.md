const express = require('express');
const { connect, toId } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 1, 0.5, 0.25];
const PAYMENT_METHODS = ['cash', 'card', 'credit', 'talabat', 'deliveroo', 'noon', 'careem', 'other'];

function computeCountedTotal(denominations) {
  let total = 0;
  for (const d of DENOMINATIONS) {
    const qty = Number((denominations || {})[d]) || 0;
    total += qty * d;
  }
  return Math.round(total * 100) / 100;
}

function normalizePaySummary(pay_summary) {
  const out = {};
  PAYMENT_METHODS.forEach(key => {
    const p = (pay_summary || {})[key] || {};
    out[key] = { pos: Number(p.pos) || 0, actual: Number(p.actual) || 0 };
  });
  return out;
}

router.get('/denominations', requireAuth, (req, res) => {
  res.json({ denominations: DENOMINATIONS, payment_methods: PAYMENT_METHODS });
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      company, outlet, entry_date, shift, pos_counter, cashier_name, supervisor_name,
      denominations, opening_float, cash_received, petty_cash, cash_deposit,
      notes, prepared_by, verified_by, received_by
    } = req.body;

    if (!entry_date) return res.status(400).json({ error: 'entry_date is required' });

    const pay_summary = normalizePaySummary(req.body.pay_summary);
    const pos_total = PAYMENT_METHODS.reduce((s, k) => s + pay_summary[k].pos, 0);
    const actual_total = PAYMENT_METHODS.reduce((s, k) => s + pay_summary[k].actual, 0);

    const total_counted = computeCountedTotal(denominations);
    const float = Number(opening_float) || 0;
    const cashReceived = Number(cash_received) || 0;
    const pettyCash = Number(petty_cash) || 0;
    const cashDeposit = Number(cash_deposit) || 0;
    const pos_cash_sales = pay_summary.cash.pos;
    const expected_cash = Math.round((float + cashReceived - pettyCash - cashDeposit) * 100) / 100;
    const short_excess = Math.round((total_counted - expected_cash) * 100) / 100;

    const db = await connect();
    const doc = {
      user_id: req.session.user.id,
      company: (company || '').trim(),
      outlet: (outlet || '').trim(),
      entry_date,
      shift: shift || '',
      pos_counter: (pos_counter || '').trim(),
      cashier_name: (cashier_name || '').trim(),
      supervisor_name: (supervisor_name || '').trim(),
      pay_summary,
      pos_total: Math.round(pos_total * 100) / 100,
      actual_total: Math.round(actual_total * 100) / 100,
      denominations: denominations || {},
      total_counted,
      opening_float: float,
      cash_received: cashReceived,
      petty_cash: pettyCash,
      cash_deposit: cashDeposit,
      pos_cash_sales,
      expected_cash,
      short_excess,
      notes: (notes || '').trim(),
      prepared_by: (prepared_by || '').trim(),
      verified_by: (verified_by || '').trim(),
      received_by: (received_by || '').trim(),
      created_at: new Date().toISOString()
    };

    const result = await db.collection('entries').insertOne(doc);
    res.status(201).json({ id: result.insertedId.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const db = await connect();
    const isAdmin = req.session.user.role === 'admin';
    const { user_id, from, to } = req.query;

    const query = {};
    if (!isAdmin) {
      query.user_id = req.session.user.id;
    } else if (user_id) {
      query.user_id = user_id;
    }
    if (from || to) {
      query.entry_date = {};
      if (from) query.entry_date.$gte = from;
      if (to) query.entry_date.$lte = to;
    }

    const entries = await db.collection('entries').find(query).sort({ entry_date: -1, created_at: -1 }).toArray();

    // attach staff name/username
    const users = await db.collection('users').find({}, { projection: { password_hash: 0 } }).toArray();
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    const rows = entries.map(e => {
      const staff = userMap[e.user_id];
      return {
        ...e,
        id: e._id.toString(),
        staff_name: staff ? staff.name : 'Unknown',
        staff_username: staff ? staff.username : 'unknown'
      };
    });

    res.json({ entries: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const db = await connect();
    const entry = await db.collection('entries').findOne({ _id: toId(req.params.id) });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    if (req.session.user.role !== 'admin' && entry.user_id !== req.session.user.id) {
      return res.status(403).json({ error: 'Not allowed' });
    }
    const staff = await db.collection('users').findOne({ _id: toId(entry.user_id) });
    res.json({
      entry: {
        ...entry,
        id: entry._id.toString(),
        staff_name: staff ? staff.name : 'Unknown',
        staff_username: staff ? staff.username : 'unknown'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const db = await connect();
    const entry = await db.collection('entries').findOne({ _id: toId(req.params.id) });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    if (req.session.user.role !== 'admin' && entry.user_id !== req.session.user.id) {
      return res.status(403).json({ error: 'Not allowed' });
    }
    await db.collection('entries').deleteOne({ _id: entry._id });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;
module.exports.DENOMINATIONS = DENOMINATIONS;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;

const express = require('express');
const PDFDocument = require('pdfkit');
const { connect, toId } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { DENOMINATIONS, PAYMENT_METHODS } = require('./entries');

const router = express.Router();

function money(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDenom(d) {
  return d >= 1 ? `AED ${d}` : `AED ${d.toFixed(2)}`;
}

const PAYMENT_LABELS = {
  cash: 'Cash', card: 'Card', credit: 'Credit', talabat: 'Talabat',
  deliveroo: 'Deliveroo', noon: 'Noon', careem: 'Careem', other: 'Other'
};

router.get('/:id', requireAuth, async (req, res) => {
  const db = await connect();
  const row = await db.collection('entries').findOne({ _id: toId(req.params.id) });
  if (!row) return res.status(404).json({ error: 'Not found' });
  if (req.session.user.role !== 'admin' && row.user_id !== req.session.user.id) {
    return res.status(403).json({ error: 'Not allowed' });
  }
  const staff = await db.collection('users').findOne({ _id: toId(row.user_id) });
  row.cashier_name = row.cashier_name || (staff ? staff.name : '');

  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="pos-closing-${row.entry_date}-${req.params.id}.pdf"`);
  doc.pipe(res);

  const wine = '#5C1A35';
  const wineDeep = '#3A0F21';
  const gold = '#C9A15A';
  const grey = '#6B6B6B';
  const ink = '#1C1B1A';
  const green = '#3F6B4E';
  const red = '#A83A2E';

  const pageW = 595;
  const marginX = 42;
  const colW = (pageW - marginX * 2 - 20) / 2;
  const col1X = marginX;
  const col2X = marginX + colW + 20;

  // Header band
  doc.rect(0, 0, pageW, 78).fill(wineDeep);
  doc.rect(0, 78, pageW, 2).fill(gold);

  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(17).text('POS CLOSING REPORT', marginX, 22);
  doc.fillColor(gold).font('Helvetica-Oblique').fontSize(9.5).text('Bettergrow Holding Company', marginX, 40);
  doc.fillColor('#E6DCD2').font('Helvetica').fontSize(8).text(row.company || 'Bettergrow Holding Company', marginX, 53);

  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9)
    .text(String(row.entry_date), marginX, 22, { width: pageW - marginX * 2, align: 'right' });
  doc.fillColor('#E6DCD2').font('Helvetica').fontSize(8.5)
    .text(`${row.outlet || '-'}  ·  ${row.shift || '-'} Shift`, marginX, 35, { width: pageW - marginX * 2, align: 'right' })
    .text(`POS: ${row.pos_counter || '-'}`, marginX, 47, { width: pageW - marginX * 2, align: 'right' })
    .text(`Cashier: ${row.cashier_name || '-'}`, marginX, 59, { width: pageW - marginX * 2, align: 'right' });

  let y = 100;

  doc.fillColor(wine).font('Helvetica-Bold').fontSize(10.5);
  doc.text('SALES SUMMARY', col1X, y);
  doc.text('CASH DENOMINATION', col2X, y);
  y += 15;
  doc.moveTo(col1X, y).lineTo(col1X + colW, y).strokeColor(gold).lineWidth(1).stroke();
  doc.moveTo(col2X, y).lineTo(col2X + colW, y).strokeColor(gold).lineWidth(1).stroke();
  y += 14;

  // Column 1: Sales Summary
  let y1 = y;
  doc.fillColor(grey).font('Helvetica-Bold').fontSize(7.5);
  doc.text('METHOD', col1X, y1);
  doc.text('POS', col1X, y1, { width: colW - 47, align: 'right' });
  doc.text('ACTUAL', col1X, y1, { width: colW - 2, align: 'right' });
  y1 += 11;
  doc.moveTo(col1X, y1).lineTo(col1X + colW, y1).strokeColor('#DCD2C3').lineWidth(1).stroke();
  y1 += 8;

  doc.font('Helvetica').fontSize(8.5);
  let anyPayRow = false;
  PAYMENT_METHODS.forEach(key => {
    const p = row.pay_summary ? row.pay_summary[key] : null;
    if (!p || (p.pos === 0 && p.actual === 0)) return;
    anyPayRow = true;
    const diff = p.actual - p.pos;
    doc.fillColor(ink);
    doc.text(PAYMENT_LABELS[key], col1X, y1);
    doc.text(money(p.pos), col1X, y1, { width: colW - 47, align: 'right' });
    doc.text(money(p.actual), col1X, y1, { width: colW - 2, align: 'right' });
    y1 += 13;
  });
  if (!anyPayRow) {
    doc.fillColor(grey).text('No sales recorded', col1X, y1);
    y1 += 13;
  }
  y1 += 3;
  doc.moveTo(col1X, y1).lineTo(col1X + colW, y1).strokeColor(wine).lineWidth(1).stroke();
  y1 += 10;
  doc.fillColor(wine).font('Helvetica-Bold').fontSize(9);
  doc.text('Total', col1X, y1);
  doc.text(money(row.actual_total), col1X, y1, { width: colW - 2, align: 'right' });
  y1 += 20;

  // Column 2: Denomination
  let y2 = y;
  doc.fillColor(grey).font('Helvetica-Bold').fontSize(7.5);
  doc.text('DENOM', col2X, y2);
  doc.text('QTY', col2X, y2, { width: colW - 65, align: 'right' });
  doc.text('SUBTOTAL', col2X, y2, { width: colW - 2, align: 'right' });
  y2 += 11;
  doc.moveTo(col2X, y2).lineTo(col2X + colW, y2).strokeColor('#DCD2C3').lineWidth(1).stroke();
  y2 += 8;

  doc.font('Helvetica').fontSize(8.5);
  let anyDenomRow = false;
  DENOMINATIONS.forEach(d => {
    const qty = Number((row.denominations || {})[d]) || 0;
    if (qty === 0) return;
    anyDenomRow = true;
    doc.fillColor(ink);
    doc.text(fmtDenom(d), col2X, y2);
    doc.text(String(qty), col2X, y2, { width: colW - 65, align: 'right' });
    doc.text(money(qty * d), col2X, y2, { width: colW - 2, align: 'right' });
    y2 += 13;
  });
  if (!anyDenomRow) {
    doc.fillColor(grey).text('No cash counted', col2X, y2);
    y2 += 13;
  }
  y2 += 3;
  doc.moveTo(col2X, y2).lineTo(col2X + colW, y2).strokeColor(wine).lineWidth(1).stroke();
  y2 += 10;
  doc.fillColor(wine).font('Helvetica-Bold').fontSize(9);
  doc.text('Actual Cash', col2X, y2);
  doc.text(money(row.total_counted), col2X, y2, { width: colW - 2, align: 'right' });
  y2 += 20;

  y = Math.max(y1, y2) + 8;

  // Cash Reconciliation
  doc.fillColor(wine).font('Helvetica-Bold').fontSize(10.5).text('CASH RECONCILIATION', marginX, y);
  y += 15;
  doc.moveTo(marginX, y).lineTo(pageW - marginX, y).strokeColor(gold).lineWidth(1).stroke();
  y += 14;

  const halfW = (pageW - marginX * 2) / 2;
  const reconItems = [
    ['POS Cash Sales', row.pos_cash_sales],
    ['Opening Float', row.opening_float],
    ['Cash Received', row.cash_received],
    ['Less: Petty Cash', -row.petty_cash],
    ['Less: Cash Deposit', -row.cash_deposit],
  ];
  doc.font('Helvetica').fontSize(9).fillColor(ink);
  reconItems.forEach((item, idx) => {
    const colX = idx % 2 === 0 ? marginX : marginX + halfW;
    const rowY = y + Math.floor(idx / 2) * 15;
    doc.text(item[0], colX, rowY);
    doc.text(money(item[1]), colX, rowY, { width: halfW - 4, align: 'right' });
  });
  y += Math.ceil(reconItems.length / 2) * 15 + 8;

  doc.moveTo(marginX, y).lineTo(pageW - marginX, y).strokeColor('#DCD2C3').lineWidth(1).stroke();
  y += 12;
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(wine);
  doc.text('Expected Cash', marginX, y);
  doc.text(money(row.expected_cash), marginX, y, { width: halfW - 4, align: 'right' });
  doc.text('Actual Cash', marginX + halfW, y);
  doc.text(money(row.total_counted), marginX + halfW, y, { width: halfW - 4, align: 'right' });
  y += 22;

  // Short/Excess banner
  const seLabel = row.short_excess === 0 ? 'BALANCED' : (row.short_excess > 0 ? 'EXCESS' : 'SHORT');
  const seColor = row.short_excess === 0 ? wineDeep : (row.short_excess > 0 ? green : red);
  doc.roundedRect(marginX, y, pageW - marginX * 2, 32, 4).fill(seColor);
  doc.fillColor(gold).font('Helvetica-Bold').fontSize(9).text(seLabel, marginX + 14, y + 11);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(13)
    .text(`AED ${money(Math.abs(row.short_excess))}`, marginX, y + 9, { width: pageW - marginX * 2 - 14, align: 'right' });
  y += 46;

  if (row.notes) {
    doc.fillColor(wine).font('Helvetica-Bold').fontSize(9.5).text('Notes', marginX, y);
    y += 13;
    doc.fillColor(ink).font('Helvetica').fontSize(8.5).text(row.notes, marginX, y, { width: pageW - marginX * 2 });
    y += 30;
  }

  y = Math.max(y, 700);
  const authColW = (pageW - marginX * 2 - 40) / 3;
  const authCols = [
    { label: 'Prepared By · Cashier', name: row.prepared_by || row.cashier_name || '' },
    { label: 'Verified By · Supervisor', name: row.verified_by || row.supervisor_name || '' },
    { label: 'Received By · Finance', name: row.received_by || '' },
  ];
  authCols.forEach((c, idx) => {
    const x = marginX + idx * (authColW + 20);
    if (c.name) {
      doc.fillColor(ink).font('Helvetica-Bold').fontSize(9).text(c.name, x, y - 14, { width: authColW });
    }
    doc.moveTo(x, y).lineTo(x + authColW, y).strokeColor('#969696').lineWidth(1).stroke();
    doc.fillColor(grey).font('Helvetica').fontSize(8).text(c.label, x, y + 4, { width: authColW });
  });

  doc.fillColor(grey).font('Helvetica').fontSize(7)
    .text(`Generated ${new Date().toLocaleString('en-AE')}`, marginX, 800, { width: pageW - marginX * 2, align: 'center' });

  doc.end();
});

module.exports = router;

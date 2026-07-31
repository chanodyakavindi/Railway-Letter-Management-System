const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPeriodStatsFilter, getPeriodRange } = require('./dashboardController');
const { startOfDay, endOfDay } = require('../utils/letterHelpers');

test('daily period filter uses the current day creation window', () => {
  const now = new Date('2026-07-31T12:00:00.000Z');
  const filter = buildPeriodStatsFilter({ status: 'Draft' }, 'daily', now);
  const expectedStart = startOfDay(now);
  const expectedEnd = endOfDay(now);

  assert.deepStrictEqual(filter.createdAt, { $gte: expectedStart, $lte: expectedEnd });
  assert.equal(filter.status, 'Draft');
});

test('weekly period filter uses a 7-day creation window', () => {
  const now = new Date('2026-07-31T12:00:00.000Z');
  const { from, to } = getPeriodRange('weekly', now);
  const expectedStart = new Date(startOfDay(now));
  expectedStart.setDate(expectedStart.getDate() - 7);

  assert.deepStrictEqual({ from, to }, { from: expectedStart, to: endOfDay(now) });
});

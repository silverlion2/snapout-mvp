import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_HEAT,
  MAX_ROUNDS,
  STARTING_CASH,
  calculatePotentialLoss,
  createInitialGameState,
  drawCard,
  getGameStatus,
  resolveDecision,
} from './gameLogic.js';

test('calculatePotentialLoss rounds trade risk to whole dollars', () => {
  assert.equal(calculatePotentialLoss({ amount: 1250, drawdown: 0.33 }), 413);
});

test('snapping out saves the projected loss, cools heat, and logs the ledger', () => {
  const state = createInitialGameState();
  const card = { ticker: 'DOGE', amount: 1000, drawdown: 0.4, bait: 'green candle' };

  const next = resolveDecision(state, card, 'snap');

  assert.equal(next.cash, STARTING_CASH);
  assert.equal(next.saved, 400);
  assert.equal(next.heat, 18);
  assert.equal(next.streak, 1);
  assert.equal(next.round, 1);
  assert.equal(next.ledger[0].result, 'saved');
  assert.equal(next.ledger[0].amount, 400);
});

test('taking the trade burns cash, raises heat, and resets streak', () => {
  const state = { ...createInitialGameState(), streak: 3, heat: 80 };
  const card = { ticker: 'TSLA', amount: 5000, drawdown: 0.5, bait: 'breakout rumor' };

  const next = resolveDecision(state, card, 'yolo');

  assert.equal(next.cash, STARTING_CASH - 2500);
  assert.equal(next.saved, 0);
  assert.equal(next.heat, MAX_HEAT);
  assert.equal(next.streak, 0);
  assert.equal(next.misses, 1);
  assert.equal(next.ledger[0].result, 'lost');
  assert.equal(next.ledger[0].amount, 2500);
});

test('timeouts punish indecision without changing cash', () => {
  const state = createInitialGameState();
  const card = { ticker: 'NVDA', amount: 2000, drawdown: 0.25, bait: 'chatroom alert' };

  const next = resolveDecision(state, card, 'timeout');

  assert.equal(next.cash, STARTING_CASH);
  assert.equal(next.saved, 0);
  assert.equal(next.heat, 48);
  assert.equal(next.streak, 0);
  assert.equal(next.misses, 1);
  assert.equal(next.ledger[0].result, 'froze');
});

test('game status reports win, heat loss, and cash loss states', () => {
  assert.equal(getGameStatus({ ...createInitialGameState(), round: MAX_ROUNDS }), 'won');
  assert.equal(getGameStatus({ ...createInitialGameState(), heat: MAX_HEAT }), 'lost-heat');
  assert.equal(getGameStatus({ ...createInitialGameState(), cash: 0 }), 'lost-cash');
  assert.equal(getGameStatus(createInitialGameState()), 'playing');
});

test('drawCard cycles the deck by round', () => {
  const first = drawCard(0);
  const cycled = drawCard(MAX_ROUNDS);

  assert.equal(first.ticker, cycled.ticker);
});

export const STARTING_CASH = 10000;
export const STARTING_HEAT = 30;
export const MAX_HEAT = 100;
export const MIN_HEAT = 0;
export const MAX_ROUNDS = 8;

export const IMPULSE_DECK = [
  {
    ticker: 'DOGE',
    amount: 1000,
    drawdown: 0.4,
    bait: 'green candle',
    headline: 'DOGE vertical spike',
    note: 'The chart is already stretched and the comment thread is all caps.',
  },
  {
    ticker: 'NVDA',
    amount: 2500,
    drawdown: 0.28,
    bait: 'AI rumor',
    headline: 'Unverified AI contract rumor',
    note: 'The post has screenshots, no source, and a lot of rocket icons.',
  },
  {
    ticker: 'TSLA',
    amount: 5000,
    drawdown: 0.5,
    bait: 'breakout rumor',
    headline: 'Pre-market breakout chase',
    note: 'You missed the move and now your mouse is hovering over market buy.',
  },
  {
    ticker: 'COIN',
    amount: 3200,
    drawdown: 0.35,
    bait: 'crypto sympathy pump',
    headline: 'Crypto sympathy trade',
    note: 'Bitcoin twitched and every trading room decided this was destiny.',
  },
  {
    ticker: 'GME',
    amount: 1800,
    drawdown: 0.45,
    bait: 'squeeze thread',
    headline: 'Squeeze thread goes viral',
    note: 'The thesis is mostly screenshots of other screenshots.',
  },
  {
    ticker: 'SPY 0DTE',
    amount: 2200,
    drawdown: 0.8,
    bait: 'zero-day lotto',
    headline: 'One-hour options lottery',
    note: 'The premium is evaporating while you convince yourself it is a plan.',
  },
  {
    ticker: 'MSTR',
    amount: 3600,
    drawdown: 0.38,
    bait: 'Bitcoin proxy chase',
    headline: 'Levered Bitcoin proxy chase',
    note: 'You are buying volatility because a line moved on another screen.',
  },
  {
    ticker: 'HOOD',
    amount: 1500,
    drawdown: 0.32,
    bait: 'social feed alert',
    headline: 'Social feed pile-on',
    note: 'Three strangers with avatars agree, which is not a risk model.',
  },
];

const HEAT_REWARD = 12;
const HEAT_YOLO_PENALTY = 22;
const HEAT_TIMEOUT_PENALTY = 18;
const SNAP_SCORE_MULTIPLIER = 0.18;
const STREAK_BONUS = 45;

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function calculatePotentialLoss(card) {
  return Math.round(card.amount * card.drawdown);
}

export function createInitialGameState() {
  return {
    cash: STARTING_CASH,
    saved: 0,
    heat: STARTING_HEAT,
    streak: 0,
    score: 0,
    misses: 0,
    round: 0,
    ledger: [],
  };
}

export function drawCard(round, deck = IMPULSE_DECK) {
  return deck[round % deck.length];
}

export function getGameStatus(state) {
  if (state.cash <= 0) {
    return 'lost-cash';
  }

  if (state.heat >= MAX_HEAT) {
    return 'lost-heat';
  }

  if (state.round >= MAX_ROUNDS) {
    return 'won';
  }

  return 'playing';
}

function appendLedger(state, entry) {
  return [
    {
      id: `${state.round + 1}-${entry.ticker}-${entry.result}`,
      round: state.round + 1,
      ...entry,
    },
    ...state.ledger,
  ].slice(0, 6);
}

export function resolveDecision(state, card, decision) {
  const potentialLoss = calculatePotentialLoss(card);

  if (decision === 'snap') {
    const nextStreak = state.streak + 1;

    return {
      ...state,
      saved: state.saved + potentialLoss,
      heat: clamp(state.heat - HEAT_REWARD, MIN_HEAT, MAX_HEAT),
      streak: nextStreak,
      score: Math.round(state.score + potentialLoss * SNAP_SCORE_MULTIPLIER + nextStreak * STREAK_BONUS),
      round: state.round + 1,
      ledger: appendLedger(state, {
        ticker: card.ticker,
        result: 'saved',
        amount: potentialLoss,
        label: `Avoided ${card.bait}`,
      }),
    };
  }

  if (decision === 'timeout') {
    return {
      ...state,
      heat: clamp(state.heat + HEAT_TIMEOUT_PENALTY, MIN_HEAT, MAX_HEAT),
      streak: 0,
      misses: state.misses + 1,
      score: Math.max(0, state.score - 120),
      round: state.round + 1,
      ledger: appendLedger(state, {
        ticker: card.ticker,
        result: 'froze',
        amount: potentialLoss,
        label: `Hesitated on ${card.bait}`,
      }),
    };
  }

  return {
    ...state,
    cash: Math.max(0, state.cash - potentialLoss),
    heat: clamp(state.heat + HEAT_YOLO_PENALTY, MIN_HEAT, MAX_HEAT),
    streak: 0,
    misses: state.misses + 1,
    score: Math.max(0, state.score - Math.round(potentialLoss * 0.12)),
    round: state.round + 1,
    ledger: appendLedger(state, {
      ticker: card.ticker,
      result: 'lost',
      amount: potentialLoss,
      label: `Chased ${card.bait}`,
    }),
  };
}

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
    bait: '暴拉阳线',
    headline: 'DOGE 垂直拉升',
    note: '图形已经拉得很满，评论区全在用大写喊单。',
  },
  {
    ticker: 'NVDA',
    amount: 2500,
    drawdown: 0.28,
    bait: 'AI 传闻',
    headline: '未经证实的 AI 合同消息',
    note: '帖子有截图、没有来源，还配了一堆火箭图标。',
  },
  {
    ticker: 'TSLA',
    amount: 5000,
    drawdown: 0.5,
    bait: '突破传闻',
    headline: '盘前突破追涨',
    note: '你已经错过第一波，现在鼠标正停在市价买入上。',
  },
  {
    ticker: 'COIN',
    amount: 3200,
    drawdown: 0.35,
    bait: '加密联动拉盘',
    headline: '加密行情联动交易',
    note: '比特币刚动了一下，每个交易群都说这是命运。',
  },
  {
    ticker: 'GME',
    amount: 1800,
    drawdown: 0.45,
    bait: '逼空长帖',
    headline: '逼空长帖刷屏',
    note: '核心论据基本是截图套截图。',
  },
  {
    ticker: 'SPY 0DTE',
    amount: 2200,
    drawdown: 0.8,
    bait: '当日到期彩票',
    headline: '一小时到期期权彩票',
    note: '权利金正在蒸发，你还在说服自己这叫计划。',
  },
  {
    ticker: 'MSTR',
    amount: 3600,
    drawdown: 0.38,
    bait: '比特币代理追涨',
    headline: '杠杆版比特币代理追涨',
    note: '你因为另一个屏幕上的线动了，就准备买入波动率。',
  },
  {
    ticker: 'HOOD',
    amount: 1500,
    drawdown: 0.32,
    bait: '社交动态提醒',
    headline: '社交动态集体上车',
    note: '三个陌生头像意见一致，但那不是风险模型。',
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
        label: `避开：${card.bait}`,
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
        label: `犹豫：${card.bait}`,
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
      label: `追涨：${card.bait}`,
    }),
  };
}

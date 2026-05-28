import { createElement, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BadgeAlert,
  CircleDollarSign,
  Flame,
  Gauge,
  Keyboard,
  Play,
  RadioTower,
  ReceiptText,
  ScanLine,
  ShieldCheck,
  Target,
  TimerReset,
  TrendingUp,
  Trophy,
  Wallet,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  MAX_HEAT,
  MAX_ROUNDS,
  STARTING_CASH,
  calculatePotentialLoss,
  createInitialGameState,
  drawCard,
  getGameStatus,
  resolveDecision,
} from './gameLogic';

const ROUND_SECONDS = 8;

const STATUS_COPY = {
  won: {
    icon: Trophy,
    title: '交易台撑住了',
    body: '你扛过了这轮冲动考验，本金还在。',
    tone: 'text-emerald-200',
  },
  'lost-heat': {
    icon: Flame,
    title: '冲动过热',
    body: '市场钻进了你的脑子。重开一局，把交易台冷下来。',
    tone: 'text-red-200',
  },
  'lost-cash': {
    icon: XCircle,
    title: '资金归零',
    body: '这轮被交易按钮赢了。冷手重来。',
    tone: 'text-red-200',
  },
  playing: {
    icon: Activity,
    title: '回合进行中',
    body: '读懂冲动信号，在倒计时归零前做决定。',
    tone: 'text-sky-200',
  },
};

const FEEDBACK_COPY = {
  snap: {
    title: '冲动已拦截',
    body: '预计亏损转入幻影账本。',
    tone: 'border-emerald-300/60 bg-emerald-950/45 text-emerald-50',
  },
  yolo: {
    title: '追涨成交',
    body: '现金被扣，热度飙升。',
    tone: 'border-red-300/60 bg-red-950/45 text-red-50',
  },
  timeout: {
    title: '错过决策',
    body: '犹豫增加了热度。市场不会等你。',
    tone: 'border-amber-200/70 bg-amber-950/40 text-amber-50',
  },
};

function formatMoney(value) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function getBars(card, round) {
  return Array.from({ length: 34 }, (_, index) => {
    const wave = (index * 19 + round * 13 + Math.round(card.drawdown * 100)) % 74;
    const height = 18 + wave;
    const isRiskBar = index > 23;

    return {
      id: `${card.ticker}-${round}-${index}`,
      height: `${height}%`,
      tone: isRiskBar ? 'bg-red-300' : index % 4 === 0 ? 'bg-amber-200' : 'bg-sky-200',
    };
  });
}

function getPressureCopy(heatPercent) {
  if (heatPercent >= 75) {
    return {
      label: '危急',
      tone: 'text-red-200',
      rail: 'bg-red-400',
    };
  }

  if (heatPercent >= 50) {
    return {
      label: '升温',
      tone: 'text-amber-100',
      rail: 'bg-amber-300',
    };
  }

  return {
    label: '可控',
    tone: 'text-emerald-200',
    rail: 'bg-emerald-300',
  };
}

export default function SnapOutApp() {
  const [gameState, setGameState] = useState(() => createInitialGameState());
  const [phase, setPhase] = useState('ready');
  const [countdown, setCountdown] = useState(ROUND_SECONDS);
  const [feedback, setFeedback] = useState(null);

  const gameStatus = getGameStatus(gameState);
  const isFinished = phase === 'finished' || gameStatus !== 'playing';
  const currentCard = useMemo(() => drawCard(gameState.round), [gameState.round]);
  const chartBars = useMemo(() => getBars(currentCard, gameState.round), [currentCard, gameState.round]);
  const potentialLoss = calculatePotentialLoss(currentCard);
  const heatPercent = Math.min(100, Math.round((gameState.heat / MAX_HEAT) * 100));
  const timerPercent = Math.round((countdown / ROUND_SECONDS) * 100);
  const cashPercent = Math.max(0, Math.round((gameState.cash / STARTING_CASH) * 100));
  const savedPercent = Math.min(100, Math.round((gameState.saved / STARTING_CASH) * 100));
  const activeRound = Math.min(gameState.round + (phase === 'playing' ? 1 : 0), MAX_ROUNDS);
  const statusMessage = STATUS_COPY[isFinished ? gameStatus : 'playing'];
  const pressure = getPressureCopy(heatPercent);
  const StatusIcon = statusMessage.icon;

  const startGame = useCallback(() => {
    setGameState(createInitialGameState());
    setCountdown(ROUND_SECONDS);
    setFeedback(null);
    setPhase('playing');
  }, []);

  const handleDecision = useCallback(
    (decision) => {
      if (phase !== 'playing' || getGameStatus(gameState) !== 'playing') {
        return;
      }

      const card = drawCard(gameState.round);
      const amount = calculatePotentialLoss(card);
      const nextState = resolveDecision(gameState, card, decision);
      const nextStatus = getGameStatus(nextState);

      setGameState(nextState);
      setCountdown(ROUND_SECONDS);
      setFeedback({
        ...FEEDBACK_COPY[decision],
        ticker: card.ticker,
        amount,
      });
      setPhase(nextStatus === 'playing' ? 'playing' : 'finished');
    },
    [gameState, phase],
  );

  useEffect(() => {
    if (phase !== 'playing' || gameStatus !== 'playing') {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setCountdown((previous) => {
        if (previous <= 1) {
          window.clearInterval(timerId);
          handleDecision('timeout');
          return ROUND_SECONDS;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [gameStatus, handleDecision, phase]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat) {
        return;
      }

      if (event.code === 'Enter' && phase !== 'playing') {
        event.preventDefault();
        startGame();
      }

      if (event.code === 'KeyR') {
        event.preventDefault();
        startGame();
      }

      if (phase !== 'playing') {
        return;
      }

      if (event.code === 'Space' || event.code === 'KeyA' || event.code === 'KeyS') {
        event.preventDefault();
        handleDecision('snap');
      }

      if (event.code === 'KeyL' || event.code === 'KeyY') {
        event.preventDefault();
        handleDecision('yolo');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDecision, phase, startGame]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#070807] text-stone-100">
      <div className="market-grid min-h-screen px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5">
          <header className="command-header overflow-hidden rounded-md border border-stone-700/70 bg-[#11120f]/90 shadow-[0_22px_90px_rgba(0,0,0,0.45)]">
            <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(520px,620px)] lg:items-center lg:p-5">
              <div className="flex min-w-0 items-center gap-4">
                <div className="brand-mark flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-red-300/80 bg-red-400 text-stone-950 shadow-[0_0_36px_rgba(248,113,113,0.24)]">
                  <Zap size={36} strokeWidth={2.7} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase text-emerald-200">实时行为训练</p>
                  <h1 className="font-display text-4xl font-black leading-tight text-stone-50 sm:text-[44px] sm:leading-tight xl:text-5xl xl:leading-tight">
                    SnapOut FOMO 防守
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">
                    在倒计时压力下保住现金。冲动烧穿交易台之前，把避开的亏损记入账本。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Metric icon={Trophy} label="得分" value={gameState.score.toLocaleString('zh-CN')} tone="text-amber-100" />
                <Metric icon={Wallet} label="现金" value={formatMoney(gameState.cash)} tone="text-emerald-100" />
                <Metric icon={ShieldCheck} label="已避损" value={formatMoney(gameState.saved)} tone="text-sky-100" />
                <Metric icon={Gauge} label="回合" value={`${Math.min(gameState.round, MAX_ROUNDS)}/${MAX_ROUNDS}`} tone="text-red-100" />
              </div>
            </div>

            <div className="grid border-t border-stone-800 bg-stone-950/55 text-xs font-black uppercase text-stone-300 sm:grid-cols-4">
              <SignalChip icon={RadioTower} label="诱因" value={currentCard.bait} />
              <SignalChip icon={ArrowUpRight} label="仓位" value={formatMoney(currentCard.amount)} />
              <SignalChip icon={ArrowDownRight} label="回撤" value={`${Math.round(currentCard.drawdown * 100)}%`} />
              <SignalChip icon={Target} label="风险" value={formatMoney(potentialLoss)} />
            </div>
          </header>

          <main className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="war-room relative min-h-[680px] overflow-hidden rounded-md border border-stone-700/75 bg-[#0f110e] shadow-[0_28px_100px_rgba(0,0,0,0.52)]">
              <div className="ticker-tape border-b border-stone-700/80 bg-stone-950/90 py-2 text-xs font-black uppercase text-amber-100">
                <div className="ticker-tape__inner">
                  <span>{currentCard.ticker}</span>
                  <span>{currentCard.headline}</span>
                  <span>潜在亏损 {formatMoney(potentialLoss)}</span>
                  <span>热度 {heatPercent}%</span>
                  <span>按 A 或空格清醒离场</span>
                </div>
              </div>

              <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_330px] lg:p-5">
                <div className="flex min-h-[590px] flex-col justify-between gap-5">
                  <div className="market-screen relative min-h-[320px] overflow-hidden rounded-md border border-stone-700 bg-[#050806]">
                    <div className="scan-lines absolute inset-0" />
                    <div className="crosshair absolute inset-0" />

                    <div className="absolute left-4 right-4 top-4 z-10 flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase text-stone-500">冲动信号</p>
                        <div className="mt-1 flex flex-wrap items-end gap-3">
                          <span className="font-display text-6xl font-black leading-tight text-stone-50 sm:text-7xl sm:leading-tight">
                            {currentCard.ticker}
                          </span>
                          <span className="mb-2 rounded-sm border border-amber-200/70 bg-amber-200 px-2 py-1 text-xs font-black uppercase text-stone-950">
                            {currentCard.bait}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-md border border-red-300/70 bg-red-400 px-4 py-3 text-right text-stone-950 shadow-[0_0_30px_rgba(248,113,113,0.22)]">
                        <p className="text-xs font-black uppercase">风险金额</p>
                        <p className="font-display text-3xl font-black leading-tight">{formatMoney(potentialLoss)}</p>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 flex h-[68%] items-end gap-1 px-4 pb-6">
                      {chartBars.map((bar) => (
                        <div
                          key={bar.id}
                          className={`chart-bar flex-1 rounded-t-sm ${bar.tone}`}
                          style={{ height: bar.height }}
                        />
                      ))}
                    </div>

                    <div className="absolute bottom-5 left-4 right-4 z-10 grid gap-2 sm:grid-cols-3">
                      <StatusPill label="仓位规模" value={formatMoney(currentCard.amount)} />
                      <StatusPill label="热度状态" value={pressure.label} tone={pressure.tone} />
                      <StatusPill label="倒计时" value={`${countdown}s`} />
                    </div>
                  </div>

                  <div>
                    <div className="rounded-md border border-stone-700 bg-stone-950/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center gap-2 text-sky-200">
                            <ScanLine size={18} />
                            <p className="text-xs font-black uppercase">冲动卡</p>
                          </div>
                          <h2 className="font-display text-3xl font-black leading-tight text-stone-50 sm:text-4xl sm:leading-tight">
                            {currentCard.headline}
                          </h2>
                        </div>
                        <div className="timer-block min-w-[112px] rounded-md border border-amber-200/70 bg-[#16130b] px-4 py-3 text-center">
                          <p className="text-xs font-black uppercase text-stone-500">倒计时</p>
                          <p className="font-display text-5xl font-black leading-tight text-amber-100">{countdown}</p>
                        </div>
                      </div>
                      <p className="max-w-3xl text-base leading-7 text-stone-300">{currentCard.note}</p>

                      <div className="mt-5 h-3 overflow-hidden rounded-sm border border-stone-700 bg-stone-900">
                        <div
                          className="h-full bg-amber-200 transition-all duration-500"
                          style={{ width: `${timerPercent}%` }}
                        />
                      </div>
                    </div>

                  </div>
                </div>

                <aside className="order-first flex flex-col gap-4 lg:order-none">
                  <div className="fixed bottom-3 left-3 right-3 z-40 grid grid-cols-2 gap-2 rounded-md border border-stone-700 bg-stone-950/90 p-2 shadow-[0_18px_70px_rgba(0,0,0,0.55)] lg:static lg:z-auto lg:grid-cols-1 lg:gap-3 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
                    <DecisionButton
                      disabled={phase !== 'playing'}
                      icon={ShieldCheck}
                      label="清醒离场"
                      meta="A / 空格"
                      tone="border-emerald-300 bg-emerald-300 text-stone-950 hover:bg-emerald-200"
                      onClick={() => handleDecision('snap')}
                    />
                    <DecisionButton
                      disabled={phase !== 'playing'}
                      icon={TrendingUp}
                      label="追单入场"
                      meta="L / Y"
                      tone="border-red-300 bg-red-400 text-stone-950 hover:bg-red-300"
                      onClick={() => handleDecision('yolo')}
                    />
                  </div>

                  <div className="rounded-md border border-stone-700 bg-stone-950/75 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-red-100">
                        <Flame size={19} />
                        <span className="text-sm font-black uppercase">冲动热度</span>
                      </div>
                      <span className={`font-display text-2xl font-black ${pressure.tone}`}>{pressure.label}</span>
                    </div>

                    <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-4">
                      <div
                        className="heat-dial grid h-28 w-28 place-items-center rounded-full"
                        style={{ '--heat': `${heatPercent * 3.6}deg` }}
                      >
                        <div className="grid h-[82px] w-[82px] place-items-center rounded-full border border-stone-700 bg-stone-950 text-center">
                          <span className="font-display text-3xl font-black leading-tight text-stone-50">{heatPercent}%</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Meter label="现金余量" value={formatMoney(gameState.cash)} percent={cashPercent} tone="bg-emerald-300" />
                        <Meter label="已避风险" value={formatMoney(gameState.saved)} percent={savedPercent} tone="bg-sky-200" />
                        <Meter label="热度" value={`${heatPercent}%`} percent={heatPercent} tone={pressure.rail} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border border-stone-700 bg-stone-950/75 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sky-200">
                      <Activity size={18} />
                      <span className="text-sm font-black uppercase">本局状态</span>
                    </div>
                    <div className={`flex items-start gap-3 ${statusMessage.tone}`}>
                      <StatusIcon size={30} className="mt-1 shrink-0" />
                      <div>
                        <p className="font-display text-2xl font-black">{statusMessage.title}</p>
                        <p className="mt-1 text-sm leading-6 text-stone-300">{statusMessage.body}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <SmallStat label="连击" value={gameState.streak} />
                      <SmallStat label="失误" value={gameState.misses} />
                      <SmallStat label="回合" value={activeRound} />
                      <SmallStat label="本金" value={formatMoney(STARTING_CASH)} />
                    </div>
                  </div>

                  {feedback && (
                    <div className={`rounded-md border p-4 ${feedback.tone}`} aria-live="polite">
                      <p className="text-sm font-black uppercase">{feedback.ticker}</p>
                      <p className="font-display text-2xl font-black">{feedback.title}</p>
                      <p className="mt-1 text-sm leading-6">
                        {feedback.body} {formatMoney(feedback.amount)} 曾摆在你面前。
                      </p>
                    </div>
                  )}

                  <div className="min-h-[210px] rounded-md border border-stone-700 bg-stone-950/75 p-4">
                    <div className="mb-3 flex items-center gap-2 text-amber-100">
                      <ReceiptText size={18} />
                      <span className="text-sm font-black uppercase">幻影账本</span>
                    </div>
                    {gameState.ledger.length === 0 ? (
                      <p className="text-sm leading-6 text-stone-500">暂无记录。开始一局并做出选择。</p>
                    ) : (
                      <div className="space-y-2">
                        {gameState.ledger.map((entry) => (
                          <LedgerEntry key={entry.id} entry={entry} />
                        ))}
                      </div>
                    )}
                  </div>
                </aside>
              </div>

              {phase === 'ready' && (
                <GameOverlay
                  icon={Play}
                  title="开盘入场"
                  body="8 张冲动卡。保住现金、压住热度，在倒计时归零前把避开的亏损记进幻影账本。"
                  actionLabel="开始训练"
                  onAction={startGame}
                />
              )}

              {isFinished && (
                <GameOverlay
                  icon={statusMessage.icon}
                  title={statusMessage.title}
                  body={`${statusMessage.body} 最终得分：${gameState.score.toLocaleString('zh-CN')}。已避损：${formatMoney(gameState.saved)}。`}
                  actionLabel="再来一局"
                  onAction={startGame}
                />
              )}
            </section>

            <aside className="grid content-start gap-5">
              <div className="rounded-md border border-stone-700 bg-[#11120f] p-4 shadow-[0_18px_70px_rgba(0,0,0,0.35)]">
                <div className="mb-3 flex items-center gap-2 text-stone-100">
                  <Keyboard size={18} />
                  <h2 className="text-sm font-black uppercase">操作</h2>
                </div>
                <div className="grid gap-2 text-sm text-stone-300">
                  <ControlKey keys="A / 空格" label="清醒离场，并记下避开的亏损" />
                  <ControlKey keys="L / Y" label="追单入场，承受亏损" />
                  <ControlKey keys="R" label="重新开始本局" />
                  <ControlKey keys="Enter" label="在准备或结束状态开始" />
                </div>
              </div>

              <div className="rounded-md border border-stone-700 bg-[#11120f] p-4 shadow-[0_18px_70px_rgba(0,0,0,0.35)]">
                <div className="mb-3 flex items-center gap-2 text-stone-100">
                  <TimerReset size={18} />
                  <h2 className="text-sm font-black uppercase">交易纪律</h2>
                </div>
                <div className="grid gap-3 text-sm leading-6 text-stone-400">
                  <ProtocolItem icon={BadgeAlert} title="识别诱饵" body="先把每条标题当成压力信号，直到你说清下行风险。" />
                  <ProtocolItem icon={CircleDollarSign} title="标出亏损" body="红色数字就是这次冲动要求你立刻承担的风险。" />
                  <ProtocolItem icon={ShieldCheck} title="快速打断" body="清醒离场会降低热度，并把避开的伤害转成得分。" />
                </div>
              </div>
            </aside>
          </main>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, tone }) {
  return (
    <div className="metric-tile rounded-md border border-stone-700/80 bg-stone-950/70 px-3 py-3">
      <div className="mb-1 flex items-center gap-2 text-stone-500">
        {createElement(icon, { size: 15 })}
        <span className="text-xs font-black uppercase">{label}</span>
      </div>
      <p className={`truncate font-display text-xl font-black leading-tight ${tone}`}>{value}</p>
    </div>
  );
}

function SignalChip({ icon, label, value }) {
  return (
    <div className="flex min-h-14 items-center gap-3 border-b border-stone-800 px-4 py-3 sm:border-b-0 sm:border-r sm:last:border-r-0">
      {createElement(icon, { size: 17, className: 'shrink-0 text-stone-500' })}
      <div className="min-w-0">
        <p className="text-[10px] text-stone-500">{label}</p>
        <p className="truncate text-stone-100">{value}</p>
      </div>
    </div>
  );
}

function StatusPill({ label, value, tone = 'text-stone-50' }) {
  return (
    <div className="rounded-md border border-stone-700/80 bg-stone-950/80 px-3 py-2 shadow-[0_14px_30px_rgba(0,0,0,0.24)]">
      <p className="text-[10px] font-black uppercase text-stone-500">{label}</p>
      <p className={`truncate font-display text-base font-black ${tone}`}>{value}</p>
    </div>
  );
}

function Meter({ label, value, percent, tone }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-black uppercase text-stone-500">{label}</span>
        <span className="text-xs font-black text-stone-200">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-sm border border-stone-700 bg-stone-900">
        <div className={`h-full transition-all duration-500 ${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function DecisionButton({ disabled, icon, label, meta, onClick, tone }) {
  return (
    <button
      className={`decision-button flex min-h-24 w-full flex-col items-start justify-center gap-3 rounded-md border px-4 py-3 text-left font-black uppercase transition disabled:cursor-not-allowed disabled:border-stone-700 disabled:bg-stone-900 disabled:text-stone-600 lg:min-h-28 ${tone}`}
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      <span className="flex min-w-0 items-center gap-3">
        {createElement(icon, { size: 28, className: 'shrink-0' })}
        <span className="min-w-0 font-display text-xl leading-tight">{label}</span>
      </span>
      <span className="rounded-sm border border-current px-2 py-1 text-xs">{meta}</span>
    </button>
  );
}

function SmallStat({ label, value }) {
  return (
    <div className="rounded-md border border-stone-800 bg-stone-900/70 p-2">
      <p className="text-xs font-black uppercase text-stone-500">{label}</p>
      <p className="truncate font-display text-lg font-black text-stone-100">{value}</p>
    </div>
  );
}

function LedgerEntry({ entry }) {
  const isSaved = entry.result === 'saved';
  const isFrozen = entry.result === 'froze';
  const tone = isSaved ? 'text-emerald-200' : isFrozen ? 'text-amber-100' : 'text-red-200';

  return (
    <div className="flex items-center justify-between gap-3 border-b border-stone-800 pb-2 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-stone-100">{entry.ticker}</p>
        <p className="truncate text-xs text-stone-500">{entry.label}</p>
      </div>
      <span className={`shrink-0 text-sm font-black ${tone}`}>
        {isSaved ? '+' : '-'}
        {formatMoney(entry.amount)}
      </span>
    </div>
  );
}

function ControlKey({ keys, label }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-stone-800 pb-2 last:border-b-0">
      <span className="text-stone-400">{label}</span>
      <kbd className="shrink-0 rounded-sm border border-stone-600 bg-stone-950 px-2 py-1 text-xs font-black text-amber-100">{keys}</kbd>
    </div>
  );
}

function ProtocolItem({ icon, title, body }) {
  return (
    <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 border-b border-stone-800 pb-3 last:border-b-0 last:pb-0">
      <div className="grid h-8 w-8 place-items-center rounded-sm border border-stone-700 bg-stone-950 text-amber-100">
        {createElement(icon, { size: 17 })}
      </div>
      <div className="min-w-0">
        <p className="font-black text-stone-100">{title}</p>
        <p className="text-stone-500">{body}</p>
      </div>
    </div>
  );
}

function GameOverlay({ icon, title, body, actionLabel, onAction }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-950/90 px-4 py-6 backdrop-blur-sm">
      <div className="overlay-panel max-w-xl rounded-md border border-amber-100/80 bg-[#11120f] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        {createElement(icon, { size: 46, className: 'mx-auto mb-3 text-amber-100' })}
        <h2 className="font-display text-4xl font-black leading-tight text-stone-50">{title}</h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-stone-300">{body}</p>
        <button
          className="mt-6 inline-flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-300 px-6 py-3 font-display text-xl font-black uppercase text-stone-950 transition hover:bg-emerald-200"
          type="button"
          onClick={onAction}
        >
          <Play size={20} />
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

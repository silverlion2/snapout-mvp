import { createElement, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Flame,
  Gauge,
  Keyboard,
  Play,
  ReceiptText,
  ShieldCheck,
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
    title: 'Desk survived',
    body: 'You made it through the impulse run with capital intact.',
    tone: 'text-emerald-300',
  },
  'lost-heat': {
    icon: Flame,
    title: 'Heat overload',
    body: 'The market got inside your head. Reset and cool the desk down.',
    tone: 'text-red-300',
  },
  'lost-cash': {
    icon: XCircle,
    title: 'Cash wiped',
    body: 'The trade button won this round. Run it back with colder hands.',
    tone: 'text-red-300',
  },
  playing: {
    icon: Activity,
    title: 'Round live',
    body: 'Read the impulse. Make the call before the timer burns out.',
    tone: 'text-cyan-300',
  },
};

const FEEDBACK_COPY = {
  snap: {
    title: 'Impulse blocked',
    body: 'Projected loss moved into the phantom ledger.',
    tone: 'border-emerald-400/50 bg-emerald-950/35 text-emerald-100',
  },
  yolo: {
    title: 'Trade chased',
    body: 'Cash took the hit and heat spiked.',
    tone: 'border-red-400/50 bg-red-950/35 text-red-100',
  },
  timeout: {
    title: 'Decision missed',
    body: 'Indecision added heat. The market does not pause for you.',
    tone: 'border-amber-300/60 bg-amber-950/35 text-amber-100',
  },
};

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function getBars(card, round) {
  return Array.from({ length: 26 }, (_, index) => {
    const wave = (index * 19 + round * 13 + Math.round(card.drawdown * 100)) % 74;
    const height = 18 + wave;
    const isRiskBar = index > 17;

    return {
      id: `${card.ticker}-${round}-${index}`,
      height: `${height}%`,
      tone: isRiskBar ? 'bg-red-400' : index % 3 === 0 ? 'bg-amber-300' : 'bg-cyan-300',
    };
  });
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
  const activeRound = Math.min(gameState.round + (phase === 'playing' ? 1 : 0), MAX_ROUNDS);
  const statusMessage = STATUS_COPY[isFinished ? gameStatus : 'playing'];
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
    <div className="min-h-screen overflow-x-hidden bg-[#090907] text-zinc-100">
      <div className="market-grid min-h-screen px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          <header className="flex flex-col gap-3 border-b border-zinc-700/70 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-red-400 bg-red-500 text-zinc-950">
                <Zap size={28} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase text-red-300">SnapOut Arcade</p>
                <h1 className="font-display text-3xl font-black leading-none text-zinc-50 sm:text-4xl">
                  FOMO Defense
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
              <Metric icon={Trophy} label="Score" value={gameState.score.toLocaleString()} />
              <Metric icon={Wallet} label="Cash" value={formatMoney(gameState.cash)} />
              <Metric icon={ShieldCheck} label="Saved" value={formatMoney(gameState.saved)} />
              <Metric icon={Gauge} label="Round" value={`${Math.min(gameState.round, MAX_ROUNDS)}/${MAX_ROUNDS}`} />
            </div>
          </header>

          <main className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="relative min-h-[650px] overflow-hidden border border-zinc-700 bg-[#11110d] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <div className="ticker-tape border-b border-zinc-700/80 bg-zinc-950/80 py-2 text-xs font-bold uppercase text-amber-200">
                <div className="ticker-tape__inner">
                  <span>{currentCard.ticker}</span>
                  <span>{currentCard.headline}</span>
                  <span>Potential loss {formatMoney(potentialLoss)}</span>
                  <span>Heat {heatPercent}%</span>
                  <span>Snap out with A or Space</span>
                </div>
              </div>

              <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:p-6">
                <div className="flex min-h-[560px] flex-col justify-between gap-4">
                  <div className="relative min-h-[250px] overflow-hidden border border-zinc-700 bg-[#070805]">
                    <div className="scan-lines absolute inset-0" />
                    <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                      <StatusPill label="Ticker" value={currentCard.ticker} />
                      <StatusPill label="Trade size" value={formatMoney(currentCard.amount)} />
                      <StatusPill label="Risk" value={`${Math.round(currentCard.drawdown * 100)}%`} />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 flex h-[78%] items-end gap-1 px-4 pb-5">
                      {chartBars.map((bar) => (
                        <div
                          key={bar.id}
                          className={`chart-bar flex-1 ${bar.tone}`}
                          style={{ height: bar.height }}
                        />
                      ))}
                    </div>
                    <div className="absolute bottom-4 right-4 z-10 border border-red-400/70 bg-red-500 px-3 py-2 text-right text-zinc-950">
                      <p className="text-xs font-black uppercase">At risk</p>
                      <p className="font-display text-3xl font-black">{formatMoney(potentialLoss)}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
                    <div className="border border-zinc-700 bg-zinc-950/65 p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase text-zinc-500">Impulse card</p>
                          <h2 className="font-display text-3xl font-black leading-tight text-zinc-50">
                            {currentCard.headline}
                          </h2>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-bold uppercase text-zinc-500">Timer</p>
                          <p className="font-display text-5xl font-black text-amber-200">{countdown}</p>
                        </div>
                      </div>
                      <p className="max-w-3xl text-base leading-7 text-zinc-300">{currentCard.note}</p>

                      <div className="mt-5 h-3 overflow-hidden border border-zinc-700 bg-zinc-900">
                        <div
                          className="h-full bg-amber-300 transition-all duration-500"
                          style={{ width: `${timerPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <DecisionButton
                        disabled={phase !== 'playing'}
                        icon={ShieldCheck}
                        label="Snap Out"
                        meta="A / Space"
                        tone="border-emerald-400 bg-emerald-400 text-zinc-950 hover:bg-emerald-300"
                        onClick={() => handleDecision('snap')}
                      />
                      <DecisionButton
                        disabled={phase !== 'playing'}
                        icon={TrendingUp}
                        label="Take Trade"
                        meta="L / Y"
                        tone="border-red-400 bg-red-500 text-zinc-950 hover:bg-red-400"
                        onClick={() => handleDecision('yolo')}
                      />
                    </div>
                  </div>
                </div>

                <aside className="flex flex-col gap-4">
                  <div className="border border-zinc-700 bg-zinc-950/70 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-red-200">
                        <Flame size={18} />
                        <span className="text-sm font-bold uppercase">Impulse heat</span>
                      </div>
                      <span className="font-display text-2xl font-black">{heatPercent}%</span>
                    </div>
                    <div className="h-4 overflow-hidden border border-zinc-700 bg-zinc-900">
                      <div
                        className="h-full bg-red-500 transition-all duration-500"
                        style={{ width: `${heatPercent}%` }}
                      />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      Snap decisions cool the desk. Chased trades and missed timers push heat toward shutdown.
                    </p>
                  </div>

                  <div className="border border-zinc-700 bg-zinc-950/70 p-4">
                    <div className="mb-3 flex items-center gap-2 text-cyan-200">
                      <Activity size={18} />
                      <span className="text-sm font-bold uppercase">Run status</span>
                    </div>
                    <div className={`flex items-start gap-3 ${statusMessage.tone}`}>
                      <StatusIcon size={28} className="mt-1 shrink-0" />
                      <div>
                        <p className="font-display text-2xl font-black">{statusMessage.title}</p>
                        <p className="mt-1 text-sm leading-6 text-zinc-300">{statusMessage.body}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <SmallStat label="Streak" value={gameState.streak} />
                      <SmallStat label="Misses" value={gameState.misses} />
                      <SmallStat label="Round" value={activeRound} />
                      <SmallStat label="Bank" value={formatMoney(STARTING_CASH)} />
                    </div>
                  </div>

                  {feedback && (
                    <div className={`border p-4 ${feedback.tone}`} aria-live="polite">
                      <p className="text-sm font-bold uppercase">{feedback.ticker}</p>
                      <p className="font-display text-2xl font-black">{feedback.title}</p>
                      <p className="mt-1 text-sm leading-6">
                        {feedback.body} {formatMoney(feedback.amount)} was on the table.
                      </p>
                    </div>
                  )}

                  <div className="min-h-[196px] border border-zinc-700 bg-zinc-950/70 p-4">
                    <div className="mb-3 flex items-center gap-2 text-amber-200">
                      <ReceiptText size={18} />
                      <span className="text-sm font-bold uppercase">Phantom ledger</span>
                    </div>
                    {gameState.ledger.length === 0 ? (
                      <p className="text-sm leading-6 text-zinc-500">No entries yet. Start the run and make a call.</p>
                    ) : (
                      <div className="space-y-2">
                        {gameState.ledger.map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-zinc-100">{entry.ticker}</p>
                              <p className="truncate text-xs text-zinc-500">{entry.label}</p>
                            </div>
                            <span
                              className={`shrink-0 text-sm font-black ${
                                entry.result === 'saved'
                                  ? 'text-emerald-300'
                                  : entry.result === 'froze'
                                    ? 'text-amber-200'
                                    : 'text-red-300'
                              }`}
                            >
                              {entry.result === 'saved' ? '+' : '-'}
                              {formatMoney(entry.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </aside>
              </div>

              {phase === 'ready' && (
                <GameOverlay
                  icon={Play}
                  title="Open the market"
                  body="Eight impulse cards. Preserve cash, cool heat, and build the phantom ledger before the timer expires."
                  actionLabel="Start Run"
                  onAction={startGame}
                />
              )}

              {isFinished && (
                <GameOverlay
                  icon={statusMessage.icon}
                  title={statusMessage.title}
                  body={`${statusMessage.body} Final score: ${gameState.score.toLocaleString()}. Saved: ${formatMoney(gameState.saved)}.`}
                  actionLabel="Play Again"
                  onAction={startGame}
                />
              )}
            </section>

            <aside className="grid gap-4">
              <div className="border border-zinc-700 bg-[#11110d] p-4">
                <div className="mb-3 flex items-center gap-2 text-zinc-200">
                  <Keyboard size={18} />
                  <h2 className="text-sm font-bold uppercase">Controls</h2>
                </div>
                <div className="grid gap-2 text-sm text-zinc-300">
                  <ControlKey keys="A / Space" label="Snap out and bank the avoided loss" />
                  <ControlKey keys="L / Y" label="Take the trade and absorb the loss" />
                  <ControlKey keys="R" label="Restart the run" />
                  <ControlKey keys="Enter" label="Start from ready or end state" />
                </div>
              </div>

              <div className="border border-zinc-700 bg-[#11110d] p-4">
                <div className="mb-3 flex items-center gap-2 text-zinc-200">
                  <TimerReset size={18} />
                  <h2 className="text-sm font-bold uppercase">Debug fixes shipped</h2>
                </div>
                <ul className="space-y-2 text-sm leading-6 text-zinc-400">
                  <li>Phantom ledger now records saved, lost, and frozen decisions.</li>
                  <li>Game rules live in tested deterministic logic.</li>
                  <li>HTML title and metadata now match SnapOut.</li>
                </ul>
              </div>
            </aside>
          </main>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="border border-zinc-700 bg-zinc-950/70 px-3 py-2">
      <div className="mb-1 flex items-center gap-2 text-zinc-500">
        {createElement(icon, { size: 15 })}
        <span className="text-xs font-bold uppercase">{label}</span>
      </div>
      <p className="truncate font-display text-xl font-black text-zinc-50">{value}</p>
    </div>
  );
}

function StatusPill({ label, value }) {
  return (
    <div className="border border-zinc-700 bg-zinc-950/80 px-3 py-2">
      <p className="text-[10px] font-bold uppercase text-zinc-500">{label}</p>
      <p className="font-display text-base font-black text-zinc-50">{value}</p>
    </div>
  );
}

function DecisionButton({ disabled, icon, label, meta, onClick, tone }) {
  return (
    <button
      className={`flex min-h-24 w-full flex-col items-start justify-center gap-2 border px-4 py-3 text-left font-black uppercase transition disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 ${tone}`}
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      <span className="flex min-w-0 items-center gap-3">
        {createElement(icon, { size: 26, className: 'shrink-0' })}
        <span className="min-w-0 font-display text-xl leading-none">{label}</span>
      </span>
      <span className="border border-current px-2 py-1 text-xs">{meta}</span>
    </button>
  );
}

function SmallStat({ label, value }) {
  return (
    <div className="border border-zinc-800 bg-zinc-900/70 p-2">
      <p className="text-xs font-bold uppercase text-zinc-500">{label}</p>
      <p className="font-display text-lg font-black text-zinc-100">{value}</p>
    </div>
  );
}

function ControlKey({ keys, label }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-2">
      <span className="text-zinc-400">{label}</span>
      <kbd className="shrink-0 border border-zinc-600 bg-zinc-950 px-2 py-1 text-xs font-black text-amber-200">{keys}</kbd>
    </div>
  );
}

function GameOverlay({ icon, title, body, actionLabel, onAction }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/86 px-4 backdrop-blur-sm">
      <div className="max-w-xl border border-amber-200 bg-[#11110d] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        {createElement(icon, { size: 46, className: 'mx-auto mb-3 text-amber-200' })}
        <h2 className="font-display text-4xl font-black text-zinc-50">{title}</h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-zinc-300">{body}</p>
        <button
          className="mt-6 inline-flex items-center gap-2 border border-emerald-300 bg-emerald-300 px-6 py-3 font-display text-xl font-black uppercase text-zinc-950 transition hover:bg-emerald-200"
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

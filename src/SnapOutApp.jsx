import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, TrendingDown, ShieldAlert, DollarSign, Skull, CheckCircle2, Crosshair, Coffee } from 'lucide-react';

const INSULTS = [
  "Couldn't even hold a button for 30 seconds, and you think you can hold a volatile trade? Pathetic.",
  "Attention span of a goldfish. Go back to index funds, boomer.",
  "Your hands are made of wet toilet paper. Stop trading.",
  "You just proved you have zero discipline. Enjoy your shift at Wendy's.",
  "Bro let go of the mouse. The hedge funds are laughing at you right now.",
  "You failed. If you buy this now, you deserve every red candle coming your way.",
  "Even a monkey throwing darts has better impulse control than you.",
  "Are you allergic to money? Keep this up and you'll be living in your wife's boyfriend's basement.",
  "I've seen literal toddlers with better emotional regulation.",
  "Your portfolio called. It's begging you to stop touching the keyboard.",
  "Is your brain completely smooth? Stop clicking and start thinking!",
  "Wall Street thanks you for your generous donation to their bonus pool."
];

export default function SnapOutApp() {
  const [step, setStep] = useState('setup'); // setup, roast, hold, unlocked, saved
  
  // Setup State
  const [ticker, setTicker] = useState('DOGE');
  const [amount, setAmount] = useState(5000);
  const [dreamItem, setDreamItem] = useState('Rolex Submariner');
  const [dreamPrice, setDreamPrice] = useState(10000);
  
  // Roast State
  const [estLoss, setEstLoss] = useState(0);
  
  // Hold State
  const [timeLeft, setTimeLeft] = useState(30);
  const [isHolding, setIsHolding] = useState(false);
  const [currentInsult, setCurrentInsult] = useState('');
  const timerRef = useRef(null);

  // Calculate Loss
  const handleCalculate = () => {
    // Assuming a worst-case 40% drawdown for crypto/meme stocks
    const loss = amount * 0.4;
    setEstLoss(loss);
    setStep('roast');
  };

  // Hold Timer Logic
  const startHold = () => {
    setIsHolding(true);
    setCurrentInsult('');
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsHolding(false);
          setStep('unlocked');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopHold = () => {
    if (timeLeft > 0 && isHolding) {
      clearInterval(timerRef.current);
      setIsHolding(false);
      setTimeLeft(30);
      setCurrentInsult(INSULTS[Math.floor(Math.random() * INSULTS.length)]);
    }
  };

  // Visibility Change Logic (Anti-Tab Switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && step === 'hold' && timeLeft > 0) {
        // If they switch tabs while supposed to be cooling down
        if (isHolding) {
          clearInterval(timerRef.current);
          setIsHolding(false);
        }
        setTimeLeft(30);
        setCurrentInsult("SWITCHED TABS? Sneaky little degen. The timer is RESET. You can't escape your own stupidity.");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [step, timeLeft, isHolding]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col items-center py-12 px-4">
      
      {/* HEADER */}
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="flex items-center gap-2 text-red-500 font-black text-4xl mb-2 tracking-tighter">
          <ShieldAlert size={40} className="animate-pulse" />
          SNAP<span className="text-white">OUT</span>
        </div>
        <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">Pre-Trade Sanity Check</p>
      </div>

      {/* STEP 1: SETUP (THE ANCHOR) */}
      {step === 'setup' && (
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-2xl">
          <h2 className="text-xl font-bold mb-6 text-white border-b border-slate-800 pb-2">1. Define Your Reality</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">What are you about to FOMO into?</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  className="w-1/3 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white uppercase focus:border-red-500 outline-none transition-colors"
                  placeholder="Ticker (e.g. TSLA)"
                />
                <div className="relative w-2/3">
                  <DollarSign size={16} className="absolute left-3 top-3 text-slate-500" />
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded pl-8 py-2 text-white focus:border-red-500 outline-none transition-colors"
                    placeholder="Trade Amount"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">What's your ultimate materialistic dream?</label>
              <input 
                type="text" 
                value={dreamItem}
                onChange={(e) => setDreamItem(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white mb-2 focus:border-red-500 outline-none"
                placeholder="e.g. Rolex, PS5, Vegas Trip"
              />
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-3 text-slate-500" />
                <input 
                  type="number" 
                  value={dreamPrice}
                  onChange={(e) => setDreamPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded pl-8 py-2 text-white focus:border-red-500 outline-none"
                  placeholder="How much does it cost?"
                />
              </div>
            </div>

            <button 
              onClick={handleCalculate}
              className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-all active:scale-95"
            >
              Analyze My Stupidity
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: THE ROAST (REALITY CHECK) */}
      {step === 'roast' && (
        <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-red-950/30 border-2 border-red-600/50 p-6 rounded-xl shadow-2xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-red-500">
              <Skull size={120} />
            </div>
            
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <TrendingDown size={28} />
              <h2 className="text-2xl font-black uppercase tracking-tight">Reality Check</h2>
            </div>
            
            <p className="text-lg text-slate-300 mb-6 leading-relaxed">
              Based on historical max drawdowns, this "{ticker}" trade could easily tank by 40% if whales decide to dump on you. 
            </p>

            <div className="bg-slate-950 border border-red-900/50 p-4 rounded-lg mb-6 text-center">
              <span className="block text-sm text-slate-500 uppercase font-bold mb-1">Estimated Potential Loss</span>
              <span className="text-4xl font-black text-red-500">-${estLoss.toLocaleString()}</span>
            </div>

            <div className="bg-red-900/20 p-4 rounded-lg border border-red-800/50 mb-8">
              <p className="font-medium text-red-200">
                You are about to YOLO this money straight into the ocean. <br/><br/>
                Are you seriously going to sacrifice your <strong className="text-white bg-red-600 px-1">{dreamItem}</strong> just to fund some hedge fund manager's new yacht?
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setStep('saved')}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded transition-all flex justify-center items-center gap-2"
              >
                <CheckCircle2 size={20} /> I'm Walking Away (Save ${estLoss.toLocaleString()})
              </button>
              <button 
                onClick={() => setStep('hold')}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold py-3 px-4 rounded transition-all border border-slate-700"
              >
                I don't care, I still want to trade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: THE 30 SEC HOLD (TOXIC FRICTION) */}
      {step === 'hold' && (
        <div className="w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-2 text-white">The Sanity Hold</h2>
          <p className="text-slate-400 text-sm mb-8">Prove you have the discipline to hold a volatile asset. Click and hold the button below for 30 seconds without letting go or switching tabs.</p>
          
          <div 
            className={`relative w-64 h-64 mx-auto rounded-full flex items-center justify-center cursor-pointer transition-all select-none
              ${isHolding ? 'bg-red-600 scale-95 shadow-[0_0_50px_rgba(220,38,38,0.5)]' : 'bg-slate-800 hover:bg-slate-700 border-4 border-slate-700'}
            `}
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={startHold}
            onTouchEnd={stopHold}
          >
            <div className="text-center pointer-events-none">
              <span className={`block text-6xl font-black tabular-nums ${isHolding ? 'text-white' : 'text-slate-400'}`}>
                {timeLeft}
              </span>
              <span className={`block text-xs font-bold uppercase mt-2 tracking-widest ${isHolding ? 'text-red-200' : 'text-slate-500'}`}>
                {isHolding ? 'Hold...' : 'Click & Hold'}
              </span>
            </div>
            
            {/* Progress ring visual hack */}
            {isHolding && (
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                <circle
                  cx="128"
                  cy="128"
                  r="124"
                  fill="none"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="8"
                  strokeDasharray="779"
                  strokeDashoffset={779 - (779 * ((30 - timeLeft) / 30))}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
            )}
          </div>

          {currentInsult && (
            <div className="mt-8 p-4 bg-red-950/80 border border-red-500 rounded-lg animate-in fade-in zoom-in duration-300 flex items-start gap-3 text-left">
              <AlertTriangle className="text-red-500 shrink-0 mt-1" />
              <p className="text-red-200 font-medium">{currentInsult}</p>
            </div>
          )}

          <div className="mt-12">
            <button 
              onClick={() => setStep('saved')}
              className="text-slate-500 hover:text-emerald-400 underline text-sm transition-colors"
            >
              Okay, you win. I'm closing the broker tab.
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: UNLOCKED (IF THEY SURVIVE THE HOLD) */}
      {step === 'unlocked' && (
        <div className="w-full max-w-md text-center bg-slate-900 p-8 rounded-xl border border-slate-700">
          <Crosshair size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-white">Timer Complete.</h2>
          <p className="text-slate-400 mb-6">If you still want to execute this trade after 30 seconds of staring at your own stupidity, go ahead. May God have mercy on your portfolio.</p>
          <button 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded"
            onClick={() => {
              setStep('setup');
              setTimeLeft(30);
            }}
          >
            Fine, Go Lose Your Money (Back to Home)
          </button>
        </div>
      )}

      {/* STEP 5: SAVED IS EARNED (SUCCESS) */}
      {step === 'saved' && (
        <div className="w-full max-w-md text-center bg-emerald-950/30 p-8 rounded-xl border border-emerald-800/50 animate-in zoom-in duration-500">
          <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-4" />
          <h2 className="text-3xl font-black mb-2 text-white tracking-tight">BULLET DODGED</h2>
          <p className="text-emerald-200/80 mb-6 text-lg">
            Because you sat on your hands today, you didn't risk losing <strong className="text-emerald-400">${estLoss.toLocaleString()}</strong>. 
          </p>
          <div className="bg-emerald-900/40 p-4 rounded-lg border border-emerald-700/50 mb-8">
            <p className="text-emerald-400 font-bold font-mono">
              + ${estLoss.toLocaleString()} SAVED
            </p>
            <p className="text-sm text-emerald-300/60 mt-1">You literally just paid yourself to do nothing. Legend.</p>
          </div>
          <button 
            onClick={() => {
              setStep('setup');
              setTimeLeft(30);
              setCurrentInsult('');
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded transition-all shadow-[0_0_20px_rgba(5,150,105,0.4)]"
          >
            Log Action to Phantom Ledger
          </button>
        </div>
      )}

      {/* ADVERTISEMENT PLACEHOLDER */}
      <div className="mt-auto pt-16 w-full max-w-2xl">
        <div className="bg-slate-900 border border-slate-800 border-dashed rounded-lg p-4 text-center text-slate-600 text-sm">
          <span className="block font-bold text-slate-500 mb-1">Advertisement Placeholder</span>
          Space reserved for trading therapy or anti-gambling hotline ads. <br/> (Your Ad Here)
        </div>
      </div>

      {/* DONATE BUTTON */}
      <button 
        className="fixed bottom-6 right-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-5 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
        onClick={() => alert('Thanks for the support! (Stripe checkout placeholder)')}
      >
        <Coffee size={20} />
        Support the Dev
      </button>

    </div>
  );
}
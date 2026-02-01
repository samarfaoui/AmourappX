import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useSaveScore } from "@/hooks/use-scores";
import { Button } from "@/components/ui/button";
import { Trophy, Save, RotateCcw, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { useToast } from "@/hooks/use-toast";

export function GameArea() {
  const [score, setScore] = useState(0);
  const [isClicking, setIsClicking] = useState(false);
  const { isAuthenticated } = useAuth();
  const { mutate: saveScore, isPending } = useSaveScore();
  const { toast } = useToast();

  const handleClick = () => {
    setScore((prev) => prev + 1);
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 100);

    // Random colorful burst every 10 clicks
    if (score > 0 && score % 10 === 0) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C']
      });
    }
  };

  const handleSave = () => {
    if (score === 0) return;
    
    saveScore({ score }, {
      onSuccess: () => {
        toast({
          title: "Score Saved! 🏆",
          description: `You banked ${score} points on the leaderboard!`,
          className: "bg-green-500 text-white border-none",
        });
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        setScore(0);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-lg mx-auto">
      {/* Score Display */}
      <motion.div 
        className="text-center mb-12 relative"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground bg-white/50 px-4 py-1 rounded-full border border-black/5 backdrop-blur-sm">
          Current Session
        </span>
        <h1 className="text-8xl font-display font-black text-foreground mt-4 tabular-nums relative z-10 drop-shadow-sm">
          {score}
        </h1>
        {/* Decorative background blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
      </motion.div>

      {/* Main Click Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={`
          w-64 h-64 rounded-full 
          bg-gradient-to-b from-primary to-primary/90
          shadow-[0_15px_30px_rgba(124,58,237,0.3),inset_0_-8px_10px_rgba(0,0,0,0.1),inset_0_4px_10px_rgba(255,255,255,0.3)]
          border-8 border-white dark:border-zinc-800
          flex flex-col items-center justify-center
          relative overflow-hidden group
          transition-colors duration-300
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="text-4xl select-none font-bold text-white drop-shadow-md">
          CLICK!
        </span>
        <Sparkles className="w-8 h-8 text-white/50 mt-2 animate-pulse" />
        
        {/* Ripple effect rings */}
        <AnimatePresence>
          {isClicking && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-full border-4 border-white/30"
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Controls */}
      <div className="mt-12 flex items-center gap-4 w-full px-8">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setScore(0)}
          className="flex-1 h-14 rounded-2xl border-2 hover:bg-muted font-bold text-muted-foreground"
          disabled={score === 0 || isPending}
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </Button>

        {isAuthenticated ? (
          <Button
            size="lg"
            onClick={handleSave}
            disabled={score === 0 || isPending}
            className={`
              flex-[2] h-14 rounded-2xl font-bold text-lg
              bg-accent hover:bg-accent/90 text-accent-foreground
              shadow-[0_4px_15px_rgba(16,185,129,0.3)]
              border-b-4 border-accent/30 active:border-b-0 active:translate-y-1
              transition-all
            `}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Bank Score
              </>
            )}
          </Button>
        ) : (
          <Button
            asChild
            size="lg"
            className="flex-[2] h-14 rounded-2xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
          >
            <a href="/api/login">
              Login to Save
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

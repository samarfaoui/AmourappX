import { useScores } from "@/hooks/use-scores";
import { Trophy, Medal, User } from "lucide-react";
import { motion } from "framer-motion";

export function Leaderboard() {
  const { data: scores, isLoading, error } = useScores();

  // Helper to format relative time
  const timeAgo = (dateStr: string | null) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
    }).format(date);
  };

  const getRankIcon = (index: number) => {
    switch(index) {
      case 0: return <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500" />;
      case 1: return <Medal className="w-6 h-6 text-gray-400 fill-gray-400" />;
      case 2: return <Medal className="w-6 h-6 text-amber-700 fill-amber-700" />;
      default: return <span className="font-bold text-muted-foreground w-6 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-card rounded-3xl p-6 shadow-sm border border-border/50 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl text-yellow-600 dark:text-yellow-500">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display">Leaderboard</h2>
          <p className="text-sm text-muted-foreground">Top clickers of all time</p>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 animate-pulse">
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-3 bg-muted rounded w-16" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="p-4 text-center text-red-500 bg-red-50 rounded-xl">
            Failed to load scores
          </div>
        ) : !scores?.length ? (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No champions yet.</p>
            <p className="text-sm">Be the first!</p>
          </div>
        ) : (
          scores.map((score, index) => (
            <motion.div
              key={score.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 flex justify-center">
                  {getRankIcon(index)}
                </div>
                <div>
                  <div className="font-bold text-foreground flex items-center gap-2">
                    {score.username || "Anonymous"}
                    {index === 0 && (
                      <span className="text-[10px] font-extrabold uppercase bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200">
                        King
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {timeAgo(score.createdAt)}
                  </div>
                </div>
              </div>
              <div className="font-mono font-bold text-lg text-primary">
                {score.score.toLocaleString()}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

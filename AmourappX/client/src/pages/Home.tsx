import { Header } from "@/components/Header";
import { GameArea } from "@/components/GameArea";
import { Leaderboard } from "@/components/Leaderboard";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start h-full">
          {/* Game Section */}
          <section className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-[2.5rem] p-8 lg:p-12 border border-white/20 shadow-xl"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                  Start Clicking!
                </h2>
                <p className="text-muted-foreground">
                  Tap the button as fast as you can. Login to save your high score.
                </p>
              </div>
              
              <GameArea />
            </motion.div>
          </section>

          {/* Leaderboard Section */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:sticky lg:top-24"
          >
            <Leaderboard />
          </motion.aside>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© 2024 ClickerQuest. Built with React & Tailwind.</p>
      </footer>
    </div>
  );
}

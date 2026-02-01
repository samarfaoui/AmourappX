import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Gamepad2, LogOut, Trophy } from "lucide-react";
import { Link } from "wouter";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="p-2 bg-primary rounded-xl text-primary-foreground transform group-hover:rotate-12 transition-transform duration-300">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            Clicker<span className="text-primary">Quest</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 bg-secondary/10 rounded-full border border-secondary/20">
                <img 
                  src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=random`} 
                  alt="Profile"
                  className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-black"
                />
                <span className="text-sm font-semibold text-foreground truncate max-w-[100px]">
                  {user?.firstName || "Player"}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => logout()}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button 
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl shadow-lg shadow-primary/25"
            >
              <a href="/api/login">
                Login with Replit
              </a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

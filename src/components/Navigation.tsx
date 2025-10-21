import { Scale, User, LogOut, BookOpen, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  user: any;
}

const Navigation = ({ user }: NavigationProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <nav className="bg-card border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-hero p-2 rounded-lg group-hover:shadow-primary transition-all">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl">JUSTICE PATH</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/chat">
                  <Button variant="ghost" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Chat
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="ghost" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

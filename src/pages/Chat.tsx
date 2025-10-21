import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import ChatInterface from "@/components/ChatInterface";

const Chat = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-subtle">
      <Navigation user={user} />
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="h-full bg-card rounded-lg shadow-lg overflow-hidden">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default Chat;

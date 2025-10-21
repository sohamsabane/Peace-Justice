import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bookmark, Clock, Plus } from "lucide-react";
import { toast } from "sonner";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

interface SavedItem {
  id: string;
  title: string;
  created_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadUserData(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadUserData = async (userId: string) => {
    try {
      const [conversationsData, savedItemsData] = await Promise.all([
        supabase
          .from('chat_conversations')
          .select('id, title, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('saved_items')
          .select('id, title, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      if (conversationsData.error) throw conversationsData.error;
      if (savedItemsData.error) throw savedItemsData.error;

      setConversations(conversationsData.data || []);
      setSavedItems(savedItemsData.data || []);
    } catch (error: any) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Here's an overview of your legal journey</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversations.length}</div>
              <p className="text-xs text-muted-foreground">Saved chat sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Items</CardTitle>
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{savedItems.length}</div>
              <p className="text-xs text-muted-foreground">Bookmarked resources</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
              <p className="text-xs text-muted-foreground">Account created</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Conversations</CardTitle>
                  <CardDescription>Your latest chat sessions</CardDescription>
                </div>
                <Link to="/chat">
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Chat
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No conversations yet. Start chatting to get legal help!</p>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                    >
                      <h4 className="font-medium text-sm mb-1">{conv.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved Items</CardTitle>
              <CardDescription>Your bookmarked content</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : savedItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved items yet. Bookmark important information during your chats!</p>
              ) : (
                <div className="space-y-3">
                  {savedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                    >
                      <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

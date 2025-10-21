import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  conversationId?: string;
  onConversationCreated?: (id: string) => void;
}

const ChatInterface = ({ conversationId, onConversationCreated }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId]);

  const loadConversation = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        setMessages(data.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })));
      }
    } catch (error: any) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  const createConversation = async (firstMessage: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to save conversations');
      return null;
    }

    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: user.id,
        title: firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '')
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    setCurrentConvId(data.id);
    if (onConversationCreated) {
      onConversationCreated(data.id);
    }
    return data.id;
  };

  const saveMessage = async (convId: string, role: 'user' | 'assistant', content: string) => {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: convId,
        role,
        content
      });

    if (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      let convId = currentConvId;
      if (!convId) {
        convId = await createConversation(userMessage);
      }

      if (convId) {
        await saveMessage(convId, 'user', userMessage);
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/legal-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantMessage += content;
              setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (convId && assistantMessage) {
        await saveMessage(convId, 'assistant', assistantMessage);
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error(error.message || 'Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg mb-2">Welcome to JUSTICE PATH</p>
            <p className="text-sm">Ask me anything about legal processes, your rights, or how to handle legal situations.</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <Card
            key={index}
            className={`p-4 ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground ml-auto max-w-[80%]'
                : 'bg-card max-w-[80%]'
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </Card>
        ))}
        
        {isLoading && (
          <Card className="p-4 max-w-[80%] bg-card">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-muted-foreground">Thinking...</span>
            </div>
          </Card>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-card p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your legal rights, processes, or get guidance..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="lg"
            className="px-6"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

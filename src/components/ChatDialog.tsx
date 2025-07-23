import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Message {
  id: string;
  from_user_id: string;
  from_user_name: string;
  from_user_type: string;
  to_user_id?: string;
  to_user_name?: string;
  to_user_type?: string;
  content: string;
  message_type: string;
  created_at: string;
  read_at?: string;
}

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDialog = ({ isOpen, onClose }: ChatDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id},message_type.eq.broadcast`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as mensagens.",
          variant: "destructive"
        });
      }
    };

    fetchMessages();

    // Setup real-time subscription
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('💬 Nova mensagem recebida:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as Message;
            // Só adicionar se a mensagem for relevante para o usuário atual
            if (
              newMsg.from_user_id === user.id ||
              newMsg.to_user_id === user.id ||
              newMsg.message_type === 'broadcast'
            ) {
              setMessages(prev => [...prev, newMsg]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, user]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || isLoading) return;

    setIsLoading(true);
    try {
      const messageData = {
        from_user_id: user.id,
        from_user_name: user.name,
        from_user_type: user.type,
        content: newMessage.trim(),
        message_type: user.type === 'secretario' ? 'broadcast' : 'direct',
        // Se for professor, enviar para todos os secretários (broadcast)
        // Se for secretário, pode ser broadcast para todos
        ...(user.type === 'professor' && {
          to_user_type: 'secretario'
        })
      };

      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) throw error;

      setNewMessage('');
      
      toast({
        title: "Mensagem enviada",
        description: user.type === 'secretario' 
          ? "Mensagem enviada para todos os professores." 
          : "Mensagem enviada para o secretário."
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMessageDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isMyMessage = (message: Message) => message.from_user_id === user?.id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Chat {user?.type === 'secretario' ? 'com Professores' : 'com Secretário'}
          </DialogTitle>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-background/50 rounded-lg">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma mensagem ainda.</p>
              <p className="text-sm">Inicie uma conversa!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isMyMessage(message)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {message.from_user_name}
                    </Badge>
                    <span className="text-xs opacity-70">
                      {formatMessageTime(message.created_at)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex gap-2 pt-4 border-t">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              user?.type === 'secretario' 
                ? "Digite uma mensagem para todos os professores..." 
                : "Digite uma mensagem para o secretário..."
            }
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2">
          {user?.type === 'secretario' 
            ? "Suas mensagens serão enviadas para todos os professores." 
            : "Suas mensagens serão enviadas para o secretário."}
        </div>
      </DialogContent>
    </Dialog>
  );
};
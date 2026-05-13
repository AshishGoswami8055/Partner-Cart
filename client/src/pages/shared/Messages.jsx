import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, MessagesSquare } from 'lucide-react';
import { messageApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { getSocket } from '@/hooks/useSocket';
import { formatRelative } from '@/lib/format';
import { cn } from '@/lib/cn';

export const MessagesPage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const endRef = useRef(null);

  const conversations = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageApi.conversations(),
    refetchInterval: 30_000,
  });

  const thread = useQuery({
    queryKey: ['thread', activeId],
    queryFn: () => messageApi.thread(activeId),
    enabled: !!activeId,
  });

  const send = useMutation({
    mutationFn: ({ id, body }) => messageApi.send(id, { body }),
    onSuccess: () => {
      setDraft('');
      qc.invalidateQueries({ queryKey: ['thread', activeId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeId) return undefined;
    socket.emit('chat:join', { conversationId: activeId });
    const onMessage = () => qc.invalidateQueries({ queryKey: ['thread', activeId] });
    const onTyping = ({ isTyping }) => setPartnerTyping(isTyping);
    socket.on('chat:message', onMessage);
    socket.on('chat:typing', onTyping);
    return () => {
      socket.emit('chat:leave', { conversationId: activeId });
      socket.off('chat:message', onMessage);
      socket.off('chat:typing', onTyping);
    };
  }, [activeId, qc]);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [thread.data?.items]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeId) return;
    socket.emit('chat:typing', { conversationId: activeId, isTyping: typing });
  }, [typing, activeId]);

  const items = conversations.data || [];

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Card className="overflow-hidden">
        <div className="border-b border-border p-4">
          <h2 className="font-display font-semibold">Conversations</h2>
        </div>
        <div className="max-h-[70vh] overflow-y-auto scrollbar-thin">
          {conversations.isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No conversations yet.</div>
          ) : (
            items.map((c) => {
              const unread = user?.role === 'vendor' ? c.unread?.vendor || 0 : c.unread?.customer || 0;
              const partnerName = user?.role === 'vendor' ? c.customer?.name : c.vendor?.storeName;
              const partnerAvatar = user?.role === 'vendor' ? c.customer?.avatar?.url : c.vendor?.logo?.url;
              return (
                <button
                  key={c._id}
                  onClick={() => setActiveId(c._id)}
                  className={cn(
                    'flex w-full items-start gap-3 border-b border-border/60 p-4 text-left transition hover:bg-muted/50',
                    activeId === c._id && 'bg-primary/5'
                  )}
                >
                  <Avatar name={partnerName} src={partnerAvatar} />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{partnerName}</span>
                      {unread > 0 && <Badge tone="primary">{unread}</Badge>}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{c.lastMessage?.body || 'Say hi 👋'}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </Card>

      <Card className="flex h-[70vh] flex-col overflow-hidden">
        {!activeId ? (
          <EmptyState
            className="m-auto border-0 bg-transparent"
            icon={MessagesSquare}
            title="Select a conversation"
            description="Pick a chat from the left to start messaging."
          />
        ) : thread.isLoading ? (
          <div className="flex-1 space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-2/3" />)}
          </div>
        ) : (
          <>
            <div className="border-b border-border p-4">
              <div className="font-display font-semibold">
                {user?.role === 'vendor'
                  ? thread.data?.conversation?.customer?.name
                  : thread.data?.conversation?.vendor?.storeName}
              </div>
              {partnerTyping && (
                <div className="text-xs text-muted-foreground">typing...</div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 p-4 scrollbar-thin">
              {(thread.data?.items || []).map((m) => {
                const mine = String(m.sender) === String(user?.id);
                return (
                  <div key={m._id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[70%] rounded-2xl px-4 py-2 text-sm',
                        mine
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      )}
                    >
                      <div>{m.body}</div>
                      <div className={cn('mt-1 text-[10px]', mine ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                        {formatRelative(m.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
            <form
              className="flex items-center gap-2 border-t border-border p-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) send.mutate({ id: activeId, body: draft.trim() });
              }}
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onFocus={() => setTyping(true)}
                onBlur={() => setTyping(false)}
                placeholder="Type a message..."
              />
              <Button type="submit" rightIcon={<Send className="h-4 w-4" />} disabled={!draft.trim()}>
                Send
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
};

export default MessagesPage;

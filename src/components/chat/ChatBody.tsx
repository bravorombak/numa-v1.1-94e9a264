interface ChatBodyProps {
  sessionId: string;
}

export const ChatBody = ({ sessionId }: ChatBodyProps) => {
  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">
          No messages yet. Start the conversation below.
        </p>
      </div>
    </div>
  );
};

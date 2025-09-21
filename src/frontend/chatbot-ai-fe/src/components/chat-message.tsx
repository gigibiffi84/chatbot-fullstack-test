import { Loader2, User, Bot, Paperclip } from "lucide-react"
import {cn} from "../service/utils.ts";
import type {ChatMessage} from "../hooks/use-chat.ts";
import {Card} from "./ui/card.tsx";

interface ChatMessageProps {
  message: ChatMessage
}

export function ChatMessageComponent({ message }: ChatMessageProps) {
  const isUser = message.type === "user"

  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      <Card
        className={cn(
          "max-w-[80%] p-4",
          isUser ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground",
        )}
      >
        <div className="space-y-2">
          {message.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>}

          {message.files && message.files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {message.files.map((file, index) => (
                <div key={index} className="flex items-center gap-1 text-xs bg-background/10 rounded px-2 py-1">
                  <Paperclip className="w-3 h-3" />
                  <span className="truncate max-w-[100px]">{file.name}</span>
                </div>
              ))}
            </div>
          )}

          {message.isLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}
        </div>
      </Card>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <User className="w-4 h-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  )
}

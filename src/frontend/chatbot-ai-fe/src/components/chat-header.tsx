"use client"

import { MessageSquarePlus } from "lucide-react"
import {Card} from "./ui/card.tsx";
import {Button} from "./ui/button.tsx";

interface ChatHeaderProps {
  onStartNewChat: () => void
  disabled: boolean
}

export function ChatHeader({ onStartNewChat, disabled }: ChatHeaderProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">AI Assistant</h1>
          <p className="text-sm text-muted-foreground">Ask me anything and I'll help you out</p>
        </div>

        <div className="flex items-center gap-2">

          <Button
            onClick={onStartNewChat}
            disabled={disabled}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
          >
            <MessageSquarePlus className="w-4 h-4" />
            New Chat
          </Button>
        </div>
      </div>
    </Card>
  )
}

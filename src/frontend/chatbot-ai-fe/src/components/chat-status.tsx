import { Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react"
import {Card} from "./ui/card.tsx";
import {cn} from "../service/utils.ts";

export type ChatStatus = "idle" | "sending" | "polling" | "success" | "error"

interface ChatStatusProps {
  status: ChatStatus
  message?: string
  className?: string
}

export function ChatStatus({ status, message, className }: ChatStatusProps) {
  if (status === "idle") return null

  const getStatusConfig = (status: ChatStatus) => {
    switch (status) {
      case "sending":
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: message || "Sending message...",
          color: "text-blue-600",
        }
      case "polling":
        return {
          icon: <Clock className="w-4 h-4 animate-pulse" />,
          text: message || "Waiting for response...",
          color: "text-amber-600",
        }
      case "success":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: message || "Message sent successfully",
          color: "text-green-600",
        }
      case "error":
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: message || "An error occurred",
          color: "text-red-600",
        }
      default:
        return null
    }
  }

  const config = getStatusConfig(status)
  if (!config) return null

  return (
    <Card className={cn("p-3 border-l-4", className)}>
      <div className="flex items-center gap-2">
        <div className={config.color}>{config.icon}</div>
        <span className={cn("text-sm", config.color)}>{config.text}</span>
      </div>
    </Card>
  )
}

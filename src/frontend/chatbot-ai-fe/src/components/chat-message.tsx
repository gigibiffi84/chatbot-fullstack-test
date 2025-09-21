import {Loader2, User, Bot, Paperclip, Search, MoreVertical} from "lucide-react"
import {cn} from "../service/utils.ts";
import type {ChatMessage} from "../hooks/use-chat.ts";
import {Card} from "./ui/card.tsx";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger,
    ContextMenuTrigger
} from "./ui/context-menu.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "./ui/dropdown-menu.tsx";
import {Button} from "./ui/button.tsx";

interface ChatMessageProps {
  message: ChatMessage,
    onFactCheck?: (fileName: string, taskId: string, originalResponse: string) => void
    originalFiles?: File[]
}

export function ChatMessageComponent({ message, onFactCheck, originalFiles }: ChatMessageProps) {
    const isUser = message.type === "user"
    const canFactCheck = !isUser && message.id && originalFiles && originalFiles.length > 0 && !message.isLoading

    const handleFactCheck = (fileName: string) => {
        if (onFactCheck && message.id && message.content) {
            onFactCheck(fileName, message.id, message.content)
        }
    }

    const factCheckMenuItems = originalFiles?.map((file, index) => (
        <ContextMenuItem key={index} onClick={() => handleFactCheck(file.name)} className="cursor-pointer">
            <Paperclip className="w-4 h-4 mr-2" />
            <span className="truncate">{file.name}</span>
        </ContextMenuItem>
    ))

    const factCheckDropdownItems = originalFiles?.map((file, index) => (
        <DropdownMenuItem key={index} onClick={() => handleFactCheck(file.name)} className="cursor-pointer">
            <Paperclip className="w-4 h-4 mr-2" />
            <span className="truncate">{file.name}</span>
        </DropdownMenuItem>
    ))

    const messageContent = (
        <Card
            className={cn("max-w-[80%] p-4", isUser ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground")}
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
    )

    return (
        <div className={cn("flex gap-3 mb-4", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
            )}

            <div className="relative flex-1 max-w-[80%] group">
                {canFactCheck ? (
                    <ContextMenu>
                        <ContextMenuTrigger asChild>{messageContent}</ContextMenuTrigger>
                        <ContextMenuContent className="w-48">
                            <ContextMenuSub>
                                <ContextMenuSubTrigger>
                                    <Search className="w-4 h-4 mr-2" />
                                    Fact-check
                                </ContextMenuSubTrigger>
                                <ContextMenuSubContent className="w-48">{factCheckMenuItems}</ContextMenuSubContent>
                            </ContextMenuSub>
                        </ContextMenuContent>
                    </ContextMenu>
                ) : (
                    messageContent
                )}

                {canFactCheck && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-200 bg-background/80 hover:bg-background/90 backdrop-blur-sm"
                            >
                                <MoreVertical className="w-3 h-3" />
                                <span className="sr-only">Message options</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <Search className="w-4 h-4 mr-2" />
                                    Fact-check
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="w-48">{factCheckDropdownItems}</DropdownMenuSubContent>
                            </DropdownMenuSub>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="w-4 h-4 text-secondary-foreground" />
                </div>
            )}
        </div>
    )
}


import {useEffect, useRef} from "react"
import {ChatHeader} from "./chat-header"
import {ChatMessageComponent} from "./chat-message"
import {ChatInput} from "./chat-input"
import {ChatStatus} from "./chat-status"
import {useChat} from "../hooks/use-chat.ts";
import {useFactCheck} from "../hooks/use-factcheck.ts";
import {FactCheckDrawer} from "./fact-check-drawer.tsx";

export function ChatInterface() {
    /*isLoading, isSending,*/
    const {messages, status, sendMessage, startNewChat, canSendMessage} = useChat()
    const {
        isDrawerOpen,
        factCheckData,
        isLoading: isFactCheckLoading,
        openFactCheck,
        closeFactCheck
    } = useFactCheck()


    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
    }, [messages])

    const getOriginalFilesForBotMessage = (botMessageIndex: number) => {
        // Find the previous user message that triggered this bot response
        for (let i = botMessageIndex - 1; i >= 0; i--) {
            if (messages[i].type === "user") {
                return messages[i].files || []
            }
        }
        return []
    }

    return (
        <div className="max-w-4xl mx-auto h-screen flex flex-col">
            {/* Header */}
            <div className="p-4">
                <ChatHeader onStartNewChat={startNewChat} disabled={!canSendMessage}/>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-muted-foreground">
                                <p className="text-lg mb-2">Welcome to AI Assistant!</p>
                                <p className="text-sm">Start a conversation by typing a message below.</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((message, index) => <ChatMessageComponent
                            key={message.id}
                            message={message}
                            onFactCheck={openFactCheck}
                            originalFiles={message.type === "bot" ? getOriginalFilesForBotMessage(index) : undefined}/>)
                    )}
                    <div ref={messagesEndRef}/>
                </div>
            </div>

            {/* Status Area */}
            {status !== "idle" && (
                <div className="px-4 pb-2">
                    <ChatStatus status={status}/>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4">
                <ChatInput onSendMessage={sendMessage} disabled={!canSendMessage}/>
            </div>

            <FactCheckDrawer
                isOpen={isDrawerOpen}
                onClose={closeFactCheck}
                fileName={factCheckData?.fileName || ""}
                fileContent={factCheckData?.fileContent || ""}
                originalResponse={factCheckData?.originalResponse || ""}
                isLoading={isFactCheckLoading}
            />
        </div>
    )
}

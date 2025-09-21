import {useState, useCallback, useRef, useEffect} from "react"

import {usePolling} from "./use-polling"
import {apiService, type CreateTaskRequest, type TaskStatusResponse} from "../service/api-service"

export interface ChatMessage {
    id: string
    type: "user" | "bot"
    content: string
    files?: File[]
    timestamp: Date
    isLoading?: boolean
}

export type ChatStatus = "idle" | "sending" | "polling" | "success" | "error"

export interface UseChatReturn {
    messages: ChatMessage[]
    status: ChatStatus
    isLoading: boolean
    isSending: boolean
    sendMessage: (message: string, files?: File[]) => Promise<void>
    startNewChat: () => void
    canSendMessage: boolean
    clearMessages: () => void
}

export function useChat(): UseChatReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [status, setStatus] = useState<ChatStatus>("idle")
    const [isLoading, setIsLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const currentTaskRef = useRef<{ taskId: string; botMessageId: string } | null>(null)

    const canSendMessage = !isLoading && !isSending

    const addMessage = useCallback((message: Omit<ChatMessage, "timestamp">) => {
        setMessages((prev) => [...prev, {...message, timestamp: new Date()}])
    }, [])

    const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
        setMessages((prev) => prev.map((msg) => (msg.id === id ? {...msg, ...updates} : msg)))
    }, [])

    useEffect(() => {
        const fetchSessionMessages = async () => {
            const sessionMessages = await apiService.getAllTasks()
            sessionMessages.forEach(t => {
                const userMessageId = `user-${Date.now()}`
                addMessage({
                    id: userMessageId,
                    type: "user",
                    content: t.msg})
                if(t.msgresponse) {
                    const botMessageId = `bot-${t.id}`
                    addMessage({
                        id: botMessageId,
                        type: "bot",
                        content: t.msgresponse,
                        isLoading: false,
                    })
                }
            })
        }
        fetchSessionMessages()
    }, []);

    const {start: startPolling, stop: stopPolling} = usePolling(
        async () => {
            if (!currentTaskRef.current) return false

            try {
                const {taskId, botMessageId} = currentTaskRef.current
                const taskStatus: TaskStatusResponse = await apiService.getTaskStatus(taskId)

                if (taskStatus.done && taskStatus.msgresponse) {
                    // Task completed successfully
                    updateMessage(botMessageId, {
                        content: taskStatus.msgresponse,
                        isLoading: false,
                    })

                    setIsLoading(false)
                    setStatus("success")
                    currentTaskRef.current = null

                    // Auto-clear success status after 2 seconds
                    setTimeout(() => setStatus("idle"), 2000)

                    return false // Stop polling
                }

                return true // Continue polling
            } catch (error) {
                console.error("Polling error:", error)

                if (currentTaskRef.current) {
                    updateMessage(currentTaskRef.current.botMessageId, {
                        content: "Error retrieving response. Please try again.",
                        isLoading: false,
                    })
                }

                setIsLoading(false)
                setStatus("error")
                currentTaskRef.current = null

                // Auto-clear error status after 3 seconds
                setTimeout(() => setStatus("idle"), 3000)

                return false // Stop polling
            }
        },
        {
            interval: 2000,
            immediate: true,
            enabled: isLoading,
        },
    )

    const sendMessage = useCallback(
        async (message: string, files?: File[]) => {
            if (!canSendMessage) return

            setIsSending(true)
            setStatus("sending")

            // Add user message to chat
            const userMessageId = `user-${Date.now()}`
            addMessage({
                id: userMessageId,
                type: "user",
                content: message,
                files,
            })

            try {
                // Create task via API
                const uuid = crypto.randomUUID().toString()
                const taskData: CreateTaskRequest = {uuid, msg: message, files}
                await apiService.createTask(taskData)

                // Add bot message placeholder
                const botMessageId = `bot-${uuid}`
                addMessage({
                    id: botMessageId,
                    type: "bot",
                    content: "",
                    isLoading: true,
                })

                setIsSending(false)
                setIsLoading(true)
                setStatus("polling")

                // Set current task for polling
                currentTaskRef.current = {
                    taskId: uuid,
                    botMessageId,
                }

                // Start polling will be triggered by the useEffect below
            } catch (error) {
                console.error("Error sending message:", error)
                setIsSending(false)
                setStatus("error")

                // Add error message
                addMessage({
                    id: `error-${Date.now()}`,
                    type: "bot",
                    content: "Sorry, there was an error processing your message. Please try again.",
                })

                // Auto-clear error status after 3 seconds
                setTimeout(() => setStatus("idle"), 3000)
            }
        },
        [canSendMessage, addMessage],
    )

    useEffect(() => {
        if (isLoading && currentTaskRef.current) {
            startPolling()
        } else {
            stopPolling()
        }
    }, [isLoading, startPolling, stopPolling])

    const startNewChat = useCallback(() => {
        if (!canSendMessage) return

        //invoke start new chat api
        apiService.startNewChat().then(response => {
            console.log("startNewChat response:", response)
            stopPolling()
            currentTaskRef.current = null

            // Open new tab for new session
            window.open(window.location.href, "_blank")
        })

        // Stop current polling

    }, [canSendMessage, stopPolling])

    const clearMessages = useCallback(() => {
        if (!canSendMessage) return

        stopPolling()
        currentTaskRef.current = null
        setMessages([])
        setStatus("idle")
    }, [canSendMessage, stopPolling])

    useEffect(() => {
        return () => {
            stopPolling()
        }
    }, [stopPolling])

    return {
        messages,
        status,
        isLoading,
        isSending,
        sendMessage,
        startNewChat,
        canSendMessage,
        clearMessages,
    }
}

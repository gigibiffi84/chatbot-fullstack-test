"use client"

import { useState } from "react"
import { X, FileText, Loader2 } from "lucide-react"
import {ScrollArea} from "./ui/scroll-area.tsx";
import {Button} from "./ui/button.tsx";
import {cn} from "../service/utils.ts";

interface FactCheckDrawerProps {
    isOpen: boolean
    onClose: () => void
    fileName: string
    fileContent: string
    originalResponse: string
    isLoading: boolean
}

export function FactCheckDrawer({
                                    isOpen,
                                    onClose,
                                    fileName,
                                    fileContent,
                                    originalResponse,
                                    isLoading,
                                }: FactCheckDrawerProps) {
    const [activePanel, setActivePanel] = useState<"file" | "response">("file")

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed right-0 top-0 h-full w-full max-w-4xl bg-background border-l shadow-lg">
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            <h2 className="text-lg font-semibold">Fact Check</h2>
                            <span className="text-sm text-muted-foreground">- {fileName}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Panel Toggle */}
                    <div className="flex border-b">
                        <button
                            onClick={() => setActivePanel("file")}
                            className={cn(
                                "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                                activePanel === "file" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                            )}
                        >
                            Original File
                        </button>
                        <button
                            onClick={() => setActivePanel("response")}
                            className={cn(
                                "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                                activePanel === "response" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                            )}
                        >
                            AI Response
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm text-muted-foreground">Loading file content...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex">
                                {/* Desktop: Split view */}
                                <div className="hidden md:flex w-full flex-col">
                                    <div className="flex-1 border-b">
                                        <div className="p-4 border-b bg-muted/50">
                                            <h3 className="font-medium text-sm">Original File Content</h3>
                                        </div>
                                        <ScrollArea className="h-[calc(50vh-6rem)]">
                                            <div className="p-4">
                                                <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">{fileContent}</pre>
                                            </div>
                                        </ScrollArea>
                                    </div>
                                    <div className="flex-1">
                                        <div className="p-4 border-b bg-muted/50">
                                            <h3 className="font-medium text-sm">AI Response</h3>
                                        </div>
                                        <ScrollArea className="h-[calc(50vh-6rem)]">
                                            <div className="p-4">
                                                <div className="text-sm leading-relaxed whitespace-pre-wrap">{originalResponse}</div>
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>

                                {/* Mobile: Tabbed view */}
                                <div className="md:hidden w-full">
                                    <ScrollArea className="h-full">
                                        <div className="p-4">
                                            {activePanel === "file" ? (
                                                <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">{fileContent}</pre>
                                            ) : (
                                                <div className="text-sm leading-relaxed whitespace-pre-wrap">{originalResponse}</div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

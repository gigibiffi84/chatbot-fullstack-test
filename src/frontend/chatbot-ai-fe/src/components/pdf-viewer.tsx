"use client"

import { useState, useEffect } from "react"
import { Loader2, AlertCircle, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import {cn} from "../service/utils.ts";
import {Button} from "./ui/button.tsx";

interface PDFViewerProps {
    base64Content: string
    fileName: string
    className?: string
}

export function PDFViewer({ base64Content, fileName, className }: PDFViewerProps) {
    const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string>("")
    const [zoom, setZoom] = useState(100)

    useEffect(() => {
        try {
            // Convert base64 to blob URL for PDF display
            const byteCharacters = atob(base64Content)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: "application/pdf" })
            const url = URL.createObjectURL(blob)

            setPdfUrl(url)
            setIsLoading(false)
        } catch (err) {
            setError("Failed to load PDF content")
            setIsLoading(false)
        }

        // Cleanup blob URL on unmount
       // return () => {
       //     if (pdfUrl) {
       //         URL.revokeObjectURL(pdfUrl)
       //     }
        //}
    }, [base64Content])

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200))
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50))
    const handleResetZoom = () => setZoom(100)

    if (isLoading) {
        return (
            <div className={cn("flex items-center justify-center h-full", className)}>
                <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading PDF...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={cn("flex items-center justify-center h-full", className)}>
                <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                </div>
            </div>
        )
    }

    return pdfUrl && (
        <div className={cn("flex flex-col h-full", className)}>
            {/* PDF Controls */}
            <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
                <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
                    <ZoomOut className="w-3 h-3" />
                </Button>
                <span className="text-xs text-muted-foreground min-w-[3rem] text-center">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
                    <ZoomIn className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleResetZoom}>
                    <RotateCw className="w-3 h-3" />
                </Button>
                <div className="flex-1" />
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">{fileName}</span>
            </div>

            {/* PDF Embed */}
            <div className="flex-1 overflow-auto bg-gray-100">
                <div
                    className="w-full h-full"
                    style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: "top left",
                        width: `${10000 / zoom}%`,
                        height: `${10000 / zoom}%`,
                    }}
                >
                    <embed src={pdfUrl} type="application/pdf" width="100%" height="100%" className="border-0" />
                </div>
            </div>
        </div>
    )
}

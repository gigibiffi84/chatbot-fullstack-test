"use client"

import { useState, useCallback } from "react"
import {apiService} from "../service/api-service.ts";

export interface FactCheckData {
    fileName: string
    fileContent: string
    originalResponse: string
}

export interface UseFactCheckReturn {
    isDrawerOpen: boolean
    factCheckData: FactCheckData | null
    isLoading: boolean
    openFactCheck: (fileName: string, taskId: string, originalResponse: string) => Promise<void>
    closeFactCheck: () => void
}

export function useFactCheck(): UseFactCheckReturn {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [factCheckData, setFactCheckData] = useState<FactCheckData | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const openFactCheck = useCallback(async (fileName: string, taskId: string, originalResponse: string) => {
        setIsLoading(true)
        setIsDrawerOpen(true)
        setFactCheckData({
            fileName,
            fileContent: "",
            originalResponse,
        })

        try {
            const fileContent = await apiService.getFileContent(taskId, fileName)

            setFactCheckData({
                fileName,
                fileContent,
                originalResponse,
            })
        } catch (error) {
            console.error("Error fetching file content:", error)
            setFactCheckData({
                fileName,
                fileContent: "Error loading file content. Please try again.",
                originalResponse,
            })
        } finally {
            setIsLoading(false)
        }
    }, [])

    const closeFactCheck = useCallback(() => {
        setIsDrawerOpen(false)
        setFactCheckData(null)
        setIsLoading(false)
    }, [])

    return {
        isDrawerOpen,
        factCheckData,
        isLoading,
        openFactCheck,
        closeFactCheck,
    }
}

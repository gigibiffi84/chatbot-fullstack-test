"use client"

import { useState, useCallback } from "react"

export interface UseFileUploadReturn {
  files: File[]
  addFiles: (newFiles: FileList | File[]) => void
  removeFile: (index: number) => void
  clearFiles: () => void
  hasFiles: boolean
}

export function useFileUpload(): UseFileUploadReturn {
  const [files, setFiles] = useState<File[]>([])

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    setFiles((prev) => [...prev, ...fileArray])
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearFiles = useCallback(() => {
    setFiles([])
  }, [])

  const hasFiles = files.length > 0

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
    hasFiles,
  }
}

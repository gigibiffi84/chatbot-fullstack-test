"use client"

import type React from "react"

import { useCallback } from "react"
import { Upload, ImageIcon } from "lucide-react"
import {Card} from "./ui/card.tsx";
import {cn} from "../service/utils.ts";

interface FileUploadZoneProps {
  onFilesSelected: (files: FileList) => void
  disabled?: boolean
  className?: string
}

export function FileUploadZone({ onFilesSelected, disabled, className }: FileUploadZoneProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()

      if (disabled) return

      const files = e.dataTransfer.files
      if (files.length > 0) {
        onFilesSelected(files)
      }
    },
    [onFilesSelected, disabled],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <Card
      className={cn(
        "border-2 border-dashed border-muted-foreground/25 p-6 text-center transition-colors",
        "hover:border-muted-foreground/50 hover:bg-muted/25",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col items-center gap-2">
        <Upload className="w-8 h-8 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Drop files here</p>
          <p className="text-xs text-muted-foreground">or click the attachment button to browse</p>
        </div>
        <ImageIcon className="w-8 h-8 text-muted-foreground" />
      </div>
    </Card>
  )
}

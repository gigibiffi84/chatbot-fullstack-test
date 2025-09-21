"use client"

import { X, FileText, ImageIcon, File } from "lucide-react"
import {Card} from "./ui/card.tsx";
import {cn} from "../service/utils.ts";
import {Button} from "./ui/button.tsx";

interface FilePreviewProps {
  file: File
  onRemove: () => void
  showRemove?: boolean
  className?: string
}

export function FilePreview({ file, onRemove, showRemove = true, className }: FilePreviewProps) {
  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="w-4 h-4" />
    } else if (file.type.includes("text/") || file.type.includes("document")) {
      return <FileText className="w-4 h-4" />
    } else {
      return <File className="w-4 h-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Card className={cn("p-3", className)}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 text-muted-foreground">{getFileIcon(file)}</div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
        </div>

        {showRemove && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
            onClick={onRemove}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </Card>
  )
}

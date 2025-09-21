"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Send, Paperclip } from "lucide-react"
import { FilePreview } from "./file-preview"
import { FileUploadZone } from "./file-upload-zone"
import {useFileUpload} from "../hooks/use-file-upload.ts";
import {Card} from "./ui/card.tsx";
import {Button} from "./ui/button.tsx";
import {Textarea} from "./ui/textarea.tsx";

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void
  disabled: boolean
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [showUploadZone, setShowUploadZone] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { files, addFiles, removeFile, clearFiles, hasFiles } = useFileUpload()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || disabled) return

    onSendMessage(message.trim(), files.length > 0 ? files : undefined)
    setMessage("")
    clearFiles()
    setShowUploadZone(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files)
      setShowUploadZone(false)
    }
  }

  const handleFilesFromZone = (fileList: FileList) => {
    addFiles(fileList)
    setShowUploadZone(false)
  }

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {hasFiles && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Attached Files ({files.length})</span>
              <Button type="button" variant="ghost" size="sm" onClick={clearFiles} className="text-xs h-6">
                Clear All
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {files.map((file, index) => (
                <FilePreview key={index} file={file} onRemove={() => removeFile(index)} />
              ))}
            </div>
          </div>
        )}

        {showUploadZone && <FileUploadZone onFilesSelected={handleFilesFromZone} disabled={disabled} />}

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={disabled}
              className="min-h-[60px] resize-none pr-12"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-8 w-8 p-0"
              onClick={() => {
                if (showUploadZone) {
                  setShowUploadZone(false)
                } else {
                  fileInputRef.current?.click()
                }
              }}
              disabled={disabled}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-1">
            <Button type="submit" disabled={disabled || !message.trim()} className="h-[60px] px-6">
              <Send className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUploadZone(!showUploadZone)}
              disabled={disabled}
              className="text-xs px-2 py-1 h-6"
            >
              {showUploadZone ? "Hide" : "Drop"}
            </Button>
          </div>
        </div>

        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} accept="*/*" />
      </form>
    </Card>
  )
}

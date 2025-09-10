import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { KeyRound, Copy, X, ArrowUpRight, Check } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface TokenDialogProps {
  children: React.ReactNode
}

export function TokenDialog({ children }: TokenDialogProps) {
  const [open, setOpen] = useState(false)
  const [generatedToken, setGeneratedToken] = useState('')
  const [copied, setCopied] = useState(false)

  const generateToken = () => {
    const token = uuidv4()
    setGeneratedToken(token)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Hide tooltip after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  useEffect(() => {
    if (open) {
      generateToken()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0">
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200/20">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-sm font-normal text-slate-800 leading-5">
                Save your Key
              </DialogTitle>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded hover:bg-slate-100/50 transition-colors"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Warning message */}
            <div className="text-[13px] text-slate-600 font-normal w-full">
              Please save this api key in a safe place. You will not be able to view it again after leaving this page. If you do lose it, you will need to generate a new one.
            </div>

            {/* Token input field */}
            <div className="space-y-2">
              <div className="bg-white border border-slate-200 rounded-md h-10 pl-2 pr-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <KeyRound className="h-4 w-4 text-slate-500 shrink-0" />
                  <span className="text-sm font-normal text-slate-800 leading-5 tracking-wide truncate">
                    {generatedToken}
                  </span>
                </div>
                <TooltipProvider>
                  <Tooltip open={copied}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={copyToClipboard}
                        className="bg-blue-50 px-2 py-1.5 rounded flex items-center gap-2 hover:bg-blue-100 transition-colors"
                      >
                        <Copy className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-450 text-blue-600 leading-4">
                          Copy
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className='flex items-center gap-1 px-1.5'>
                        <Check className="h-4 w-4 text-green-600" />
                      <span className='text-[13px]'>Copied</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Permissions section */}
            <div className="space-y-1.5">
              <div className="text-[13px] font-450 text-slate-600 leading-4">
                Available Permission
              </div>
              <div className="text-[13px] text-slate-600 leading-5 font-normal">
                Read and write API Resources
              </div>
              <div className="flex items-center gap-0.5">
                <a
                  href="https://docs.dynamo.ai/api/"
                  className="text-[12px] font-normal text-slate-500 underline underline-offset-2 hover:text-slate-600 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read API Docs
                </a>
                <ArrowUpRight className="h-4 w-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

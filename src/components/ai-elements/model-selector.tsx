'use client'

import { Bot, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface ModelOption {
    id: string
    displayName: string
    provider: string
    capabilities?: string[]
}

export interface ModelSelectorProps {
    models: ModelOption[]
    selectedModelId: string
    onModelChange: (modelId: string) => void
    disabled?: boolean
    className?: string
}

const providerColors: Record<string, string> = {
    openai: 'text-green-600 dark:text-green-400',
    anthropic: 'text-orange-600 dark:text-orange-400',
    google: 'text-blue-600 dark:text-blue-400',
    xai: 'text-purple-600 dark:text-purple-400',
}

export function ModelSelector({
    models,
    selectedModelId,
    onModelChange,
    disabled = false,
    className,
}: ModelSelectorProps) {
    const [open, setOpen] = useState(false)

    const selectedModel = models.find(m => m.id === selectedModelId)
    const displayName = selectedModel?.displayName ?? 'Select Model'

    // Group models by provider
    const grouped = models.reduce<Record<string, ModelOption[]>>((acc, model) => {
        const key = model.provider
        if (!acc[key]) acc[key] = []
        acc[key].push(model)
        return acc
    }, {})

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    className={cn('gap-2 text-xs', className)}
                >
                    <Bot className="h-3.5 w-3.5" />
                    <span className="max-w-[120px] truncate">{displayName}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                {Object.entries(grouped).map(([provider, providerModels], idx) => (
                    <div key={provider}>
                        {idx > 0 && <DropdownMenuSeparator />}
                        <DropdownMenuLabel
                            className={cn('text-xs uppercase', providerColors[provider])}
                        >
                            {provider}
                        </DropdownMenuLabel>
                        {providerModels.map(model => (
                            <DropdownMenuItem
                                key={model.id}
                                onSelect={() => {
                                    onModelChange(model.id)
                                    setOpen(false)
                                }}
                                className={cn(
                                    'cursor-pointer',
                                    model.id === selectedModelId && 'bg-accent'
                                )}
                            >
                                <span className="text-sm">{model.displayName}</span>
                            </DropdownMenuItem>
                        ))}
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

export interface NotaInputProps {
    value: number | null
    onSave: (value: number | null) => void
    isPending?: boolean
    isSuccess?: boolean
    disabled?: boolean
    className?: string
    placeholder?: string
}

export function NotaInput({
    value,
    onSave,
    isPending = false,
    isSuccess = false,
    disabled = false,
    className,
    placeholder = '-'
}: NotaInputProps) {
    const [localValue, setLocalValue] = useState(value?.toString() ?? '')
    const [showSuccess, setShowSuccess] = useState(false)
    const lastSavedRef = useRef(value)

    useEffect(() => {
        if (value !== lastSavedRef.current) {
            setLocalValue(value?.toString() ?? '')
            lastSavedRef.current = value
        }
    }, [value])

    useEffect(() => {
        if (isSuccess) {
            setShowSuccess(true)
            const timer = setTimeout(() => setShowSuccess(false), 2000)
            return () => clearTimeout(timer)
        }
    }, [isSuccess])

    const handleBlur = useCallback(() => {
        const numValue = localValue === '' ? null : parseFloat(localValue)

        if (numValue !== null && (isNaN(numValue) || numValue < 0 || numValue > 10)) {
            setLocalValue(value?.toString() ?? '')
            return
        }

        if (numValue !== value) {
            lastSavedRef.current = numValue
            onSave(numValue)
        }
    }, [localValue, value, onSave])

    return (
        <div className="flex items-center gap-1.5">
            <Input
                type="number"
                inputMode="decimal"
                min={0}
                max={10}
                step={0.1}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                disabled={disabled || isPending}
                className={cn('text-center', className)}
                placeholder={placeholder}
            />
            {isPending && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0" />
            )}
            {showSuccess && !isPending && (
                <Check className="h-4 w-4 text-vt-green flex-shrink-0" />
            )}
        </div>
    )
}

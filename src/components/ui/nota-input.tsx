'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
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
    /** Ref (not state) so mutating it won't re-trigger effects or cause re-renders */
    const didSaveRef = useRef(false)
    const lastSavedRef = useRef(value)

    useEffect(() => {
        if (value !== lastSavedRef.current) {
            setLocalValue(value?.toString() ?? '')
            lastSavedRef.current = value
        }
    }, [value])

    // Show success only when isSuccess fires AND this specific input triggered the save
    useEffect(() => {
        if (isSuccess && didSaveRef.current) {
            didSaveRef.current = false
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
            didSaveRef.current = true
            onSave(numValue)
        }
    }, [localValue, value, onSave])

    return (
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
            className={cn(
                'text-center transition-all duration-500',
                isPending && didSaveRef.current && 'ring-1 ring-vt-blue/40 border-vt-blue/40',
                showSuccess && !isPending && 'ring-2 ring-vt-green/50 border-vt-green/50 bg-vt-green/5',
                className
            )}
            placeholder={placeholder}
        />
    )
}


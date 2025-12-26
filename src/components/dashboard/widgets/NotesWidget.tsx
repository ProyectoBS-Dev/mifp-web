'use client'

import { useState } from 'react'
import { Plus, X, Loader2, StickyNote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApuntes, useCreateApunte, useDeleteApunte } from '@/hooks'
import { coloresDisponibles } from '@/types/apuntes'

// Mapeo de colores hex a clases de Tailwind
function getColorClasses(hexColor: string) {
  const colorMap: Record<string, string> = {
    '#FBBF24': 'bg-yellow-400/20 border-yellow-400/30',
    '#3B82F6': 'bg-blue-500/20 border-blue-500/30',
    '#22C55E': 'bg-green-500/20 border-green-500/30',
    '#A855F7': 'bg-purple-500/20 border-purple-500/30',
    '#EF4444': 'bg-red-500/20 border-red-500/30',
    '#F97316': 'bg-orange-500/20 border-orange-500/30',
  }
  return colorMap[hexColor] || 'bg-muted/50 border-border'
}

export function NotesWidget() {
  const { data: notes, isLoading } = useApuntes()
  const createApunte = useCreateApunte()
  const deleteApunte = useDeleteApunte()

  const [isAdding, setIsAdding] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [selectedColor, setSelectedColor] = useState(coloresDisponibles[0].hex)

  const addNote = async () => {
    if (newNote.trim()) {
      await createApunte.mutateAsync({
        contenido: newNote.trim(),
        color: selectedColor,
      })
      setNewNote('')
      setIsAdding(false)
      setSelectedColor(coloresDisponibles[0].hex)
    }
  }

  const removeNote = (id: string) => {
    deleteApunte.mutate(id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1">
        {(!notes || notes.length === 0) && !isAdding && (
          <div className="flex flex-col items-center justify-center h-full text-center py-4">
            <StickyNote className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No tienes apuntes
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Añade tu primera nota
            </p>
          </div>
        )}

        {notes?.map((note) => (
          <div
            key={note.id}
            className={cn(
              'p-2 rounded-lg border text-sm relative group',
              getColorClasses(note.color)
            )}
          >
            {note.titulo && (
              <p className="font-medium text-xs mb-1">{note.titulo}</p>
            )}
            <p className="pr-6 text-sm">{note.contenido}</p>
            <button
              onClick={() => removeNote(note.id)}
              disabled={deleteApunte.isPending}
              className="absolute top-1 right-1 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-opacity disabled:opacity-50"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {isAdding && (
          <div className="space-y-2">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Escribe tu nota..."
              className="w-full p-2 text-sm rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={2}
              autoFocus
            />
            
            {/* Selector de color */}
            <div className="flex gap-1">
              {coloresDisponibles.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setSelectedColor(color.hex)}
                  className={cn(
                    'w-5 h-5 rounded-full transition-transform',
                    selectedColor === color.hex && 'ring-2 ring-offset-1 ring-primary scale-110'
                  )}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={addNote}
                disabled={createApunte.isPending || !newNote.trim()}
                className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {createApunte.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  'Guardar'
                )}
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewNote('')
                }}
                className="px-3 py-1 text-xs font-medium bg-muted rounded-md hover:bg-muted/80"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-2 flex items-center justify-center gap-1 w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Añadir nota
        </button>
      )}
    </div>
  )
}

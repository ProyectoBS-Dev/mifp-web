'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Note {
  id: string
  content: string
  color: string
}

const NOTE_COLORS = [
  'bg-vt-yellow/20 border-vt-yellow/30',
  'bg-vt-green/20 border-vt-green/30',
  'bg-vt-blue/20 border-vt-blue/30',
  'bg-vt-purple/20 border-vt-purple/30',
]

export function NotesWidget() {
  // TODO: Conectar con datos reales de Supabase (apuntes tabla)
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      content: 'Repasar tema 3 de BBDD antes del examen',
      color: NOTE_COLORS[0],
    },
    {
      id: '2',
      content: 'Preguntar dudas sobre herencia en la próxima VT',
      color: NOTE_COLORS[1],
    },
  ])

  const [isAdding, setIsAdding] = useState(false)
  const [newNote, setNewNote] = useState('')

  const addNote = () => {
    if (newNote.trim()) {
      const randomColor = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)]
      setNotes([
        ...notes,
        {
          id: Date.now().toString(),
          content: newNote.trim(),
          color: randomColor,
        },
      ])
      setNewNote('')
      setIsAdding(false)
    }
  }

  const removeNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id))
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 space-y-2 overflow-auto">
        {notes.map((note) => (
          <div
            key={note.id}
            className={cn(
              'p-2 rounded-lg border text-sm relative group',
              note.color
            )}
          >
            <p className="pr-6">{note.content}</p>
            <button
              onClick={() => removeNote(note.id)}
              className="absolute top-1 right-1 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-opacity"
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
            <div className="flex gap-2">
              <button
                onClick={addNote}
                className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Guardar
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

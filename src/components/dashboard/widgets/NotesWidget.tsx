'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, X, Loader2, StickyNote, Search, Pencil, Trash2, Pin, Copy, Check, Archive, ArchiveRestore, LayoutList, LayoutGrid, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTimeAgo } from '@/lib/format'
import { useApuntes, useCreateApunte, useDeleteApunte, useUpdateApunte } from '@/hooks'
import { coloresDisponibles, type Apunte } from '@/types/apuntes'
import { MiniRichTextEditor, htmlToPlainText, htmlToMarkdown } from './MiniRichTextEditor'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Mapeo de colores hex a clases de Tailwind
function getColorClasses(hexColor: string) {
  const colorMap: Record<string, string> = {
    '#FBBF24': 'bg-vt-yellow/20 border-vt-yellow/30',
    '#3B82F6': 'bg-vt-blue/20 border-vt-blue/30',
    '#22C55E': 'bg-vt-green/20 border-vt-green/30',
    '#A855F7': 'bg-vt-purple/20 border-vt-purple/30',
    '#EF4444': 'bg-vt-red/20 border-vt-red/30',
    '#F97316': 'bg-orange-500/20 border-orange-500/30',
  }
  return colorMap[hexColor] || 'bg-muted/50 border-border'
}

// Constante para localStorage
const COMPACT_MODE_KEY = 'notes-widget-compact-mode'
const SHOW_ARCHIVED_KEY = 'notes-widget-show-archived'

export function NotesWidget() {
  const [showArchived, setShowArchived] = useState(false)
  const { data: notes, isLoading } = useApuntes(showArchived)
  const createApunte = useCreateApunte()
  const updateApunte = useUpdateApunte()
  const deleteApunte = useDeleteApunte()

  // Estados para crear nota
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [selectedColor, setSelectedColor] = useState(coloresDisponibles[0].hex)

  // Estados para búsqueda
  const [searchTerm, setSearchTerm] = useState('')

  // Estados para modal
  const [selectedNote, setSelectedNote] = useState<Apunte | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editColor, setEditColor] = useState('')

  // Estado para feedback de copia
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null)

  // Estado para modo compacto
  const [isCompactMode, setIsCompactMode] = useState(false)

  // Cargar preferencias desde localStorage
  useEffect(() => {
    const savedCompactMode = localStorage.getItem(COMPACT_MODE_KEY)
    if (savedCompactMode !== null) {
      setIsCompactMode(savedCompactMode === 'true')
    }
    const savedShowArchived = localStorage.getItem(SHOW_ARCHIVED_KEY)
    if (savedShowArchived !== null) {
      setShowArchived(savedShowArchived === 'true')
    }
  }, [])

  // Guardar preferencias en localStorage
  const toggleCompactMode = () => {
    const newValue = !isCompactMode
    setIsCompactMode(newValue)
    localStorage.setItem(COMPACT_MODE_KEY, String(newValue))
  }

  const toggleShowArchived = () => {
    const newValue = !showArchived
    setShowArchived(newValue)
    localStorage.setItem(SHOW_ARCHIVED_KEY, String(newValue))
  }

  // Separar notas activas y archivadas
  const { activeNotes, archivedNotes } = useMemo(() => {
    if (!notes) return { activeNotes: [], archivedNotes: [] }
    const active = notes.filter(n => !n.archived)
    const archived = notes.filter(n => n.archived)
    return { activeNotes: active, archivedNotes: archived }
  }, [notes])

  // Filtrar notas por búsqueda
  const filteredNotes = useMemo(() => {
    const notesToFilter = showArchived ? [...activeNotes, ...archivedNotes] : activeNotes
    if (!searchTerm.trim()) return notesToFilter
    const term = searchTerm.toLowerCase()
    return notesToFilter.filter(note => {
      const titleMatch = note.titulo?.toLowerCase().includes(term)
      const contentMatch = htmlToPlainText(note.contenido).toLowerCase().includes(term)
      return titleMatch || contentMatch
    })
  }, [activeNotes, archivedNotes, showArchived, searchTerm])

  const addNote = async () => {
    if (newContent.trim() || newTitle.trim()) {
      await createApunte.mutateAsync({
        titulo: newTitle.trim() || undefined,
        contenido: newContent.trim(),
        color: selectedColor,
      })
      setNewTitle('')
      setNewContent('')
      setIsAdding(false)
      setSelectedColor(coloresDisponibles[0].hex)
    }
  }

  const openNoteModal = (note: Apunte) => {
    setSelectedNote(note)
    setEditTitle(note.titulo || '')
    setEditContent(note.contenido)
    setEditColor(note.color)
    setIsEditing(false)
  }

  const closeNoteModal = () => {
    setSelectedNote(null)
    setIsEditing(false)
  }

  const saveEdit = async () => {
    if (!selectedNote) return
    await updateApunte.mutateAsync({
      id: selectedNote.id,
      titulo: editTitle.trim() || undefined,
      contenido: editContent,
      color: editColor,
    })
    closeNoteModal()
  }

  const removeNote = async (id: string) => {
    await deleteApunte.mutateAsync(id)
    closeNoteModal()
  }

  const togglePin = async (note: Apunte, e?: React.MouseEvent) => {
    e?.stopPropagation()
    await updateApunte.mutateAsync({
      id: note.id,
      pinned: !note.pinned,
    })
  }

  const toggleArchive = async (note: Apunte, e?: React.MouseEvent) => {
    e?.stopPropagation()
    await updateApunte.mutateAsync({
      id: note.id,
      archived: !note.archived,
    })
    if (selectedNote?.id === note.id) {
      closeNoteModal()
    }
  }

  const copyToClipboard = async (note: Apunte, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const plainText = note.titulo
      ? `${note.titulo}\n\n${htmlToPlainText(note.contenido)}`
      : htmlToPlainText(note.contenido)

    await navigator.clipboard.writeText(plainText)
    setCopiedNoteId(note.id)
    setTimeout(() => setCopiedNoteId(null), 2000)
  }

  const exportToMarkdown = (note: Apunte) => {
    const markdown = `# ${note.titulo || 'Sin título'}\n\n${htmlToMarkdown(note.contenido)}\n\n---\n*Exportado desde MiFP - ${new Date().toLocaleDateString('es-ES')}*`

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${note.titulo || 'nota'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-full flex flex-col">
        {/* Header con controles */}
        {(notes && notes.length > 0) && !isAdding && (
          <div className="flex items-center gap-2 mb-2">
            {/* Barra de búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Botones de control */}
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleCompactMode}
                    className={cn(
                      'p-1.5 rounded hover:bg-muted transition-colors',
                      isCompactMode && 'bg-muted text-primary'
                    )}
                  >
                    {isCompactMode ? <LayoutGrid className="h-3.5 w-3.5" /> : <LayoutList className="h-3.5 w-3.5" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{isCompactMode ? 'Vista normal' : 'Vista compacta'}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleShowArchived}
                    className={cn(
                      'p-1.5 rounded hover:bg-muted transition-colors',
                      showArchived && 'bg-muted text-primary'
                    )}
                  >
                    <Archive className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{showArchived ? 'Ocultar archivadas' : 'Ver archivadas'} {archivedNotes.length > 0 && `(${archivedNotes.length})`}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}

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

          {/* Mensaje cuando no hay resultados de búsqueda */}
          {notes && notes.length > 0 && filteredNotes.length === 0 && !isAdding && (
            <div className="flex flex-col items-center justify-center h-full text-center py-4">
              <Search className="h-6 w-6 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                Sin resultados para &ldquo;{searchTerm}&rdquo;
              </p>
            </div>
          )}

          {/* Lista de notas */}
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => openNoteModal(note)}
              className={cn(
                'p-2 rounded-lg border text-sm relative group cursor-pointer hover:shadow-sm transition-shadow',
                getColorClasses(note.color),
                note.pinned && 'ring-1 ring-primary/50',
                note.archived && 'opacity-60'
              )}
            >
              {/* Header con título y controles */}
              <div className="flex items-start justify-between gap-1 mb-1">
                <div className="flex-1 min-w-0">
                  {note.titulo && (
                    <p className="font-medium text-xs truncate flex items-center gap-1">
                      {note.pinned && <Pin className="h-3 w-3 text-primary flex-shrink-0" />}
                      {note.archived && <Archive className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                      {note.titulo}
                    </p>
                  )}
                  {!note.titulo && (note.pinned || note.archived) && (
                    <div className="flex items-center gap-1">
                      {note.pinned && <Pin className="h-3 w-3 text-primary" />}
                      {note.archived && <Archive className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!note.archived && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => togglePin(note, e)}
                          className="p-1 rounded hover:bg-black/10"
                        >
                          <Pin className={cn('h-3 w-3', note.pinned && 'text-primary fill-primary')} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{note.pinned ? 'Desfijar' : 'Fijar arriba'}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => toggleArchive(note, e)}
                        className="p-1 rounded hover:bg-black/10"
                      >
                        {note.archived ? (
                          <ArchiveRestore className="h-3 w-3" />
                        ) : (
                          <Archive className="h-3 w-3" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{note.archived ? 'Desarchivar' : 'Archivar'}</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => copyToClipboard(note, e)}
                        className="p-1 rounded hover:bg-black/10"
                      >
                        {copiedNoteId === note.id ? (
                          <Check className="h-3 w-3 text-vt-green" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{copiedNoteId === note.id ? '¡Copiado!' : 'Copiar'}</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeNote(note.id)
                        }}
                        disabled={deleteApunte.isPending}
                        className="p-1 rounded hover:bg-black/10 disabled:opacity-50"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Eliminar</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Contenido (oculto en modo compacto) */}
              {!isCompactMode && (
                <div
                  className="text-sm line-clamp-3 prose prose-sm dark:prose-invert max-w-none prose-p:my-0.5 prose-ul:my-0.5 prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-primary prose-code:font-mono prose-code:text-xs prose-code:before:content-none prose-code:after:content-none"
                  dangerouslySetInnerHTML={{ __html: note.contenido }}
                />
              )}

              {/* Fecha de modificación */}
              <p className={cn(
                "text-[10px] text-muted-foreground opacity-60",
                isCompactMode ? 'mt-0.5' : 'mt-1.5'
              )}>
                {formatTimeAgo(note.updated_at)}
              </p>
            </div>
          ))}

          {/* Formulario de nueva nota */}
          {isAdding && (
            <div className="space-y-2">
              {/* Campo de título */}
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Título (opcional)"
                className="w-full px-2 py-1.5 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />

              {/* Editor de contenido enriquecido */}
              <MiniRichTextEditor
                value={newContent}
                onChange={setNewContent}
                placeholder="Escribe tu nota..."
                minHeight="60px"
              />

              {/* Selector de color */}
              <div className="flex gap-1 pl-1.5">
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
                  disabled={createApunte.isPending || (!newContent.trim() && !newTitle.trim())}
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
                    setNewTitle('')
                    setNewContent('')
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

        {/* Modal de visualización/edición */}
        <Dialog open={!!selectedNote} onOpenChange={(open) => !open && closeNoteModal()}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isEditing ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Título (opcional)"
                    className="text-lg font-semibold"
                  />
                ) : (
                  <span className="flex items-center gap-2">
                    {selectedNote?.pinned && <Pin className="h-4 w-4 text-primary" />}
                    {selectedNote?.archived && <Archive className="h-4 w-4 text-muted-foreground" />}
                    {selectedNote?.titulo || 'Sin título'}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="py-2">
              {isEditing ? (
                <div className="space-y-3">
                  <MiniRichTextEditor
                    value={editContent}
                    onChange={setEditContent}
                    placeholder="Contenido de la nota..."
                    minHeight="120px"
                  />

                  {/* Selector de color en edición */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Color:</span>
                    <div className="flex gap-1 pl-0.5">
                      {coloresDisponibles.map((color) => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => setEditColor(color.hex)}
                          className={cn(
                            'w-5 h-5 rounded-full transition-transform',
                            editColor === color.hex && 'ring-2 ring-offset-1 ring-primary scale-110'
                          )}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    'p-3 rounded-lg border prose prose-sm dark:prose-invert max-w-none prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-primary prose-code:font-mono prose-code:text-xs prose-code:before:content-none prose-code:after:content-none',
                    getColorClasses(selectedNote?.color || '#FBBF24')
                  )}
                  dangerouslySetInnerHTML={{ __html: selectedNote?.contenido || '' }}
                />
              )}

              {/* Fecha en modal */}
              {!isEditing && selectedNote && (
                <p className="text-xs text-muted-foreground mt-2">
                  Última modificación: {formatTimeAgo(selectedNote.updated_at)}
                </p>
              )}
            </div>

            <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => selectedNote && removeNote(selectedNote.id)}
                  disabled={deleteApunte.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>

                {!isEditing && selectedNote && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleArchive(selectedNote)}
                        >
                          {selectedNote.archived ? (
                            <ArchiveRestore className="h-4 w-4" />
                          ) : (
                            <Archive className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{selectedNote.archived ? 'Desarchivar' : 'Archivar'}</p>
                      </TooltipContent>
                    </Tooltip>

                    {!selectedNote.archived && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePin(selectedNote)}
                          >
                            <Pin className={cn('h-4 w-4', selectedNote.pinned && 'text-primary fill-primary')} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{selectedNote.pinned ? 'Desfijar' : 'Fijar arriba'}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(selectedNote)}
                        >
                          {copiedNoteId === selectedNote.id ? (
                            <Check className="h-4 w-4 text-vt-green" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copiedNoteId === selectedNote.id ? '¡Copiado!' : 'Copiar'}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportToMarkdown(selectedNote)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Exportar Markdown</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveEdit}
                      disabled={updateApunte.isPending}
                    >
                      {updateApunte.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Guardar'
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Estilos para TaskList en contenido renderizado */}
        <style jsx global>{`
          .prose ul[data-type="taskList"] {
            list-style: none;
            padding-left: 0;
            margin: 0.25rem 0;
          }
          .prose ul[data-type="taskList"] li {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            margin: 0.25rem 0;
          }
          .prose ul[data-type="taskList"] li > label {
            flex-shrink: 0;
            margin-top: 0.125rem;
          }
          .prose ul[data-type="taskList"] li > label input[type="checkbox"] {
            width: 1rem;
            height: 1rem;
            cursor: pointer;
            accent-color: hsl(var(--primary));
          }
          .prose ul[data-type="taskList"] li > div {
            flex: 1;
          }
          .prose ul[data-type="taskList"] li[data-checked="true"] > div {
            text-decoration: line-through;
            opacity: 0.6;
          }
        `}</style>
      </div>
    </TooltipProvider>
  )
}

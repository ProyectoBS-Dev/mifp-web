'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Bold, Code, List, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

interface MiniRichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

// Botón de toolbar compacto
function ToolbarButton({
  onClick,
  isActive,
  title,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded hover:bg-muted transition-colors',
        isActive && 'bg-muted text-primary'
      )}
    >
      {children}
    </button>
  )
}

export function MiniRichTextEditor({
  value,
  onChange,
  placeholder = 'Escribe tu nota...',
  className,
  minHeight = '80px',
}: MiniRichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Solo habilitamos lo necesario
        heading: false,
        blockquote: false,
        horizontalRule: false,
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none px-3 py-2 text-muted-foreground',
          'prose-p:my-1 prose-ul:my-1 prose-li:my-0'
        ),
        style: `min-height: ${minHeight}`,
      },
    },
  })

  // Sincronizar contenido cuando cambia externamente
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  if (!editor) {
    return null
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden bg-background', className)}>
      {/* Mini Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b bg-muted/30">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Negrita (Ctrl+B)"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Código"
        >
          <Code className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Lista"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          title="Checklist"
        >
          <CheckSquare className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Estilos para TaskList */}
      <style jsx global>{`
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
          margin: 0.25rem 0;
        }
        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin: 0.25rem 0;
        }
        .ProseMirror ul[data-type="taskList"] li > label {
          flex-shrink: 0;
          margin-top: 0.125rem;
        }
        .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"] {
          width: 1rem;
          height: 1rem;
          cursor: pointer;
          accent-color: hsl(var(--primary));
        }
        .ProseMirror ul[data-type="taskList"] li > div {
          flex: 1;
        }
        .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div {
          text-decoration: line-through;
          opacity: 0.6;
        }
      `}</style>
    </div>
  )
}

// Utilidad para extraer texto plano del HTML
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Utilidad para convertir HTML a Markdown
export function htmlToMarkdown(html: string): string {
  return html
    // Checklists
    .replace(/<li data-checked="true"[^>]*><label[^>]*><input[^>]*><\/label><div>([^<]*)<\/div><\/li>/gi, '- [x] $1\n')
    .replace(/<li data-checked="false"[^>]*><label[^>]*><input[^>]*><\/label><div>([^<]*)<\/div><\/li>/gi, '- [ ] $1\n')
    // Listas
    .replace(/<li><p>([^<]*)<\/p><\/li>/gi, '- $1\n')
    .replace(/<li>([^<]*)<\/li>/gi, '- $1\n')
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '')
    // Formato
    .replace(/<strong>([^<]*)<\/strong>/gi, '**$1**')
    .replace(/<b>([^<]*)<\/b>/gi, '**$1**')
    .replace(/<em>([^<]*)<\/em>/gi, '*$1*')
    .replace(/<i>([^<]*)<\/i>/gi, '*$1*')
    .replace(/<code>([^<]*)<\/code>/gi, '`$1`')
    // Párrafos
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    // Limpiar resto de tags
    .replace(/<[^>]*>/g, '')
    // Limpiar espacios extra
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

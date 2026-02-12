import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/uiKit';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({ value, onChange, placeholder = 'Введите Markdown текст...', className }: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');

  return (
    <div className={className}>
      <div className="flex gap-2 mb-4">
        <Button
          type="button"
          variant={viewMode === 'edit' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('edit')}
        >
          Редактор
        </Button>
        <Button
          type="button"
          variant={viewMode === 'preview' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('preview')}
        >
          Предпросмотр
        </Button>
        <Button
          type="button"
          variant={viewMode === 'split' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('split')}
        >
          Оба
        </Button>
      </div>

      {viewMode === 'edit' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[400px] p-4 border border-input bg-background text-foreground rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 placeholder:text-muted-foreground"
          style={{ fontFamily: 'monospace' }}
        />
      )}

      {viewMode === 'preview' && (
        <div className="min-h-[400px] p-4 border border-input bg-background rounded-md prose prose-slate dark:prose-invert max-w-none break-words prose-pre:overflow-x-auto prose-pre:max-w-full prose-table:block prose-table:overflow-x-auto">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-muted-foreground">{placeholder}</p>
          )}
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Редактор</label>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full min-h-[400px] p-4 border border-input bg-background text-foreground rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 placeholder:text-muted-foreground"
              style={{ fontFamily: 'monospace' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Предпросмотр</label>
            <div className="min-h-[400px] p-4 border border-input bg-background rounded-md prose prose-slate dark:prose-invert max-w-none break-words prose-pre:overflow-x-auto prose-pre:max-w-full prose-table:block prose-table:overflow-x-auto overflow-y-auto">
              {value ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {value}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">{placeholder}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

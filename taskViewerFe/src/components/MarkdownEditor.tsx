import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/uiKit';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Функция для вставки текста в textarea на позицию курсора или выделения
function insertText(textarea: HTMLTextAreaElement, before: string, after: string = '', placeholder: string = 'текст') {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  const textToInsert = selectedText || placeholder;
  
  const newValue = 
    textarea.value.substring(0, start) +
    before + textToInsert + after +
    textarea.value.substring(end);
  
  const newCursorPos = start + before.length + textToInsert.length + after.length;
  
  return { newValue, newCursorPos };
}

// Компонент тулбара форматирования
function FormatToolbar({ textareaRef, value, onChange }: { textareaRef: React.RefObject<HTMLTextAreaElement>, value: string, onChange: (value: string) => void }) {
  const applyFormat = (before: string, after: string = '', placeholder: string = 'текст') => {
    if (!textareaRef.current) return;
    
    const { newValue, newCursorPos } = insertText(textareaRef.current, before, after, placeholder);
    onChange(newValue);
    
    // Восстанавливаем фокус и позицию курсора
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const formatButtons = [
    { 
      label: 'Жирный', 
      icon: 'B', 
      onClick: () => applyFormat('**', '**', 'жирный текст'),
      title: 'Жирный текст (Ctrl+B)'
    },
    { 
      label: 'Курсив', 
      icon: 'I', 
      onClick: () => applyFormat('*', '*', 'курсив'),
      title: 'Курсив (Ctrl+I)'
    },
    { 
      label: 'Заголовок 1', 
      icon: 'H1', 
      onClick: () => applyFormat('# ', '', 'Заголовок 1'),
      title: 'Заголовок 1'
    },
    { 
      label: 'Заголовок 2', 
      icon: 'H2', 
      onClick: () => applyFormat('## ', '', 'Заголовок 2'),
      title: 'Заголовок 2'
    },
    { 
      label: 'Заголовок 3', 
      icon: 'H3', 
      onClick: () => applyFormat('### ', '', 'Заголовок 3'),
      title: 'Заголовок 3'
    },
    { 
      label: 'Список', 
      icon: '•', 
      onClick: () => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        const lines = value.substring(0, start).split('\n');
        const currentLine = lines[lines.length - 1];
        const indent = currentLine.match(/^(\s*)/)?.[1] || '';
        applyFormat(`${indent}- `, '', 'Элемент списка');
      },
      title: 'Маркированный список'
    },
    { 
      label: 'Нумерованный список', 
      icon: '1.', 
      onClick: () => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        const lines = value.substring(0, start).split('\n');
        const currentLine = lines[lines.length - 1];
        const indent = currentLine.match(/^(\s*)/)?.[1] || '';
        applyFormat(`${indent}1. `, '', 'Элемент списка');
      },
      title: 'Нумерованный список'
    },
    { 
      label: 'Ссылка', 
      icon: '🔗', 
      onClick: () => applyFormat('[', '](https://example.com)', 'текст ссылки'),
      title: 'Вставить ссылку'
    },
    { 
      label: 'Код', 
      icon: '</>', 
      onClick: () => applyFormat('`', '`', 'код'),
      title: 'Инлайн код'
    },
    { 
      label: 'Блок кода', 
      icon: '```', 
      onClick: () => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        const beforeText = value.substring(0, start);
        const afterText = value.substring(start);
        const newValue = beforeText + '\n```\nкод\n```\n' + afterText;
        onChange(newValue);
        setTimeout(() => {
          if (textareaRef.current) {
            const newPos = start + 5; // Позиция после "```\n"
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newPos, newPos + 4);
          }
        }, 0);
      },
      title: 'Блок кода'
    },
    { 
      label: 'Разделитель', 
      icon: '---', 
      onClick: () => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        const beforeText = value.substring(0, start);
        const afterText = value.substring(start);
        const needsNewlineBefore = beforeText && !beforeText.endsWith('\n');
        const needsNewlineAfter = afterText && !afterText.startsWith('\n');
        const newValue = 
          beforeText + 
          (needsNewlineBefore ? '\n' : '') + 
          '---\n' + 
          (needsNewlineAfter ? '' : '') + 
          afterText;
        onChange(newValue);
        setTimeout(() => {
          if (textareaRef.current) {
            const newPos = start + (needsNewlineBefore ? 1 : 0) + 5;
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newPos, newPos);
          }
        }, 0);
      },
      title: 'Горизонтальная линия'
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-input bg-muted/30">
      {formatButtons.map((btn, idx) => (
        <Button
          key={idx}
          type="button"
          variant="ghost"
          size="sm"
          onClick={btn.onClick}
          title={btn.title}
          className="h-8 px-2 text-xs"
        >
          <span className="font-semibold">{btn.icon}</span>
        </Button>
      ))}
    </div>
  );
}

export function MarkdownEditor({ value, onChange, placeholder = 'Введите Markdown текст...', className }: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRefSplit = useRef<HTMLTextAreaElement>(null);

  return (
    <div className={`flex flex-col h-full min-h-0 ${className || ''}`}>
      <div className="flex gap-2 mb-4 flex-shrink-0">
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
        <div className="border border-input rounded-md overflow-hidden flex flex-col flex-1 min-h-0">
          <FormatToolbar textareaRef={textareaRef} value={value} onChange={onChange} />
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full flex-1 p-4 bg-background text-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 placeholder:text-muted-foreground border-0 overflow-y-auto"
            style={{ fontFamily: 'monospace' }}
          />
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="flex-1 min-h-0 p-4 border border-input bg-background rounded-md prose prose-slate dark:prose-invert max-w-none break-words prose-pre:overflow-x-auto prose-pre:max-w-full prose-table:block prose-table:overflow-x-auto overflow-y-auto">
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
        <div className="grid grid-cols-2 gap-4 h-full min-h-0 flex-1">
          <div className="flex flex-col min-h-0 h-full">
            <label className="block text-sm font-medium mb-2 text-foreground flex-shrink-0">Редактор</label>
            <div className="border border-input rounded-md overflow-hidden flex flex-col flex-1 min-h-0">
              <FormatToolbar textareaRef={textareaRefSplit} value={value} onChange={onChange} />
              <textarea
                ref={textareaRefSplit}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full flex-1 p-4 bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 placeholder:text-muted-foreground border-0 resize-none overflow-y-auto"
                style={{ fontFamily: 'monospace' }}
              />
            </div>
          </div>
          <div className="flex flex-col min-h-0 h-full">
            <label className="block text-sm font-medium mb-2 text-foreground flex-shrink-0">Предпросмотр</label>
            <div className="flex-1 p-4 border border-input bg-background rounded-md prose prose-slate dark:prose-invert max-w-none break-words prose-pre:overflow-x-auto prose-pre:max-w-full prose-table:block prose-table:overflow-x-auto overflow-y-auto min-h-0">
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

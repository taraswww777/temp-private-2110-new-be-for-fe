import { useState, useRef, useEffect, useCallback } from 'react';
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
function FormatToolbar({
  textareaRef,
  value,
  onChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  value: string,
  onChange: (value: string) => void,
  onUndo?: () => void,
  onRedo?: () => void,
  canUndo?: boolean,
  canRedo?: boolean
}) {
  const applyFormat = useCallback((before: string, after: string = '', placeholder: string = 'текст') => {
    if (!textareaRef.current) return;

    const { newValue, newCursorPos } = insertText(textareaRef.current, before, after, placeholder);
    onChange(newValue);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [textareaRef, onChange]);

  const handleUndoClick = useCallback(() => {
    if (!onUndo) return;
    onUndo();
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }, [onUndo, textareaRef]);

  const handleRedoClick = useCallback(() => {
    if (!onRedo) return;
    onRedo();
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }, [onRedo, textareaRef]);

  const handleListClick = useCallback(() => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const lines = value.substring(0, start).split('\n');
    const currentLine = lines[lines.length - 1];
    const indent = currentLine.match(/^(\s*)/)?.[1] || '';
    applyFormat(`${indent}- `, '', 'Элемент списка');
  }, [textareaRef, value, applyFormat]);

  const handleNumberedListClick = useCallback(() => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const lines = value.substring(0, start).split('\n');
    const currentLine = lines[lines.length - 1];
    const indent = currentLine.match(/^(\s*)/)?.[1] || '';
    applyFormat(`${indent}1. `, '', 'Элемент списка');
  }, [textareaRef, value, applyFormat]);

  const handleCodeBlockClick = useCallback(() => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const beforeText = value.substring(0, start);
    const afterText = value.substring(start);
    const newValue = beforeText + '\n```\nкод\n```\n' + afterText;
    onChange(newValue);
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = start + 5;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPos, newPos + 4);
      }
    }, 0);
  }, [textareaRef, value, onChange]);

  const handleDividerClick = useCallback(() => {
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
  }, [textareaRef, value, onChange]);

  // Рендерим кнопки напрямую, без создания промежуточного массива
  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-input bg-muted/30">
      {onUndo && onRedo && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUndoClick}
            title="Отменить (Ctrl+Z)"
            disabled={!canUndo}
            className="h-8 px-2 text-xs"
          >
            <span className="font-semibold">↶</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRedoClick}
            title="Повторить (Shift+Ctrl+Z)"
            disabled={!canRedo}
            className="h-8 px-2 text-xs"
          >
            <span className="font-semibold">↷</span>
          </Button>
        </>
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => applyFormat('**', '**', 'жирный текст')}
        title="Жирный текст (Ctrl+B)"
        className="h-8 px-2 text-xs"
      >
        <span className="font-semibold">B</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => applyFormat('*', '*', 'курсив')}
        title="Курсив (Ctrl+I)"
        className="h-8 px-2 text-xs"
      >
        <span className="font-semibold">I</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => applyFormat('# ', '', 'Заголовок 1')}
        title="Заголовок 1"
        className="h-8 px-2 text-xs"
      >
        <span className="font-semibold">H1</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => applyFormat('## ', '', 'Заголовок 2')}
        title="Заголовок 2"
        className="h-8 px-2 text-xs"
      >
        <span className="font-semibold">H2</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => applyFormat('### ', '', 'Заголовок 3')}
        title="Заголовок 3"
        className="h-8 px-2 text-xs"
      >
        <span className="font-semibold">H3</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleListClick}
        title="Маркированный список"
        className="h-8 px-2 text-xs"
      >
        <span className="font-semibold">•</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleNumberedListClick}
        title="Нумерованный список"
        className="h-8 px-2 text-xs"
      >
        <span className="font-semibold">1.</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => applyFormat('[', '](https://example.com)', 'текст ссылки')}
        title="Вставить ссылку"
        className="h-8 px-2 text-xs"
      >
        <span className="font-semibold">🔗</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => applyFormat('`', '`', 'код')}
        title="Инлайн код"
        className="h-8 px-2 text-xs"
      >
        <span className="font-semibold">{'</>'}</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleCodeBlockClick}
        title="Блок кода"
        className="h-8 px-2 text-xs"
      >
        <span className="font-semibold">{'```'}</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleDividerClick}
        title="Горизонтальная линия"
        className="h-8 px-2 text-xs"
      >
        <span className="font-semibold">---</span>
      </Button>
    </div>
  );
}

export function MarkdownEditor({ value, onChange, placeholder = 'Введите Markdown текст...', className }: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRefSplit = useRef<HTMLTextAreaElement>(null);

  // История изменений для undo/redo
  const historyRef = useRef<string[]>([value]);
  const historyIndexRef = useRef(0);
  const isHistoryUpdateRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAddedValueRef = useRef<string>(value);

  // Состояние для отслеживания возможности undo/redo
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Обновление состояния undo/redo
  const updateUndoRedoState = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  // Добавление в историю с debounce
  const addToHistory = useCallback((newValue: string) => {
    if (isHistoryUpdateRef.current) return;

    // Сохраняем последнее добавленное значение
    lastAddedValueRef.current = newValue;

    // Очищаем таймер если он есть
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Добавляем в историю с задержкой для группировки быстрых изменений
    debounceTimerRef.current = setTimeout(() => {
      const history = historyRef.current;
      const index = historyIndexRef.current;

      // Используем последнее значение (может измениться за время debounce)
      const valueToAdd = lastAddedValueRef.current;

      // Удаляем все записи после текущего индекса (если были redo)
      const newHistory = history.slice(0, index + 1);

      // Добавляем новое значение только если оно отличается от последнего в истории
      if (newHistory[newHistory.length - 1] !== valueToAdd) {
        newHistory.push(valueToAdd);
        // Ограничиваем размер истории (максимум 50 записей)
        if (newHistory.length > 50) {
          newHistory.shift();
        }
        historyIndexRef.current = newHistory.length - 1;
        historyRef.current = newHistory;
        updateUndoRedoState();
      }
    }, 300);
  }, [updateUndoRedoState]);

  // Принудительное сохранение текущего значения в историю
  const flushHistory = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const currentValue = lastAddedValueRef.current;
    const history = historyRef.current;
    const index = historyIndexRef.current;

    // Удаляем все записи после текущего индекса
    const newHistory = history.slice(0, index + 1);

    // Добавляем текущее значение если оно отличается от последнего
    if (newHistory[newHistory.length - 1] !== currentValue) {
      newHistory.push(currentValue);
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      historyIndexRef.current = newHistory.length - 1;
      historyRef.current = newHistory;
      updateUndoRedoState();
    }
  }, [updateUndoRedoState]);

  // Undo
  const handleUndo = useCallback(() => {
    // Принудительно сохраняем текущее состояние перед undo
    flushHistory();

    const history = historyRef.current;
    const index = historyIndexRef.current;

    if (index > 0) {
      isHistoryUpdateRef.current = true;
      historyIndexRef.current = index - 1;
      onChange(history[index - 1]);
      updateUndoRedoState();
      setTimeout(() => {
        isHistoryUpdateRef.current = false;
      }, 0);
    }
  }, [onChange, updateUndoRedoState, flushHistory]);

  // Redo
  const handleRedo = useCallback(() => {
    const history = historyRef.current;
    const index = historyIndexRef.current;

    if (index < history.length - 1) {
      isHistoryUpdateRef.current = true;
      historyIndexRef.current = index + 1;
      onChange(history[index + 1]);
      updateUndoRedoState();
      setTimeout(() => {
        isHistoryUpdateRef.current = false;
      }, 0);
    }
  }, [onChange, updateUndoRedoState]);

  // Инициализация истории при монтировании и при изменении value извне
  useEffect(() => {
    // Если значение изменилось извне (не через undo/redo), сбрасываем историю
    if (!isHistoryUpdateRef.current) {
      const currentValue = historyRef.current[historyIndexRef.current];
      if (currentValue !== value) {
        // Очищаем debounce таймер если есть
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        // Сбрасываем историю
        historyRef.current = [value];
        historyIndexRef.current = 0;
        lastAddedValueRef.current = value;
        updateUndoRedoState();
      }
    }
  }, [value, updateUndoRedoState]);

  // Обработка изменений с добавлением в историю
  const handleChange = useCallback((newValue: string) => {
    onChange(newValue);
    addToHistory(newValue);
  }, [onChange, addToHistory]);

  // Обработка клавиатурных сокращений
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
      e.preventDefault();
      handleUndo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
      e.preventDefault();
      handleRedo();
      return;
    }
  }, [handleUndo, handleRedo]);

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
          <FormatToolbar
            textareaRef={textareaRef}
            value={value}
            onChange={handleChange}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e)}
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
              <FormatToolbar
                textareaRef={textareaRefSplit}
                value={value}
                onChange={handleChange}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={canUndo}
                canRedo={canRedo}
              />
              <textarea
                ref={textareaRefSplit}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
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

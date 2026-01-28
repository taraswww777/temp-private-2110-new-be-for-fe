import { useMemo, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface MarkdownViewerProps {
  content: string;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  const [activeHeading, setActiveHeading] = useState<string>('');

  // Функция для генерации ID из текста заголовка
  const generateId = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')           // пробелы в дефисы
      .replace(/[^\w\u0400-\u04FF-]/g, '') // оставляем буквы, цифры, кириллицу и дефисы
      .replace(/--+/g, '-')           // множественные дефисы в один
      .replace(/^-+|-+$/g, '');       // удаляем дефисы в начале и конце
  };

  // Извлекаем заголовки из markdown для навигации
  const headings = useMemo(() => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const result: Heading[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = generateId(text);
      result.push({ id, text, level });
    }

    return result;
  }, [content]);

  // Intersection Observer для подсветки активного заголовка
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex gap-6">
      {/* Навигация по заголовкам */}
      {headings.length > 0 && (
        <Card className="w-64 p-4 sticky top-4 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto">
          <h3 className="font-semibold mb-3">Содержание</h3>
          <Separator className="mb-3" />
          <nav className="space-y-1">
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => scrollToHeading(heading.id)}
                className={`block w-full text-left text-sm py-1 px-2 rounded transition-colors ${
                  activeHeading === heading.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
              >
                {heading.text}
              </button>
            ))}
          </nav>
        </Card>
      )}

      {/* Контент markdown */}
      <div className="flex-1 prose prose-slate dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children, ...props }) => {
              const id = generateId(String(children));
              return <h1 id={id} {...props}>{children}</h1>;
            },
            h2: ({ children, ...props }) => {
              const id = generateId(String(children));
              return <h2 id={id} {...props}>{children}</h2>;
            },
            h3: ({ children, ...props }) => {
              const id = generateId(String(children));
              return <h3 id={id} {...props}>{children}</h3>;
            },
            h4: ({ children, ...props }) => {
              const id = generateId(String(children));
              return <h4 id={id} {...props}>{children}</h4>;
            },
            h5: ({ children, ...props }) => {
              const id = generateId(String(children));
              return <h5 id={id} {...props}>{children}</h5>;
            },
            h6: ({ children, ...props }) => {
              const id = generateId(String(children));
              return <h6 id={id} {...props}>{children}</h6>;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

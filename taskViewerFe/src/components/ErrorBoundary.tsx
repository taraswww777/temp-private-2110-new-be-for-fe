import { Component, ReactNode } from 'react';
import { Button } from '@/uiKit/button';
import { Card } from '@/uiKit/card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-2xl w-full mx-auto shadow-lg">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-red-100 p-3 mr-4 dark:bg-red-900">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-600 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Что-то пошло не так
                </h2>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ошибка:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {this.state.error?.toString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={this.handleReset}
                  variant="default"
                  className="flex-1 min-w-32"
                >
                  Попробовать снова
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1 min-w-32"
                >
                  Перезагрузить страницу
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

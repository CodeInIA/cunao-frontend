import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorPageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  title = 'Algo ha ido mal',
  message = 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.',
  onRetry,
  showHomeButton = true
}) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-900 px-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-24 h-24 text-spanish-red mx-auto mb-6" />
        
        <h1 className="text-3xl font-patriot font-bold text-white mb-4">
          {title}
        </h1>
        
        <p className="text-slate-300 mb-8">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-6 py-3 bg-spanish-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Intentar de nuevo
            </button>
          )}
          
          {showHomeButton && (
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-slate-700 text-slate-200 font-semibold rounded-lg hover:bg-slate-600 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Volver al inicio
            </a>
          )}
        </div>

        <p className="mt-8 text-spanish-yellow font-bold italic">
          "En mi pueblo esto no pasaba"
        </p>
      </div>
    </div>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          title="Error de aplicación"
          message="Ha ocurrido un error inesperado en la aplicación. Por favor, recarga la página."
          onRetry={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}

interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  onRetry,
  className = ''
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-red-700 text-sm">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Intentar de nuevo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


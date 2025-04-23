import React from 'react';
import { toast } from 'sonner';

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log the error
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Show toast notification
    toast.error('Une erreur est survenue. Veuillez rafraîchir la page.');
  }

  render() {
    if (this.state.error) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Oops! Une erreur est survenue
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Nous nous excusons pour la gêne occasionnée. Veuillez rafraîchir la page ou réessayer plus tard.
              </p>
            </div>
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Détails de l'erreur
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      {this.state.error.toString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Rafraîchir la page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 
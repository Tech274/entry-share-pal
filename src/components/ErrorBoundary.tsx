import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Do NOT treat removeChild DOM reconciliation errors as fatal.
    // These are transient Radix UI portal cleanup artifacts and React recovers automatically.
    if (error?.message?.includes('removeChild') || error?.message?.includes('is not a child of this node')) {
      return { hasError: false, errorMessage: '' };
    }
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Skip logging for known transient removeChild portal errors
    if (error?.message?.includes('removeChild') || error?.message?.includes('is not a child of this node')) {
      return;
    }
    console.error('App error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-xl text-center space-y-2">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">
              An unexpected error occurred while rendering the page.
            </p>
            <div className="text-sm bg-muted rounded p-3 text-left">
              {this.state.errorMessage || 'Unknown error'}
            </div>
            <button
              onClick={() => this.setState({ hasError: false, errorMessage: '' })}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


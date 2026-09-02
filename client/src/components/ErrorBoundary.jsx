import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CodeFlow ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-panel rounded-2xl p-8 text-center border border-outline-variant/40 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} />
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-2">Something went wrong</h2>
            <p className="text-sm text-on-surface-variant mb-6">
              We encountered an unexpected error while loading this page.
            </p>
            {this.state.error?.message && (
              <pre className="text-xs text-left bg-surface-container/60 p-3 rounded-xl mb-6 overflow-x-auto text-rose-400 font-mono border border-outline-variant/20">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 btn-primary py-2.5 text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} />
                <span>Reload Page</span>
              </button>
              <a
                href="/dashboard"
                className="px-4 py-2.5 text-xs rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface flex items-center justify-center gap-1.5 transition-colors"
              >
                <Home size={14} />
                <span>Dashboard</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

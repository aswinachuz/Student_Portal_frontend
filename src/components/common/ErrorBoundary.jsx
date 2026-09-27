import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary:", error);
    console.error("Component Error Info:", errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-800 px-4 dark:bg-slate-950">
          <div className="w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-8 text-center shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 text-5xl">⚠️</div>

            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
              Something went wrong
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              An unexpected error occurred while loading this page.
            </p>

            <button
              onClick={this.handleReload}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Reload Page
            </button>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-5 text-left">
                <summary className="cursor-pointer text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Development Error
                </summary>

                <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-xs text-red-600 dark:bg-slate-800 dark:text-red-400">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
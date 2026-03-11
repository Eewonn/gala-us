"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8f6f5] flex items-center justify-center p-6">
          <div className="bg-white rounded-xl bold-border p-12 shadow-playful max-w-lg text-center">
            <div className="size-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-red-600">
                error
              </span>
            </div>
            <h1 className="text-3xl font-black mb-4">Oops! Something went wrong</h1>
            <p className="text-slate-600 font-medium mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="h-14 px-8 bg-[#ff5833] text-white font-black rounded-xl bold-border shadow-playful-sm btn-push inline-flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">refresh</span>
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

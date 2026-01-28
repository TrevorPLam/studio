/**
 * ============================================================================
 * ERROR BOUNDARY COMPONENT
 * ============================================================================
 *
 * @file src/components/error-boundary.tsx
 *
 * PURPOSE:
 * React error boundary for catching and handling component errors gracefully.
 * Prevents entire app from crashing on component errors.
 *
 * FEATURES:
 * - Catches React component errors
 * - Displays user-friendly error UI
 * - Provides reload and home navigation options
 * - Logs errors to console
 *
 * USAGE:
 * Wrap app in root layout to catch all errors.
 *
 * RELATED FILES:
 * - src/app/layout.tsx (Uses ErrorBoundary)
 *
 * ============================================================================
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * Error boundary component state.
 */
interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;

  /** The error that was caught */
  error: Error | null;
}

// ============================================================================
// SECTION: ERROR BOUNDARY CLASS
// ============================================================================

/**
 * Error boundary component.
 *
 * Catches React component errors and displays fallback UI.
 *
 * @see React Error Boundaries documentation
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  /**
   * Initialize error boundary state.
   *
   * @param props - Component props
   */
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Update state when error is caught.
   *
   * Called automatically by React when error occurs.
   *
   * @param error - The error that was caught
   * @returns New state with error information
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Log error information.
   *
   * Called automatically by React when error occurs.
   *
   * @param error - The error that was caught
   * @param errorInfo - React error information
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  /**
   * Render component or error UI.
   *
   * @returns Error UI if error caught, otherwise children
   */
  render() {
    if (this.state.hasError) {
      // ====================================================================
      // ERROR UI
      // ====================================================================
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                An unexpected error occurred. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ============================================================
                  ERROR MESSAGE
                  ============================================================ */}
              {this.state.error && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-mono text-muted-foreground">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* ============================================================
                  ACTION BUTTONS
                  ============================================================ */}
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.reload();
                  }}
                  className="flex-1"
                >
                  Reload Page
                </Button>
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.href = '/';
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // ========================================================================
    // NORMAL RENDER
    // ========================================================================
    return this.props.children;
  }
}

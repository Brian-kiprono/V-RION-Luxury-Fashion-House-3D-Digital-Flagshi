import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallbackTitle?: string },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallbackTitle?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 bg-[#EAE6DC] border border-[#0F0F10]/10 text-center text-[#0F0F10]">
          <p className="font-display text-2xl">
            {this.props.fallbackTitle || 'Section temporarily unavailable'}
          </p>
          <p className="text-xs text-[#78756E] mt-2">
            Please refresh the page to reinitialize the 3D presentation.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

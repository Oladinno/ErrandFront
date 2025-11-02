import React from 'react';
import ErrorState from './ErrorState';

export default class AppErrorBoundary extends React.Component<React.PropsWithChildren<{}>, { error?: Error }> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { error: undefined };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error('App error:', error);
  }
  render() {
    if (this.state.error) {
      return <ErrorState message={this.state.error.message} />;
    }
    return this.props.children;
  }
}
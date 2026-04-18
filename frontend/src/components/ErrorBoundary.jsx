import React, { Component } from 'react';

/**
 * ErrorBoundary component to catch and handle React errors
 * @extends Component
 */
class ErrorBoundary extends Component {
  /**
   * @typedef {Object} State
   * @property {boolean} hasError
   * @property {Error|null} error
   */

  /** @type {State} */
  state = {
    hasError: false,
    error: null,
  };

  /**
   * Static lifecycle method to update state when an error occurs
   * @param {Error} error - The error that was thrown
   * @returns {State}
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * ComponentDidCatch for side effects like logging
   * @param {Error} error - The error that was thrown
   * @param {Object} info - Component stack trace info
   */
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  /**
   * Resets the error state to allow retry
   */
  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  /**
   * Renders the fallback UI when an error occurs
   * @returns {React.ReactElement}
   */
  renderFallbackUI = () => {
    const { error } = this.state;

    return (
      <div
        className="glass-panel"
        style={{
          margin: '2rem auto',
          padding: '2rem',
          maxWidth: '500px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            color: 'var(--danger)',
            marginBottom: '1rem',
            fontSize: '1.5rem',
          }}
        >
          Something went wrong
        </h2>

        <p
          style={{
            color: 'var(--text-muted)',
            marginBottom: '1.5rem',
          }}
        >
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>

        <button
          onClick={this.handleRetry}
          className="btn-primary"
          style={{ width: '100%' }}
        >
          Try Again
        </button>
      </div>
    );
  };

  /**
   * Renders the component
   * @returns {React.ReactElement}
   */
  render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return this.renderFallbackUI();
    }

    return children;
  }
}

export default ErrorBoundary;

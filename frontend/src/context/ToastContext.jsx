import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Toast from '../components/Toast';

/**
 * @typedef {'success'|'error'|'warning'|'info'} ToastType
 */

/**
 * @typedef {Object} ToastItem
 * @property {string} id - Unique identifier
 * @property {string} message - Toast message
 * @property {ToastType} type - Toast type
 * @property {number} duration - Duration in ms
 */

/**
 * @typedef {Object} ToastContextValue
 * @property {function(string, ToastType, number=): void} showToast - Show a toast notification
 */

/** @type {React.Context<ToastContextValue|null>} */
const ToastContext = createContext(null);

/**
 * Custom hook to access toast context
 * @returns {ToastContextValue}
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Toast provider component that wraps the app and provides toast notifications globally
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {ToastType} [type='info'] - Toast type
   * @param {number} [duration=3000] - Auto-dismiss duration in ms
   */
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = `toast-${toastIdRef.current++}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  /**
   * Remove a toast by ID
   * @param {string} id - Toast ID to remove
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container positioned at top-right */}
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <Toast
              id={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={removeToast}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;

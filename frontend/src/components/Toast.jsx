import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * @typedef {'success'|'error'|'warning'|'info'} ToastType
 */

/**
 * @typedef {Object} ToastProps
 * @property {string} message - The toast message text
 * @property {ToastType} type - Toast type/style
 * @property {number} [duration=3000] - Auto-dismiss duration in ms
 * @property {function} onClose - Callback when toast is dismissed
 * @property {number} [id] - Unique identifier for the toast
 */

/**
 * Toast notification component with auto-dismiss and slide-in animation
 * @param {ToastProps} props
 */
const Toast = ({ message, type = 'info', duration = 3000, onClose, id }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger slide-in animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Auto-dismiss timer
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose?.(id);
    }, 300); // Match the animation duration
  };

  const typeStyles = {
    success: {
      background: 'linear-gradient(135deg, var(--success) 0%, #157347 100%)',
      borderColor: '#badbcc'
    },
    error: {
      background: 'linear-gradient(135deg, var(--danger) 0%, #c82333 100%)',
      borderColor: '#f5c6cb'
    },
    warning: {
      background: 'linear-gradient(135deg, var(--warning) 0%, #d39e00 100%)',
      borderColor: '#ffe69c',
      color: '#721c24'
    },
    info: {
      background: 'linear-gradient(135deg, var(--primary) 0%, #007bff 100%)',
      borderColor: '#86b7fe'
    }
  };

  const icons = {
    success: '\u2713', // checkmark
    error: '\u2717',   // X mark
    warning: '\u26A0', // warning sign
    info: '\u2139'     // info sign
  };

  const style = typeStyles[type] || typeStyles.info;
  const icon = icons[type] || icons.info;

  const toastContent = (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '1px solid',
        minWidth: '300px',
        maxWidth: '400px',
        cursor: 'pointer',
        fontFamily: 'var(--font-family)',
        fontSize: '0.95rem',
        fontWeight: 500,
        transform: isLeaving ? 'translateX(120%)' : isVisible ? 'translateX(0)' : 'translateX(120%)',
        opacity: isLeaving ? 0 : isVisible ? 1 : 0,
        transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
        ...style
      }}
      onClick={handleDismiss}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          fontSize: '0.85rem',
          flexShrink: 0
        }}
      >
        {icon}
      </span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.25rem',
          cursor: 'pointer',
          padding: '0',
          lineHeight: 1,
          opacity: 0.7,
          color: type === 'warning' ? '#721c24' : 'white',
          transition: 'opacity var(--transition-fast)'
        }}
        onMouseOver={(e) => e.target.style.opacity = '1'}
        onMouseOut={(e) => e.target.style.opacity = '0.7'}
        aria-label="Dismiss notification"
      >
        &times;
      </button>
    </div>
  );

  return createPortal(toastContent, document.body);
};

export default Toast;

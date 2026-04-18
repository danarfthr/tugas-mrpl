import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * @typedef {Object} ModalProps
 * @property {boolean} isOpen - Whether the modal is visible
 * @property {function} onClose - Callback to close the modal
 * @property {string} title - Modal title text
 * @property {React.ReactNode} children - Modal body content
 * @property {function} [onConfirm] - Confirm button callback
 * @property {string} [confirmText] - Confirm button text (default 'Konfirmasi')
 * @property {string} [cancelText] - Cancel button text (default 'Batal')
 * @property {'danger'|'primary'} [variant] - Confirm button style
 * @property {boolean} [showFooter] - Whether to show footer buttons (default true)
 */

/**
 * Confirmation/action dialog component with React Portal
 * @param {ModalProps} props
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'primary',
  showFooter = true
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const confirmButtonStyle = variant === 'danger'
    ? {
        background: 'linear-gradient(135deg, var(--danger) 0%, #c82333 100%)',
        boxShadow: '0 4px 6px rgba(220, 53, 69, 0.2)'
      }
    : {
        background: 'linear-gradient(135deg, var(--primary) 0%, #007bff 100%)',
        boxShadow: '0 4px 6px rgba(0, 86, 179, 0.2)'
      };

  const modalContent = (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
    >
      <div
        ref={modalRef}
        className="glass-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto',
          outline: 'none'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #dee2e6'
          }}
        >
          <h2
            id="modal-title"
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--text-main)'
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.25rem',
              lineHeight: 1,
              transition: 'color var(--transition-fast)'
            }}
            onMouseOver={(e) => e.target.style.color = 'var(--text-main)'}
            onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              padding: '1rem 1.5rem',
              borderTop: '1px solid #dee2e6',
              backgroundColor: '#f8f9fa'
            }}
          >
            <button
              onClick={onClose}
              className="btn-secondary"
              style={{ minWidth: '100px' }}
            >
              {cancelText}
            </button>
            {onConfirm && (
              <button
                onClick={onConfirm}
                style={{
                  ...confirmButtonStyle,
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  minWidth: '100px'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;

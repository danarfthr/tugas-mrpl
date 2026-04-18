/**
 * Status badge component with pill shape
 * @param {Object} props
 * @param {'success' | 'warning' | 'danger' | 'secondary'} props.variant - Badge color variant
 * @param {React.ReactNode} props.children - Badge content
 */
const Badge = ({ variant, children }) => {
  const variantStyles = {
    success: { backgroundColor: '#d1e7dd', color: '#0f5132' },
    warning: { backgroundColor: '#fff3cd', color: '#664d03' },
    danger: { backgroundColor: '#f8d7da', color: '#721c24' },
    secondary: { backgroundColor: '#e2e3e5', color: '#41464b' },
  };

  const style = variantStyles[variant] || variantStyles.secondary;

  return (
    <span
      style={{
        ...style,
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
};

export default Badge;

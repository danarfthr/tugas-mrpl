/**
 * Reusable glass panel card component
 * @param {Object} props
 * @param {string} [props.title] - Card header title
 * @param {React.ReactNode} props.children - Card content
 * @param {React.ReactNode} [props.action] - Optional action button in footer
 * @param {string} [props.className] - Additional CSS class names
 */
const Card = ({ title, children, action, className = '' }) => {
  return (
    <div className={`glass-panel ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {title && (
        <div style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{title}</h3>
        </div>
      )}

      <div style={{ flexGrow: 1 }}>{children}</div>

      {action && (
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
          {action}
        </div>
      )}
    </div>
  );
};

export default Card;

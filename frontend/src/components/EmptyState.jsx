/**
 * Empty state placeholder component
 * @param {Object} props
 * @param {string} props.title - Main message title
 * @param {string} [props.description] - Optional descriptive text
 * @param {React.ReactNode} [props.action] - Optional action button
 */
const EmptyState = ({ title, description, action }) => {
  return (
    <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 600 }}>{title}</h3>
      {description && (
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;

/**
 * CSS-only loading spinner component
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Spinner size
 * @param {string} [props.color] - Spinner color (CSS color value)
 */
const LoadingSpinner = ({ size = 'md', color = 'var(--primary)' }) => {
  const sizeMap = {
    sm: '20px',
    md: '40px',
    lg: '60px',
  };

  const dimension = sizeMap[size] || sizeMap.md;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div
        style={{
          width: dimension,
          height: dimension,
          border: '3px solid rgba(0,0,0,0.1)',
          borderTopColor: color,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;

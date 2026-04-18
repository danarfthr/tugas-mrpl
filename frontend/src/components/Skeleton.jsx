import React from 'react';

/**
 * @typedef {'text'|'circular'|'rectangular'} SkeletonVariant
 */

/**
 * @typedef {Object} SkeletonProps
 * @property {SkeletonVariant} [variant='text'] - Skeleton shape variant
 * @property {string|number} [width] - Optional width
 * @property {string|number} [height] - Optional height
 * @property {number} [count=1] - Number of skeleton elements to render
 */

/**
 * Loading skeleton component with pulse animation
 * @param {SkeletonProps} props
 */
const Skeleton = ({
  variant = 'text',
  width,
  height,
  count = 1
}) => {
  /**
   * Get base styles based on variant
   * @returns {Object} Style object
   */
  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return {
          width: width || '40px',
          height: height || '40px',
          borderRadius: '50%'
        };
      case 'rectangular':
        return {
          width: width || '100%',
          height: height || '100px',
          borderRadius: 'var(--radius-md)'
        };
      case 'text':
      default:
        return {
          width: width || '100%',
          height: height || '1rem',
          borderRadius: 'var(--radius-sm)'
        };
    }
  };

  const baseStyle = getVariantStyles();

  /**
   * Generate array of count items
   * @returns {number[]} Array of numbers
   */
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((_, index) => (
        <div
          key={index}
          style={{
            ...baseStyle,
            background: 'linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            marginBottom: index < count - 1 ? '0.5rem' : 0,
            display: variant === 'text' ? 'block' : 'inline-block'
          }}
          aria-hidden="true"
        />
      ))}
      <style>
        {`
          @keyframes skeleton-pulse {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}
      </style>
    </>
  );
};

/**
 * Skeleton row for table loading state
 * @param {Object} props
 * @param {number} props.columns - Number of table columns
 * @returns {React.ReactElement}
 */
export const SkeletonRow = ({ columns }) => (
  <tr>
    {Array.from({ length: columns }, (_, i) => (
      <td key={i} style={{ padding: '1rem' }}>
        <Skeleton variant="text" width={`${60 + Math.random() * 40}%`} />
      </td>
    ))}
  </tr>
);

/**
 * Skeleton card for card loading state
 * @param {Object} props
 * @param {string|number} [props.height] - Card height
 * @returns {React.ReactElement}
 */
export const SkeletonCard = ({ height = '200px' }) => (
  <div
    style={{
      padding: '1.5rem',
      background: 'var(--surface)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-md)'
    }}
  >
    <Skeleton variant="rectangular" height="120px" />
    <div style={{ marginTop: '1rem' }}>
      <Skeleton variant="text" width="70%" height="1.25rem" />
    </div>
    <div style={{ marginTop: '0.5rem' }}>
      <Skeleton variant="text" width="90%" />
    </div>
    <div style={{ marginTop: '0.5rem' }}>
      <Skeleton variant="text" width="50%" />
    </div>
  </div>
);

export default Skeleton;

import React from 'react';

/**
 * @typedef {Object} Option
 * @property {string|number} value - The option value
 * @property {string} label - The option label
 */

/**
 * @typedef {Object} SelectProps
 * @property {string} [label] - Label text for the select
 * @property {string|number} value - Currently selected value
 * @property {function} onChange - Change handler (value) => void
 * @property {Option[]} options - Array of option objects
 * @property {string} [placeholder] - Placeholder text when no value selected
 * @property {string} [error] - Error message to display
 * @property {string} [id] - Input id (auto-generated if not provided)
 * @property {string} [name] - Input name attribute
 * @property {boolean} [required] - Whether the field is required
 * @property {boolean} [disabled] - Whether the field is disabled
 */

/**
 * Styled dropdown select component
 * @param {SelectProps} props
 */
const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  error,
  id,
  name,
  required,
  disabled = false
}) => {
  const generatedId = React.useId();
  const selectId = id || generatedId;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={selectId}>
          {label}
          {required && (
            <span style={{ color: 'var(--danger)', marginLeft: '0.25rem' }}>*</span>
          )}
        </label>
      )}

      <select
        id={selectId}
        name={name || selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className={`form-input ${error ? 'is-invalid' : ''}`}
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: disabled ? '#e9ecef' : 'white',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235c6366' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          paddingRight: '2.5rem'
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <span className="error-text" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default Select;

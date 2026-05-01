import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, style, ...rest }, ref) => {
    const inputId = id ?? `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {label && (
          <label htmlFor={inputId} style={{ fontSize: 13, fontWeight: 600, color: 'var(--ww-text, #374151)' }}>
            {label}
            {rest.required && <span aria-hidden="true" style={{ color: 'var(--ww-danger, #dc2626)', marginLeft: 3 }}>*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          style={{
            border: `1.5px solid ${error ? 'var(--ww-danger, #dc2626)' : 'var(--ww-border, #d1d5db)'}`,
            borderRadius: 'var(--ww-radius, 8px)',
            padding: '11px 14px',
            fontSize: 15,
            minHeight: 44,
            width: '100%',
            outline: 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            background: 'var(--ww-surface, #fff)',
            color: 'var(--ww-text, #111827)',
            ...style,
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--ww-primary, #0F4C81)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,76,129,0.15)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = error ? 'var(--ww-danger, #dc2626)' : 'var(--ww-border, #d1d5db)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          {...rest}
        />
        {error && <span id={`${inputId}-error`} role="alert" style={{ fontSize: 12, color: 'var(--ww-danger, #dc2626)' }}>{error}</span>}
        {!error && hint && <span id={`${inputId}-hint`} style={{ fontSize: 12, color: 'var(--ww-text-muted, #6b7280)' }}>{hint}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

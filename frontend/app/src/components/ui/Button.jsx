export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const base = 'btn';
  const variantClass = variant === 'ghost' ? 'btn-ghost' : variant === 'danger' ? 'btn-danger' : 'btn-primary';
  return (
    <button className={`${base} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}



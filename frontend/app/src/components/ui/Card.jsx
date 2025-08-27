export function Card({ className = '', children }) {
  return <div className={`bg-surface border border-gray-800 rounded-xl ${className}`}>{children}</div>;
}

export function CardHeader({ title, subtitle, actions }) {
  return (
    <div className="px-5 pt-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}



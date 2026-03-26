export type AuthTitleBlockProps = {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
};

export function AuthTitleBlock({ title, subtitle, align = 'left' }: AuthTitleBlockProps) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';

  return (
    <div className={`mb-6 ${alignClass}`}>
      <h1 className="text-2xl font-semibold mb-1 text-gray-900">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

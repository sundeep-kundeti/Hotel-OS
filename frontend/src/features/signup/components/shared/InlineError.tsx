export type InlineErrorProps = {
  message?: string;
};

export function InlineError({ message }: InlineErrorProps) {
  if (!message) return null;

  return (
    <p className="text-xs text-red-600 mt-1.5 font-medium" role="alert">
      {message}
    </p>
  );
}

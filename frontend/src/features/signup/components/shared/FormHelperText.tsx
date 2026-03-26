export type FormHelperTextProps = {
  text?: string;
};

export function FormHelperText({ text }: FormHelperTextProps) {
  if (!text) return null;

  return (
    <p className="text-xs text-gray-500 mt-1.5" id="helper-text">
      {text}
    </p>
  );
}

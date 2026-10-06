type Props = {
  questions: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
};

export function SuggestedQuestion({ questions, onSelect, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((q, idx) => (
        <button
          key={idx}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(q)}
          className="rounded border border-ink/15 bg-sandstone/15 px-3 py-1.5 text-xs text-ink/80 transition hover:border-clay hover:bg-clay/10 hover:text-ink disabled:opacity-50 text-left cursor-pointer"
        >
          {q}
        </button>
      ))}
    </div>
  );
}

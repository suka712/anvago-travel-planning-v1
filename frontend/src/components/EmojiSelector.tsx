import { Check } from 'lucide-react';

interface EmojiOption {
  emoji: string;
  label: string;
}

interface EmojiSelectorProps {
  options: EmojiOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function EmojiSelector({ options, selected, onChange }: EmojiSelectorProps) {
  const toggleSelection = (emoji: string) => {
    if (selected.includes(emoji)) {
      onChange(selected.filter((e) => e !== emoji));
    } else {
      onChange([...selected, emoji]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {options.map((option) => {
        const isSelected = selected.includes(option.emoji);
        return (
          <button
            key={option.emoji}
            onClick={() => toggleSelection(option.emoji)}
            className={`relative bg-white rounded-xl border-2 border-black p-4 shadow-[6px_6px_0px_#000] transition-all duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0px_#000] ${
              isSelected ? 'bg-[#4FC3F7]/20' : ''
            }`}
          >
            {isSelected && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#4FC3F7] border-2 border-black rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-black" />
              </div>
            )}
            <div className="text-4xl mb-2">{option.emoji}</div>
            <div className="text-sm font-medium text-center">{option.label}</div>
          </button>
        );
      })}
    </div>
  );
}


import { Check } from 'lucide-react';

interface PersonaCardProps {
  id: string;
  emoji: string;
  name: string;
  selected: boolean;
  onClick: () => void;
}

export function PersonaCard({ emoji, name, selected, onClick }: PersonaCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative bg-white rounded-xl border-2 border-black p-6 shadow-[6px_6px_0px_#000] transition-all duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0px_#000] ${
        selected ? 'bg-[#4FC3F7]/20' : ''
      }`}
    >
      {selected && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#4FC3F7] border-2 border-black rounded-full flex items-center justify-center">
          <Check className="w-5 h-5 text-black" />
        </div>
      )}
      <div className="text-5xl mb-3">{emoji}</div>
      <div className="font-semibold text-center">{name}</div>
    </button>
  );
}


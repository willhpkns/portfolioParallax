import { Circle } from 'lucide-react';

interface SkillLevelSelectorProps {
  level: number;
  onLevelChange: (level: number) => void;
}

export default function SkillLevelSelector({ level, onLevelChange }: SkillLevelSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Level:</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onLevelChange(value)}
            className="p-1 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C4B37] focus:ring-offset-2"
          >
            <Circle
              size={16}
              className={value <= level ? 'fill-[#2C1810] text-[#2C1810]' : 'fill-[#E6D5AC] text-[#E6D5AC]'}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

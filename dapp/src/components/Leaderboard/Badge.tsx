import { cn } from '@/lib/utils';

interface BadgeProps {
  rank: number;
  className?: string;
}

export default function Badge({ rank, className }: BadgeProps) {
  const getBadgeConfig = () => {
    if (rank === 1) {
      return {
        emoji: '🥇',
        bgColor: 'bg-yellow-500',
        textColor: 'text-black',
        borderColor: 'border-yellow-600',
        glow: 'shadow-[0_0_20px_rgba(234,179,8,0.6)]',
        pulse: 'animate-pulse',
      };
    }
    if (rank === 2) {
      return {
        emoji: '🥈',
        bgColor: 'bg-gray-300',
        textColor: 'text-black',
        borderColor: 'border-gray-400',
        glow: 'shadow-[0_0_15px_rgba(156,163,175,0.5)]',
        pulse: '',
      };
    }
    if (rank === 3) {
      return {
        emoji: '🥉',
        bgColor: 'bg-orange-400',
        textColor: 'text-black',
        borderColor: 'border-orange-500',
        glow: 'shadow-[0_0_15px_rgba(251,146,60,0.5)]',
        pulse: '',
      };
    }
    if (rank <= 10) {
      return {
        emoji: '⭐',
        bgColor: 'bg-primary',
        textColor: 'text-primary-foreground',
        borderColor: 'border-primary-active',
        glow: 'shadow-[0_0_10px_rgba(67,56,202,0.4)]',
        pulse: '',
      };
    }
    if (rank <= 100) {
      return {
        emoji: '🏆',
        bgColor: 'bg-accent',
        textColor: 'text-accent-foreground',
        borderColor: 'border-primary',
        glow: '',
        pulse: '',
      };
    }
    return {
      emoji: '',
      bgColor: 'bg-background-secondary',
      textColor: 'text-foreground',
      borderColor: 'border-border',
      glow: '',
      pulse: '',
    };
  };

  const config = getBadgeConfig();

  if (rank > 100 && !config.emoji) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center',
          'w-8 h-8',
          'bg-background-secondary',
          'text-foreground',
          'border-neobrutal',
          'font-bold',
          'text-sm',
          'rounded-none',
          className
        )}
      >
        {rank}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'w-10 h-10 sm:w-12 sm:h-12',
        config.bgColor,
        config.textColor,
        'border-neobrutal-thick',
        config.borderColor,
        'font-bold',
        'text-lg sm:text-xl',
        'rounded-none',
        config.glow,
        config.pulse,
        'transition-all',
        'hover:scale-110',
        className
      )}
      title={`Rank #${rank}`}
    >
      {config.emoji || rank}
    </span>
  );
}


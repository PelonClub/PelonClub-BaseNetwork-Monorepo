import { FaTwitter, FaDiscord, FaGithub } from 'react-icons/fa';
import { cn } from '@/lib/utils';

interface SocialIconsProps {
  className?: string;
}

export default function SocialIcons({ className }: SocialIconsProps) {
  const socialLinks = [
    {
      name: 'Twitter',
      url: 'https://twitter.com',
      icon: FaTwitter,
    },
    {
      name: 'Discord',
      url: 'https://discord.com',
      icon: FaDiscord,
    },
    {
      name: 'GitHub',
      url: 'https://github.com',
      icon: FaGithub,
    },
  ];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {socialLinks.map((social) => {
        const Icon = social.icon;
        return (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="
              bg-background-secondary
              text-foreground
              border-neobrutal
              shadow-neobrutal-sm
              p-2
              rounded-none
              hover:bg-primary
              hover:text-primary-foreground
              active:bg-primary-active
            active:shadow-none
            active:translate-x-[2px]
            active:translate-y-[2px]
            transition-none
            "
            aria-label={social.name}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>
        );
      })}
    </div>
  );
}


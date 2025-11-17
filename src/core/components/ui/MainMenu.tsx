'use client';

import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';

import { LightbulbIcon } from '@/core/components/icons/LightbulbIcon';
import { MenuIcon } from '@/core/components/icons/MenuIcon';
import { MoonIcon } from '@/core/components/icons/MoonIcon';
import { SignOutIcon } from '@/core/components/icons/SignOutIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/core/components/ui/DropdownMenu';
import { cn } from '@/core/utils';
import { useSessionClient } from '@/core/features/auth/hooks/useSessionClient';
import { useMemo } from 'react';

type MainMenuProps = {
  className?: string;
};

const MainMenu = ({ className }: MainMenuProps) => {
  const { session } = useSessionClient();
  const { setTheme, theme } = useTheme();

  const userData = useMemo(() => {
    if (!session) return null;

    return {
      email: session.user.email,
      name: session.user.name,
    };
  }, [session]);

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const handleSignOut = () => {
    signOut();
  };

  const themeIcon =
    theme === 'light' ? (
      <MoonIcon className="text-icon" />
    ) : (
      <LightbulbIcon className="text-icon" />
    );

  return (
    <div className={cn('main-menu h-6', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MenuIcon className="icon--action" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <div className="cursor-default px-4 py-2">
            {userData?.name ? (
              <div className="text-lg font-bold text-accent">
                {userData.name}
              </div>
            ) : null}
            {userData ? (
              <div className="text-sm text-muted">{userData.email}</div>
            ) : null}
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleToggleTheme}>
            {themeIcon}
            {theme === 'light' ? 'Dark' : 'Light'} theme
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleSignOut}>
            <SignOutIcon className="text-icon flip-x" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

MainMenu.displayName = 'MainMenu';

export default MainMenu;

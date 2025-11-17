'use client';

import { useRouter } from 'next/navigation';

import { FolderElement } from '@/core/components/images/FolderElement';
import { folderColorMap } from '@/core/features/note/maps';
import { FolderItem as TFolderItem } from '@/core/features/note/types';
import { Theme } from '@/core/types';
import { cn } from '@/core/utils';
import {
  Bookmark,
  Brain,
  Lightbulb,
  Shapes,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

interface FolderListProps extends TFolderItem {
  theme: Theme;
  activeFolderId?: string;
  small?: boolean;
}

const FolderItem = ({
  id,
  color,
  // tags,
  // timestamp,
  small,
  title,
  theme,
  activeFolderId,
}: FolderListProps) => {
  const router = useRouter();
  const [folderIconEl, setFolderIconEl] = useState<ReactNode | null>(null);

  const colorGroup = folderColorMap.get(color) || {
    light: '#99a1af',
    dark: '#4a5565',
  };
  const backgroundColor = colorGroup[theme];

  const handleClick = () => {
    router.push(`/folder/${id}`);
  };

  // Init folder icon
  useEffect(() => {
    (async () => {
      switch (title) {
        case 'AI':
          setFolderIconEl(<Sparkles size={16} />);
          break;
        case 'Books':
          setFolderIconEl(<Bookmark size={16} />);
          break;
        case 'Dev':
          setFolderIconEl(<Terminal size={16} />);
          break;
        case 'Ideas':
          setFolderIconEl(<Lightbulb size={16} />);
          break;
        case 'Mind':
          setFolderIconEl(<Brain size={16} />);
          break;
        case 'Misc':
          setFolderIconEl(<Shapes size={16} />);
          break;
        default:
          setFolderIconEl(null);
      }
    })();
  }, [title]);

  return (
    <div
      onClick={handleClick}
      className={cn(
        'cursor-pointer select-none',
        small
          ? 'flex items-center hover:bg-card rounded-full pl-2 pr-2.5 py-1 trans-c'
          : 'w-15.75',
        small && activeFolderId === id && 'bg-card pointer-events-none'
      )}
    >
      {small ? (
        // Colored circle
        <div
          className="w-2.5 h-2.5 rounded-full mr-1 trans-c"
          style={{ backgroundColor }}
        ></div>
      ) : (
        // Folder
        <div
          className="relative mb-2 overflow-hidden h-10 rounded-sm trans-c"
          style={{ backgroundColor }}
        >
          {folderIconEl && (
            <div className="fade absolute left-2.5 bottom-2.5 text-white dark:text-white/80">
              {folderIconEl}
            </div>
          )}
          <div className="absolute top-0 right-0 opacity-20 dark:opacity-30 trans-o">
            <FolderElement />
          </div>
        </div>
      )}

      <div
        className="text-xs font-semibold tracking-wider text-center truncate trans-c"
        title={small ? '' : title}
      >
        {title}
      </div>
    </div>
  );
};

export default FolderItem;

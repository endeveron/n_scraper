import { useState } from 'react';

import { FolderArrowIcon } from '@/core/components/icons/FolderArrowIcon';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/core/components/ui/Command';
import LoadingIcon from '@/core/components/ui/LoadingIcon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/core/components/ui/Popover';
import { FolderItem, TargetFolderData } from '@/core/features/note/types';

interface MoveNoteDropdownProps {
  currentFolderId: string;
  folders: FolderItem[];
  loading: boolean;
  onMoveNote: (args: TargetFolderData) => void;
}

const MIN_FOLDERS_TO_SHOW_SEARCH = 8;

export function MoveNoteDropdown({
  currentFolderId,
  folders,
  loading,
  onMoveNote,
}: MoveNoteDropdownProps) {
  const [open, setOpen] = useState(false);

  // Filter out the current folder from the list
  const availableFolders = [...folders]
    .filter((folder) => folder.id !== currentFolderId)
    .sort((a, b) => a.title.localeCompare(b.title));

  const handleSelectFolder = (targetFolderData: TargetFolderData) => {
    onMoveNote(targetFolderData);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="w-6 h-6 flex-center">
          {loading ? (
            <LoadingIcon className="scale-80" />
          ) : (
            <button
              className="icon--action"
              aria-label="Move note to folder"
              title="Move note to folder"
            >
              <FolderArrowIcon />
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="mt-2 w-40 p-0" align="start">
        <Command>
          {availableFolders.length >= MIN_FOLDERS_TO_SHOW_SEARCH && (
            <CommandInput placeholder="Search folder..." className="h-9" />
          )}
          <CommandList>
            <CommandEmpty>No folders found.</CommandEmpty>
            <CommandGroup>
              {availableFolders.map((folder) => (
                <CommandItem
                  key={folder.id}
                  value={folder.title}
                  onSelect={() =>
                    handleSelectFolder({
                      folderId: folder.id,
                      folderTitle: folder.title,
                    })
                  }
                  className="cursor-pointer"
                >
                  <span className="truncate">{folder.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

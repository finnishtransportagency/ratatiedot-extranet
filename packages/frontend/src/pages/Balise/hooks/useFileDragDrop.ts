import { useCallback, useState } from 'react';

/**
 * Hook for managing drag-and-drop file uploads with support for directories
 * and recursive file reading
 */
export const useFileDragDrop = (onFilesDropped: (files: File[]) => void) => {
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Recursively reads all files from a directory entry
   */
  const readDirectory = useCallback(async (entry: FileSystemDirectoryEntry): Promise<File[]> => {
    const files: File[] = [];
    const reader = entry.createReader();

    return new Promise((resolve) => {
      const readEntries = () => {
        reader.readEntries(async (entries) => {
          if (entries.length === 0) {
            resolve(files);
            return;
          }

          for (const entry of entries) {
            if (entry.isFile) {
              const fileEntry = entry as FileSystemFileEntry;
              const file = await new Promise<File>((resolve) => {
                fileEntry.file(resolve);
              });
              files.push(file);
            } else if (entry.isDirectory) {
              const dirFiles = await readDirectory(entry as FileSystemDirectoryEntry);
              files.push(...dirFiles);
            }
          }

          // Read more entries (needed for directories with many files)
          readEntries();
        });
      };

      readEntries();
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const items = Array.from(e.dataTransfer.items);
      const allFiles: File[] = [];

      // Process all dropped items
      for (const item of items) {
        if (item.kind !== 'file') continue;

        const entry = item.webkitGetAsEntry();

        if (!entry) {
          // Fallback for browsers that don't support webkitGetAsEntry
          const file = item.getAsFile();
          if (file) allFiles.push(file);
          continue;
        }

        if (entry.isFile) {
          const file = item.getAsFile();
          if (file) allFiles.push(file);
          continue;
        }

        if (entry.isDirectory) {
          // Recursively read all files from the directory
          const dirFiles = await readDirectory(entry as FileSystemDirectoryEntry);
          allFiles.push(...dirFiles);
        }
      }

      onFilesDropped(allFiles);
    },
    [onFilesDropped, readDirectory],
  );

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};

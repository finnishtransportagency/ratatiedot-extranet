import JSZip from 'jszip';

/**
 * Triggers a file download in the browser.
 * @param url The URL to download the file from.
 * @param filename The desired name for the downloaded file.
 */
export const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Downloads a blob as a file.
 * @param blob The blob to download.
 * @param filename The desired name for the downloaded file.
 */
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  downloadFile(url, filename);
  URL.revokeObjectURL(url);
};

/**
 * Download all files for a balise (sequentially to avoid browser blocking)
 * @param baliseId The balise ID
 * @param files Array of filenames to download
 * @param version Optional version number to download from (defaults to current)
 */
export const downloadBaliseFiles = async (baliseId: number, files: string[], version?: number): Promise<void> => {
  for (const filename of files) {
    try {
      // Get presigned URL from backend
      const url = version
        ? `/api/balise/${baliseId}/download?fileName=${encodeURIComponent(filename)}&version=${version}`
        : `/api/balise/${baliseId}/download?fileName=${encodeURIComponent(filename)}`;

      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Failed to get download URL for ${filename}:`, response.statusText);
        continue;
      }

      const data = await response.json();
      downloadFile(data.downloadUrl, filename);

      // Small delay to avoid triggering popup blockers
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error downloading ${filename}:`, error);
    }
  }
};

/**
 * Download files from multiple balises as a single zip file.
 * Fetches all files in parallel, bundles them into a zip, and triggers download.
 * @param balises Array of {baliseId, files}
 */
export const downloadMultipleBaliseFiles = async (
  balises: Array<{ baliseId: number; files: string[] }>,
): Promise<void> => {
  const zip = new JSZip();

  // Collect all file fetch promises
  const fetchPromises: Promise<{ folder: string; filename: string; blob: Blob } | null>[] = [];

  for (const balise of balises) {
    const folderName = `balise_${balise.baliseId}`;

    for (const filename of balise.files) {
      const promise = (async () => {
        try {
          // Use stream mode to get file content directly from backend (avoids CORS with S3 presigned URLs)
          const url = `/api/balise/${balise.baliseId}/download?fileName=${encodeURIComponent(filename)}&stream=true`;
          const response = await fetch(url);

          if (!response.ok) {
            console.error(`Failed to download ${filename}:`, response.statusText);
            return null;
          }

          const blob = await response.blob();
          return { folder: folderName, filename, blob };
        } catch (error) {
          console.error(`Error downloading ${filename}:`, error);
          return null;
        }
      })();

      fetchPromises.push(promise);
    }
  }

  // Wait for all files to be fetched
  const results = await Promise.all(fetchPromises);

  // Add files to zip
  for (const result of results) {
    if (result) {
      zip.folder(result.folder)?.file(result.filename, result.blob);
    }
  }

  // Generate and download zip
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  downloadBlob(zipBlob, `balise_files_${timestamp}.zip`);
};

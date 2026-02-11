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
 * Makes a single request to backend which creates the zip server-side.
 * @param balises Array of {baliseId, files}
 */
export const downloadMultipleBaliseFiles = async (
  balises: Array<{ baliseId: number; files: string[] }>,
): Promise<void> => {
  const response = await fetch('/api/balise/bulk-download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ balises }),
  });

  if (!response.ok) {
    throw new Error(`Bulk download failed: ${response.statusText}`);
  }

  const blob = await response.blob();
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  downloadBlob(blob, `balise_files_${timestamp}.zip`);
};

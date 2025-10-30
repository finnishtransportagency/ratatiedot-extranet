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
 * Download files from multiple balises
 * @param balises Array of {baliseId, files}
 */
export const downloadMultipleBaliseFiles = async (
  balises: Array<{ baliseId: number; files: string[] }>,
): Promise<void> => {
  for (const balise of balises) {
    await downloadBaliseFiles(balise.baliseId, balise.files);
  }
};

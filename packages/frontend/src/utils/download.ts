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
 * Download files for a single balise using presigned URLs.
 * Downloads each file type for the balise's version.
 * @param baliseId The balise secondary ID
 * @param fileTypes Array of filenames to download
 * @param version Optional version number to download from (defaults to official version)
 */
export const downloadSingleBaliseFiles = async (
  baliseId: number,
  fileTypes: string[],
  version?: number,
): Promise<void> => {
  for (const filename of fileTypes) {
    try {
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
 * Backend determines which files to include based on each balise's official version.
 * @param baliseIds Array of balise IDs to download
 */
export const downloadMultipleBaliseFiles = async (baliseIds: number[]): Promise<void> => {
  const response = await fetch('/api/balise/bulk-download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baliseIds }),
  });

  if (!response.ok) {
    throw new Error(`Bulk download failed: ${response.statusText}`);
  }

  const blob = await response.blob();
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  downloadBlob(blob, `Baliisit_${timestamp}.zip`);
};

// Threshold for using bulk download (zip) vs individual downloads
const BULK_DOWNLOAD_THRESHOLD = 3;

/**
 * Download function that chooses between individual and bulk download.
 * Uses individual downloads for 3 or fewer balises, bulk (zip) for more.
 * @param balises Array of balise data objects with secondaryId, fileTypes, and optional version
 */
export const downloadBaliseFiles = async (
  balises: Array<{ secondaryId: number; fileTypes: string[]; version?: number }>,
): Promise<void> => {
  if (balises.length === 0) return;

  if (balises.length <= BULK_DOWNLOAD_THRESHOLD) {
    // Download each balise's files individually
    for (const balise of balises) {
      await downloadSingleBaliseFiles(balise.secondaryId, balise.fileTypes, balise.version);
    }
  } else {
    // Use bulk download for more than threshold
    const baliseIds = balises.map((b) => b.secondaryId);
    await downloadMultipleBaliseFiles(baliseIds);
  }
};

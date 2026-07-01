/**
 * Converts a Google Drive share link into an embeddable /preview URL.
 * Handles both formats:
 *   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *   https://drive.google.com/open?id=FILE_ID
 */
export function toDriveEmbedUrl(url: string): string | null {
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (!fileIdMatch) return null;
  return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
}
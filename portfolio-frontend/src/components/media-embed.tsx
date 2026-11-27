import { toDriveEmbedUrl } from "@/lib/api";

/** Google Drive links become an embedded player; direct video files use <video>. */
export function MediaEmbed({ url, title }: { url: string; title: string }) {
  const driveUrl = toDriveEmbedUrl(url);
  if (driveUrl) {
    return (
      <div className="media-frame">
        <iframe src={driveUrl} title={title} allow="autoplay; fullscreen" allowFullScreen loading="lazy" />
      </div>
    );
  }
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return (
      <div className="media-frame">
        <video src={url} controls preload="metadata" title={title} />
      </div>
    );
  }
  return (
    <a className="text-link" href={url} target="_blank" rel="noreferrer">
      Open {title}
    </a>
  );
}

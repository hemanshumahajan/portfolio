import { useEffect } from "react";

/**
 * Sets the document title and meta description for the current page,
 * and restores the site-wide defaults on unmount. Avoids pulling in
 * react-helmet-async for what's currently just two dynamic routes.
 */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    let descTag: HTMLMetaElement | null = null;
    let prevDescription: string | null = null;

    if (description) {
      descTag = document.querySelector('meta[name="description"]');
      if (descTag) {
        prevDescription = descTag.getAttribute("content");
        descTag.setAttribute("content", description);
      }
    }

    return () => {
      document.title = prevTitle;
      if (descTag && prevDescription !== null) {
        descTag.setAttribute("content", prevDescription);
      }
    };
  }, [title, description]);
}
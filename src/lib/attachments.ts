export interface AttachmentAnnotation {
  id: string;
  /** 0-1 normalized x coordinate (0 = left, 1 = right) */
  x: number;
  /** 0-1 normalized y coordinate (0 = top, 1 = bottom) */
  y: number;
  comment: string;
}

export interface Attachment {
  url: string;
  name?: string;
  mime?: string;
  annotations?: AttachmentAnnotation[];
}

/**
 * Robust parser for the `attachments` JSON column.
 * Handles legacy format (array of url strings) and new format
 * (array of { url, ... }) transparently.
 */
export function parseAttachments(raw: string | null | undefined): Attachment[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .map((item): Attachment | null => {
        if (typeof item === "string") return { url: item };
        if (item && typeof item === "object" && typeof item.url === "string") {
          return {
            url: item.url,
            name: typeof item.name === "string" ? item.name : undefined,
            mime: typeof item.mime === "string" ? item.mime : undefined,
            annotations: Array.isArray(item.annotations)
              ? item.annotations
                  .filter(
                    (a: unknown): a is AttachmentAnnotation =>
                      typeof a === "object" &&
                      a !== null &&
                      typeof (a as AttachmentAnnotation).id === "string" &&
                      typeof (a as AttachmentAnnotation).x === "number" &&
                      typeof (a as AttachmentAnnotation).y === "number" &&
                      typeof (a as AttachmentAnnotation).comment === "string"
                  )
              : undefined,
          };
        }
        return null;
      })
      .filter((a): a is Attachment => a !== null);
  } catch {
    return [];
  }
}

export function serializeAttachments(atts: Attachment[]): string {
  return JSON.stringify(atts);
}

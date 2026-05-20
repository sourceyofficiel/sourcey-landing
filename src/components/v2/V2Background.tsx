/**
 * V2Background — Grid pattern aux extrémités + 2 radial blue blobs.
 *
 * Comportement :
 *   - Fond blanc uniforme
 *   - Grille visible UNIQUEMENT en haut et en bas (mask-image gradient)
 *   - 2 blobs bleus radiaux (top-right + bottom-left) pour la couleur
 *
 * Le mask `linear-gradient(to bottom, black 0%, transparent 20%, transparent 80%, black 100%)`
 * rend la grille opaque aux 20 premiers et derniers % puis transparente au milieu.
 */
export function V2Background() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-hidden bg-white"
    >
      {/* Grid pattern — masked to show only at top and bottom */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ececec 1px, transparent 1px),
            linear-gradient(to bottom, #ececec 1px, transparent 1px)
          `,
          backgroundSize: "1.5rem 1.5rem",
          maskImage:
            "linear-gradient(to bottom, black 0%, transparent 18%, transparent 82%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, transparent 18%, transparent 82%, black 100%)",
        }}
      />

      {/* Blob #1 — top-right (smaller on mobile, larger on desktop) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_320px_at_100%_120px,#dbeafe,transparent)] md:bg-[radial-gradient(circle_800px_at_100%_200px,#dbeafe,transparent)]" />

      {/* Blob #2 — bottom-left (covers footer area) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_280px_at_0%_100%,#bfdbfe,transparent)] md:bg-[radial-gradient(circle_700px_at_0%_100%,#bfdbfe,transparent)]" />
    </div>
  );
}

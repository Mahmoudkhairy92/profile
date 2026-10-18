/** Attribute marking fixed elements (e.g. the navbar) that cover the top of the viewport. */
export const FIXED_HEADER_ATTRIBUTE = 'data-fixed-header';

const GAP_PX = 16;

/**
 * Vertical offset for anchor scrolling: the bottom edge of the fixed header elements currently
 * rendered, plus a small gap, so the scroll target is not hidden behind them. Uses layout
 * geometry (offsetTop/offsetHeight), which ignores transforms, so a header that is still
 * animating into place (the navbar slides in) is measured at its final position.
 */
export function fixedHeaderOffset(doc: Document): number {
  let bottom = 0;
  doc.querySelectorAll<HTMLElement>(`[${FIXED_HEADER_ATTRIBUTE}]`).forEach(element => {
    bottom = Math.max(bottom, element.offsetTop + element.offsetHeight);
  });
  return bottom + GAP_PX;
}

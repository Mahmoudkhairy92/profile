import { FIXED_HEADER_ATTRIBUTE, fixedHeaderOffset } from './fixed-header-offset';

function addElement(top: number, height: number, fixedHeader = true): HTMLElement {
  const element = document.createElement('div');
  if (fixedHeader) {
    element.setAttribute(FIXED_HEADER_ATTRIBUTE, '');
  }
  Object.defineProperty(element, 'offsetTop', { value: top });
  Object.defineProperty(element, 'offsetHeight', { value: height });
  document.body.appendChild(element);
  return element;
}

describe('fixedHeaderOffset', () => {
  afterEach(() => {
    document.body.querySelectorAll('div').forEach(element => element.remove());
  });

  it('should return only the gap when no fixed header is rendered', () => {
    expect(fixedHeaderOffset(document)).toBe(16);
  });

  it('should clear the lowest fixed header element, e.g. navbar plus banner', () => {
    addElement(0, 70);
    addElement(70, 50);

    expect(fixedHeaderOffset(document)).toBe(136);
  });

  it('should ignore elements that are not marked as fixed headers', () => {
    addElement(0, 70);
    addElement(0, 500, false);

    expect(fixedHeaderOffset(document)).toBe(86);
  });
});

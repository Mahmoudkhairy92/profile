import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root',
})
export class ScreenshotService {
  /**
   * Capture a screenshot of a specific HTML element
   * @param element The HTML element to capture
   * @param filename Optional filename for download
   * @returns Promise with the data URL of the screenshot
   */
  async captureElement(element: HTMLElement, filename?: string): Promise<string> {
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#0a192f',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL('image/png');

      // Optionally download the image
      if (filename) {
        this.downloadImage(dataUrl, filename);
      }

      return dataUrl;
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      throw error;
    }
  }

  /**
   * Download an image from a data URL
   */
  private downloadImage(dataUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  /**
   * Copy image to clipboard (modern browsers)
   */
  async copyToClipboard(dataUrl: string): Promise<void> {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw error;
    }
  }
}

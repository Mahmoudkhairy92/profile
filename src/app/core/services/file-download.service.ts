import { Injectable, inject } from '@angular/core';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FileDownloadService {
  private readonly location = inject(Location);

  /**
   * Downloads the CV file
   */
  downloadCV(): void {
    const link = document.createElement('a');
    // Use Location service to prepend base href correctly
    // prepareExternalUrl handles the base href automatically
    const filePath = 'assets/files/Mahmoud_Khairy_Automation_Engineer.pdf';
    link.href = this.location.prepareExternalUrl(filePath);
    link.download = 'Mahmoud_Khairy_Automation_Engineer.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

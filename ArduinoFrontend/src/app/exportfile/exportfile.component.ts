import { Component, Inject, OnInit } from '@angular/core';
import { Download, ImageType } from '../Libs/Download';
import { Title } from '@angular/platform-browser';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Workspace } from '../Libs/Workspace';

/**
 * Declare window so that custom created function don't throw error
 */
declare var window;

/**
 * Class For Export Dialog Component
 */
@Component({
  selector: 'app-exportfile',
  templateUrl: './exportfile.component.html',
  styleUrls: ['./exportfile.component.css']
})
export class ExportfileComponent {
  /**
   * Constructor For Export Dialog
   * @param title Project Title
   * @param dialog Material Dialog Reference
   */
  constructor(private title: Title, private dialog: MatDialogRef<ExportfileComponent>, @Inject(MAT_DIALOG_DATA) public data: any ) { }
  /**
   * Export Workspace to image
   * @param svg SVG Radio element
   * @param png PNG Radio element
   * @param jpg JPG Radio element
   * @param esim ESIM Radio element
   */
  Export(svg, png, jpg, esim) {
    // Show Loading animation
    window.showLoading();
    if (svg.checked) {
      Download.ExportImage(ImageType.SVG)
        .then(v => {
          Download.DownloadText(this.title.getTitle() + '.svg', [v], {
            type: 'data:image/svg+xml;charset=utf-8;'
          });
          window.hideLoading();
        });
    } else if (png.checked) {
      Download.ExportImage(ImageType.PNG)
        .then(v => {
          Download.DownloadImage(v, this.title.getTitle(), ImageType.PNG);
          window.hideLoading();
        });
    } else if (jpg.checked) {
      Download.ExportImage(ImageType.JPG)
        .then(v => {
          Download.DownloadImage(v, this.title.getTitle(), ImageType.JPG);
          window.hideLoading();
        });
    }
    else if (esim.checked) {
      this.saveAsESIMFile()
      window.hideLoading();
    } else {
      // Hide loading animation
      window.hideLoading();
    }
    // Close Dialog
    this.dialog.close();
  }

  saveAsESIMFile() {
    let fileData = {
      canvas: {
        x: Workspace.translateX,
        y: Workspace.translateY,
        scale: Workspace.scale
      },
      project: {
        id: Date.now(),
        name: this.data.project.name,
        description: this.data.project.description,
        created_at: Date.now(),
        updated_at: Date.now()
      }
    };
    for (const key in window.scope) {
      // if atleast one component is present
      if (window.scope[key] && window.scope[key].length > 0) {
        fileData[key] = [];
        // Add the component to the save object
        for (const item of window.scope[key]) {
          if (item.save) {
            fileData[key].push(item.save());
          }
        }
      }
    }
    console.log(fileData);
    const filename = this.data.project.name + '.esim';
    const fileJSON = JSON.stringify(fileData);
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileJSON));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}
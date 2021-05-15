import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileHandlingService {

  fileInfo: Blob;

  constructor() { }

  setFileInfo(fileInfo) {
    this.fileInfo = fileInfo;
  }

  getFileInfo() {
    return this.fileInfo;
  }

}

# Task 9 - Import and export project
The task was to implement functionality to save the circuit offline in some file format and to load the same circuit using the file back.
## Summary
First, I focused on `exporting` the project. Reading the code of Workspace.ts and components - exportfile, dashboard and simulation from Arduino Frontend cleared some of my doubts. SaveProject() and Load() functions from Workspace.ts made the task more easier. In `importing` the project, challenging part for me, was to set up the file uploading part. Reading docs and debugging the code helped a lot.

The Export File option in simulator component had mechanism to take user input regarding format of downloadable file. I added an option for downloading `.esim` file which contains JSON format of the code and electronic components used. The generation of .esim file is handled by saveAsESIMFile().

Since, the changes in the workspace were stored in `scope` property of `window` object. The saveAsESIMFile() extracts the required data from `window['scope']` and converts it into string. The file is downloaded by creating a dummy anchor element which is removed when function ends. I didn't use the SaveProject() from Workspace.ts as some other stuff in that function was not important.

User has to go to dashboard and select the project file(`.esim`) to be uploaded. After file gets uploaded, it is opened in simulator. `file-handling.service.ts` and `loadESIMFile()` in dashboard component were created to pass the file data from input tag in dashboard to simulator component.

Imported File gets automatically saved for the first time, once it opens in the simulator. loadESIMFile() is used to read the components from the uploaded file. The pre-written function Load() in Workspace.ts is used in loadESIMFile() for loading the components on simulator.

I didn't use any new package/technology.

Files - `exportfile.component.ts`, `exportfile.component.html`, `simulator.component.ts` and `simulator.component.ts` were updated heavily.

## Demo of importing and exporting the ``.esim`` file.
![Arduino Demo](demo/Arduino.gif)
### Demo .mov file
![Arduino Demo](demo/Arduino.mov)
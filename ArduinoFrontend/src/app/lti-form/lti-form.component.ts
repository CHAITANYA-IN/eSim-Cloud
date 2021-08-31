import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../api.service';
import { AlertService } from '../alert/alert-service/alert.service';
import { Login } from '../Libs/Login';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { SaveOnline } from '../Libs/SaveOnline';


export interface circuit {
  id: number;
  branch: string;
  version: string;
  lti: string;
  image: string;
  description: string;
  save_id: string;
  save_time: string;
}

export interface LTIDetails {
  secret_key: string;
  consumer_key: string;
  config_url: string;
  configExists: boolean;
  consumerError: string;
  score: number;
  initial_schematic: number;
  model_schematic: number;
  test_case: string;
  scored: boolean;
  id: string;
  sim_params: string[];
}

@Component({
  selector: 'lti-form',
  templateUrl: './lti-form.component.html',
  styleUrls: ['./lti-form.component.css']
})
export class LTIFormComponent implements OnInit {

  constructor(
    public api: ApiService,
    private router: Router,
    private aroute: ActivatedRoute,
  ) {
  }

  @ViewChild('modaltrigger') modaltrigger: ElementRef;
  ltiAssignmentType = "";
  hide: boolean = true;
  modelCircuit: circuit;
  studentCircuit: circuit;
  circuit_id: any = null; // strongly type it to string
  branch: string = '';
  version: string = '';
  lti_id: string = null; // strongly type it to string
  copyTooltip: boolean = false;
  circuits: any[];
  testCases: any[];
  configUrl: string = '';
  details: LTIDetails = {
    secret_key: '',
    consumer_key: '',
    config_url: '',
    configExists: false,
    consumerError: '',
    score: 0,
    initial_schematic: 0,
    model_schematic: 0,
    test_case: null,
    scored: false,
    id: '',
    sim_params: [],
  }
  form: FormGroup = new FormGroup({
    consumer_key: new FormControl("", [Validators.required, Validators.minLength(2)]),
    secret_key: new FormControl("", [Validators.required, Validators.minLength(2)]),
    score: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(1)]),
    test_case: new FormControl(''),
    initial_schematic: new FormControl(0, Validators.required),
    scored: new FormControl(true),
  })
  form1: FormGroup = new FormGroup({
    consumer_key: new FormControl("", [Validators.required, Validators.minLength(2)]),
    secret_key: new FormControl("", [Validators.required, Validators.minLength(2)]),
    score: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(1)]),
    test_case: new FormControl(''),
    scored: new FormControl(true),
  })

  ngOnInit() {
    document.documentElement.style.overflow = 'auto';
    document.title = 'LTI | Arduino on Cloud';
    this.aroute.queryParams.subscribe(v => {
      console.log(v);
      // if project id is present and no query parameter then redirect to dashboard
      const token = Login.getToken();
      if (Object.keys(v).length === 0 && this.circuit_id || !token) {
        setTimeout(() => this.router.navigate(['dashboard'])
          , 100);
        return;
      }
      this.circuit_id = v.id;
      this.branch = v.branch;
      this.version = v.version;
      this.lti_id = v.lti;
      this.onClear();
      if (this.lti_id) {
        this.details.id = this.lti_id;
        const token = Login.getToken();

        this.api.existLTIURL(this.circuit_id, token).subscribe(res => {
          if (res['model_schematic'].branch != this.branch || res['model_schematic'].version != this.version) {
            this.router.navigate(
              [],
              {
                relativeTo: this.aroute,
                queryParams: {
                  id: this.circuit_id,
                  branch: res['model_schematic'].branch,
                  version: res['model_schematic'].version,
                  lti: this.lti_id,
                },
              });
          }
          this.modelCircuit = res['model_schematic'];
          this.studentCircuit = res['initial_schematic'];
          res['initial_schematic'] = this.studentCircuit.id;
          res['model_schematic'] = this.modelCircuit.id;
          if (!environment.production) {
            this.modelCircuit['base64_image'] = environment.API_URL + this.modelCircuit['base64_image'];
            this.studentCircuit['base64_image'] = environment.API_URL + this.studentCircuit['base64_image'];
          }
          this.setForm(res);
          const formData = this.ltiAssignmentType === '1' ? this.form1.value : this.form.value;
          this.details = {
            ...formData,
            model_schematic: res['model_schematic'],
            config_url: res['config_url'],
            consumerError: '',
            configExists: true,
          };
          this.getAllVersions();
          this.configUrl = this.details.config_url;
          console.log(this.modelCircuit, this.studentCircuit);
        }, err => {
          if (err.status == 404) {
            this.details.configExists = false;
          }
          console.log(err);
          this.getAllVersions();
        });
      } else {
        this.details.configExists = false;
        this.getAllVersions();
      }
    });
    if (!this.lti_id) {
      this.modaltrigger.nativeElement.click();
    }
  }

  ngAfterViewInit() {
    this.getAllVersions();
    // if (!this.lti_id) {
    //   this.modaltrigger.nativeElement.click();
    // }
  }

  // ngOnChanges() {
  //   if (!this.lti_id) {
  //     this.modaltrigger.nativeElement.click();
  //   }
  // }

  setForm(res: any) {
    if (this.ltiAssignmentType === '1') {
      this.form1.setValue({
        consumer_key: res['consumer_key'],
        secret_key: res['secret_key'],
        score: parseInt(res['score'], 10),
        test_case: res['test_case'],
        scored: res['scored'],
      });
    } else {
      this.form.setValue({
        consumer_key: res['consumer_key'],
        secret_key: res['secret_key'],
        score: parseInt(res['score'], 10),
        initial_schematic: parseInt(res['initial_schematic'], 10),
        test_case: res['test_case'],
        scored: res['scored'],
      });
    }
  }

  ontestCaseSelectChanges(event) {
    console.log(event);
  }

  getStudentSimulation(value, callback) {
    this.studentCircuit = value ? this.circuits.filter(v => v.id === parseInt(value, 10))[0] : undefined;
    callback();
  }

  getModelSimulation(value, callback) {
    this.modelCircuit = value ? this.circuits.filter(v => v.id === parseInt(value, 10))[0] : undefined;
    callback();
  }

  onModelSelectChanges(event) {
    this.getModelSimulation(event.value, () => console.log(this.studentCircuit));
  }

  onSelectChanges(event) {
    this.getStudentSimulation(event.value, () => console.log(this.studentCircuit));
  }

  onSubmit() {
    const formValidity = this.ltiAssignmentType === '1' ? this.form1.valid : this.form.valid
    if (formValidity) {
      if (!this.details.scored) {
        this.details.score = null;
      }
      const formDetails = this.ltiAssignmentType === '1' ? this.form1.value : this.form.value
      this.details = {
        ...this.details,
        ...formDetails,
        scored: formDetails.scored ? formDetails.scored : false,
        initial_schematic: this.studentCircuit.id,
        model_schematic: this.modelCircuit.id,
        test_case: null,
        sim_params: [],
        configExists: false,
      }
      const token = Login.getToken();
      if (token) {
        let data = { ...this.details };
        delete data['configExists']
        delete data['config_url']
        delete data['consumerError']
        delete data['id']
        console.log(data);
        this.api.saveLTIDetails(token, data).subscribe(res => {
          console.log(res);
          this.setForm(res);
          const formDetails = this.ltiAssignmentType === '1' ? this.form1.value : this.form.value
          this.details = {
            ...formDetails,
            initial_schematic: res['initial_schematic'],
            id: res['id'],
            model_schematic: res['model_schematic'],
            config_url: res['config_url'],
            configExists: true,
            consumerError: '',
          }
          this.lti_id = res['id'];
          // this.studentCircuit = res['initial_schematic'];
          // this.modelCircuit = res['model_schematic'];
          this.configUrl = this.details.config_url;
          console.log(res);
          console.log(this.configUrl);
          this.router.navigate(
            [],
            {
              relativeTo: this.aroute,
              queryParams: {
                id: this.modelCircuit.save_id,
                branch: this.modelCircuit.branch,
                version: this.modelCircuit.version,
                lti: this.lti_id,
              },
            });
        }, err => {
          console.log(err);
          this.setConsumerError(err);
          this.details.configExists = false;
        })
      }
    }
  }

  onDelete() {
    const token = Login.getToken();
    if (token) {
      this.api.removeLTIDetails(this.details.model_schematic, token).subscribe(res => {
        console.log(res);
        this.details = {
          ...this.details,
          secret_key: '',
          consumer_key: '',
          config_url: '',
          configExists: false,
          consumerError: '',
          score: 0,
          test_case: null,
          sim_params: [],
          scored: false,
          id: '',
        }
        this.studentCircuit = undefined;
        this.configUrl = this.details.config_url;
        this.router.navigate(
          [],
          {
            relativeTo: this.aroute,
            queryParams: {
              id: this.modelCircuit.save_id,
              branch: this.modelCircuit.branch,
              version: this.modelCircuit.version,
            },
          });
      }, err => {
        console.log(err);
        this.setConsumerError(err);
        this.details.configExists = true;
      })
    }
  }

  onUpdate() {
    const token = Login.getToken();
    const formValidity = this.ltiAssignmentType === '1' ? this.form1.valid : this.form.valid
    if (!formValidity && !token) {
      return;
    }
    const formDetails = this.ltiAssignmentType === '1' ? this.form1.value : this.form.value
    this.details = {
      ...this.details,
      ...formDetails,
      id: this.lti_id,
      configExists: this.details.configExists, // false,
      model_schematic: this.details.model_schematic,
      test_case: null,
      sim_params: [],
    }
    if (!this.details.scored) {
      this.details.score = null;
    }
    let data = { ...this.details };
    delete data['configExists']
    delete data['config_url']
    delete data['consumerError']
    console.log(data);
    this.api.updateLTIDetails(token, data).subscribe(res => {
      console.log(res);
      this.setForm(res);
      const formDetails = this.ltiAssignmentType === '1' ? this.form1.value : this.form.value
      this.details = {
        ...this.details,
        ...formDetails,
        // scored: this.details.scored ? this.details.scored : false,
        // initial_schematic: parseInt(res['initial_schematic'], 10),
        id: res['id'] ? res['id'] : this.lti_id,
        model_schematic: parseInt(res['model_schematic'], 10),
        config_url: res['config_url'] ? res['config_url'] : this.details.config_url,
        configExists: true,
        consumerError: '',
      }
      this.lti_id = res['id'];
      this.configUrl = this.details.config_url;
      console.log(res);
      console.log(this.configUrl);
      this.router.navigate(
        [],
        {
          relativeTo: this.aroute,
          queryParams: {
            id: this.modelCircuit.save_id,
            branch: this.modelCircuit.branch,
            version: this.modelCircuit.version,
            lti: this.lti_id,
          },
        });
    }, err => {
      console.log(err);
      this.setConsumerError(err);
      // this.details.configExists = false;
    });
  }

  onClear() {
    if (this.ltiAssignmentType === '1') {
      this.form1.reset();
    } else {
      this.form.reset();
    }
  }

  setConsumerError(err) {
    this.details.consumerError = "";
    if (err.error) {
      Object.keys(err.error).forEach(key => {
        this.details.consumerError += `${key}:  `
        for (let i = 0; i < err.error[key].length; i++) {
          this.details.consumerError += err.error[key][i] + '\n';
        }
      });
    }
    else {
      this.details.consumerError = err.message;
    }
  }

  copyURL() {
    let copyUrl: HTMLTextAreaElement = document.querySelector('#lti-url');
    this.copyTooltip = true;
    copyUrl.select();
    copyUrl.setSelectionRange(0, 99999);
    document.execCommand('copy');
  }

  /**
   * Get all variation of project
   */
  getAllVersions() {
    // get Auth token
    const token = Login.getToken();
    if (token) {
      this.api.listAllVersions(this.circuit_id, token).subscribe((v) => {
        this.circuits = v;
        if (this.modelCircuit) {
          this.circuits.filter(v => v.id === this.modelCircuit.id)[0]
        } else {
          this.modelCircuit = this.circuits.filter(v => v.branch === this.branch && v.version === this.version)[0]
        }
        // Splice the model circuit from the retrieved ones.
      });
    } else {
      // if no token is present then show this message
      AlertService.showAlert('Please Login to Continue');
    }
  }

  compareIds(id1, id2) {
    return id1 && id2 && id1 === id2;
  }

  getFormattedDate(date: string) {
    const dateObj = new Date(date);
    return `${dateObj.getDate()}/${dateObj.getMonth()}/${dateObj.getFullYear()} ${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`;
  }

  redirectToLTICreation() {
    this.router.navigate(
      [],
      {
        relativeTo: this.aroute,
        queryParams: {
          id: this.modelCircuit.save_id,
          branch: this.modelCircuit.branch,
          version: this.modelCircuit.version,
        },
      });
  }

  checkAssignmentType() {
    if (!this.lti_id) {
      if (this.ltiAssignmentType === '1') {
        // this.NoCodeOnlyCircuit();
        console.log("No Code");
      } else if (this.ltiAssignmentType === '2') {
        // this.NoCircuitOnlyCode();
        console.log("No Circuit");
      } else if (this.ltiAssignmentType === '0') {
        // this.ChangeBoth();
        console.log("Change Both");
      }
      this.router.navigate(
        [],
        {
          relativeTo: this.aroute,
          queryParams: {
            id: this.modelCircuit.save_id,
            branch: this.modelCircuit.branch,
            version: this.modelCircuit.version,
          },
        });
    }
  }

  ChangeBoth(data, token) {
    this.getAllVersions();
    this.onSubmit();
  }

  NoCircuitOnlyCode(data, token) {
    const saveObj = {
      data_dump: '',
      is_arduino: true,
      description: data.description,
      name: data.name,
      branch: `t${this.ltiAssignmentType}t${Date.now()}`,
      version: SaveOnline.getRandomString(20),
      base64_image: '',
    };
    let dataDump = JSON.parse(data.data_dump);
    console.log(dataDump);
    let newDataDump = {
      'ArduinoUno': dataDump['ArduinoUno'],
    }
    for (var i = 0; i < newDataDump['ArduinoUno'].length; i++) {
      newDataDump['ArduinoUno'][i] = {
        'x': dataDump['ArduinoUno'][i]['x'],
        'y': dataDump['ArduinoUno'][i]['y'],
        'tx': dataDump['ArduinoUno'][i]['tx'],
        'ty': dataDump['ArduinoUno'][i]['ty'],
        'id': dataDump['ArduinoUno'][i]['id'],
        'data': dataDump['ArduinoUno'][i]['data'],
      }
      newDataDump['ArduinoUno'][i]['data'] = {
        'name': newDataDump['ArduinoUno'][i]['data']['name'],
        'code': newDataDump['ArduinoUno'][i]['data']['code'],
      }
    }
    saveObj.data_dump = JSON.stringify(newDataDump);
    this.regenerateImage(saveObj, data['base64_image'], token);
  }

  NoCodeOnlyCircuit(data, token) {
    const saveObj = {
      data_dump: '',
      is_arduino: true,
      description: data.description,
      name: data.name,
      branch: `t${this.ltiAssignmentType}t${Date.now()}`,
      version: SaveOnline.getRandomString(20),
      base64_image: '',
    };
    let dataDump = JSON.parse(data.data_dump);
    console.log(dataDump);
    for (var i = 0; i < dataDump['ArduinoUno'].length; i++) {
      dataDump['ArduinoUno'][i].data.code = "void setup() {\n\t\n}\n\nvoid loop() {\n\t\n}";
    }
    saveObj.data_dump = JSON.stringify(dataDump);
    this.regenerateImage(saveObj, data['base64_image'], token);
  }

  setUpInitialSimulation() {
    const token = Login.getToken();
    if (token && !this.lti_id) {
      this.api.readProject(this.modelCircuit.save_id, this.modelCircuit.branch ? this.modelCircuit.branch : 'master',
        this.modelCircuit.version ? this.modelCircuit.version : SaveOnline.getRandomString(20),
        token).subscribe(async (data: any) => {
          if (this.ltiAssignmentType === '1') {
            this.NoCodeOnlyCircuit(data, token);
          } else if (this.ltiAssignmentType === '2') {
            this.NoCircuitOnlyCode(data, token);
          } else if (this.ltiAssignmentType === '0') {
            this.ChangeBoth(data, token);
          }
        }, err => {
          console.log(err);
        });
    }
  }

  regenerateImage(saveObj, imageData, token) {
    // Getting image data from image url
    console.log(imageData);
    const image = document.createElement('img');
    document.body.appendChild(image);
    image.setAttribute('src', imageData);
    image.setAttribute('visibility', 'hidden');

    image.onload = () => {
      const canvas = document.createElement('canvas');
      document.body.appendChild(canvas);
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.setAttribute('visibility', 'hidden');
      canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
      saveObj.base64_image = canvas.toDataURL();
      console.log(saveObj);
      this.SaveModifiedCircuit(saveObj, token);
      image.parentElement.removeChild(image);
      canvas.parentElement.removeChild(canvas);
    };
  }

  SaveModifiedCircuit(saveObj, token) {
    this.api.updateProject(this.circuit_id, saveObj, token).subscribe(res => {
      this.studentCircuit = {
        id: res['id'],
        branch: res['branch'],
        version: res['version'],
        lti: res['lti_id'],
        image: res['base64_image'],
        description: res['description'],
        save_id: res['save_id'],
        save_time: res['save_time'],
      };
      this.details.initial_schematic = res['id'];
      this.form.patchValue({
        initial_schematic: res['id'],
      });
      console.log(res);
      // Close the modal.
      this.onSubmit();
    }, err => {
      console.log(err);
    });
  }

  getImageUrl(location: string) {
    return environment.API_URL + location;
  }
}
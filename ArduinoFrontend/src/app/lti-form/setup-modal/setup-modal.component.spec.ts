import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupModalComponent } from './setup-modal.component';

describe('SetupModalComponent', () => {
  let component: SetupModalComponent;
  let fixture: ComponentFixture<SetupModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

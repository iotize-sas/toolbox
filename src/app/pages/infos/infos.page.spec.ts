import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfosPage } from './infos.page';
import { of } from 'rxjs';
import { InfosService } from 'src/app/services/infos.service';

describe('InfosPage', () => {
  let component: InfosPage;
  let fixture: ComponentFixture<InfosPage>;
  let infosServiceSpy;

  beforeEach(async(() => {
    let infos = () => {
      return of(
        MOCKED_INFOS
      );
    }
    infosServiceSpy = jasmine.createSpyObj('InfosService', { getInfos: infos() });

    TestBed.configureTestingModule({
      declarations: [InfosPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: InfosService, useValue: infosServiceSpy
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve info on viewWillEnter', async () => {
    component.ionViewWillEnter();
    fixture.detectChanges();
    expect(component.tapInfos).toBe(MOCKED_INFOS);
  });

  it('should display every available info', async () => {
    component.ionViewWillEnter();
    fixture.detectChanges();
    const innerHTML = fixture.debugElement.nativeElement.innerHTML;
    for (let prop in MOCKED_INFOS) {
      expect(innerHTML).toContain(MOCKED_INFOS[prop]);
    }
  })
});

const MOCKED_INFOS = {
  sn: 'testSN',
  model: 'testModel',
  appName: 'testAppName',
  currentProtocol: 'testCurrentProtocol',
  availableProtocols: 'testAvailableProtocols',
  firmwareVersion: 'testFirmwareVersion',
  targetCurrentProtocol: 'testTargetCurrentProtocol',
  targetAvailableProtocol: 'testTargetAvailableProtocol',
  targetFirmwareVersion: 'testTargetFirmwareVersion'
}
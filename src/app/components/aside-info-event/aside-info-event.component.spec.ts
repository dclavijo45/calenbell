import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsideInfoEventComponent } from './aside-info-event.component';

describe('AsideInfoEventComponent', () => {
  let component: AsideInfoEventComponent;
  let fixture: ComponentFixture<AsideInfoEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsideInfoEventComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AsideInfoEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

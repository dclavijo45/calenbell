import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsideInfoComponent } from './aside-info.component';

describe('AsideInfoComponent', () => {
  let component: AsideInfoComponent;
  let fixture: ComponentFixture<AsideInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsideInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AsideInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

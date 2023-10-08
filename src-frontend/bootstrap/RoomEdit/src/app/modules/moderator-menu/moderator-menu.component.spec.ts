import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeratorMenuComponent } from './moderator-menu.component';

describe('ModeratorMenuComponent', () => {
  let component: ModeratorMenuComponent;
  let fixture: ComponentFixture<ModeratorMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModeratorMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModeratorMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverviewContainer } from './overview-container';

describe('OverviewContainer', () => {
  let component: OverviewContainer;
  let fixture: ComponentFixture<OverviewContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverviewContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

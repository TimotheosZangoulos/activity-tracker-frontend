import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartContainer } from './chart-container';

describe('ChartContainer', () => {
  let component: ChartContainer;
  let fixture: ComponentFixture<ChartContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

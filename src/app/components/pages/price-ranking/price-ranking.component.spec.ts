import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceRankingComponent } from './price-ranking.component';

describe('PriceRankingComponent', () => {
  let component: PriceRankingComponent;
  let fixture: ComponentFixture<PriceRankingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PriceRankingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PriceRankingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

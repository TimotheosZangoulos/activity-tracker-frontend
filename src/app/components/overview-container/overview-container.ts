import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-overview-container',
  standalone: true,
  imports: [],
  templateUrl: './overview-container.html',
  styleUrl: './overview-container.css'
})

export class OverviewContainer {
  @Input() value: number = 0;
  @Input() description: string = '';
  @Input() tooltipText: string = '';
}

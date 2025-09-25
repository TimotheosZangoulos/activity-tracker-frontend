import { Component, Input } from '@angular/core';
import { NgxEchartsModule, provideEchartsCore } from 'ngx-echarts';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-chart-container',
  standalone: true,
  imports: [NgxEchartsModule, NgIf],
  providers: [
    provideEchartsCore({
      echarts: () => import('echarts'),
    }),
  ],
  templateUrl: './chart-container.html',
  styleUrls: ['./chart-container.css']
})

export class ChartContainer {
  @Input() options: any;
  @Input() title: string = '';
  @Input() description: string = '';
}

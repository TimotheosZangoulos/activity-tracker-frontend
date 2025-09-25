import { Component, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OverviewContainer } from './components/overview-container/overview-container';
import { ChartContainer } from './components/chart-container/chart-container';
import { ActivityService } from './services/activityService';
import { Activity } from './models/activity.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OverviewContainer, ChartContainer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('activity-tracker');

  activities = signal<Activity[]>([]);
  scatterToggleState = signal<'direct' | 'all'>('direct'); 

  durationStats = {
    totalActivities: 0,
    shorterThanDay: 0,
    shorterThanMonth: 0,
    longerThanMonth: 0
  }

  chartOptions = {
      durationDistributionChartOptions: null as any,
      scatterChartOptions: computed(() => this.prepareScatterChart()),
      timelineChartOptions: null as any,
      pathFinderChartOptions: null as any
  }

  constructor(private activityService: ActivityService) {
    this.loadActivities();
  }
  
  private loadActivities() {
    this.activityService.getActivities().subscribe((data) => {
      this.activities.set(data);
      this.prepareStats();
      this.prepareChartOptions();
    });
  }
  
  private prepareStats() {
    const activities = this.activities();
    this.durationStats.totalActivities = activities.length;
    this.durationStats.shorterThanDay = activities.filter(a => a.duration <= 1).length;
    this.durationStats.shorterThanMonth = activities.filter(a => a.duration > 1 && a.duration < 30).length;
    this.durationStats.longerThanMonth = activities.filter(a => a.duration >= 30).length;
  }

  private prepareChartOptions() {
    this.prepareDurationDistributionChart();
    this.prepareScatterChart();
    this.prepareTimelineChart();
    this.preparePathFinderGraph();
  }

  private prepareDurationDistributionChart() {
    this.chartOptions.durationDistributionChartOptions = {
      tooltip: { trigger: 'item' },
      legend: {
        top:40
      },
      series: [
        {
          name: 'Activity Duration',
          type: 'pie',
          radius: '50%',
          data: [
            { value: this.durationStats.shorterThanDay, name: 'Shorter than a Day' },
            { value: this.durationStats.shorterThanMonth, name: 'Shorter than a Month' },
            { value: this.durationStats.longerThanMonth, name: 'Longer than a Month' }
          ],
          label: { formatter: '{b}: {d}%' },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' }
          }
        }
      ]
    };
  }

  private prepareScatterChart() {
    const toggleMode = this.scatterToggleState();
    const data = this.activities().map(a => [
      toggleMode === 'direct' ? a.directPrerequisites.length : a.allPrerequisites.length,
      toggleMode === 'direct' ? a.directDependencies.length : a.allDependencies.length,
      a.duration
    ]);

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const activity = this.activities()[params.dataIndex];
          return `Activity: ${activity.nodeId}<br>
                  Prerequisites: ${toggleMode === 'direct' ? activity.directPrerequisites.length : activity.allPrerequisites.length}<br>
                  Dependencies: ${toggleMode === 'direct' ? activity.directDependencies.length : activity.allDependencies.length}<br>
                  Duration: ${activity.duration}`;
        }
      },
      grid: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      },
      xAxis: { name: 'Prerequisites', type: 'value', min: 0 },
      yAxis: { name: 'Dependencies', type: 'value', min: 0 },
      series: [{
        type: 'scatter',
        symbolSize: 10,
        data: data
      }]
    };
  }

  private prepareTimelineChart() {
    const activitiesWithDates = this.activities().map(a => ({
      ...a,
      start: new Date(a.startDate),
      end: new Date(a.endDate)
    }));

    // Establish timeline
    const minDate = new Date(Math.min(...activitiesWithDates.map(a => a.start.getTime())));
    const maxDate = new Date(Math.max(...activitiesWithDates.map(a => a.end.getTime())));

    const timeline: string[] = [];
    const counts: number[] = [];

    // Get Monday
    const getWeekStart = (date: Date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = (day + 6) % 7;
      d.setDate(d.getDate() - diff);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    let currentDate = getWeekStart(minDate);
    while (currentDate <= maxDate) {
      timeline.push(currentDate.toISOString().split('T')[0]);

      const endOfCurrentWeek = new Date(currentDate);
      endOfCurrentWeek.setDate(currentDate.getDate() + 6);

      const activeCount = activitiesWithDates.filter(
        a => a.start <= endOfCurrentWeek && a.end >= currentDate
      ).length;
      counts.push(activeCount);

      currentDate.setDate(currentDate.getDate() + 7);
    }

    this.chartOptions.timelineChartOptions = {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      },
      xAxis: {
        type: 'category',
        name: 'Week',
        data: timeline
      },
      yAxis: {
        type: 'value',
        name: 'Active Activities'
      },
      series: [{
        name: 'Active Activities',
        type: 'line',
        smooth: true,
        data: counts
      }]
    };
  }
  
  private preparePathFinderGraph() {
    const nodes = this.activities().map(a => ({
      id: a.nodeId.toString(),
      name: `Act. ${a.nodeId}`,
      value: a.duration,
      label: { show: true }
    }));

    const edges = this.activities().flatMap(a =>
      a.directDependencies.map(dep => ({
        source: a.nodeId.toString(),
        target: dep.toString()
      }))
    );

    this.chartOptions.pathFinderChartOptions = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const activity = this.activities().find(a => a.nodeId.toString() === params.data.id);
          if (!activity) return '';
          return `Activity: ${activity.nodeId}<br>
                  Start: ${new Date(activity.startDate).toLocaleDateString()}<br>
                  End: ${new Date(activity.endDate).toLocaleDateString()}<br>
                  Duration: ${activity.duration}`;
        }
      },
      series: [{
        type: 'graph',
        layout: 'force',
        roam: true,
        label: { show: true },
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [0, 10],
        data: nodes,
        links: edges,
        force: {
          repulsion: 200,
          edgeLength: 100
        }
      }],
      grid: { top: 0, bottom: 0, left: 0, right: 0 }
    };
  }

  scatterChartDyncamicDescriptionText = computed(() =>
    `Shows the amount of ${this.scatterToggleState() === 'direct' ? 'direct' : 'all'} dependencies compared to the ${this.scatterToggleState() === 'direct' ? 'direct' : 'all'} prerequisites`
  );

  scrollToChart(chartId: string) {
    const elmnt = document.getElementById(chartId);
    if (elmnt) {
      elmnt.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleScatterMode() {
    this.scatterToggleState.set(this.scatterToggleState() === 'direct' ? 'all' : 'direct');
  }
  
}

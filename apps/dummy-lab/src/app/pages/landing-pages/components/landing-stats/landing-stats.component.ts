import { Component } from '@angular/core';

export interface Stat {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'dl-landing-stats',
  imports: [],
  templateUrl: './landing-stats.component.html',
  styleUrl: './landing-stats.component.css',
})
export class LandingStatsComponent {
  stats: Stat[] = [
    {
      icon: 'pi pi-users',
      title: '83M',
      description: 'Nostrum laborum accusamus quia iste facere possimus.',
    },
    {
      icon: 'pi pi-chart-line',
      title: '$256K',
      description: 'Nostrum laborum accusamus quia iste facere possimus.',
    },
    {
      icon: 'pi pi-globe',
      title: '1,453',
      description: 'Nostrum laborum accusamus quia iste facere possimus.',
    },
    {
      icon: 'pi pi-map',
      title: '45 km',
      description: 'Nostrum laborum accusamus quia iste facere possimus.',
    },
  ];
}

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { UsersStore } from '@dummy-lab/data-access-users';
import { DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import {NgClass} from '@angular/common';

@Component({
  selector: 'dl-users-page',
  imports: [DataViewModule, SelectButtonModule, FormsModule, NgClass],
  templateUrl: './users.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './users.page.css',
})
export class UsersPage {
  usersStore = inject(UsersStore);
  options: string[] = ['list', 'grid'];
  layout = 'list';
}

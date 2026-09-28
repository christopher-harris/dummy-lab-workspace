import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {TodosStore} from "@dummy-lab/data-access-todos";
import {JsonPipe} from "@angular/common";

@Component({
  selector: 'dl-todos-page',
  imports: [
    JsonPipe
  ],
  templateUrl: './todos.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './todos.page.css',
})
export class TodosPage {
  todosStore = inject(TodosStore);
}

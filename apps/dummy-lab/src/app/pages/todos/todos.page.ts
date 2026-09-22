import {Component, inject} from '@angular/core';
import {TodosStore} from "@dummy-lab/data-access-todos";
import {JsonPipe} from "@angular/common";

@Component({
  selector: 'dl-todos-page',
  imports: [
    JsonPipe
  ],
  templateUrl: './todos.page.html',
  styleUrl: './todos.page.css',
})
export class TodosPage {
  todosStore = inject(TodosStore);
}

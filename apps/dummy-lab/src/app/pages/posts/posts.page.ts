import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {PostsStore} from "@dummy-lab/data-access-posts";
import {JsonPipe} from "@angular/common";

@Component({
  selector: 'dl-posts-page',
  imports: [
    JsonPipe
  ],
  templateUrl: './posts.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './posts.page.css',
})
export class PostsPage {
  postsStore = inject(PostsStore);
}

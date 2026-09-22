import {Component, inject} from '@angular/core';
import {CardModule} from "primeng/card";
import {CommonModule} from "@angular/common";
import {PostsStore} from "@dummy-lab/data-access-posts";
import {TagModule} from "primeng/tag";

@Component({
  selector: 'dl-top-posts-card',
    imports: [
      CommonModule,
      CardModule,
      TagModule
    ],
  templateUrl: './top-posts-card.component.html',
  styleUrl: './top-posts-card.component.css',
})
export class TopPostsCardComponent {
  postsStore = inject(PostsStore);
}

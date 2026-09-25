import {Component, inject} from '@angular/core';
import {UsersStore} from "@dummy-lab/data-access-users";
import {AvatarModule} from 'primeng/avatar';
import {CardModule} from 'primeng/card';
import {SkeletonModule} from 'primeng/skeleton';
import {TagModule} from 'primeng/tag';

@Component({
  selector: 'dl-account',
  imports: [AvatarModule, CardModule, SkeletonModule, TagModule],
  templateUrl: './account.page.html',
  styleUrl: './account.page.css',
})
export class AccountPage {
  usersStore = inject(UsersStore);
}

import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';

export interface Author {
  name: string;
  image: string;
}

export interface Blog {
  category: string;
  color: string;
  title: string;
  description: string;
  cover: string;
  author: Author;
  date: string;
}

@Component({
  selector: 'dl-landing-articles',
  imports: [AvatarModule],
  templateUrl: './landing-articles.component.html',
  styleUrl: './landing-articles.component.css',
})
export class LandingArticlesComponent {
  blogs: Blog[] = [
    {
      category: 'Crime',
      color: 'blue',
      title: 'Fugitive flamingo spotted in Florida',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ',
      cover:
        'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/blog/blog-1.jpg',
      author: {
        name: 'Anna Lane',
        image:
          'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/circle/avatar-f-1.png',
      },
      date: 'Apr 5, 202X',
    },
    {
      category: 'Wildlife',
      color: 'pink',
      title: 'To the Ends of the Earth',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ',
      cover:
        'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/blog/blog-2.jpg',
      author: {
        name: 'Arlene McCoy',
        image:
          'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/circle/avatar-f-2.png',
      },
      date: 'Apr 5, 202X',
    },
    {
      category: 'Marine',
      color: 'orange',
      title: "'Real and imminent' extinction risk",
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ',
      cover:
        'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/blog/blog-3.jpg',
      author: {
        name: 'Floyd Miles',
        image:
          'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/circle/avatar-f-3.png',
      },
      date: 'Apr 5, 202X',
    },
  ];
}

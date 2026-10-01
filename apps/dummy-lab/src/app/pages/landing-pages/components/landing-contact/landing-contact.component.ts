import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

export interface Contact {
  name: string;
  company: string;
  email: string;
  budget: string;
  message: string;
}

@Component({
  selector: 'dl-landing-contact',
  imports: [FormsModule, ButtonModule, InputTextModule, TextareaModule],
  templateUrl: './landing-contact.component.html',
  styleUrl: './landing-contact.component.css',
})
export class LandingContactComponent {
  contact: Contact = {
    name: '',
    company: '',
    email: '',
    budget: '',
    message: '',
  };
}

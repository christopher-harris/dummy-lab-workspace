import {Component, signal} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {ButtonModule} from "primeng/button";
import {CheckboxModule} from "primeng/checkbox";
import {InputTextModule} from "primeng/inputtext";
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'dl-auth-page',
  imports: [
    CommonModule, FormsModule, ButtonModule, CheckboxModule, InputTextModule, RouterOutlet
  ],
  templateUrl: './auth.page.html',
  styleUrl: './auth.page.css',
})
export class AuthPage {
}

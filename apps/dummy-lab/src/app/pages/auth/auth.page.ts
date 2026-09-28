import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './auth.page.css',
})
export class AuthPage {
}

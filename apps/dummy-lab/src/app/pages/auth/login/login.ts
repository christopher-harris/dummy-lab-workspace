import {Component, inject, signal} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {CheckboxModule} from "primeng/checkbox";
import {InputTextModule} from "primeng/inputtext";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {authEvents, AuthLoginCredentials, AuthStore} from "@dummy-lab/data-access-auth";
import {injectDispatch} from "@ngrx/signals/events";

type LoginForm = Omit<AuthLoginCredentials, 'expiresInMins'>;

@Component({
  selector: 'dl-login',
  imports: [
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  authEvents = injectDispatch(authEvents);
  authStore = inject(AuthStore);
  checked1 = signal<boolean>(true);

  private readonly fb = inject(FormBuilder).nonNullable;

  loginForm = this.fb.group({
    username: this.fb.control('', Validators.required),
    password: this.fb.control('', Validators.required),
  });

  onSignInClicked() {
    console.log(this.loginForm.getRawValue());
    if (this.loginForm.valid) {
      this.authEvents.loginSubmitted(this.loginForm.getRawValue());
    }
  }
}

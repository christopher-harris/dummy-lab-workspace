import {Component, signal} from '@angular/core';
import {Avatar} from "primeng/avatar";
import {ButtonDirective, ButtonIcon, ButtonLabel} from "primeng/button";
import {IconField} from "primeng/iconfield";
import {InputIcon} from "primeng/inputicon";
import {InputText} from "primeng/inputtext";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {StyleClass} from "primeng/styleclass";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'dl-navbar',
    imports: [
        CommonModule,
        Avatar,
        ButtonDirective,
        ButtonIcon,
        ButtonLabel,
        IconField,
        InputIcon,
        InputText,
        ReactiveFormsModule,
        StyleClass,
        FormsModule
    ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
    search: string = '';
    selectedNav = signal('Home');

    navs: any[] = [
        {
            label: 'Home',
            icon: 'pi pi-home',
            to: ''
        },
        {
            label: 'Comments',
            icon: 'pi pi-comments',
            to: ''
        },
        {
            label: 'Favorites',
            icon: 'pi pi-heart',
            to: ''
        },
        {
            label: 'Calendar',
            icon: 'pi pi-calendar',
            to: ''
        },
        {
            label: 'Likes',
            icon: 'pi pi-bolt',
            to: ''
        }
    ];
}

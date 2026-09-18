import {Component, signal} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {AvatarModule} from 'primeng/avatar';
import {ButtonModule} from 'primeng/button';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {InputTextModule} from 'primeng/inputtext';
import {MenuModule} from 'primeng/menu';
import {RippleModule} from 'primeng/ripple';
import {StyleClassModule} from 'primeng/styleclass';
import {NavbarComponent} from "../navbar/navbar.component";
import {FooterComponent} from "../footer/footer.component";
import {RouterOutlet} from "@angular/router";

@Component({
    selector: 'dl-shell',
    imports: [CommonModule, FormsModule, AvatarModule, ButtonModule, IconFieldModule, InputIconModule, InputTextModule, MenuModule, RippleModule, StyleClassModule, NavbarComponent, FooterComponent, RouterOutlet],
    templateUrl: './shell.component.html',
    styleUrl: './shell.component.css',
})
export class ShellComponent {

}

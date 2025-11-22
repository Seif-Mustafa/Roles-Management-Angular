import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { LayoutService } from '@/layout/service/layout.service';
import { LoginService } from '../login.service';
import { LoggedUser } from '../../layout/model/loggeduser.model';
import { MessageService, ToastMessageOptions } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { UserLogin } from '../models/user-login.model';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator, ToastModule],
    templateUrl: 'login-component.html',
    providers: [MessageService]
})
export class Login {
    userLogin: UserLogin = {
        username: '',
        password: '',
        rememberMe: false
    };

    constructor(
        private router: Router,
        private loginService: LoginService,
        private layoutService: LayoutService,
        private messageService: MessageService
    ) {}

    // Method to login user
    login(): void {
        this.loginService.checkCredentials(this.userLogin).subscribe({
            next: (res) => {
                const user: LoggedUser = res.data as LoggedUser;
                this.layoutService.setLoggedUser(user);

                if (this.userLogin.rememberMe) {
                    localStorage.setItem('loggedUser', JSON.stringify(user));
                }

                // this.router.navigate(['/app/activities']);
                this.router.navigate(['/dashboard']);
            },
            error: (error) => {
                this.showErrorViaToast(error.message);
            }
        });
    }

    showErrorViaToast(detail: string) {
        this.messageService.add({ severity: 'error', summary: 'Failed to login', detail: detail });
    }
}

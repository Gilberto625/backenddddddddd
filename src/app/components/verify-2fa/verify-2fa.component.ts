import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-2fa',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './verify-2fa.component.html'
})
export class Verify2faComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  code = ['', '', '', '', '', ''];
  type: 'login' | 'register' = 'login';
  errorMessage = '';
  isLoading = false;
  attemptsLeft = 5;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.type = params['type'] || 'login';
    });
  }

  onCodeInput(index: number, event: any): void {
    const value = event.target.value;

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }

    if (this.code.every(digit => digit !== '')) {
      this.verifyCode();
    }
  }

  onKeyDown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  }

  verifyCode(): void {
    const codigo = this.code.join('');

    if (codigo.length !== 6) {
      this.errorMessage = 'Por favor ingresa los 6 dígitos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const verification$ = this.type === 'register'
      ? this.authService.verifyRegister2FA(codigo)
      : this.authService.verifyLogin2FA(codigo);

    verification$.subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.token) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.attemptsLeft--;
        this.errorMessage = error.error?.error || 'Código incorrecto';
        this.code = ['', '', '', '', '', ''];
        const firstInput = document.getElementById('code-0') as HTMLInputElement;
        firstInput?.focus();

        if (this.attemptsLeft === 0) {
          this.errorMessage = 'Has excedido el número de intentos. Por favor, inicia el proceso nuevamente.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        }
      }
    });
  }

  resendCode(): void {
    this.errorMessage = '';
    this.code = ['', '', '', '', '', ''];
    this.attemptsLeft = 5;
    // Here you would call the appropriate endpoint to resend the code
    // For now, just show a success message
    this.errorMessage = '';
  }
}

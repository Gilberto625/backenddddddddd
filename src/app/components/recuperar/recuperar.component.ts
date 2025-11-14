import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recuperar.component.html'
})
export class RecuperarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  onSubmit(): void {
    if (!this.email) {
      this.errorMessage = 'Por favor ingresa tu email';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.recuperar(this.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Código enviado a tu email. Revisa tu bandeja de entrada.';
        setTimeout(() => {
          this.router.navigate(['/restablecer']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Error al enviar el código';
      }
    });
  }
}

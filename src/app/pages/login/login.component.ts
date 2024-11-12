import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Login } from '../../interfaces/login';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicies/auth.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent implements OnInit {
  ngOnInit(): void {
    console.log("HOLAA")
  }
  datosLogin: Login = {
    username: '',
    password: ''
  }

  router = inject(Router);
  auth = inject(AuthService);

  Login() {
    console.log("Login");
    this.auth.Login(this.datosLogin)
        if (this.datosLogin.username === 'admin' && this.datosLogin.password === 'admin') {
          this.router.navigate(['/estado-cocheras']);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Credenciales incorrectas',
          });
        }
      }
    }

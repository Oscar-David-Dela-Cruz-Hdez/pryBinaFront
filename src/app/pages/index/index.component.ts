import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';



@Component({
  selector: 'app-index',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
})
export class IndexComponent {
  constructor(private authService: AuthService, private router: Router) {
    this.authService.userRole$.subscribe(role => {
      if (role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      }
    });
  }
}

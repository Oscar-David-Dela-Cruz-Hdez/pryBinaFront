import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

import { AdminUsersService } from '../../../core/services/admin/admin-users.service';

@Component({
  selector: 'app-admin-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  displayedColumns: string[] = ['nombre', 'email', 'rol', 'acciones'];
  dataSource!: MatTableDataSource<any>;
  users: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private adminUsersService: AdminUsersService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.adminUsersService.getUsuarios().subscribe({
      next: (data) => {
        this.users = data;
        this.dataSource = new MatTableDataSource(this.users);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => {
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  toggleRole(user: any, event: any) {
    const newRole = event.checked ? 'admin' : 'usuario';
    // Revert visual change until confirmed (optional, but good UX)
    // For now, we update immediately.
    
    this.adminUsersService.updateRol(user._id, newRole).subscribe({
      next: () => {
        user.rol = newRole;
        this.snackBar.open(`Rol actualizado a ${newRole}`, 'Cerrar', { duration: 2000 });
      },
      error: () => {
        // Revert toggle if error
        event.source.checked = !event.checked; 
        this.snackBar.open('Error al actualizar rol', 'Cerrar', { duration: 3000 });
      }
    });
  }

  deleteUser(user: any) {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: `Se eliminará a ${user.nombre} (${user.email})`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminUsersService.deleteUsuario(user._id).subscribe({
          next: () => {
            this.loadUsers(); // Reload table
            Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
          }
        });
      }
    });
  }
}

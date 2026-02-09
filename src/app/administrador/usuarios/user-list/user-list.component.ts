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
  template: `
    <div class="admin-container">
      <h2>Gestión de Usuarios</h2>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Filtrar usuarios</mat-label>
        <input matInput (keyup)="applyFilter($event)" placeholder="Buscar por nombre, email, etc." #input>
      </mat-form-field>

      <div class="mat-elevation-z8">
        <table mat-table [dataSource]="dataSource" matSort>

          <!-- Nombre -->
          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Nombre </th>
            <td mat-cell *matCellDef="let row"> {{row.nombre}} {{row.ap}} {{row.am}} </td>
          </ng-container>

          <!-- Email -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Email </th>
            <td mat-cell *matCellDef="let row"> {{row.email}} </td>
          </ng-container>

          <!-- Rol (Toggle) -->
          <ng-container matColumnDef="rol">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Admin </th>
            <td mat-cell *matCellDef="let row">
              <mat-slide-toggle
                [checked]="row.rol === 'admin'"
                (change)="toggleRole(row, $event)"
                color="primary">
                {{ row.rol | titlecase }}
              </mat-slide-toggle>
            </td>
          </ng-container>

          <!-- Acciones -->
          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef> Acciones </th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button color="warn" (click)="deleteUser(row)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <!-- Row shown when there is no matching data. -->
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" colspan="4">No hay datos que coincidan con el filtro "{{input.value}}"</td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of users"></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .filter-field { width: 100%; font-size: 14px; }
    table { width: 100%; }
    th { font-weight: bold; color: #444; }
  `]
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

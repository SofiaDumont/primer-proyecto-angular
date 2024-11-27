import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Cochera } from '../../interfaces/cocheras';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../servicies/auth.service';
import Swal from 'sweetalert2';
import { EstacionamientoService } from '../../servicies/estacionamineto.service';
import { CocherasService } from '../../servicies/cocheras.service';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-estado-cocheras',
  standalone: true,
  imports: [RouterModule, CommonModule, HeaderComponent],
  templateUrl: './estado-cocheras.component.html',
  styleUrls: ['./estado-cocheras.component.scss'],
})
export class EstadoCocherasComponent {
  header = {
    nro: 'N°',
    deshabilitada: 'DISPONIBILIDAD',
    ingreso: 'INGRESO',
    acciones: 'ACCIONES',
  };
  filas: Cochera[] = [];
  siguienteNumero = 1;

  cocherasService = inject(CocherasService);
  estacionamientosService = inject(EstacionamientoService);

  auth = inject(AuthService);
  estacionamientos = inject(EstacionamientoService);
  cocheras = inject(CocherasService);

  ngOnInit() {
    this.traerCocheras();
  }

  traerCocheras() {
    return this.cocheras.cocheras().then((cocheras) => {
      console.log('Datos de cocheras:', cocheras);
      this.filas = [];
      cocheras.forEach((cochera: Cochera) => {
        this.estacionamientos
          .buscarEstacionamientoActivo(cochera.id)
          .then((estacionamiento) => {
            this.filas.push({
              ...cochera,
              activo: estacionamiento,
              deshabilitada: !!cochera.deshabilitada,
              patente: estacionamiento ? estacionamiento.patente : undefined,
              fechaIngreso: estacionamiento
                ? new Date(estacionamiento.horaIngreso).toLocaleDateString()
                : undefined,
              horaIngreso: estacionamiento
                ? new Date(estacionamiento.horaIngreso).toLocaleTimeString()
                : undefined,
            });
          });
      });
    });
  }

  agregarFila() {
    this.cocherasService.agregarCochera().then((cochera) => {
      this.filas.push({
        ...cochera,
        activo: null,
        deshabilitada: false,
        patente: undefined,
        fechaIngreso: undefined,
        horaIngreso: undefined,
      });
    });
    // Swal.fire({
    //   title: 'Ingrese la patente del vehículo',
    //   input: 'text',
    //   showCancelButton: true,
    //   inputValidator: (value) => {
    //     if (!value) {
    //       return 'Por favor, ingrese una patente válida';
    //     }
    //     return null;
    //   }
    // }).then((result) => {
    //   if (result.isConfirmed && result.value) {

    //     this.cocherasService.agregarCochera().then((data) => {
    //       const now = new Date();
    //     const nuevaCochera: Cochera = {
    //       id: data.id,
    //       descripcion: result.value,
    //       patente: result.value,
    //       deshabilitada: false,
    //       eliminada: false,
    //       activo: null,
    //       fechaIngreso: now.toLocaleDateString(),
    //       horaIngreso: now.toLocaleTimeString(),
    //     };
    //       this.filas.push(nuevaCochera);
    //       this.siguienteNumero++;
    //       this.estacionamientos.estacionarAuto(nuevaCochera.descripcion, data.id);

    //       this.estacionamientos.buscarEstacionamientoActivo(nuevaCochera.id).then(estacionamiento => {
    //         nuevaCochera.activo = estacionamiento
    //        });

    //       Swal.fire('Fila agregada', 'La cochera ha sido registrada con éxito.', 'success');
    //   })
    // }
    // });
  }

  eliminarFila(cocheraId: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cocherasService.eliminarCochera(cocheraId).then(() => {
          this.filas = this.filas.filter((cochera) => cochera.id !== cocheraId);
          Swal.fire('Eliminado', 'La cochera ha sido eliminada.', 'success');
        });
      }
    });
  }

  cambiarDisponibilidadCochera(cochera: Cochera) {
    const now = new Date();
    if (!cochera.activo && !cochera.deshabilitada) {
      Swal.fire({
        title: 'Ingrese la patente del vehículo',
        input: 'text',
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return 'Por favor, ingrese una patente válida';
          }
          return null;
        },
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          this.estacionamientos
            .estacionarAuto(result.value, cochera.id)
            .then((resp) => {
              cochera.patente = result.value;
              cochera.deshabilitada = false;
              cochera.fechaIngreso = now.toLocaleDateString();
              cochera.horaIngreso = now.toLocaleTimeString();
              cochera.fechaDeshabilitado = undefined;
              cochera.horaDeshabilitado = undefined;

              this.estacionamientos
                .buscarEstacionamientoActivo(cochera.id)
                .then((resp) => {
                  cochera.activo = resp;
                });

              Swal.fire(
                'Patente registrada',
                'La cochera ahora está ocupada.',
                'success'
              );
            })
            .catch((error) => {
              console.error('Error al ocupar la cochera:', error);
              Swal.fire(
                'Error',
                'Hubo un problema al ocupar la cochera en el sistema.',
                'error'
              );
            });
        }
      });
    }
  }

  cobrarEstacionamiento(idCochera: number) {
    this.estacionamientos
      .buscarEstacionamientoActivo(idCochera)
      .then((estacionamiento) => {
        if (!estacionamiento) {
          Swal.fire({
            title: 'Error',
            text: 'No se encontró un estacionamiento activo para la cochera',
            icon: 'error',
          });
          return;
        }

        const horaIngreso = new Date(estacionamiento.horaIngreso);
        console.log('Hora de ingreso:', horaIngreso);

        if (isNaN(horaIngreso.getTime())) {
          Swal.fire({
            title: 'Error',
            text: 'La hora de ingreso es inválida.',
            icon: 'error',
          });
          return;
        }
        const tiempoTranscurridoMs =
          new Date().getTime() - horaIngreso.getTime();
        const horas = Math.floor(tiempoTranscurridoMs / (1000 * 60 * 60));
        const minutos = Math.floor(
          (tiempoTranscurridoMs % (1000 * 60 * 60)) / (1000 * 60)
        );
        let precio = 0;

        if (horas === 0) {
          precio = 600.00;
        } else {
          precio = tiempoTranscurridoMs / 1000 / 60 / 60;
        }

        Swal.fire({
          title: 'Cobrar estacionamiento',
          text: `Tiempo transcurrido: ${horas}hs ${minutos}mins - Precio: $${precio.toFixed(
            2
          )}`,
          icon: 'info',
          showCancelButton: true,
          confirmButtonColor: '#00c98d',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Cobrar',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            this.estacionamientos
              .cobrarEstacionamiento(idCochera, estacionamiento.patente, precio)
              .then(() => {
                Swal.fire(
                  'Estacionamiento cobrado',
                  'El estacionamiento ha sido cobrado correctamente.',
                  'success'
                );
                this.traerCocheras();
              })
              .catch((error: any) => {
                console.error('Error al cobrar el estacionamiento:', error);
                Swal.fire(
                  'Error',
                  'Hubo un error al cobrar el estacionamiento.',
                  'error'
                );
              });
          }
        });
      })
      .catch((error) => {
        console.error('Error al buscar el estacionamiento activo:', error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un error al buscar el estacionamiento.',
          icon: 'error',
        });
      });
  }

  cambiarEstadoCochera(cochera: Cochera) {
    if (!cochera.deshabilitada) {
      this.cocherasService.deshabilitar(cochera).then((next) => {
        cochera.deshabilitada = true;
      });
    } else {
      this.cocherasService.habilitar(cochera).then((next) => {
        cochera.deshabilitada = false;
      });
    }
  }
}
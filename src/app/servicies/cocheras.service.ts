import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Cochera } from '../interfaces/cocheras';


@Injectable({
  providedIn: 'root'
})
export class CocherasService {
  private baseUrl = 'http://localhost:4000';
  constructor() { }
  auth = inject(AuthService);

  cambiarDisponibilidadCochera(cochera: Cochera, opcion: string) {
    return fetch(`http://localhost:4000/cocheras/${cochera.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.auth.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ deshabilitada: !cochera.deshabilitada })
    }).then(res => res.json());
  }

  eliminarCochera(cocheraId: number) {
    return fetch(`http://localhost:4000/cocheras/${cocheraId}`, {
      method: "DELETE",
      headers:{
        'Authorization' : `Bearer ${this.auth.getToken()}`
      }
    }).then(res => res.json());
  }

  agregarCochera() {
    return fetch("http://localhost:4000/cocheras",{
      method: "POST",
      headers:{
        'Authorization' : `Bearer ${this.auth.getToken()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ descripcion: "Agregada por api" })
    }).then(res => res.json());
  }

  cargar() :Promise<Cochera[]>{
    return fetch("http://localhost:4000/cocheras",{
      method: "GET",
      headers:{
        authorization : "Bearer " + (this.auth.getToken() ?? "")
      },
    }).then(res => res.json());
  }
  habilitar(cochera:Cochera){
    return fetch(`http://localhost:4000/cocheras/${cochera.id}/enable`,{
      method: "POST",
      headers:{
        'Authorization' : `Bearer ${this.auth.getToken()}`
      }
    }).then(res => res.json());
  }

  deshabilitar(cochera:Cochera){
    return fetch (`http://localhost:4000/cocheras/${cochera.id}/disable`, {
      method:"POST",
      headers:{
        'Authorization' : `Bearer ${this.auth.getToken()}`
      }
    }).then(res => res.json());
  }

  cocheras():Promise<Cochera[]>{
  return fetch('http://localhost:4000/cocheras',{
    method: 'GET',
    headers: {
      authorization: "Bearer " + (this.auth.getToken()?? ''),
    },
  }).then(r=> r.json());
}}
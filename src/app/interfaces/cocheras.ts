import { Estacionamiento } from "./estacionamiento";

export interface Cochera{
    id: number, 
    descripcion: string,
    deshabilitada: boolean,
    eliminada: boolean,
    activo: Estacionamiento | null;
    ingreso?: { patente: string; fecha: string } | null;
    patente?: string
    fechaIngreso?: string;
    horaIngreso?: string;
    fechaDeshabilitado?: string;
    horaDeshabilitado?: string;
}

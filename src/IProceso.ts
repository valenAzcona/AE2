import type { EstadoProceso } from "./EstadoProceso.js";

export interface IProceso {
  pid: number;
  memoriaRequerida: number;
  tiempoTotalCpu: number;
  cpuRestante: number;
  estado: EstadoProceso;
  quantumConsumido: number;
  tiempoBloqueoRestante: number;

  obtenerResumen(): string;
}
import type { EstadoProceso } from "./EstadoProceso.js";

export interface IProcesoVista {
  readonly pid: number;
  readonly memoriaRequerida: number;
  readonly tiempoTotalCpu: number;
  readonly cpuRestante: number;
  readonly estado: EstadoProceso;
  readonly quantumConsumido: number;
  readonly tiempoBloqueoRestante: number;
}
import type { EstadoProceso } from "./EstadoProceso.js";

export interface IProceso {
  readonly pid: number;
  readonly memoriaRequerida: number;
  readonly tiempoTotalCpu: number;
  readonly cpuRestante: number;
  readonly estado: EstadoProceso;
  readonly quantumConsumido: number;
  readonly tiempoBloqueoRestante: number;

  marcarEsperandoMemoria(): void;

  marcarListo(): void;

  marcarTerminado(): void;

  obtenerResumen(): string;
}
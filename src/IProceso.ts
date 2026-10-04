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
  marcarEjecutando(): void;
  marcarTerminado(): void;

  ejecutarTick(): void;
  reiniciarQuantum(): void;

  obtenerResumen(): string;
}
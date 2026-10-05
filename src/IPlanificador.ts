import type { Proceso } from "./Proceso.js";

export interface IPlanificador {
  readonly quantum: number;
  readonly pidEjecutando: number | null;
  readonly cambiosContexto: number;

  encolar(pid: number): void;

  obtenerColaListos(): number[];

  despachar(
    procesos: Proceso[]
  ): Proceso | null;

  liberarCpuPorFinalizacion(): void;

  liberarCpuPorBloqueo(): void;

  procesarFinQuantum(
    proceso: Proceso
  ): void;
}
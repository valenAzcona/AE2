import type { IProceso } from "./IProceso.js";

export interface IPlanificador {
  readonly quantum: number;
  readonly pidEjecutando: number | null;
  readonly cambiosContexto: number;

  encolar(pid: number): void;

  obtenerColaListos(): number[];

  despachar(
    procesos: IProceso[]
  ): IProceso | null;

  liberarCpuPorFinalizacion(): void;

  liberarCpuPorBloqueo(): void;

  procesarFinQuantum(
    proceso: IProceso
  ): void;
}
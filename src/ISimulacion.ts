import type { IProceso } from "./IProceso.js";
import type { IBloqueMemoria } from "./IBloqueMemoria.js";

export interface ISimulacion {
  readonly memoriaTotal: number;
  readonly quantum: number;

  tick: number;

  registrarProceso(
    pid: number,
    memoriaRequerida: number,
    tiempoTotalCpu: number
  ): void;

  admitirProceso(pid: number): void;

  liberarMemoria(pid: number): void;

  reintentarProcesosEnEspera(): void;

  avanzarTick(): void;

  consultarProcesos(): IProceso[];

  consultarMemoria(): IBloqueMemoria[];
}
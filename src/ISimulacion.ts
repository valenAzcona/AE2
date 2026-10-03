import type { IProceso } from "./IProceso.js";
import type { IBloqueMemoria } from "./IBloqueMemoria.js";
import type { PoliticaAsignacion } from "./PoliticaAsignacion.js";

export interface ISimulacion {
  readonly memoriaTotal: number;
  readonly quantum: number;
  readonly politicaAsignacion: PoliticaAsignacion;

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
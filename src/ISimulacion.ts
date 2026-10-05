import type { IProcesoVista } from "./IProcesoVista.js";
import type { IBloqueMemoria } from "./IBloqueMemoria.js";
import type { IMetricas } from "./IMetricas.js";
import type { IEstadoSistema } from "./IEstadoSistema.js";
import type { PoliticaAsignacion } from "./PoliticaAsignacion.js";

export interface ISimulacion {
  readonly memoriaTotal: number;
  readonly quantum: number;
  readonly politicaAsignacion: PoliticaAsignacion;
  readonly pidEjecutando: number | null;
  readonly cambiosContexto: number;

  tick: number;

  registrarProceso(
    pid: number,
    memoriaRequerida: number,
    tiempoTotalCpu: number
  ): void;

  admitirProceso(pid: number): void;

  liberarMemoria(pid: number): void;

  reintentarProcesosEnEspera(): void;

  programarEventoES(
    pid: number,
    despuesDeTicksCpu: number,
    duracion: number
  ): void;

  avanzarTick(): void;

  consultarProcesos(): IProcesoVista[];

  consultarMemoria(): IBloqueMemoria[];

  consultarMetricas(): IMetricas;

  consultarEstado(): IEstadoSistema;
}
import type { IBloqueMemoria } from "./IBloqueMemoria.js";

export interface IEstadoSistema {
  readonly tick: number;
  readonly pidEjecutando: number | null;

  readonly colaListos: readonly number[];
  readonly colaEsperandoMemoria: readonly number[];
  readonly colaBloqueados: readonly number[];

  readonly procesosTerminados: readonly number[];

  readonly memoria: readonly IBloqueMemoria[];
}
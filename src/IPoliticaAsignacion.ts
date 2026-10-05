import type { IBloqueMemoria } from "./IBloqueMemoria.js";
export interface IPoliticaAsignacion {
  readonly nombre: string;

  seleccionar(
    bloques: readonly IBloqueMemoria[],
    tamanio: number
  ): number;
}
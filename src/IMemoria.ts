import type { IBloqueMemoria } from "./IBloqueMemoria.js";

export interface IMemoria {
  readonly tamanioTotal: number;

  obtenerBloques(): IBloqueMemoria[];

  asignar(
    pid: number,
    tamanio: number
  ): boolean;

  liberar(pid: number): void;
}
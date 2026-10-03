import type {
  IBloqueMemoria,
  IMemoria
} from "./IMemoria.js";

export class Memoria implements IMemoria {
  readonly tamanioTotal: number;

  private bloques: IBloqueMemoria[];

  constructor(tamanioTotal: number) {
    if (!Number.isInteger(tamanioTotal) || tamanioTotal <= 0) {
      throw new Error(
        "El tamaño total de memoria debe ser un entero positivo"
      );
    }

    this.tamanioTotal = tamanioTotal;

    this.bloques = [
      {
        inicio: 0,
        tamanio: tamanioTotal,
        libre: true,
        pidProceso: null,
      },
    ];
  }

  obtenerBloques(): IBloqueMemoria[] {
    return this.bloques.map((bloque) => ({
      ...bloque,
    }));
  }

  asignar(
    pid: number,
    tamanio: number
  ): boolean {
    const bloqueDisponible = this.bloques.find(
      (bloque) =>
        bloque.libre &&
        bloque.tamanio >= tamanio
    );

    if (!bloqueDisponible) {
      return false;
    }

    bloqueDisponible.libre = false;
    bloqueDisponible.pidProceso = pid;

    return true;
  }

  liberar(pid: number): void {
    const bloque = this.bloques.find(
      (bloqueActual) =>
        bloqueActual.pidProceso === pid
    );

    if (!bloque) {
      return;
    }

    bloque.libre = true;
    bloque.pidProceso = null;
  }
}
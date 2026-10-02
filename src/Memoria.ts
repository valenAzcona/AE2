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
      },
    ];
  }

  obtenerBloques(): IBloqueMemoria[] {
    return this.bloques.map((bloque) => ({
      ...bloque,
    }));
  }

  buscarBloqueDisponible(
    tamanio: number
  ): IBloqueMemoria | undefined {
    return this.bloques.find(
      (bloque) =>
        bloque.libre &&
        bloque.tamanio >= tamanio
    );
  }
}
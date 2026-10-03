import type { IMemoria } from "./IMemoria.js";
import type { IBloqueMemoria } from "./IBloqueMemoria.js";
import { BloqueMemoria } from "./BloqueMemoria.js";

export class Memoria implements IMemoria {
  readonly tamanioTotal: number;

  private bloques: BloqueMemoria[];

  constructor(tamanioTotal: number) {
    if (!Number.isInteger(tamanioTotal) || tamanioTotal <= 0) {
      throw new Error(
        "El tamaño total de memoria debe ser un entero positivo"
      );
    }

    this.tamanioTotal = tamanioTotal;

    this.bloques = [
      new BloqueMemoria(0, tamanioTotal)
    ];
  }

  obtenerBloques(): IBloqueMemoria[] {
    return this.bloques.map((bloque) => ({
      inicio: bloque.inicio,
      tamanio: bloque.tamanio,
      libre: bloque.libre,
      pidProceso: bloque.pidProceso,
      obtenerFin: () => bloque.obtenerFin(),
    }));
  }

  asignar(
    pid: number,
    tamanio: number
  ): boolean {
    const indice = this.bloques.findIndex(
      (bloque) =>
        bloque.libre &&
        bloque.tamanio >= tamanio
    );

    if (indice === -1) {
      return false;
    }

    const bloque = this.bloques[indice]!;

    if (bloque.tamanio === tamanio) {
      this.bloques[indice] = new BloqueMemoria(
        bloque.inicio,
        tamanio,
        false,
        pid
      );

      return true;
    }

    const bloqueOcupado = new BloqueMemoria(
      bloque.inicio,
      tamanio,
      false,
      pid
    );

    const bloqueLibre = new BloqueMemoria(
      bloque.inicio + tamanio,
      bloque.tamanio - tamanio,
      true,
      null
    );

    this.bloques.splice(
      indice,
      1,
      bloqueOcupado,
      bloqueLibre
    );

    return true;
  }

  liberar(pid: number): void {
    const indice = this.bloques.findIndex(
      (bloque) => bloque.pidProceso === pid
    );

    if (indice === -1) {
      return;
    }

    const bloque = this.bloques[indice]!;

    this.bloques[indice] = new BloqueMemoria(
      bloque.inicio,
      bloque.tamanio,
      true,
      null
    );

    this.fusionarBloquesLibres();
  }

  private fusionarBloquesLibres(): void {
    let indice = 0;

    while (indice < this.bloques.length - 1) {
      const actual = this.bloques[indice]!;
      const siguiente = this.bloques[indice + 1]!;

      const sonContiguos =
        actual.obtenerFin() === siguiente.inicio;

      if (
        actual.libre &&
        siguiente.libre &&
        sonContiguos
      ) {
        const bloqueFusionado = new BloqueMemoria(
          actual.inicio,
          actual.tamanio + siguiente.tamanio,
          true,
          null
        );

        this.bloques.splice(
          indice,
          2,
          bloqueFusionado
        );
      } else {
        indice++;
      }
    }
  }
}
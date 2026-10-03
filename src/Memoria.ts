import type { IMemoria } from "./IMemoria.js";
import type { IBloqueMemoria } from "./IBloqueMemoria.js";
import { BloqueMemoria } from "./BloqueMemoria.js";
import { PoliticaAsignacion } from "./PoliticaAsignacion.js";

export class Memoria implements IMemoria {
  readonly tamanioTotal: number;
  readonly politicaAsignacion: PoliticaAsignacion;

  private bloques: BloqueMemoria[];

  constructor(
    tamanioTotal: number,
    politicaAsignacion: PoliticaAsignacion = PoliticaAsignacion.FirstFit
  ) {
    if (!Number.isInteger(tamanioTotal) || tamanioTotal <= 0) {
      throw new Error(
        "El tamaño total de memoria debe ser un entero positivo"
      );
    }

    this.tamanioTotal = tamanioTotal;
    this.politicaAsignacion = politicaAsignacion;

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
    const indice = this.buscarBloque(tamanio);

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

  private buscarBloque(tamanio: number): number {
    let indiceElegido = -1;

    for (let i = 0; i < this.bloques.length; i++) {
      const bloque = this.bloques[i]!;

      if (!bloque.libre || bloque.tamanio < tamanio) {
        continue;
      }

      if (this.politicaAsignacion === PoliticaAsignacion.FirstFit) {
        return i;
      }

      if (indiceElegido === -1) {
        indiceElegido = i;
        continue;
      }

      const bloqueElegido = this.bloques[indiceElegido]!;

      if (
        this.politicaAsignacion === PoliticaAsignacion.BestFit &&
        bloque.tamanio < bloqueElegido.tamanio
      ) {
        indiceElegido = i;
      }

      if (
        this.politicaAsignacion === PoliticaAsignacion.WorstFit &&
        bloque.tamanio > bloqueElegido.tamanio
      ) {
        indiceElegido = i;
      }
    }

    return indiceElegido;
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
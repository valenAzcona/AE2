export interface BloqueMemoria {
  inicio: number;
  tamanio: number;
  libre: boolean;
}

export class Simulacion {
  readonly memoriaTotal: number;
  readonly quantum: number;

  tick: number;
  bloques: BloqueMemoria[];

  colaNuevos: number[];
  colaEsperandoMemoria: number[];
  colaListos: number[];
  colaBloqueados: number[];

  procesosTerminados: number;

  constructor(memoriaTotal: number, quantum: number) {
    if (!Number.isInteger(memoriaTotal) || memoriaTotal <= 0) {
      throw new Error("La memoria total debe ser un entero positivo");
    }

    if (!Number.isInteger(quantum) || quantum <= 0) {
      throw new Error("El quantum debe ser un entero positivo");
    }

    this.memoriaTotal = memoriaTotal;
    this.quantum = quantum;

    this.tick = 0;

    this.bloques = [
      {
        inicio: 0,
        tamanio: memoriaTotal,
        libre: true,
      },
    ];

    this.colaNuevos = [];
    this.colaEsperandoMemoria = [];
    this.colaListos = [];
    this.colaBloqueados = [];

    this.procesosTerminados = 0;
  }
}
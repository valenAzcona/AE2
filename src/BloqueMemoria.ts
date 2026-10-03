import type { IBloqueMemoria } from "./IBloqueMemoria.js";

export class BloqueMemoria implements IBloqueMemoria {
  private _inicio: number;
  private _tamanio: number;
  private _libre: boolean;
  private _pidProceso: number | null;

  constructor(
    inicio: number,
    tamanio: number,
    libre: boolean = true,
    pidProceso: number | null = null
  ) {
    if (!Number.isInteger(inicio) || inicio < 0) {
      throw new Error("El inicio debe ser un entero no negativo");
    }

    if (!Number.isInteger(tamanio) || tamanio <= 0) {
      throw new Error("El tamaño debe ser un entero positivo");
    }

    this._inicio = inicio;
    this._tamanio = tamanio;
    this._libre = libre;
    this._pidProceso = pidProceso;
  }

  get inicio(): number {
    return this._inicio;
  }

  get tamanio(): number {
    return this._tamanio;
  }

  get libre(): boolean {
    return this._libre;
  }

  get pidProceso(): number | null {
    return this._pidProceso;
  }

  obtenerFin(): number {
    return this._inicio + this._tamanio;
  }
}
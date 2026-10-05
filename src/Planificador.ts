import type { IPlanificador } from "./IPlanificador.js";
import { Proceso } from "./Proceso.js";

export class Planificador implements IPlanificador {
  readonly quantum: number;

  private colaListos: number[];
  private _pidEjecutando: number | null;
  private _cambiosContexto: number;

  constructor(quantum: number) {
    if (!Number.isInteger(quantum) || quantum <= 0) {
      throw new Error(
        "El quantum debe ser un entero positivo"
      );
    }

    this.quantum = quantum;

    this.colaListos = [];
    this._pidEjecutando = null;
    this._cambiosContexto = 0;
  }

  get pidEjecutando(): number | null {
    return this._pidEjecutando;
  }

  get cambiosContexto(): number {
    return this._cambiosContexto;
  }

  encolar(pid: number): void {
    if (!this.colaListos.includes(pid)) {
      this.colaListos.push(pid);
    }
  }

  obtenerColaListos(): number[] {
    return [...this.colaListos];
  }

  despachar(
    procesos: Proceso[]
  ): Proceso | null {
    if (this._pidEjecutando !== null) {
      const procesoActual = procesos.find(
        (proceso) =>
          proceso.pid === this._pidEjecutando
      );

      return procesoActual ?? null;
    }

    const siguientePid = this.colaListos.shift();

    if (siguientePid === undefined) {
      return null;
    }

    const proceso = procesos.find(
      (procesoActual) =>
        procesoActual.pid === siguientePid
    );

    if (!proceso) {
      return null;
    }

    proceso.reiniciarQuantum();
    proceso.marcarEjecutando();

    this._pidEjecutando = proceso.pid;

    return proceso;
  }

  liberarCpuPorFinalizacion(): void {
    this._pidEjecutando = null;
  }

  liberarCpuPorBloqueo(): void {
    this._pidEjecutando = null;
    this._cambiosContexto++;
  }

  procesarFinQuantum(
    proceso: Proceso
  ): void {
    if (proceso.quantumConsumido < this.quantum) {
      return;
    }

    if (this.colaListos.length === 0) {
      proceso.reiniciarQuantum();
      return;
    }

    proceso.marcarListo();
    proceso.reiniciarQuantum();

    this.encolar(proceso.pid);

    this._pidEjecutando = null;
    this._cambiosContexto++;
  }
}
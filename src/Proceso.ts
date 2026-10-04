import type { IProceso } from "./IProceso.js";
import { EstadoProceso } from "./EstadoProceso.js";

export class Proceso implements IProceso {
  private readonly _pid: number;
  private readonly _memoriaRequerida: number;
  private readonly _tiempoTotalCpu: number;

  private _cpuRestante: number;
  private _estado: EstadoProceso;
  private _quantumConsumido: number;
  private _tiempoBloqueoRestante: number;

  constructor(
    pid: number,
    memoriaRequerida: number,
    tiempoTotalCpu: number
  ) {
    if (!Number.isInteger(pid) || pid <= 0) {
      throw new Error(
        "El PID debe ser un entero positivo"
      );
    }

    if (
      !Number.isInteger(memoriaRequerida) ||
      memoriaRequerida <= 0
    ) {
      throw new Error(
        "La memoria requerida debe ser un entero positivo"
      );
    }

    if (
      !Number.isInteger(tiempoTotalCpu) ||
      tiempoTotalCpu <= 0
    ) {
      throw new Error(
        "El tiempo total de CPU debe ser un entero positivo"
      );
    }

    this._pid = pid;
    this._memoriaRequerida = memoriaRequerida;
    this._tiempoTotalCpu = tiempoTotalCpu;

    this._cpuRestante = tiempoTotalCpu;
    this._estado = EstadoProceso.Nuevo;
    this._quantumConsumido = 0;
    this._tiempoBloqueoRestante = 0;
  }

  get pid(): number {
    return this._pid;
  }

  get memoriaRequerida(): number {
    return this._memoriaRequerida;
  }

  get tiempoTotalCpu(): number {
    return this._tiempoTotalCpu;
  }

  get cpuRestante(): number {
    return this._cpuRestante;
  }

  get estado(): EstadoProceso {
    return this._estado;
  }

  get quantumConsumido(): number {
    return this._quantumConsumido;
  }

  get tiempoBloqueoRestante(): number {
    return this._tiempoBloqueoRestante;
  }

  marcarEsperandoMemoria(): void {
    if (this._estado === EstadoProceso.Terminado) {
      return;
    }

    this._estado = EstadoProceso.EsperandoMemoria;
  }

  marcarListo(): void {
    if (this._estado === EstadoProceso.Terminado) {
      return;
    }

    this._estado = EstadoProceso.Listo;
  }

  marcarEjecutando(): void {
    if (this._estado === EstadoProceso.Terminado) {
      return;
    }

    this._estado = EstadoProceso.Ejecutando;
  }

  marcarTerminado(): void {
    this._estado = EstadoProceso.Terminado;
    this._quantumConsumido = 0;
  }

  ejecutarTick(): void {
    if (
      this._estado !== EstadoProceso.Ejecutando ||
      this._cpuRestante <= 0
    ) {
      return;
    }

    this._cpuRestante--;
    this._quantumConsumido++;
  }

  reiniciarQuantum(): void {
    this._quantumConsumido = 0;
  }

  obtenerResumen(): string {
    return `PID ${this._pid} - Estado: ${this._estado} - CPU restante: ${this._cpuRestante}`;
  }
}
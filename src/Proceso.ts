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

  private _eventoESDespuesDe: number | null;
  private _duracionEventoES: number | null;
  private _eventoESDisparado: boolean;

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

    this._eventoESDespuesDe = null;
    this._duracionEventoES = null;
    this._eventoESDisparado = false;
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

  private cambiarEstado(
  nuevoEstado: EstadoProceso,
  estadosPermitidos: EstadoProceso[]
): void {
  if (!estadosPermitidos.includes(this._estado)) {
    throw new Error(
      `Transicion de estado invalida: ${this._estado} -> ${nuevoEstado}`
    );
  }

  this._estado = nuevoEstado;
}

marcarEsperandoMemoria(): void {
  if (
    this._estado ===
    EstadoProceso.EsperandoMemoria
  ) {
    return;
  }

  this.cambiarEstado(
    EstadoProceso.EsperandoMemoria,
    [EstadoProceso.Nuevo]
  );
}
marcarListo(): void {
  this.cambiarEstado(
    EstadoProceso.Listo,
    [
      EstadoProceso.EsperandoMemoria,
      EstadoProceso.Ejecutando,
      EstadoProceso.Bloqueado,
    ]
  );
}

marcarEjecutando(): void {
  this.cambiarEstado(
    EstadoProceso.Ejecutando,
    [EstadoProceso.Listo]
  );
}

marcarTerminado(): void {
  this.cambiarEstado(
    EstadoProceso.Terminado,
    [EstadoProceso.Ejecutando]
  );

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

  programarEventoES(
  despuesDeTicksCpu: number,
  duracion: number
): void {
  if (
    !Number.isInteger(despuesDeTicksCpu) ||
    despuesDeTicksCpu <= 0
  ) {
    throw new Error(
      "El momento del evento de E/S debe ser un entero positivo"
    );
  }

  if (
    !Number.isInteger(duracion) ||
    duracion <= 0
  ) {
    throw new Error(
      "La duración del evento de E/S debe ser un entero positivo"
    );
  }

  if (this._estado === EstadoProceso.Terminado) {
    throw new Error(
      "No se puede programar E/S para un proceso terminado"
    );
  }

  const cpuConsumida =
    this._tiempoTotalCpu - this._cpuRestante;

  if (despuesDeTicksCpu <= cpuConsumida) {
    throw new Error(
      "El momento del evento de E/S ya paso"
    );
  }

  if (despuesDeTicksCpu >= this._tiempoTotalCpu) {
    throw new Error(
      "El evento de E/S debe ocurrir antes de finalizar el proceso"
    );
  }

  this._eventoESDespuesDe = despuesDeTicksCpu;
  this._duracionEventoES = duracion;
  this._eventoESDisparado = false;
}

  debeBloquearsePorES(): boolean {
    if (
      this._eventoESDespuesDe === null ||
      this._eventoESDisparado
    ) {
      return false;
    }

    const cpuConsumida =
      this._tiempoTotalCpu - this._cpuRestante;

    return cpuConsumida === this._eventoESDespuesDe;
  }

  bloquearPorES(): void {
    if (
      this._duracionEventoES === null ||
      !this.debeBloquearsePorES()
    ) {
      return;
    }

    this._estado = EstadoProceso.Bloqueado;
    this._tiempoBloqueoRestante =
      this._duracionEventoES;

    this._quantumConsumido = 0;
    this._eventoESDisparado = true;
  }

  actualizarBloqueo(): boolean {
    if (
      this._estado !== EstadoProceso.Bloqueado ||
      this._tiempoBloqueoRestante <= 0
    ) {
      return false;
    }

    this._tiempoBloqueoRestante--;

    return this._tiempoBloqueoRestante === 0;
  }

  obtenerResumen(): string {
    return `PID ${this._pid} - Estado: ${this._estado} - CPU restante: ${this._cpuRestante}`;
  }
}
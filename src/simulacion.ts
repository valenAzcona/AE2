import { Proceso } from "./Proceso.js";
import type { IProceso } from "./IProceso.js";
import type { ISimulacion } from "./ISimulacion.js";
import { EstadoProceso } from "./EstadoProceso.js";
import { Memoria } from "./Memoria.js";

export class Simulacion implements ISimulacion {
  readonly memoriaTotal: number;
  readonly quantum: number;

  tick: number;

  colaNuevos: number[];
  colaEsperandoMemoria: number[];
  colaListos: number[];
  colaBloqueados: number[];

  procesosTerminados: number;

  private procesos: Proceso[];
  private memoria: Memoria;

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

    this.memoria = new Memoria(memoriaTotal);

    this.colaNuevos = [];
    this.colaEsperandoMemoria = [];
    this.colaListos = [];
    this.colaBloqueados = [];

    this.procesosTerminados = 0;
    this.procesos = [];
  }

  registrarProceso(
    pid: number,
    memoriaRequerida: number,
    tiempoTotalCpu: number
  ): void {
    const pidDuplicado = this.procesos.some(
      (proceso) => proceso.pid === pid
    );

    if (pidDuplicado) {
      throw new Error("Ya existe un proceso con ese PID");
    }

    if (memoriaRequerida > this.memoriaTotal) {
      throw new Error(
        "La memoria requerida no puede superar la memoria total"
      );
    }

    const proceso = new Proceso(
      pid,
      memoriaRequerida,
      tiempoTotalCpu
    );

    this.procesos.push(proceso);
    this.colaNuevos.push(pid);
  }

  admitirProceso(pid: number): void {
    const proceso = this.procesos.find(
      (procesoActual) => procesoActual.pid === pid
    );

    if (!proceso) {
      throw new Error("El proceso no existe");
    }

    if (proceso.estado === EstadoProceso.Terminado) {
      return;
    }

    this.colaNuevos = this.colaNuevos.filter(
      (pidActual) => pidActual !== pid
    );

    const asignado = this.memoria.asignar(
      proceso.pid,
      proceso.memoriaRequerida
    );

    if (!asignado) {
      proceso.estado = EstadoProceso.EsperandoMemoria;

      if (!this.colaEsperandoMemoria.includes(pid)) {
        this.colaEsperandoMemoria.push(pid);
      }

      return;
    }

    proceso.estado = EstadoProceso.Listo;

    this.colaEsperandoMemoria =
      this.colaEsperandoMemoria.filter(
        (pidActual) => pidActual !== pid
      );

    if (!this.colaListos.includes(pid)) {
      this.colaListos.push(pid);
    }
  }

  liberarMemoria(pid: number): void {
    this.memoria.liberar(pid);
  }

  reintentarProcesosEnEspera(): void {
    const procesosEnEspera = [...this.colaEsperandoMemoria];

    for (const pid of procesosEnEspera) {
      this.admitirProceso(pid);
    }
  }

  avanzarTick(): void {
    this.reintentarProcesosEnEspera();
    this.tick++;
  }

  consultarProcesos(): IProceso[] {
    return this.procesos.map((proceso) => ({
      pid: proceso.pid,
      memoriaRequerida: proceso.memoriaRequerida,
      tiempoTotalCpu: proceso.tiempoTotalCpu,
      cpuRestante: proceso.cpuRestante,
      estado: proceso.estado,
      quantumConsumido: proceso.quantumConsumido,
      tiempoBloqueoRestante: proceso.tiempoBloqueoRestante,
      obtenerResumen: () => proceso.obtenerResumen(),
    }));
  }

  consultarMemoria() {
    return this.memoria.obtenerBloques();
  }
}
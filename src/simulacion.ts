import { Proceso } from "./Proceso.js";
import type { IProceso } from "./IProceso.js";
import { EstadoProceso } from "./EstadoProceso.js";

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

  private procesos: Proceso[];

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

    const bloqueDisponible = this.bloques.find(
      (bloque) =>
        bloque.libre &&
        bloque.tamanio >= proceso.memoriaRequerida
    );

    this.colaNuevos = this.colaNuevos.filter(
      (pidActual) => pidActual !== pid
    );

    if (!bloqueDisponible) {
      proceso.estado = EstadoProceso.EsperandoMemoria;

      if (!this.colaEsperandoMemoria.includes(pid)) {
        this.colaEsperandoMemoria.push(pid);
      }

      return;
    }

    bloqueDisponible.libre = false;
    proceso.estado = EstadoProceso.Listo;

    this.colaEsperandoMemoria =
      this.colaEsperandoMemoria.filter(
        (pidActual) => pidActual !== pid
      );

    if (!this.colaListos.includes(pid)) {
      this.colaListos.push(pid);
    }
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
}
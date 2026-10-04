import { Proceso } from "./Proceso.js";
import type { IProcesoVista } from "./IProcesoVista.js";
import type { ISimulacion } from "./ISimulacion.js";
import type { IBloqueMemoria } from "./IBloqueMemoria.js";
import { EstadoProceso } from "./EstadoProceso.js";
import { Memoria } from "./Memoria.js";
import { PoliticaAsignacion } from "./PoliticaAsignacion.js";

export class Simulacion implements ISimulacion {
  readonly memoriaTotal: number;
  readonly quantum: number;
  readonly politicaAsignacion: PoliticaAsignacion;

  tick: number;

  colaNuevos: number[];
  colaEsperandoMemoria: number[];
  colaListos: number[];
  colaBloqueados: number[];

  procesosTerminados: number;

  private procesos: Proceso[];
  private memoria: Memoria;

  private _pidEjecutando: number | null;
  private _cambiosContexto: number;

  constructor(
    memoriaTotal: number,
    quantum: number,
    politicaAsignacion: PoliticaAsignacion = PoliticaAsignacion.FirstFit
  ) {
    if (!Number.isInteger(memoriaTotal) || memoriaTotal <= 0) {
      throw new Error(
        "La memoria total debe ser un entero positivo"
      );
    }

    if (!Number.isInteger(quantum) || quantum <= 0) {
      throw new Error(
        "El quantum debe ser un entero positivo"
      );
    }

    this.memoriaTotal = memoriaTotal;
    this.quantum = quantum;
    this.politicaAsignacion = politicaAsignacion;

    this.tick = 0;

    this.memoria = new Memoria(
      memoriaTotal,
      politicaAsignacion
    );

    this.colaNuevos = [];
    this.colaEsperandoMemoria = [];
    this.colaListos = [];
    this.colaBloqueados = [];

    this.procesosTerminados = 0;

    this.procesos = [];

    this._pidEjecutando = null;
    this._cambiosContexto = 0;
  }

  get pidEjecutando(): number | null {
    return this._pidEjecutando;
  }

  get cambiosContexto(): number {
    return this._cambiosContexto;
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
      throw new Error(
        "Ya existe un proceso con ese PID"
      );
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
      throw new Error(
        "El proceso no existe"
      );
    }

    if (
      proceso.estado !== EstadoProceso.Nuevo &&
      proceso.estado !== EstadoProceso.EsperandoMemoria
    ) {
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
      proceso.marcarEsperandoMemoria();

      if (!this.colaEsperandoMemoria.includes(pid)) {
        this.colaEsperandoMemoria.push(pid);
      }

      return;
    }

    proceso.marcarListo();

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
    const procesosEnEspera = [
      ...this.colaEsperandoMemoria
    ];

    for (const pid of procesosEnEspera) {
      this.admitirProceso(pid);
    }
  }

  programarEventoES(
    pid: number,
    despuesDeTicksCpu: number,
    duracion: number
  ): void {
    const proceso = this.procesos.find(
      (procesoActual) => procesoActual.pid === pid
    );

    if (!proceso) {
      throw new Error(
        "El proceso no existe"
      );
    }

    proceso.programarEventoES(
      despuesDeTicksCpu,
      duracion
    );
  }

  avanzarTick(): void {
    this.prepararNuevosParaAdmision();
    this.reintentarProcesosEnEspera();

    this.actualizarBloqueados();

    this.ejecutarCpu();

    this.tick++;
  }

  consultarProcesos(): IProcesoVista[] {
    return this.procesos.map((proceso) => ({
      pid: proceso.pid,
      memoriaRequerida: proceso.memoriaRequerida,
      tiempoTotalCpu: proceso.tiempoTotalCpu,
      cpuRestante: proceso.cpuRestante,
      estado: proceso.estado,
      quantumConsumido: proceso.quantumConsumido,
      tiempoBloqueoRestante:
        proceso.tiempoBloqueoRestante,
    }));
  }

  consultarMemoria(): IBloqueMemoria[] {
    return this.memoria.obtenerBloques();
  }

  private prepararNuevosParaAdmision(): void {
    const nuevos = [...this.colaNuevos];

    for (const pid of nuevos) {
      const proceso = this.procesos.find(
        (procesoActual) => procesoActual.pid === pid
      );

      if (!proceso) {
        continue;
      }

      proceso.marcarEsperandoMemoria();

      if (!this.colaEsperandoMemoria.includes(pid)) {
        this.colaEsperandoMemoria.push(pid);
      }
    }

    this.colaNuevos = [];
  }

  private actualizarBloqueados(): void {
    const bloqueados = [...this.colaBloqueados];

    for (const pid of bloqueados) {
      const proceso = this.procesos.find(
        (procesoActual) => procesoActual.pid === pid
      );

      if (!proceso) {
        continue;
      }

      const finalizoBloqueo =
        proceso.actualizarBloqueo();

      if (!finalizoBloqueo) {
        continue;
      }

      proceso.marcarListo();

      this.colaBloqueados =
        this.colaBloqueados.filter(
          (pidActual) => pidActual !== pid
        );

      if (!this.colaListos.includes(pid)) {
        this.colaListos.push(pid);
      }
    }
  }

  private ejecutarCpu(): void {
    if (this._pidEjecutando === null) {
      this.despacharSiguiente();
    }

    if (this._pidEjecutando === null) {
      return;
    }

    const proceso = this.procesos.find(
      (procesoActual) =>
        procesoActual.pid === this._pidEjecutando
    );

    if (!proceso) {
      this._pidEjecutando = null;
      return;
    }

    proceso.ejecutarTick();

    if (proceso.cpuRestante === 0) {
      this.finalizarProceso(proceso);
      return;
    }

    if (proceso.debeBloquearsePorES()) {
      this.bloquearProceso(proceso);
      return;
    }

    if (proceso.quantumConsumido >= this.quantum) {
      this.procesarFinQuantum(proceso);
    }
  }

  private despacharSiguiente(): void {
    const siguientePid = this.colaListos.shift();

    if (siguientePid === undefined) {
      return;
    }

    const proceso = this.procesos.find(
      (procesoActual) =>
        procesoActual.pid === siguientePid
    );

    if (!proceso) {
      return;
    }

    proceso.reiniciarQuantum();
    proceso.marcarEjecutando();

    this._pidEjecutando = proceso.pid;
  }

  private finalizarProceso(proceso: Proceso): void {
    proceso.marcarTerminado();

    this.memoria.liberar(proceso.pid);

    this.procesosTerminados++;

    this._pidEjecutando = null;
  }

  private bloquearProceso(proceso: Proceso): void {
    proceso.bloquearPorES();

    if (!this.colaBloqueados.includes(proceso.pid)) {
      this.colaBloqueados.push(proceso.pid);
    }

    this._pidEjecutando = null;
    this._cambiosContexto++;
  }

  private procesarFinQuantum(proceso: Proceso): void {
    if (this.colaListos.length === 0) {
      proceso.reiniciarQuantum();
      return;
    }

    proceso.marcarListo();
    proceso.reiniciarQuantum();

    this.colaListos.push(proceso.pid);

    this._pidEjecutando = null;
    this._cambiosContexto++;
  }
}
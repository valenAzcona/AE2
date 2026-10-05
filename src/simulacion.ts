import { Proceso } from "./Proceso.js";
import type { IProcesoVista } from "./IProcesoVista.js";
import type { ISimulacion } from "./ISimulacion.js";
import type { IBloqueMemoria } from "./IBloqueMemoria.js";
import type { IMetricas } from "./IMetricas.js";
import type { IEstadoSistema } from "./IEstadoSistema.js";
import { EstadoProceso } from "./EstadoProceso.js";
import { Memoria } from "./Memoria.js";
import { PoliticaAsignacion } from "./PoliticaAsignacion.js";
import { Planificador } from "./Planificador.js";

export class Simulacion implements ISimulacion {
  readonly memoriaTotal: number;
  readonly quantum: number;
  readonly politicaAsignacion: PoliticaAsignacion;

  tick: number;

  colaNuevos: number[];
  colaEsperandoMemoria: number[];
  colaBloqueados: number[];

  procesosTerminados: number;

  private procesos: Proceso[];
  private memoria: Memoria;
  private planificador: Planificador;

  private _ticksConCpuOcupada: number;

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

    this.planificador = new Planificador(quantum);

    this.colaNuevos = [];
    this.colaEsperandoMemoria = [];
    this.colaBloqueados = [];

    this.procesosTerminados = 0;
    this.procesos = [];

    this._ticksConCpuOcupada = 0;
  }

  get colaListos(): number[] {
    return this.planificador.obtenerColaListos();
  }

  get pidEjecutando(): number | null {
    return this.planificador.pidEjecutando;
  }

  get cambiosContexto(): number {
    return this.planificador.cambiosContexto;
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

    this.planificador.encolar(pid);
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

  consultarMetricas(): IMetricas {
    const bloques = this.memoria.obtenerBloques();

    const bloquesLibres = bloques.filter(
      (bloque) => bloque.libre
    );

    const memoriaLibreTotal = bloquesLibres.reduce(
      (total, bloque) => total + bloque.tamanio,
      0
    );

    const mayorBloqueLibre =
      bloquesLibres.length === 0
        ? 0
        : Math.max(
            ...bloquesLibres.map(
              (bloque) => bloque.tamanio
            )
          );

    const memoriaOcupada =
      this.memoriaTotal - memoriaLibreTotal;

    const ocupacionMemoria =
      (memoriaOcupada / this.memoriaTotal) * 100;

    const utilizacionCPU =
      this.tick === 0
        ? 0
        : (
            this._ticksConCpuOcupada /
            this.tick
          ) * 100;

    const fragmentacionExterna =
      memoriaLibreTotal === 0
        ? 0
        : (
            1 -
            mayorBloqueLibre /
              memoriaLibreTotal
          ) * 100;

    return {
      ocupacionMemoria,
      utilizacionCPU,
      cambiosContexto:
        this.planificador.cambiosContexto,
      memoriaLibreTotal,
      mayorBloqueLibre,
      fragmentacionExterna,
    };
  }

  consultarEstado(): IEstadoSistema {
    return {
      tick: this.tick,
      pidEjecutando:
        this.planificador.pidEjecutando,
      colaListos:
        this.planificador.obtenerColaListos(),
      colaEsperandoMemoria: [
        ...this.colaEsperandoMemoria
      ],
      colaBloqueados: [
        ...this.colaBloqueados
      ],
      procesosTerminados:
        this.procesosTerminados,
      memoria:
        this.memoria.obtenerBloques(),
    };
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

      this.planificador.encolar(pid);
    }
  }

  private ejecutarCpu(): void {
    const proceso =
      this.planificador.despachar(this.procesos);

    if (!proceso) {
      return;
    }

    this._ticksConCpuOcupada++;

    proceso.ejecutarTick();

    if (proceso.cpuRestante === 0) {
      this.finalizarProceso(proceso);
      return;
    }

    if (proceso.debeBloquearsePorES()) {
      this.bloquearProceso(proceso);
      return;
    }

    if (
      proceso.quantumConsumido >=
      this.planificador.quantum
    ) {
      this.planificador.procesarFinQuantum(
        proceso
      );
    }
  }

  private finalizarProceso(
    proceso: Proceso
  ): void {
    proceso.marcarTerminado();

    this.memoria.liberar(proceso.pid);

    this.procesosTerminados++;

    this.planificador.liberarCpuPorFinalizacion();
  }

  private bloquearProceso(
    proceso: Proceso
  ): void {
    proceso.bloquearPorES();

    if (!this.colaBloqueados.includes(proceso.pid)) {
      this.colaBloqueados.push(proceso.pid);
    }

    this.planificador.liberarCpuPorBloqueo();
  }
}
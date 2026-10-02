import type { IProceso } from "./IProceso.js";
import { EntidadSimulacion } from "./EntidadSimulacion.js";

export class Proceso extends EntidadSimulacion implements IProceso {
  pid: number;
  memoriaRequerida: number;
  tiempoTotalCpu: number;
  cpuRestante: number;
  estado: string;
  quantumConsumido: number;
  tiempoBloqueoRestante: number;

  constructor(
    pid: number,
    memoriaRequerida: number,
    tiempoTotalCpu: number
  ) {
    super();

    if (!Number.isInteger(pid) || pid <= 0) {
      throw new Error("El PID debe ser un entero positivo");
    }

    if (!Number.isInteger(memoriaRequerida) || memoriaRequerida <= 0) {
      throw new Error("La memoria requerida debe ser un entero positivo");
    }

    if (!Number.isInteger(tiempoTotalCpu) || tiempoTotalCpu <= 0) {
      throw new Error("El tiempo total de CPU debe ser un entero positivo");
    }

    this.pid = pid;
    this.memoriaRequerida = memoriaRequerida;
    this.tiempoTotalCpu = tiempoTotalCpu;
    this.cpuRestante = tiempoTotalCpu;
    this.estado = "Nuevo";
    this.quantumConsumido = 0;
    this.tiempoBloqueoRestante = 0;
  }

  override obtenerResumen(): string {
    return `PID ${this.pid} - Estado: ${this.estado} - CPU restante: ${this.cpuRestante}`;
  }
}
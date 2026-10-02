export interface IProceso {
  pid: number;
  memoriaRequerida: number;
  tiempoTotalCpu: number;
  cpuRestante: number;
  estado: string;
  quantumConsumido: number;
  tiempoBloqueoRestante: number;

  obtenerResumen(): string;
}
export interface IBloqueMemoria {
  readonly inicio: number;
  readonly tamanio: number;
  readonly libre: boolean;
  readonly pidProceso: number | null;

  obtenerFin(): number;
}
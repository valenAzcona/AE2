export interface IBloqueMemoria {
  inicio: number;
  tamanio: number;
  libre: boolean;
  pidProceso: number | null;
}

export interface IMemoria {
  readonly tamanioTotal: number;

  obtenerBloques(): IBloqueMemoria[];

  asignar(
    pid: number,
    tamanio: number
  ): boolean;

  liberar(pid: number): void;
}
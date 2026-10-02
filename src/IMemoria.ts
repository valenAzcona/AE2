export interface IBloqueMemoria {
  inicio: number;
  tamanio: number;
  libre: boolean;
}

export interface IMemoria {
  readonly tamanioTotal: number;

  obtenerBloques(): IBloqueMemoria[];

  buscarBloqueDisponible(
    tamanio: number
  ): IBloqueMemoria | undefined;
}
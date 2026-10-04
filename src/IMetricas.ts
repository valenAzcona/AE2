export interface IMetricas {
  readonly ocupacionMemoria: number;
  readonly utilizacionCPU: number;
  readonly cambiosContexto: number;
  readonly memoriaLibreTotal: number;
  readonly mayorBloqueLibre: number;
  readonly fragmentacionExterna: number;
}
import type { IBloqueMemoria } from "./IBloqueMemoria.js";
import type { IPoliticaAsignacion } from "./IPoliticaAsignacion.js";

export class PrimerAjuste implements IPoliticaAsignacion {
  readonly nombre = "First-Fit";

  seleccionar(
    bloques: readonly IBloqueMemoria[],
    tamanio: number
  ): number {
    return bloques.findIndex(
      (bloque) => bloque.libre && bloque.tamanio >= tamanio
    );
  }
}
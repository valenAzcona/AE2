import type { IBloqueMemoria } from "./IBloqueMemoria.js";
import type { IPoliticaAsignacion } from "./IPoliticaAsignacion.js";

export class MejorAjuste implements IPoliticaAsignacion {
  readonly nombre = "Best-Fit";

  seleccionar(
    bloques: readonly IBloqueMemoria[],
    tamanio: number
  ): number {
    let elegido = -1;

    bloques.forEach((bloque, i) => {
      if (!bloque.libre || bloque.tamanio < tamanio) {
        return;
      }

      // Comparación estricta: en empate se conserva la menor dirección.
      if (elegido === -1 || bloque.tamanio < bloques[elegido]!.tamanio) {
        elegido = i;
      }
    });

    return elegido;
  }
}
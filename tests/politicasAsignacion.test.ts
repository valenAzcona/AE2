import { describe, expect, it } from "vitest";
import { BloqueMemoria } from "../src/BloqueMemoria.js";
import { PrimerAjuste } from "../src/PrimerAjuste.js";
import { MejorAjuste } from "../src/MejorAjuste.js";
import { PeorAjuste } from "../src/PeorAjuste.js";
import { PoliticaAsignacion } from "../src/PoliticaAsignacion.js";
import { Memoria } from "../src/Memoria.js";

describe("Politicas de asignacion", () => {
  const bloques = [
    new BloqueMemoria(0, 100, true, null),
    new BloqueMemoria(100, 200, false, 1),
    new BloqueMemoria(300, 300, true, null),
    new BloqueMemoria(600, 150, true, null),
  ];

  it("First-Fit selecciona el primer bloque suficiente", () => {
    const politica = new PrimerAjuste();

    expect(
      politica.seleccionar(bloques, 120)
    ).toBe(2);
  });

  it("Best-Fit selecciona el bloque suficiente mas pequeno", () => {
    const politica = new MejorAjuste();

    expect(
      politica.seleccionar(bloques, 120)
    ).toBe(3);
  });

  it("Worst-Fit selecciona el bloque suficiente mas grande", () => {
    const politica = new PeorAjuste();

    expect(
      politica.seleccionar(bloques, 120)
    ).toBe(2);
  });

  it("devuelven -1 cuando ningun bloque alcanza", () => {
    expect(
      new PrimerAjuste().seleccionar(
        bloques,
        500
      )
    ).toBe(-1);

    expect(
      new MejorAjuste().seleccionar(
        bloques,
        500
      )
    ).toBe(-1);

    expect(
      new PeorAjuste().seleccionar(
        bloques,
        500
      )
    ).toBe(-1);
  });

  it("Best-Fit conserva la menor direccion ante empate", () => {
    const bloquesEmpatados = [
      new BloqueMemoria(0, 200, true, null),
      new BloqueMemoria(200, 100, false, 1),
      new BloqueMemoria(300, 200, true, null),
    ];

    const politica = new MejorAjuste();

    expect(
      politica.seleccionar(
        bloquesEmpatados,
        150
      )
    ).toBe(0);
  });

  it("Worst-Fit conserva la menor direccion ante empate", () => {
    const bloquesEmpatados = [
      new BloqueMemoria(0, 300, true, null),
      new BloqueMemoria(300, 100, false, 1),
      new BloqueMemoria(400, 300, true, null),
    ];

    const politica = new PeorAjuste();

    expect(
      politica.seleccionar(
        bloquesEmpatados,
        150
      )
    ).toBe(0);
  });

  it("compara First-Fit, Best-Fit y Worst-Fit con el mismo escenario", () => {
   const crearEscenario = (
    politica: PoliticaAsignacion
   ) => {
    const memoria = new Memoria(1200, politica);

    memoria.asignar(1, 100);
    memoria.asignar(2, 200);
    memoria.asignar(3, 100);
    memoria.asignar(4, 300);
    memoria.asignar(5, 100);
    memoria.asignar(6, 150);
    memoria.asignar(7, 250);

    memoria.liberar(2);
    memoria.liberar(4);
    memoria.liberar(6);

    memoria.asignar(8, 140);

    return memoria
      .obtenerBloques()
      .find(
        (bloque) =>
          bloque.pidProceso === 8
      )?.inicio;
   };

   const inicioFirstFit = crearEscenario(
    PoliticaAsignacion.FirstFit
   );

   const inicioBestFit = crearEscenario(
    PoliticaAsignacion.BestFit
   );

   const inicioWorstFit = crearEscenario(
    PoliticaAsignacion.WorstFit
   );

   expect(inicioFirstFit).toBe(100);
   expect(inicioBestFit).toBe(800);
   expect(inicioWorstFit).toBe(400);
  });
});
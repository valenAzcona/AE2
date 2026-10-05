import { describe, expect, it } from "vitest";
import { BloqueMemoria } from "../src/BloqueMemoria.js";
import { PrimerAjuste } from "../src/PrimerAjuste.js";
import { MejorAjuste } from "../src/MejorAjuste.js";
import { PeorAjuste } from "../src/PeorAjuste.js";

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
});
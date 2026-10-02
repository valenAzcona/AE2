import { describe, expect, it } from "vitest";
import { Simulacion } from "../src/simulacion.js";

describe("RF01 - Configurar e iniciar la simulación", () => {
  it("inicia correctamente con memoria y quantum válidos", () => {
    const simulacion = new Simulacion(1024, 4);

    expect(simulacion.memoriaTotal).toBe(1024);
    expect(simulacion.quantum).toBe(4);
    expect(simulacion.tick).toBe(0);

    expect(simulacion.bloques).toEqual([
      {
        inicio: 0,
        tamanio: 1024,
        libre: true,
      },
    ]);

    expect(simulacion.colaNuevos).toEqual([]);
    expect(simulacion.colaEsperandoMemoria).toEqual([]);
    expect(simulacion.colaListos).toEqual([]);
    expect(simulacion.colaBloqueados).toEqual([]);
    expect(simulacion.procesosTerminados).toBe(0);
  });

  it("rechaza memoria total inválida", () => {
    expect(() => new Simulacion(0, 4)).toThrow();
    expect(() => new Simulacion(-100, 4)).toThrow();
    expect(() => new Simulacion(100.5, 4)).toThrow();
  });

  it("rechaza quantum inválido", () => {
    expect(() => new Simulacion(1024, 0)).toThrow();
    expect(() => new Simulacion(1024, -2)).toThrow();
    expect(() => new Simulacion(1024, 2.5)).toThrow();
  });
});

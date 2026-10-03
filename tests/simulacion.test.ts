import { describe, expect, it } from "vitest";
import { Simulacion } from "../src/simulacion.js";

describe("RF01 - Configurar e iniciar la simulacion", () => {
  it("inicia correctamente con memoria y quantum validos", () => {
    const simulacion = new Simulacion(1024, 4);

    expect(simulacion.memoriaTotal).toBe(1024);
    expect(simulacion.quantum).toBe(4);
    expect(simulacion.tick).toBe(0);

    expect(simulacion.consultarMemoria()).toEqual([
      {
        inicio: 0,
        tamanio: 1024,
        libre: true,
        pidProceso: null,
        obtenerFin: expect.any(Function),
      },
    ]);

    expect(simulacion.colaNuevos).toEqual([]);
    expect(simulacion.colaEsperandoMemoria).toEqual([]);
    expect(simulacion.colaListos).toEqual([]);
    expect(simulacion.colaBloqueados).toEqual([]);
    expect(simulacion.procesosTerminados).toBe(0);
  });

  it("rechaza memoria total invalida", () => {
    expect(() => new Simulacion(0, 4)).toThrow();
    expect(() => new Simulacion(-100, 4)).toThrow();
    expect(() => new Simulacion(100.5, 4)).toThrow();
  });

  it("rechaza quantum invalido", () => {
    expect(() => new Simulacion(1024, 0)).toThrow();
    expect(() => new Simulacion(1024, -2)).toThrow();
    expect(() => new Simulacion(1024, 2.5)).toThrow();
  });
});
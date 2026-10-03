import { describe, expect, it } from "vitest";
import { Simulacion } from "../src/simulacion.js";
import { EstadoProceso } from "../src/EstadoProceso.js";

describe("RF03 - Gestionar estados y admision", () => {
  it("admite un proceso y lo pasa a Listo cuando hay memoria", () => {
    const simulacion = new Simulacion(1024, 4);

    simulacion.registrarProceso(1, 128, 10);
    simulacion.admitirProceso(1);

    const procesos = simulacion.consultarProcesos();

    expect(procesos[0]?.estado).toBe(EstadoProceso.Listo);
    expect(simulacion.colaNuevos).toEqual([]);
    expect(simulacion.colaListos).toEqual([1]);
  });

  it("deja un proceso Esperando Memoria cuando no hay bloque suficiente", () => {
    const simulacion = new Simulacion(300, 4);

    simulacion.registrarProceso(1, 200, 10);
    simulacion.registrarProceso(2, 150, 10);

    simulacion.admitirProceso(1);
    simulacion.admitirProceso(2);

    const procesos = simulacion.consultarProcesos();

    const proceso2 = procesos.find(
      (proceso) => proceso.pid === 2
    );

    expect(proceso2?.estado).toBe(
      EstadoProceso.EsperandoMemoria
    );

    expect(simulacion.colaEsperandoMemoria).toEqual([2]);
  });

  it("admite un proceso en espera cuando se libera memoria", () => {
    const simulacion = new Simulacion(300, 4);

    simulacion.registrarProceso(1, 200, 10);
    simulacion.registrarProceso(2, 150, 10);

    simulacion.admitirProceso(1);
    simulacion.admitirProceso(2);

    simulacion.liberarMemoria(1);
    simulacion.avanzarTick();

    const procesos = simulacion.consultarProcesos();

    const proceso2 = procesos.find(
      (proceso) => proceso.pid === 2
    );

    expect(proceso2?.estado).toBe(EstadoProceso.Listo);
    expect(simulacion.colaEsperandoMemoria).toEqual([]);
    expect(simulacion.colaListos).toContain(2);
    expect(simulacion.tick).toBe(1);
  });

  it("no duplica un proceso en la cola de Listos", () => {
    const simulacion = new Simulacion(1024, 4);

    simulacion.registrarProceso(1, 128, 10);
    simulacion.admitirProceso(1);

    expect(simulacion.colaListos).toEqual([1]);

    simulacion.admitirProceso(1);

    expect(simulacion.colaListos).toEqual([1]);
  });
});
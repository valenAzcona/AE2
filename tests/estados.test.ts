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

  it("salta un proceso que no entra y admite al siguiente que si entra", () => {
    const simulacion = new Simulacion(500, 4);

    simulacion.registrarProceso(1, 200, 10);
    simulacion.registrarProceso(2, 200, 10);
    simulacion.registrarProceso(3, 100, 10);

    simulacion.admitirProceso(1);
    simulacion.admitirProceso(2);
    simulacion.admitirProceso(3);

    simulacion.registrarProceso(4, 150, 10);
    simulacion.registrarProceso(5, 80, 10);

    simulacion.admitirProceso(4);
    simulacion.admitirProceso(5);

    expect(simulacion.colaEsperandoMemoria).toEqual([
      4,
      5,
    ]);

    simulacion.liberarMemoria(3);

    simulacion.reintentarProcesosEnEspera();

    const procesos = simulacion.consultarProcesos();

    const proceso4 = procesos.find(
      (proceso) => proceso.pid === 4
    );

    const proceso5 = procesos.find(
      (proceso) => proceso.pid === 5
    );

    expect(proceso4?.estado).toBe(
      EstadoProceso.EsperandoMemoria
    );

    expect(proceso5?.estado).toBe(
      EstadoProceso.Listo
    );

    expect(simulacion.colaEsperandoMemoria).toEqual([
      4,
    ]);

    expect(simulacion.colaListos).toContain(5);
  });
});
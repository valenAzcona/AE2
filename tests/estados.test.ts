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

  it("deja un proceso Esperando Memoria cuando no hay un bloque disponible", () => {
    const simulacion = new Simulacion(1024, 4);

    simulacion.registrarProceso(1, 128, 10);
    simulacion.registrarProceso(2, 256, 10);

    simulacion.admitirProceso(1);
    simulacion.admitirProceso(2);

    const procesos = simulacion.consultarProcesos();
    const proceso2 = procesos.find((proceso) => proceso.pid === 2);

    expect(proceso2?.estado).toBe(EstadoProceso.EsperandoMemoria);
    expect(simulacion.colaEsperandoMemoria).toEqual([2]);
  });

  it("reintenta los procesos en espera al avanzar un tick", () => {
    const simulacion = new Simulacion(1024, 4);

    simulacion.registrarProceso(1, 128, 10);
    simulacion.registrarProceso(2, 256, 10);

    simulacion.admitirProceso(1);
    simulacion.admitirProceso(2);

    simulacion.bloques[0]!.libre = true;

    simulacion.avanzarTick();

    const procesos = simulacion.consultarProcesos();
    const proceso2 = procesos.find((proceso) => proceso.pid === 2);

    expect(proceso2?.estado).toBe(EstadoProceso.Listo);
    expect(simulacion.colaEsperandoMemoria).toEqual([]);
    expect(simulacion.colaListos).toContain(2);
    expect(simulacion.tick).toBe(1);
  });

  it("un proceso que no entra no impide admitir otro que si cabe", () => {
    const simulacion = new Simulacion(1024, 4);

    simulacion.registrarProceso(1, 300, 10);
    simulacion.registrarProceso(2, 100, 10);

    simulacion.bloques[0]!.tamanio = 200;
    simulacion.bloques[0]!.libre = false;

    simulacion.admitirProceso(1);
    simulacion.admitirProceso(2);

    simulacion.bloques[0]!.libre = true;

    simulacion.reintentarProcesosEnEspera();

    const procesos = simulacion.consultarProcesos();

    const proceso1 = procesos.find((proceso) => proceso.pid === 1);
    const proceso2 = procesos.find((proceso) => proceso.pid === 2);

    expect(proceso1?.estado).toBe(
      EstadoProceso.EsperandoMemoria
    );

    expect(proceso2?.estado).toBe(EstadoProceso.Listo);
  });
});
import { describe, expect, it } from "vitest";
import { Simulacion } from "../src/simulacion.js";
import { EstadoProceso } from "../src/EstadoProceso.js";

describe("RF02 - Registrar y consultar procesos", () => {
  it("registra correctamente un proceso", () => {
    const simulacion = new Simulacion(1024, 4);

    simulacion.registrarProceso(1, 128, 10);

    const procesos = simulacion.consultarProcesos();

    expect(procesos).toHaveLength(1);

    expect(procesos[0]).toMatchObject({
      pid: 1,
      memoriaRequerida: 128,
      tiempoTotalCpu: 10,
      cpuRestante: 10,
      estado: EstadoProceso.Nuevo,
      quantumConsumido: 0,
      tiempoBloqueoRestante: 0,
    });
  });

  it("agrega el proceso nuevo a la cola de Nuevos", () => {
    const simulacion = new Simulacion(1024, 4);

    simulacion.registrarProceso(1, 128, 10);

    expect(simulacion.colaNuevos).toEqual([1]);
  });

  it("rechaza un PID duplicado", () => {
    const simulacion = new Simulacion(1024, 4);

    simulacion.registrarProceso(1, 128, 10);

    expect(() =>
      simulacion.registrarProceso(1, 256, 20)
    ).toThrow("Ya existe un proceso con ese PID");
  });

  it("rechaza una memoria requerida mayor que la memoria total", () => {
    const simulacion = new Simulacion(1024, 4);

    expect(() =>
      simulacion.registrarProceso(1, 2048, 10)
    ).toThrow(
      "La memoria requerida no puede superar la memoria total"
    );
  });

  it("rechaza datos invalidos del proceso", () => {
    const simulacion = new Simulacion(1024, 4);

    expect(() =>
      simulacion.registrarProceso(0, 128, 10)
    ).toThrow();

    expect(() =>
      simulacion.registrarProceso(1, 0, 10)
    ).toThrow();

    expect(() =>
      simulacion.registrarProceso(1, 128, 0)
    ).toThrow();
  });

  it("consultar procesos devuelve una nueva coleccion", () => {
    const simulacion = new Simulacion(1024, 4);

    simulacion.registrarProceso(1, 128, 10);

    const primeraConsulta =
      simulacion.consultarProcesos();

    const segundaConsulta =
      simulacion.consultarProcesos();

    expect(primeraConsulta).not.toBe(
      segundaConsulta
    );

    expect(primeraConsulta[0]).not.toBe(
      segundaConsulta[0]
    );

    expect(segundaConsulta[0]).toMatchObject({
      pid: 1,
      cpuRestante: 10,
      estado: EstadoProceso.Nuevo,
    });
  });
});
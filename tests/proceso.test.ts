import { describe, expect, it } from "vitest";
import { Simulacion } from "../src/simulacion.js";
import { Proceso } from "../src/Proceso.js";
import { EstadoProceso } from "../src/EstadoProceso.js";

describe("RF02 - Registrar y consultar procesos", () => {
  it("crea un proceso con sus valores iniciales correctos", () => {
    const proceso = new Proceso(1, 128, 10);

    expect(proceso.pid).toBe(1);
    expect(proceso.memoriaRequerida).toBe(128);
    expect(proceso.tiempoTotalCpu).toBe(10);
    expect(proceso.cpuRestante).toBe(10);
    expect(proceso.estado).toBe(EstadoProceso.Nuevo);
    expect(proceso.quantumConsumido).toBe(0);
    expect(proceso.tiempoBloqueoRestante).toBe(0);
  });

  it("rechaza procesos con datos invalidos", () => {
    expect(() => new Proceso(0, 128, 10)).toThrow();
    expect(() => new Proceso(1, 0, 10)).toThrow();
    expect(() => new Proceso(1, 128, 0)).toThrow();

    expect(() => new Proceso(1.5, 128, 10)).toThrow();
    expect(() => new Proceso(1, 128.5, 10)).toThrow();
    expect(() => new Proceso(1, 128, 10.5)).toThrow();
  });

  it("registra un proceso y lo agrega a la cola de nuevos", () => {
    const simulacion = new Simulacion(1024, 4);

    simulacion.registrarProceso(1, 128, 10);

    const procesos = simulacion.consultarProcesos();

    expect(procesos).toHaveLength(1);
    expect(procesos[0]?.pid).toBe(1);
    expect(simulacion.colaNuevos).toEqual([1]);
  });

  it("rechaza PID duplicados", () => {
    const simulacion = new Simulacion(1024, 4);

    simulacion.registrarProceso(1, 128, 10);

    expect(() =>
      simulacion.registrarProceso(1, 256, 20)
    ).toThrow("Ya existe un proceso con ese PID");
  });

  it("rechaza procesos que requieren mas memoria que la memoria total", () => {
    const simulacion = new Simulacion(1024, 4);

    expect(() =>
      simulacion.registrarProceso(1, 2048, 10)
    ).toThrow("La memoria requerida no puede superar la memoria total");
  });

  it("consultar procesos devuelve una copia y no permite modificar el proceso interno", () => {
    const simulacion = new Simulacion(1024, 4);

    simulacion.registrarProceso(1, 128, 10);

    const procesos = simulacion.consultarProcesos();

    procesos[0]!.cpuRestante = 0;
    procesos[0]!.estado = EstadoProceso.Terminado;

    const procesosInternos = simulacion.consultarProcesos();

    expect(procesosInternos[0]?.cpuRestante).toBe(10);
    expect(procesosInternos[0]?.estado).toBe(EstadoProceso.Nuevo);
  });
});
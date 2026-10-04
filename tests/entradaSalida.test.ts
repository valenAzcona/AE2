import { describe, expect, it } from "vitest";
import { Simulacion } from "../src/simulacion.js";
import { EstadoProceso } from "../src/EstadoProceso.js";

describe("RF08 - Entrada y Salida", () => {
  it("bloquea un proceso cuando se dispara su evento de E/S", () => {
    const simulacion = new Simulacion(1024, 4);

    simulacion.registrarProceso(1, 200, 5);

    simulacion.programarEventoES(
      1,
      2,
      3
    );

    simulacion.avanzarTick();
    simulacion.avanzarTick();

    const procesos =
      simulacion.consultarProcesos();

    const proceso1 = procesos.find(
      (proceso) => proceso.pid === 1
    );

    expect(proceso1?.estado).toBe(
      EstadoProceso.Bloqueado
    );

    expect(proceso1?.cpuRestante).toBe(3);

    expect(proceso1?.tiempoBloqueoRestante).toBe(3);

    expect(simulacion.colaBloqueados).toEqual([1]);

    expect(simulacion.pidEjecutando).toBeNull();

    expect(simulacion.cambiosContexto).toBe(1);
  });

  it("un proceso bloqueado conserva su memoria", () => {
    const simulacion = new Simulacion(1024, 4);

    simulacion.registrarProceso(1, 200, 5);

    simulacion.programarEventoES(
      1,
      1,
      2
    );

    simulacion.avanzarTick();

    const bloques =
      simulacion.consultarMemoria();

    const bloqueProceso1 = bloques.find(
      (bloque) =>
        bloque.pidProceso === 1
    );

    expect(bloqueProceso1).toBeDefined();

    expect(bloqueProceso1).toMatchObject({
      inicio: 0,
      tamanio: 200,
      libre: false,
      pidProceso: 1,
    });
  });

  it("no consume CPU mientras permanece bloqueado", () => {
    const simulacion = new Simulacion(1024, 4);

    simulacion.registrarProceso(1, 200, 5);

    simulacion.programarEventoES(
      1,
      1,
      3
    );

    simulacion.avanzarTick();

    let procesos =
      simulacion.consultarProcesos();

    let proceso1 = procesos.find(
      (proceso) => proceso.pid === 1
    );

    expect(proceso1?.cpuRestante).toBe(4);

    expect(proceso1?.estado).toBe(
      EstadoProceso.Bloqueado
    );

    simulacion.avanzarTick();

    procesos =
      simulacion.consultarProcesos();

    proceso1 = procesos.find(
      (proceso) => proceso.pid === 1
    );

    expect(proceso1?.cpuRestante).toBe(4);

    expect(proceso1?.estado).toBe(
      EstadoProceso.Bloqueado
    );

    expect(
      proceso1?.tiempoBloqueoRestante
    ).toBe(2);
  });

  it("vuelve a Listos al terminar el bloqueo y puede ejecutar en ese mismo tick", () => {
    const simulacion = new Simulacion(1024, 4);

    simulacion.registrarProceso(1, 200, 5);

    simulacion.programarEventoES(
      1,
      1,
      2
    );

    simulacion.avanzarTick();

    let proceso1 =
      simulacion.consultarProcesos().find(
        (proceso) => proceso.pid === 1
      );

    expect(proceso1?.estado).toBe(
      EstadoProceso.Bloqueado
    );

    expect(proceso1?.cpuRestante).toBe(4);

    simulacion.avanzarTick();

    proceso1 =
      simulacion.consultarProcesos().find(
        (proceso) => proceso.pid === 1
      );

    expect(proceso1?.estado).toBe(
      EstadoProceso.Bloqueado
    );

    expect(proceso1?.cpuRestante).toBe(4);

    simulacion.avanzarTick();

    proceso1 =
      simulacion.consultarProcesos().find(
        (proceso) => proceso.pid === 1
      );

    expect(proceso1?.estado).toBe(
      EstadoProceso.Ejecutando
    );

    expect(proceso1?.cpuRestante).toBe(3);

    expect(
      simulacion.colaBloqueados
    ).toEqual([]);

    expect(simulacion.pidEjecutando).toBe(1);
  });

  it("el bloqueo tiene prioridad sobre el fin de quantum", () => {
    const simulacion = new Simulacion(1024, 2);

    simulacion.registrarProceso(1, 200, 5);
    simulacion.registrarProceso(2, 200, 5);

    simulacion.programarEventoES(
      1,
      2,
      2
    );

    simulacion.avanzarTick();
    simulacion.avanzarTick();

    const proceso1 =
      simulacion.consultarProcesos().find(
        (proceso) => proceso.pid === 1
      );

    expect(proceso1?.estado).toBe(
      EstadoProceso.Bloqueado
    );

    expect(
      simulacion.colaListos.includes(1)
    ).toBe(false);

    expect(
      simulacion.colaBloqueados
    ).toEqual([1]);

    expect(simulacion.cambiosContexto).toBe(1);
  });

  it("rechaza eventos de E/S invalidos", () => {
    const simulacion = new Simulacion(1024, 4);

    simulacion.registrarProceso(1, 200, 5);

    expect(() =>
      simulacion.programarEventoES(
        1,
        0,
        2
      )
    ).toThrow();

    expect(() =>
      simulacion.programarEventoES(
        1,
        2,
        0
      )
    ).toThrow();

    expect(() =>
      simulacion.programarEventoES(
        1,
        5,
        2
      )
    ).toThrow();
  });

  it("rechaza programar E/S para un proceso inexistente", () => {
    const simulacion = new Simulacion(1024, 4);

    expect(() =>
      simulacion.programarEventoES(
        99,
        1,
        2
      )
    ).toThrow(
      "El proceso no existe"
    );
  });
});
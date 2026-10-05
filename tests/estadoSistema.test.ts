import { describe, expect, it } from "vitest";
import { Simulacion } from "../src/simulacion.js";
import { EstadoProceso } from "../src/EstadoProceso.js";

describe("RF10 - Consultar estado del sistema", () => {
  it("expone tick, CPU, colas, terminados y memoria", () => {
    const simulacion = new Simulacion(500, 2);

    simulacion.registrarProceso(1, 100, 3);
    simulacion.registrarProceso(2, 200, 2);

    simulacion.avanzarTick();

    const estado = simulacion.consultarEstado();

    expect(estado.tick).toBe(1);
    expect(estado.pidEjecutando).toBe(1);
    expect(estado.colaListos).toEqual([2]);
    expect(estado.colaEsperandoMemoria).toEqual([]);
    expect(estado.colaBloqueados).toEqual([]);
    expect(estado.procesosTerminados).toBe(0);
    expect(estado.memoria.length).toBeGreaterThan(0);
  });

  it("refleja procesos bloqueados", () => {
    const simulacion = new Simulacion(500, 4);

    simulacion.registrarProceso(1, 100, 5);

    simulacion.programarEventoES(
      1,
      1,
      2
    );

    simulacion.avanzarTick();

    const estado = simulacion.consultarEstado();

    expect(estado.pidEjecutando).toBeNull();
    expect(estado.colaBloqueados).toEqual([1]);
  });

  it("refleja procesos terminados", () => {
    const simulacion = new Simulacion(500, 2);

    simulacion.registrarProceso(1, 100, 1);

    simulacion.avanzarTick();

    const estado = simulacion.consultarEstado();

    expect(estado.procesosTerminados).toBe(1);

    const proceso1 =
      simulacion.consultarProcesos().find(
        (proceso) => proceso.pid === 1
      );

    expect(proceso1?.estado).toBe(
      EstadoProceso.Terminado
    );
  });

  it("devuelve copias de las colas internas", () => {
    const simulacion = new Simulacion(500, 2);

    simulacion.registrarProceso(1, 100, 5);
    simulacion.registrarProceso(2, 100, 5);

    simulacion.avanzarTick();

    const estado =
      simulacion.consultarEstado();

    const colaListos =
      estado.colaListos as number[];

    colaListos.push(99);

    const nuevoEstado =
      simulacion.consultarEstado();

    expect(
      nuevoEstado.colaListos.includes(99)
    ).toBe(false);
  });

  it("devuelve una copia del mapa de memoria", () => {
    const simulacion = new Simulacion(500, 2);

    simulacion.registrarProceso(1, 100, 5);
    simulacion.admitirProceso(1);

    const primerEstado =
      simulacion.consultarEstado();

    const segundoEstado =
      simulacion.consultarEstado();

    expect(primerEstado.memoria).not.toBe(
      segundoEstado.memoria
    );

    const primerMapa =
      primerEstado.memoria.map((bloque) => ({
        inicio: bloque.inicio,
        tamanio: bloque.tamanio,
        libre: bloque.libre,
        pidProceso: bloque.pidProceso,
      }));

    const segundoMapa =
      segundoEstado.memoria.map((bloque) => ({
        inicio: bloque.inicio,
        tamanio: bloque.tamanio,
        libre: bloque.libre,
        pidProceso: bloque.pidProceso,
      }));

    expect(primerMapa).toEqual(segundoMapa);
  });
});
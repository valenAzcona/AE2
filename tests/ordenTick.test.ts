import { describe, expect, it } from "vitest";
import { Simulacion } from "../src/simulacion.js";
import { EstadoProceso } from "../src/EstadoProceso.js";

describe("RF06 - Orden del tick e invariantes", () => {
  it("la memoria liberada al finalizar un tick se usa recien en el siguiente", () => {
    const simulacion = new Simulacion(300, 4);

    simulacion.registrarProceso(1, 300, 1);
    simulacion.registrarProceso(2, 200, 2);

    simulacion.avanzarTick();

    let procesos = simulacion.consultarProcesos();

    const proceso1 = procesos.find(
      (proceso) => proceso.pid === 1
    );

    const proceso2 = procesos.find(
      (proceso) => proceso.pid === 2
    );

    expect(proceso1?.estado).toBe(
      EstadoProceso.Terminado
    );

    expect(proceso2?.estado).toBe(
      EstadoProceso.EsperandoMemoria
    );

    expect(proceso2?.cpuRestante).toBe(2);

    expect(
      simulacion.colaEsperandoMemoria
    ).toEqual([2]);

    simulacion.avanzarTick();

    procesos = simulacion.consultarProcesos();

    const proceso2Despues = procesos.find(
      (proceso) => proceso.pid === 2
    );

    expect(proceso2Despues?.estado).toBe(
      EstadoProceso.Ejecutando
    );

    expect(proceso2Despues?.cpuRestante).toBe(1);

    expect(
      simulacion.colaEsperandoMemoria
    ).toEqual([]);
  });

  it("como maximo un proceso consume CPU por tick", () => {
    const simulacion = new Simulacion(1000, 2);

    simulacion.registrarProceso(1, 100, 5);
    simulacion.registrarProceso(2, 100, 5);
    simulacion.registrarProceso(3, 100, 5);

    const antes = simulacion.consultarProcesos();

    simulacion.avanzarTick();

    const despues = simulacion.consultarProcesos();

    const procesosQueConsumieronCpu =
      despues.filter((procesoDespues) => {
        const procesoAntes = antes.find(
          (proceso) =>
            proceso.pid === procesoDespues.pid
        );

        return (
          procesoAntes !== undefined &&
          procesoDespues.cpuRestante ===
            procesoAntes.cpuRestante - 1
        );
      });

    expect(procesosQueConsumieronCpu).toHaveLength(1);
  });

  it("no duplica procesos en las colas", () => {
    const simulacion = new Simulacion(500, 4);

    simulacion.registrarProceso(1, 200, 5);
    simulacion.registrarProceso(2, 400, 5);

    simulacion.admitirProceso(1);
    simulacion.admitirProceso(2);

    simulacion.reintentarProcesosEnEspera();
    simulacion.reintentarProcesosEnEspera();

    expect(
      simulacion.colaEsperandoMemoria
    ).toEqual([2]);

    expect(
      new Set(simulacion.colaEsperandoMemoria).size
    ).toBe(
      simulacion.colaEsperandoMemoria.length
    );

    expect(
      new Set(simulacion.colaListos).size
    ).toBe(
      simulacion.colaListos.length
    );
  });

  it("mantiene los bloques de memoria ordenados y sin solapamientos", () => {
    const simulacion = new Simulacion(500, 4);

    simulacion.registrarProceso(1, 100, 5);
    simulacion.registrarProceso(2, 200, 5);
    simulacion.registrarProceso(3, 150, 5);

    simulacion.admitirProceso(1);
    simulacion.admitirProceso(2);
    simulacion.admitirProceso(3);

    simulacion.liberarMemoria(2);

    const bloques = simulacion.consultarMemoria();

    const tamanioTotal = bloques.reduce(
      (total, bloque) =>
        total + bloque.tamanio,
      0
    );

    expect(tamanioTotal).toBe(500);

    expect(bloques[0]?.inicio).toBe(0);

    for (let i = 0; i < bloques.length - 1; i++) {
      const actual = bloques[i]!;
      const siguiente = bloques[i + 1]!;

      expect(
        actual.inicio + actual.tamanio
      ).toBe(siguiente.inicio);
    }

    const ultimo = bloques[bloques.length - 1]!;

    expect(
      ultimo.inicio + ultimo.tamanio
    ).toBe(500);
  });

  it("nunca hay mas de un proceso en estado Ejecutando", () => {
    const simulacion = new Simulacion(1000, 2);

    simulacion.registrarProceso(1, 100, 5);
    simulacion.registrarProceso(2, 100, 5);
    simulacion.registrarProceso(3, 100, 5);

    for (let i = 0; i < 6; i++) {
      simulacion.avanzarTick();

      const ejecutando =
        simulacion.consultarProcesos().filter(
          (proceso) =>
            proceso.estado ===
            EstadoProceso.Ejecutando
        );

      expect(ejecutando.length).toBeLessThanOrEqual(1);
    }
  });
});
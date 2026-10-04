import { describe, expect, it } from "vitest";
import { Simulacion } from "../src/simulacion.js";
import { EstadoProceso } from "../src/EstadoProceso.js";

describe("RF07 - Planificacion Round Robin", () => {
  it("ejecuta P1, P1, P2, P2, P1 con quantum 2", () => {
    const simulacion = new Simulacion(1024, 2);

    simulacion.registrarProceso(1, 100, 3);
    simulacion.registrarProceso(2, 100, 2);

    const secuencia: number[] = [];

    for (let i = 0; i < 5; i++) {
      const antes = simulacion.consultarProcesos();

      simulacion.avanzarTick();

      const despues = simulacion.consultarProcesos();

      const procesoEjecutado = despues.find(
        (procesoDespues) => {
          const procesoAntes = antes.find(
            (proceso) =>
              proceso.pid === procesoDespues.pid
          );

          return (
            procesoAntes !== undefined &&
            procesoDespues.cpuRestante ===
              procesoAntes.cpuRestante - 1
          );
        }
      );

      if (procesoEjecutado) {
        secuencia.push(procesoEjecutado.pid);
      }
    }

    expect(secuencia).toEqual([
      1,
      1,
      2,
      2,
      1,
    ]);

    expect(simulacion.cambiosContexto).toBe(1);
  });

  it("un unico proceso renueva quantum sin cambio de contexto", () => {
    const simulacion = new Simulacion(1024, 2);

    simulacion.registrarProceso(1, 100, 5);

    simulacion.avanzarTick();
    simulacion.avanzarTick();

    const procesos = simulacion.consultarProcesos();

    const proceso1 = procesos.find(
      (proceso) => proceso.pid === 1
    );

    expect(proceso1?.estado).toBe(
      EstadoProceso.Ejecutando
    );

    expect(proceso1?.quantumConsumido).toBe(0);
    expect(proceso1?.cpuRestante).toBe(3);

    expect(simulacion.cambiosContexto).toBe(0);
    expect(simulacion.pidEjecutando).toBe(1);
  });

  it("finalizar en el limite del quantum no reencola el proceso", () => {
    const simulacion = new Simulacion(1024, 2);

    simulacion.registrarProceso(1, 100, 2);
    simulacion.registrarProceso(2, 100, 3);

    simulacion.avanzarTick();
    simulacion.avanzarTick();

    const procesos = simulacion.consultarProcesos();

    const proceso1 = procesos.find(
      (proceso) => proceso.pid === 1
    );

    expect(proceso1?.estado).toBe(
      EstadoProceso.Terminado
    );

    expect(proceso1?.cpuRestante).toBe(0);

    expect(simulacion.colaListos).toEqual([2]);

    expect(
      simulacion.colaListos.includes(1)
    ).toBe(false);

    expect(simulacion.cambiosContexto).toBe(0);
    expect(simulacion.pidEjecutando).toBeNull();
  });
});
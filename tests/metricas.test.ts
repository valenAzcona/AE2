import { describe, expect, it } from "vitest";
import { Simulacion } from "../src/simulacion.js";

describe("RF09 - Metricas consultables", () => {
  it("en tick 0 informa utilizacion de CPU igual a 0", () => {
    const simulacion = new Simulacion(1000, 2);

    const metricas = simulacion.consultarMetricas();

    expect(metricas.utilizacionCPU).toBe(0);
    expect(metricas.ocupacionMemoria).toBe(0);
    expect(metricas.memoriaLibreTotal).toBe(1000);
    expect(metricas.mayorBloqueLibre).toBe(1000);
    expect(metricas.fragmentacionExterna).toBe(0);
    expect(metricas.cambiosContexto).toBe(0);
  });

  it("calcula correctamente la ocupacion de memoria", () => {
   const simulacion = new Simulacion(1000, 2);

   simulacion.registrarProceso(1, 400, 10);

   simulacion.avanzarTick();

   const metricas = simulacion.consultarMetricas();

   expect(metricas.ocupacionMemoria).toBe(40);
   expect(metricas.memoriaLibreTotal).toBe(600);
   expect(metricas.mayorBloqueLibre).toBe(600);
   expect(metricas.fragmentacionExterna).toBe(0);
  });
  
  it("informa correctamente memoria llena", () => {
   const simulacion = new Simulacion(400, 2);

   simulacion.registrarProceso(1, 200, 10);
   simulacion.registrarProceso(2, 200, 10);

   simulacion.avanzarTick();

   const metricas = simulacion.consultarMetricas();

   expect(metricas.ocupacionMemoria).toBe(100);
   expect(metricas.memoriaLibreTotal).toBe(0);
   expect(metricas.mayorBloqueLibre).toBe(0);
   expect(metricas.fragmentacionExterna).toBe(0);
  });

  it("calcula 25 por ciento de fragmentacion con huecos de 100 y 300", () => {
   const simulacion = new Simulacion(1000, 1);

   simulacion.registrarProceso(1, 100, 1);
   simulacion.registrarProceso(2, 200, 10);
   simulacion.registrarProceso(3, 300, 1);
   simulacion.registrarProceso(4, 400, 10);

   simulacion.avanzarTick();
   simulacion.avanzarTick();
   simulacion.avanzarTick();

   const metricas = simulacion.consultarMetricas();

   expect(metricas.memoriaLibreTotal).toBe(400);
   expect(metricas.mayorBloqueLibre).toBe(300);

   expect(
    metricas.fragmentacionExterna
   ).toBeCloseTo(25, 5);
  });


  it("calcula la utilizacion acumulada de CPU", () => {
    const simulacion = new Simulacion(1000, 4);

    simulacion.avanzarTick();

    simulacion.registrarProceso(1, 100, 5);

    simulacion.avanzarTick();

    const metricas = simulacion.consultarMetricas();

    expect(simulacion.tick).toBe(2);

    expect(metricas.utilizacionCPU).toBeCloseTo(
      50,
      5
    );
  });

  it("informa 100 por ciento de utilizacion cuando la CPU trabaja todos los ticks", () => {
    const simulacion = new Simulacion(1000, 4);

    simulacion.registrarProceso(1, 100, 5);

    simulacion.avanzarTick();
    simulacion.avanzarTick();

    const metricas = simulacion.consultarMetricas();

    expect(metricas.utilizacionCPU).toBe(100);
  });

  it("expone el contador acumulado de cambios de contexto", () => {
    const simulacion = new Simulacion(1000, 1);

    simulacion.registrarProceso(1, 100, 5);
    simulacion.registrarProceso(2, 100, 5);

    simulacion.avanzarTick();

    const metricas = simulacion.consultarMetricas();

    expect(simulacion.cambiosContexto).toBe(1);
    expect(metricas.cambiosContexto).toBe(1);
  });
});
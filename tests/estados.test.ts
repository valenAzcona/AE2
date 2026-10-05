import { describe, expect, it } from "vitest";
import { Simulacion } from "../src/simulacion.js";
import { EstadoProceso } from "../src/EstadoProceso.js";

describe("RF03 - Gestionar estados y admision", () => {
  
  it("deja un proceso Esperando Memoria cuando no hay bloque suficiente", () => {
   const simulacion = new Simulacion(300, 4);

   simulacion.registrarProceso(1, 200, 10);
   simulacion.registrarProceso(2, 150, 10);

   simulacion.avanzarTick();

   const procesos = simulacion.consultarProcesos();

   const proceso2 = procesos.find(
    (proceso) => proceso.pid === 2
   );

   expect(proceso2?.estado).toBe(
    EstadoProceso.EsperandoMemoria
   );

   expect(
    simulacion.colaEsperandoMemoria
   ).toEqual([2]);
  });

  it("admite procesos y deja en Listo al que espera CPU", () => {
   const simulacion = new Simulacion(1024, 4);

   simulacion.registrarProceso(1, 128, 10);
   simulacion.registrarProceso(2, 128, 10);

   simulacion.avanzarTick();

   const procesos = simulacion.consultarProcesos();

   const proceso2 = procesos.find(
    (proceso) => proceso.pid === 2
   );

   expect(proceso2?.estado).toBe(
    EstadoProceso.Listo
   );

   expect(simulacion.colaNuevos).toEqual([]);
   expect(simulacion.colaListos).toEqual([2]);
  });

  it("no duplica procesos en la cola de Listos entre ticks", () => {
   const simulacion = new Simulacion(1024, 4);

   simulacion.registrarProceso(1, 128, 10);
   simulacion.registrarProceso(2, 128, 10);

   simulacion.avanzarTick();

   expect(simulacion.colaListos).toEqual([2]);

   simulacion.avanzarTick();

   expect(simulacion.colaListos).toEqual([2]);
  });

  it("salta un proceso que no entra y admite al siguiente que si entra", () => {
   const simulacion = new Simulacion(500, 4);

   simulacion.registrarProceso(1, 100, 1);
   simulacion.registrarProceso(2, 200, 10);
   simulacion.registrarProceso(3, 200, 10);

   simulacion.registrarProceso(4, 150, 10);
   simulacion.registrarProceso(5, 80, 10);

   simulacion.avanzarTick();

   expect(
    simulacion.colaEsperandoMemoria
   ).toEqual([4, 5]);

   simulacion.avanzarTick();

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

   expect(
    simulacion.colaEsperandoMemoria
   ).toEqual([4]);

   expect(simulacion.colaListos).toContain(5);
  });
});
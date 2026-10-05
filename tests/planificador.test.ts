import { describe, expect, it } from "vitest";
import { Planificador } from "../src/Planificador.js";
import { Proceso } from "../src/Proceso.js";
import { EstadoProceso } from "../src/EstadoProceso.js";

describe("Planificador - CPU y cola de Listos", () => {
  it("encola procesos sin duplicarlos", () => {
    const planificador = new Planificador(2);

    planificador.encolar(1);
    planificador.encolar(1);
    planificador.encolar(2);

    expect(
      planificador.obtenerColaListos()
    ).toEqual([1, 2]);
  });

  it("despacha procesos respetando el orden FIFO", () => {
   const planificador = new Planificador(2);

   const proceso1 = new Proceso(1, 100, 5);
   const proceso2 = new Proceso(2, 100, 5);

   proceso1.marcarEsperandoMemoria();
   proceso1.marcarListo();

   proceso2.marcarEsperandoMemoria();
   proceso2.marcarListo();

   const procesos = [proceso1, proceso2];

   planificador.encolar(1);
   planificador.encolar(2);

   const despachado =
    planificador.despachar(procesos);

   expect(despachado?.pid).toBe(1);

   expect(despachado?.estado).toBe(
    EstadoProceso.Ejecutando
   );

   expect(planificador.pidEjecutando).toBe(1);

   expect(
    planificador.obtenerColaListos()
   ).toEqual([2]);
  });
  
  it("mantiene el proceso actual si la CPU ya esta ocupada", () => {
   const planificador = new Planificador(2);

   const proceso1 = new Proceso(1, 100, 5);
   const proceso2 = new Proceso(2, 100, 5);

   proceso1.marcarEsperandoMemoria();
   proceso1.marcarListo();

   proceso2.marcarEsperandoMemoria();
   proceso2.marcarListo();

   const procesos = [proceso1, proceso2];

   planificador.encolar(1);
   planificador.encolar(2);

   planificador.despachar(procesos);

   const segundoDespacho =
    planificador.despachar(procesos);

   expect(segundoDespacho?.pid).toBe(1);

   expect(
    planificador.obtenerColaListos()
   ).toEqual([2]);
  });

  it("al vencer el quantum con otro Listo reencola el proceso", () => {
   const planificador = new Planificador(2);

   const proceso1 = new Proceso(1, 100, 5);
   const proceso2 = new Proceso(2, 100, 5);

   proceso1.marcarEsperandoMemoria();
   proceso1.marcarListo();

   proceso2.marcarEsperandoMemoria();
   proceso2.marcarListo();

   const procesos = [proceso1, proceso2];

   planificador.encolar(1);
   planificador.encolar(2);

   const proceso =
    planificador.despachar(procesos);

   proceso?.ejecutarTick();
   proceso?.ejecutarTick();

   planificador.procesarFinQuantum(
    proceso!
   );

   expect(proceso?.estado).toBe(
    EstadoProceso.Listo
   );

   expect(proceso?.quantumConsumido).toBe(0);

   expect(
    planificador.obtenerColaListos()
   ).toEqual([2, 1]);

   expect(planificador.pidEjecutando).toBeNull();

   expect(planificador.cambiosContexto).toBe(1);
  });
 
  it("renueva el quantum sin cambio de contexto si no hay otros Listos", () => {
   const planificador = new Planificador(2);

   const proceso = new Proceso(1, 100, 5);

   proceso.marcarEsperandoMemoria();
   proceso.marcarListo();

   planificador.encolar(1);

   planificador.despachar([proceso]);

   proceso.ejecutarTick();
   proceso.ejecutarTick();

   planificador.procesarFinQuantum(
    proceso
   );

   expect(proceso.estado).toBe(
    EstadoProceso.Ejecutando
   );

   expect(proceso.quantumConsumido).toBe(0);

   expect(planificador.pidEjecutando).toBe(1);

   expect(planificador.cambiosContexto).toBe(0);
  });
  
  it("libera la CPU al finalizar sin sumar cambio de contexto", () => {
   const planificador = new Planificador(2);

   const proceso = new Proceso(1, 100, 1);

   proceso.marcarEsperandoMemoria();
   proceso.marcarListo();

   planificador.encolar(1);
   planificador.despachar([proceso]);

   planificador.liberarCpuPorFinalizacion();

   expect(planificador.pidEjecutando).toBeNull();
   expect(planificador.cambiosContexto).toBe(0);
  });

  it("libera la CPU por bloqueo y suma un cambio de contexto", () => {
   const planificador = new Planificador(2);

   const proceso = new Proceso(1, 100, 5);

   proceso.marcarEsperandoMemoria();
   proceso.marcarListo();

   planificador.encolar(1);
   planificador.despachar([proceso]);

   planificador.liberarCpuPorBloqueo();

   expect(planificador.pidEjecutando).toBeNull();
   expect(planificador.cambiosContexto).toBe(1);
  });

  it("devuelve una copia de la cola de Listos", () => {
    const planificador = new Planificador(2);

    planificador.encolar(1);

    const cola =
      planificador.obtenerColaListos();

    cola.push(99);

    expect(
      planificador.obtenerColaListos()
    ).toEqual([1]);
  });
});
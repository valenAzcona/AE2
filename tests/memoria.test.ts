import { describe, expect, it } from "vitest";
import { Memoria } from "../src/Memoria.js";
import { PoliticaAsignacion } from "../src/PoliticaAsignacion.js";

describe("Memoria", () => {
  it("First-Fit divide un bloque cuando sobra espacio", () => {
    const memoria = new Memoria(
      500,
      PoliticaAsignacion.FirstFit
    );

    const asignado = memoria.asignar(1, 100);

    expect(asignado).toBe(true);

    const bloques = memoria.obtenerBloques();

    expect(bloques).toHaveLength(2);

    expect(bloques[0]).toMatchObject({
      inicio: 0,
      tamanio: 100,
      libre: false,
      pidProceso: 1,
    });

    expect(bloques[1]).toMatchObject({
      inicio: 100,
      tamanio: 400,
      libre: true,
      pidProceso: null,
    });
  });

  it("una asignacion exacta no genera un bloque de tamanio cero", () => {
    const memoria = new Memoria(
      100,
      PoliticaAsignacion.FirstFit
    );

    const asignado = memoria.asignar(1, 100);

    expect(asignado).toBe(true);

    const bloques = memoria.obtenerBloques();

    expect(bloques).toHaveLength(1);

    expect(bloques[0]).toMatchObject({
      inicio: 0,
      tamanio: 100,
      libre: false,
      pidProceso: 1,
    });
  });

  it("First-Fit elige el primer bloque suficiente por direccion", () => {
    const memoria = new Memoria(
      600,
      PoliticaAsignacion.FirstFit
    );

    memoria.asignar(1, 100);
    memoria.asignar(2, 200);
    memoria.asignar(3, 100);
    memoria.asignar(4, 200);

    memoria.liberar(1);
    memoria.liberar(3);

    const asignado = memoria.asignar(5, 80);

    expect(asignado).toBe(true);

    const bloqueProceso5 =
      memoria.obtenerBloques().find(
        (bloque) => bloque.pidProceso === 5
      );

    expect(bloqueProceso5?.inicio).toBe(0);
  });

  it("falla sin modificar los bloques cuando no existe espacio suficiente", () => {
    const memoria = new Memoria(
      500,
      PoliticaAsignacion.FirstFit
    );

    memoria.asignar(1, 200);
    memoria.asignar(2, 200);

    const antes = memoria.obtenerBloques().map(
      (bloque) => ({
        inicio: bloque.inicio,
        tamanio: bloque.tamanio,
        libre: bloque.libre,
        pidProceso: bloque.pidProceso,
      })
    );

    const asignado = memoria.asignar(3, 150);

    expect(asignado).toBe(false);

    const despues = memoria.obtenerBloques().map(
      (bloque) => ({
        inicio: bloque.inicio,
        tamanio: bloque.tamanio,
        libre: bloque.libre,
        pidProceso: bloque.pidProceso,
      })
    );

    expect(despues).toEqual(antes);
  });

  it("falla si la memoria libre total alcanza pero no existe un hueco contiguo suficiente", () => {
    const memoria = new Memoria(
      800,
      PoliticaAsignacion.FirstFit
    );

    memoria.asignar(1, 100);
    memoria.asignar(2, 100);
    memoria.asignar(3, 300);
    memoria.asignar(4, 300);

    memoria.liberar(1);
    memoria.liberar(3);

    const antes = memoria.obtenerBloques().map(
      (bloque) => ({
        inicio: bloque.inicio,
        tamanio: bloque.tamanio,
        libre: bloque.libre,
        pidProceso: bloque.pidProceso,
      })
    );

    const memoriaLibreTotal = antes
      .filter((bloque) => bloque.libre)
      .reduce(
        (total, bloque) =>
          total + bloque.tamanio,
        0
      );

    expect(memoriaLibreTotal).toBe(400);

    const asignado = memoria.asignar(5, 350);

    expect(asignado).toBe(false);

    const despues = memoria.obtenerBloques().map(
      (bloque) => ({
        inicio: bloque.inicio,
        tamanio: bloque.tamanio,
        libre: bloque.libre,
        pidProceso: bloque.pidProceso,
      })
    );

    expect(despues).toEqual(antes);
  });

  it("fusiona con el bloque libre de la derecha", () => {
    const memoria = new Memoria(300);

    memoria.asignar(1, 100);
    memoria.asignar(2, 100);

    memoria.liberar(2);

    const bloques = memoria.obtenerBloques();

    expect(bloques).toHaveLength(2);

    expect(bloques[1]).toMatchObject({
      inicio: 100,
      tamanio: 200,
      libre: true,
      pidProceso: null,
    });
  });

  it("fusiona con el bloque libre de la izquierda", () => {
    const memoria = new Memoria(300);

    memoria.asignar(1, 100);
    memoria.asignar(2, 100);
    memoria.asignar(3, 100);

    memoria.liberar(1);
    memoria.liberar(2);

    const bloques = memoria.obtenerBloques();

    expect(bloques).toHaveLength(2);

    expect(bloques[0]).toMatchObject({
      inicio: 0,
      tamanio: 200,
      libre: true,
      pidProceso: null,
    });

    expect(bloques[1]).toMatchObject({
      inicio: 200,
      tamanio: 100,
      libre: false,
      pidProceso: 3,
    });
  });

  it("fusiona con bloques libres a izquierda y derecha", () => {
    const memoria = new Memoria(400);

    memoria.asignar(1, 100);
    memoria.asignar(2, 100);
    memoria.asignar(3, 100);
    memoria.asignar(4, 100);

    memoria.liberar(1);
    memoria.liberar(3);
    memoria.liberar(2);

    const bloques = memoria.obtenerBloques();

    expect(bloques).toHaveLength(2);

    expect(bloques[0]).toMatchObject({
      inicio: 0,
      tamanio: 300,
      libre: true,
      pidProceso: null,
    });

    expect(bloques[1]).toMatchObject({
      inicio: 300,
      tamanio: 100,
      libre: false,
      pidProceso: 4,
    });
  });

  it("al liberar todos los procesos queda un unico bloque libre", () => {
    const memoria = new Memoria(500);

    memoria.asignar(1, 100);
    memoria.asignar(2, 150);
    memoria.asignar(3, 250);

    memoria.liberar(2);
    memoria.liberar(1);
    memoria.liberar(3);

    const bloques = memoria.obtenerBloques();

    expect(bloques).toHaveLength(1);

    expect(bloques[0]).toMatchObject({
      inicio: 0,
      tamanio: 500,
      libre: true,
      pidProceso: null,
    });
  });

  it("Best-Fit elige el bloque suficiente de menor tamanio", () => {
    const memoria = new Memoria(
      800,
      PoliticaAsignacion.BestFit
    );

    memoria.asignar(1, 100);
    memoria.asignar(2, 200);
    memoria.asignar(3, 300);
    memoria.asignar(4, 200);

    memoria.liberar(1);
    memoria.liberar(3);

    memoria.asignar(5, 90);

    const bloqueProceso5 =
      memoria.obtenerBloques().find(
        (bloque) => bloque.pidProceso === 5
      );

    expect(bloqueProceso5?.inicio).toBe(0);
  });

  it("Worst-Fit elige el bloque suficiente de mayor tamanio", () => {
    const memoria = new Memoria(
      800,
      PoliticaAsignacion.WorstFit
    );

    memoria.asignar(1, 100);
    memoria.asignar(2, 200);
    memoria.asignar(3, 300);
    memoria.asignar(4, 200);

    memoria.liberar(1);
    memoria.liberar(3);

    memoria.asignar(5, 90);

    const bloqueProceso5 =
      memoria.obtenerBloques().find(
        (bloque) => bloque.pidProceso === 5
      );

    expect(bloqueProceso5?.inicio).toBe(300);
  });

  it("Best-Fit desempata por la menor direccion", () => {
    const memoria = new Memoria(
      600,
      PoliticaAsignacion.BestFit
    );

    memoria.asignar(1, 100);
    memoria.asignar(2, 100);
    memoria.asignar(3, 100);
    memoria.asignar(4, 100);
    memoria.asignar(5, 200);

    memoria.liberar(1);
    memoria.liberar(3);

    memoria.asignar(6, 80);

    const bloqueProceso6 =
      memoria.obtenerBloques().find(
        (bloque) => bloque.pidProceso === 6
      );

    expect(bloqueProceso6?.inicio).toBe(0);
  });

  it("Worst-Fit desempata por la menor direccion", () => {
    const memoria = new Memoria(
      600,
      PoliticaAsignacion.WorstFit
    );

    memoria.asignar(1, 100);
    memoria.asignar(2, 100);
    memoria.asignar(3, 100);
    memoria.asignar(4, 100);
    memoria.asignar(5, 200);

    memoria.liberar(1);
    memoria.liberar(3);

    memoria.asignar(6, 80);

    const bloqueProceso6 =
      memoria.obtenerBloques().find(
        (bloque) => bloque.pidProceso === 6
      );

    expect(bloqueProceso6?.inicio).toBe(0);
  });

  it("rechaza asignar memoria dos veces al mismo PID", () => {
    const memoria = new Memoria(500);

    expect(
      memoria.asignar(1, 100)
    ).toBe(true);

    expect(() =>
      memoria.asignar(1, 50)
    ).toThrow(
      "El proceso ya tiene memoria asignada"
    );

    const bloquesProceso1 =
      memoria.obtenerBloques().filter(
        (bloque) => bloque.pidProceso === 1
      );

    expect(bloquesProceso1).toHaveLength(1);
  });
});
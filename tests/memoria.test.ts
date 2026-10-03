import { describe, expect, it } from "vitest";
import { Memoria } from "../src/Memoria.js";

describe("RF04 - Asignar memoria contigua", () => {
  it("asigna usando First-Fit y divide el bloque si sobra espacio", () => {
    const memoria = new Memoria(1024);

    const asignado = memoria.asignar(1, 200);

    expect(asignado).toBe(true);

    expect(memoria.obtenerBloques()).toEqual([
      {
        inicio: 0,
        tamanio: 200,
        libre: false,
        pidProceso: 1,
        obtenerFin: expect.any(Function),
      },
      {
        inicio: 200,
        tamanio: 824,
        libre: true,
        pidProceso: null,
        obtenerFin: expect.any(Function),
      },
    ]);
  });

  it("una asignacion exacta no crea bloques de tamanio cero", () => {
    const memoria = new Memoria(256);

    const asignado = memoria.asignar(1, 256);

    expect(asignado).toBe(true);

    const bloques = memoria.obtenerBloques();

    expect(bloques).toHaveLength(1);

    expect(bloques[0]).toMatchObject({
      inicio: 0,
      tamanio: 256,
      libre: false,
      pidProceso: 1,
    });
  });

  it("usa el primer bloque suficiente por direccion", () => {
    const memoria = new Memoria(1000);

    memoria.asignar(1, 200);
    memoria.asignar(2, 300);

    memoria.liberar(1);

    const asignado = memoria.asignar(3, 150);

    expect(asignado).toBe(true);

    const bloques = memoria.obtenerBloques();

    expect(bloques[0]).toMatchObject({
      inicio: 0,
      tamanio: 150,
      libre: false,
      pidProceso: 3,
    });
  });

  it("si no hay hueco suficiente falla sin modificar los bloques", () => {
    const memoria = new Memoria(500);

    memoria.asignar(1, 300);

    const antes = memoria.obtenerBloques().map((bloque) => ({
      inicio: bloque.inicio,
      tamanio: bloque.tamanio,
      libre: bloque.libre,
      pidProceso: bloque.pidProceso,
    }));

    const asignado = memoria.asignar(2, 250);

    const despues = memoria.obtenerBloques().map((bloque) => ({
      inicio: bloque.inicio,
      tamanio: bloque.tamanio,
      libre: bloque.libre,
      pidProceso: bloque.pidProceso,
    }));

    expect(asignado).toBe(false);
    expect(despues).toEqual(antes);
  });
});
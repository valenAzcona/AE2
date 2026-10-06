# AE2 - Simulador de Gestión de Procesos y Memoria 

Este proyecto corresponde a la actividad intercátedra de Paradigmas II y Sistemas Operativos. La entrega es individual y se realiza mediante un repositorio Git personal, que contiene el código fuente, los tests, las dependencias, la configuración reproducible, la documentación, el diagrama de clases, el informe técnico y el reporte de cobertura.

## Datos
Estudiante: Azcona Valentina
Carrera: Ingeniería en Sistemas  
Materias: Paradigmas II / Sistemas Operativos  
Repositorio personal: https://github.com/valenAzcona/AE2.git  
Tag evaluado: entrega-final  
Commit evaluado: [completar al finalizar]

El objetivo del proyecto es implementar una biblioteca orientada a objetos que simule la administración de procesos, memoria y CPU de un sistema operativo. La simulación contempla registro de procesos, estados, asignación y liberación de memoria, políticas First-Fit, Best-Fit y Worst-Fit, planificación Round Robin, eventos de Entrada/Salida, bloqueo y desbloqueo de procesos, métricas de CPU y memoria, fragmentación externa y consulta del estado general del sistema.

Para ejecutar el proyecto se requiere Node.js 22 o compatible, npm, TypeScript y Vitest.

## Reporte de Cobertura:
 Los resultados obtenidos en la versión final son:
- Statements: 94.54%
- Branches: 91.46%
- Functions: 97.64%
- Lines: 94.54%
La cobertura de líneas supera el 90% requerido para el proyecto.

El reporte generado se encuentra en la carpeta:coverage/

Y puede visualizarse desde: coverage/index.html

## Diagramas:

-Diagrama de clases Imágen:![Diagrama de clases](docs/AE2_diagrama_clases.drawio.png)
-Diagrama de clases Editable:![Diagrama de clases](docs/AE2_diagrama_clases.drawio.png)

-Diagramas de secuencia:
Imágen:
![Secuencia 1](docs/Diagramas/AE2_diagramas_secuencia-Secuencia%201%20(RF02,%20RF03,%20RF04).drawio.png)
![Secuencia 2](docs/Diagramas/AE2_diagramas_secuencia-Secuencia%202%20(RF06,%20RF07).drawio.png)
![Secuencia 3](docs/Diagramas/AE2_diagramas_secuencia-Secuencia%203%20(RF08,%20RF09).drawio.png)

Editable:
![Secuencia 1](docs/Diagramas/AE2_diagramas_secuencia%201.drawio)
![Secuencia 2](docs/Diagramas/AE2_diagramas_secuencia%202.drawio)
![Secuencia 3](docs/Diagramas/AE2_diagramas_secuencia%203.drawio)

## Informe técnico

El informe técnico de la entrega se encuentra en: 
![Informe](docs/Informe/AE2_Azcona%20Valentina_Paradigmas%20.pdf)

## Para clonar el repositorio:
```bash
git clone https://github.com/valenAzcona/AE2.git
#Luego ingresar a la carpeta 
cd AE2
#Instalar las dependencias:
npm install

## Reproducción de la validación
Para reproducir los resultados del commit entregado:

```bash
npm install
npm run typecheck
npm test
npm run coverage
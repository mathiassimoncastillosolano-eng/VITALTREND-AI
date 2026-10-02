# VitalTrend AI — Frontend (prototipo con datos simulados)

Sistema de apoyo a la **detección temprana del deterioro clínico** mediante análisis personalizado de signos vitales.
Prototipo funcional de alta fidelidad, **exclusivamente frontend**: sin backend, base de datos, API, autenticación ni ML real.

> **Aviso:** VitalTrend AI es una herramienta experimental de apoyo a la priorización. No diagnostica, no sustituye el juicio clínico y no ha sido validada prospectivamente. Todos los datos son ficticios.

## Objetivo

Hacer visibles los cinco pilares de la propuesta académica:

1. **Línea base fisiológica individual** (con arranque en frío / *cold start* representado).
2. **Tendencias temporales** (valor actual + evolución + rango esperado individual).
3. **Riesgo explicable** (factores tipo SHAP traducidos a lenguaje clínico, confianza y horizonte).
4. **Reducción de falsas alarmas** (filtro anti-fatiga por persistencia en 2–3 ventanas).
5. **Comparación transparente contra NEWS2** (incluye visualización del *lead time*).

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Recharts · Motion (Framer Motion) · Lucide · Zustand (estado compartido) · ESLint · Prettier.

## Instalación y ejecución

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit + vite build
npm run lint
```

> Nota: el código se escribió sin acceso al registro npm, por lo que **no se ha compilado ni probado en un navegador**. Las versiones de `package.json` son rangos razonables sin verificar; si `npm install` o `npm run build` reportan algún ajuste de versiones o tipos, corrígelos antes de la demo.

## Estructura

```
src/
├── app/            App y enrutado (hash router propio, sin dependencias)
├── components/     ui · layout · patients · vitals · alerts · baseline · explainability · comparison · charts · decision
├── pages/          Login · Dashboard · Patients · Alerts · Analytics · Reports · Settings
├── data/           Datos simulados (pacientes, métricas de escenarios, series de reportes)
├── mockEngine/     Capa que reemplaza al backend (lecturas, nuevas mediciones, escenarios)
├── store/          Estado global (Zustand): pacientes, filtros, simulación, alertas, decisiones, ajustes
├── hooks/ · utils/ · constants/ · types/ · animations/ · styles/
```

## Arquitectura y coherencia de datos

- **Fuente única de verdad:** cada paciente guarda su historial de ventanas horarias y su línea base. Todo lo demás se **deriva** con funciones puras (`utils/clinical.ts`): desviaciones, persistencia, riesgo, factores SHAP simulados, confianza, horizonte, NEWS2 (calculado con la escala oficial en el navegador), lead time, alertas y línea de tiempo.
- Por eso card, gráfico, línea base, alerta, explicación y comparación **nunca se contradicen**: si cambia la SpO₂, todo se recalcula.
- `data/news2.mock.ts`, `alerts.mock.ts` y `explanations.mock.ts` del prompt original no existen como archivos: esos datos se derivan (`utils/news2.ts`, `utils/alerts.ts`, `utils/explain.ts`) precisamente para evitar estados duplicados.
- Línea base efectiva = mezcla ponderada entre prior poblacional y evidencia individual según horas acumuladas (cold start).

## Funcionalidades

- **Inicio:** resumen derivado de los datos (monitorizados, estables, en observación, riesgo elevado, críticos), filtros por estado, orden por riesgo / última actualización / FC / SpO₂ / temperatura / FR (con sentido ascendente o descendente), búsqueda por nombre, ID, habitación o cama (`hab 103`, `cama 2`; sin distinguir tildes) con estados de escritura, sin resultados y búsqueda borrada.
- **Tarjeta de paciente:** nombre, ID, edad, sexo, habitación, cama, servicio, estado, riesgo, NEWS2, FC, FR, SpO₂, T°, PAS, ritmo ECG (si hay monitorización) y tendencia de cada signo.
- **Ver análisis:** navega a `#/patients/:id[/pestaña]` con vista clínica completa: Resumen (monitor multiparámetro con ECG, pletismografía y respiración), Signos vitales (evolución multiparámetro, riesgo, detalle por signo, últimas lecturas), Línea base, Explicabilidad, Comparación NEWS2, Eventos y Evaluación. Incluye migas de pan, paciente anterior/siguiente y enlaces directos por pestaña.
- Centro de alertas, Análisis, Reportes, Configuración, búsqueda Ctrl+K, tema oscuro/claro y ajustes de accesibilidad.

## Datos

Todo funciona con datos de prueba (`src/data`, `src/mockEngine`); no hay backend, API ni base de datos. Los escenarios de prueba (evolución de un paciente, restablecer datos) están en Configuración > Datos de prueba.

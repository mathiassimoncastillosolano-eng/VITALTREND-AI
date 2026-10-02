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

Dashboard con KPIs (count-up), filtros, búsqueda con debounce, orden y tarjetas con mini tendencia · Drawer de paciente con 7 pestañas (Resumen, Signos vitales, Línea base, Explicabilidad, Comparación, Historial, Notas) · Persistencia 1/3–3/3 y filtro anti-fatiga · SHAP con barras · Confianza y horizonte · VitalTrend AI vs NEWS2 + lead time · Centro de alertas con acciones simuladas y toasts · Reportes y Análisis (4 escenarios; sin *accuracy*) · Configuración · Login demo · Búsqueda Ctrl+K · Tema oscuro/claro · `prefers-reduced-motion`, alto contraste y texto grande · Estados loading/empty/error/offline/updating.

## Datos y escenarios de demostración

16 pacientes ficticios. Destacan:

| Paciente | Escenario |
|---|---|
| 03 | **Riesgo elevado**: FR↑, SpO₂↓, T°↑, persistencia 3/3, NEWS2 = 3 (bajo umbral) |
| 07 | **Crítico**: deterioro evidente en varios signos |
| 16 / 13 | **Deterioro temprano**: persistencia 2/3, NEWS2 bajo |
| 08 | Pico transitorio retenido por anti-fatiga (1/3) |
| 09 | EPOC: SpO₂ habitual 91 %, NEWS2 marca banda roja pero su línea base lo explica |
| 11 | Riesgo elevado con NEWS2 también en alerta |
| 12 | *Cold start*: 2 h de datos, confianza baja |
| 01, 02, 04… | Estables |

**Panel “Simulación”** (abajo a la derecha): iniciar/pausar/reiniciar, velocidad 0.5×/1×/2× y escenario (Estable, Deterioro, Riesgo elevado, Crítico) aplicado al Paciente 03. Cada tick agrega una ventana horaria simulada.

**Guía de demostración** en el Dashboard: recorrido de 7 pasos que abre el drawer en la pestaña adecuada.

## Limitaciones

- No se ha compilado ni ejecutado en un navegador (ver nota de instalación).
- El modelo de riesgo, SHAP, confianza, horizonte y las métricas de Análisis/Reportes son **simulados**; no provienen de entrenamiento ni validación.
- El lead time de cada paciente se calcula sobre su historial simulado (24 ventanas); las series semanales de Reportes son ilustrativas.
- Las acciones clínicas no persisten: se reinician al recargar.

## Disclaimer académico

Prototipo de un proyecto de investigación académica (solo informe). Sin datos reales, sin cumplimiento regulatorio y sin validación prospectiva.

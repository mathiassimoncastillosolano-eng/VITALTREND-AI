export const GLOSSARY: Record<string, string> = {
  'Línea base':
    'Rango fisiológico habitual de ESTE paciente, estimado con sus propias mediciones y, al inicio, ponderado con un prior poblacional.',
  SHAP:
    'Valor que representa la contribución de una variable a la predicción del modelo. No representa causalidad.',
  AUPRC:
    'Área bajo la curva precisión–recall. Más informativa que la exactitud cuando el evento (sepsis) es poco frecuente.',
  AUROC:
    'Área bajo la curva ROC: capacidad del modelo para distinguir pacientes que se deterioran de los que no.',
  NEWS2:
    'National Early Warning Score 2: puntaje estándar basado en umbrales poblacionales de signos vitales. Se usa como comparador.',
  'Lead time':
    'Horas de anticipación de la alerta respecto al momento en que NEWS2 alcanza su umbral.',
  Persistencia:
    'Número de ventanas consecutivas en que la desviación se mantiene. Evita alertar por un único valor anómalo.',
  'Shock Index':
    'Cociente FC / presión arterial sistólica. Aumenta cuando hay mayor carga hemodinámica.',
  Confianza:
    'La confianza representa la estimación del modelo sobre el riesgo; no constituye un diagnóstico clínico.',
  'Falsas alarmas':
    'Alertas que no se asocian a un deterioro real. Reducirlas combate la fatiga de alarmas.',
  Sensibilidad:
    'Proporción de deterioros reales detectados, medida a una especificidad fija.',
  'Anti-fatiga':
    'Filtro que exige desviación sostenida en varias ventanas consecutivas antes de confirmar una alerta.',
  Horizonte:
    'Ventana de tiempo estimada en que podría iniciar el deterioro si la tendencia actual continúa. No es un diagnóstico ni una certeza.',
}

# Guía de Configuración del Webhook de Tally

## 📝 Cómo identificar los nombres de campos de Tally

### Paso 1: Ejecutar el servidor en desarrollo

```bash
pnpm dev
```

### Paso 2: Ejecutar ngrok (en otra terminal)

```bash
ngrok http 3000
```

Copia la URL HTTPS que te da ngrok (ejemplo: `https://abc123.ngrok.io`)

### Paso 3: Configurar el webhook en Tally

1. Ve a tu formulario en Tally
2. Click en **Integrations** → **Webhooks**
3. Agrega: `https://TU-URL-NGROK.ngrok.io/api/tally-webhook`
4. Click en **Connect**

### Paso 4: Enviar un formulario de prueba

Llena tu formulario de Tally con datos de ejemplo y envíalo.

### Paso 5: Revisar los logs en la terminal

En tu terminal donde corre `pnpm dev`, verás algo como:

```
========================================
🎯 WEBHOOK RECIBIDO DE TALLY
========================================
📦 Payload completo:
{
  "eventId": "abc123",
  "eventType": "FORM_RESPONSE",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "data": {
    "responseId": "xyz789",
    "submissionId": "sub_123",
    "respondentId": "resp_456",
    "formId": "form_abc",
    "formName": "Quiz de Lealtad",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "fields": [
      {
        "key": "question_abc123",
        "label": "¿Cuál es tu nombre?",
        "type": "INPUT_TEXT",
        "value": "Juan Pérez"
      },
      {
        "key": "question_def456",
        "label": "Cuando usas los productos/servicios de Apple...",
        "type": "MULTIPLE_CHOICE",
        "value": "4"
      },
      ...más campos...
    ]
  }
}
========================================
```

### Paso 6: Identificar los campos

En los logs, busca la sección **"📋 Campos extraídos"**. Ahí verás todos los campos que envió Tally.

**IMPORTANTE**: Tally envía los datos como un array de objetos con esta estructura:
```json
{
  "key": "question_abc123",
  "label": "Texto de la pregunta",
  "value": "Respuesta del usuario"
}
```

### Paso 7: Mapear los campos

Necesitas crear un mapeo entre:
- Los `key` de Tally → Las variables en el código

Por ejemplo:
```
question_abc123 → nombre
question_def456 → calidad_q1 (70%)
question_ghi789 → calidad_q2 (30%)
```

## 🔧 Actualizar el código con los campos correctos

Una vez identificados los `key` de cada pregunta en Tally, necesitas actualizar el archivo:
`/app/api/tally-webhook/route.ts`

### Ejemplo de actualización:

**ANTES** (líneas 90-136):
```typescript
const pillarAnswers = {
  calidad_q1: tallyData.calidad_q1 || '1',
  calidad_q2: tallyData.calidad_q2 || '1',
  // ...
};
```

**DESPUÉS** (usando los keys reales de Tally):
```typescript
// Convertir array de fields a objeto key-value
const fieldsMap: any = {};
if (Array.isArray(tallyData)) {
  tallyData.forEach((field: any) => {
    fieldsMap[field.key] = field.value;
  });
}

const pillarAnswers = {
  // Calidad y eficiencia
  calidad_q1: fieldsMap['question_abc123'] || '1',  // Reemplazar con el key real
  calidad_q2: fieldsMap['question_def456'] || '1',  // Reemplazar con el key real

  // Relevancia
  relevancia_q1: fieldsMap['question_ghi789'] || '1',
  relevancia_q2: fieldsMap['question_jkl012'] || '1',

  // ... continúa con todos los pilares
};
```

## 📊 Estructura de las preguntas en Tally

Tu formulario debe tener **20 preguntas en total** (10 pilares × 2 preguntas):

1. **Calidad y eficiencia**
   - Pregunta 1 (70%): `question_???`
   - Pregunta 2 (30%): `question_???`

2. **Relevancia**
   - Pregunta 1 (70%): `question_???`
   - Pregunta 2 (30%): `question_???`

3. **Identidad**
   - Pregunta 1 (70%): `question_???`
   - Pregunta 2 (30%): `question_???`

4. **Consistencia**
   - Pregunta 1 (70%): `question_???`
   - Pregunta 2 (30%): `question_???`

5. **Adopción**
   - Pregunta 1 (70%): `question_???`
   - Pregunta 2 (30%): `question_???`

6. **Valores e impacto**
   - Pregunta 1 (70%): `question_???`
   - Pregunta 2 (30%): `question_???`

7. **Conveniencia**
   - Pregunta 1 (70%): `question_???`
   - Pregunta 2 (30%): `question_???`

8. **Eficiencia en la experiencia**
   - Pregunta 1 (70%): `question_???`
   - Pregunta 2 (30%): `question_???`

9. **Familiaridad**
   - Pregunta 1 (70%): `question_???`
   - Pregunta 2 (30%): `question_???`

10. **Reconocimiento**
    - Pregunta 1 (70%): `question_???`
    - Pregunta 2 (30%): `question_???`

## ✅ Validación

Cada pregunta debe tener **4 opciones de respuesta** numeradas 1, 2, 3, 4 que mapean a:
- `1` = 0 puntos
- `2` = 33 puntos
- `3` = 66 puntos
- `4` = 100 puntos

## 🐛 Debugging

Si algo no funciona:

1. **Verifica que ngrok esté corriendo**: Debe mostrar "Session Status: online"
2. **Revisa los logs en la terminal de Next.js**: Ahí verás todos los detalles del webhook
3. **Prueba el endpoint manualmente**:
   ```bash
   curl -X POST https://tu-ngrok-url.ngrok.io/api/tally-webhook \
     -H "Content-Type: application/json" \
     -d '{"eventId": "test", "data": {"fields": []}}'
   ```
4. **Verifica la URL en Tally**: Debe ser HTTPS (no HTTP)

## 📞 Siguiente paso

Una vez que veas los logs con los datos reales de Tally, comparte el payload completo y te ayudaré a mapear todos los campos correctamente.

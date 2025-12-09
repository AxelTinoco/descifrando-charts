# 🎯 Guía Completa de Configuración Tally → Next.js

## ✅ Resumen de lo que hemos logrado

Tu aplicación ahora funciona completamente **SIN Notion**. El flujo es:
1. Usuario completa el formulario en Tally
2. Tally envía webhook con los scores calculados
3. Next.js procesa los datos y genera URL de resultados
4. Usuario es redirigido a ver sus resultados inmediatamente

---

## 📋 Paso 1: Configurar el Webhook en Tally

### 1.1 Ir a la configuración de Integrations

1. Abre tu formulario en Tally: https://tally.so
2. Ve a **Integrations** → **Webhooks**
3. Click en **Add webhook**

### 1.2 Configurar la URL del Webhook

**En desarrollo (con ngrok):**
```
https://TU-NGROK-URL.ngrok.io/api/tally-webhook
```

**En producción (cuando despliegues a Vercel):**
```
https://tu-dominio.vercel.app/api/tally-webhook
```

### 1.3 Eventos a escuchar

- ✅ Marcar: **Form response**
- ❌ Dejar sin marcar: Los demás eventos

---

## 📋 Paso 2: Configurar la Redirección Automática

### 2.1 Ir a Settings → After submit

1. En tu formulario de Tally, ve a **Settings**
2. Click en **After submit**

### 2.2 Seleccionar "Redirect to URL"

1. Selecciona la opción **"Redirect to URL"**
2. Marca la casilla **"Custom redirect URL"**

### 2.3 Configurar URL de Redirección

**IMPORTANTE**: La redirección debe apuntar a la página de resultados con el `submission_id`.

**Pega esta URL en el campo de redirección:**

**Para desarrollo (localhost con ngrok):**
```
https://TU-NGROK-URL.ngrok.io/resultados?submission_id={{response_id}}
```

**Para producción (Vercel):**
```
https://tu-dominio.vercel.app/resultados?submission_id={{response_id}}
```

**¿Cómo funciona?**
1. Usuario completa el formulario
2. Tally envía webhook a `/api/tally-webhook` (en background)
3. El webhook procesa y **guarda los resultados en caché**
4. Tally redirige al usuario a `/resultados?submission_id=XXX`
5. La página recupera los resultados del caché usando el `submission_id`
6. Si los resultados aún no están listos, la página **reintenta automáticamente** cada 2 segundos (hasta 3 veces)

---

## 📋 Paso 3: Asegurar que los Campos Calculados estén configurados

Tu formulario ya tiene campos calculados (tipo `CALCULATED_FIELDS`), pero verifica que tengan exactamente estos nombres:

### ✅ Nombres correctos de campos calculados:

1. **Calidad y eficiencia (70%)**
2. **Calidad y eficiencia (30%)**
3. **Relevancia (70%)**
4. **Relevancia (30%)**
5. **Identidad (70%)**
6. **Identidad (30%)**
7. **Consistencia (70%)**
8. **Consistencia (30%)**
9. **Adopción (70%)**
10. **Adopción (30%)**
11. **Valores e impacto (70%)**
12. **Valores e impacto (30%)**
13. **Conveniencia (70%)**
14. **Conveniencia (30%)**
15. **Eficiencia en la experiencia (70%)**
16. **Eficiencia en la experiencia (30%)**
17. **Familiaridad (70%)**
18. **Familiaridad (30%)**
19. **Reconocimiento (70%)**
20. **Reconocimiento (30%)**

**IMPORTANTE**: El texto "(70%)" y "(30%)" debe estar exactamente así en el label del campo.

---

## 🧪 Paso 4: Probar el Flujo Completo

### 4.1 Iniciar servidores locales

```bash
# Terminal 1: Next.js
pnpm dev

# Terminal 2: ngrok (si estás en desarrollo local)
ngrok http 3000
```

### 4.2 Enviar formulario de prueba

1. Completa el formulario en Tally
2. Click en **Submit**
3. Deberías ver:
   - ✅ El webhook se recibe en tu terminal (logs)
   - ✅ Tally te redirige automáticamente a `/resultados`
   - ✅ Ves tu radar chart con tus scores

### 4.3 Verificar los logs

En la terminal donde corre `pnpm dev`, deberías ver:

```
========================================
🎯 WEBHOOK RECIBIDO DE TALLY
========================================
📋 Submission ID: abc-123-xyz
📊 Total de campos recibidos: 80

🔢 Campos calculados encontrados: 20

📊 Scores extraídos de Tally:
   Calidad y eficiencia: 70%=70, 30%=30
   Relevancia: 70%=46, 30%=20
   ...

✅ Scores finales calculados:
   scoreCalidad: 100
   scoreRelevancia: 66
   ...

🔗 URL de redirección: http://localhost:3000/resultados?...
========================================
```

---

## 🚀 Paso 5: Desplegar a Producción

### 5.1 Desplegar a Vercel

```bash
# Conecta tu repo a Vercel o usa la CLI
vercel

# O si ya está conectado
git add .
git commit -m "Add Tally webhook integration"
git push origin main
```

### 5.2 Actualizar configuración de Tally

Una vez desplegado:

1. Obtén tu URL de producción (ej: `https://quiz-lealtad.vercel.app`)
2. Ve a Tally → Integrations → Webhooks
3. Actualiza la URL del webhook a:
   ```
   https://quiz-lealtad.vercel.app/api/tally-webhook
   ```
4. Ve a Tally → Settings → After submit
5. Actualiza la URL de redirección a:
   ```
   https://quiz-lealtad.vercel.app/resultados?submission_id={{response_id}}&processing=true
   ```

---

## 🔍 Troubleshooting

### El webhook no se está recibiendo

**Verifica:**
- ✅ ngrok está corriendo y la URL es correcta
- ✅ La URL en Tally es HTTPS (no HTTP)
- ✅ El formulario está publicado (no en draft)

**Prueba manualmente:**
```bash
curl -X GET https://tu-ngrok-url.ngrok.io/api/tally-webhook
```

Deberías ver:
```json
{
  "message": "Tally Webhook Endpoint - Simplified (No Notion)",
  ...
}
```

### Los scores aparecen en 0

**Verifica:**
- ✅ Los campos calculados en Tally tienen el formato exacto: "Nombre (70%)" y "Nombre (30%)"
- ✅ Los campos calculados están configurados correctamente con las fórmulas
- ✅ Revisa los logs para ver qué datos está recibiendo el webhook

### El usuario no es redirigido después de enviar

**Verifica:**
- ✅ Configuraste "Redirect to URL" en Tally Settings → After submit
- ✅ La URL usa la variable `{{response_id}}`
- ✅ La URL es correcta (con https://)

---

## 📊 Datos de Ejemplo

El webhook recibe este JSON de Tally:

```json
{
  "eventId": "f2af77a1-fa76-4d8b-8c99-6521148d15de",
  "eventType": "FORM_RESPONSE",
  "data": {
    "responseId": "J9bb0DK",
    "fields": [
      {
        "key": "question_Avadjo",
        "label": "Nombre",
        "value": "Juan Pérez"
      },
      {
        "key": "question_GdEjg2_xxx",
        "label": "Calidad y eficiencia (70%)",
        "type": "CALCULATED_FIELDS",
        "value": 100
      },
      ...
    ]
  }
}
```

Y devuelve:

```json
{
  "success": true,
  "submission_id": "f2af77a1-fa76-4d8b-8c99-6521148d15de",
  "nombre": "Juan Pérez",
  "scores": {
    "scoreCalidad": 100,
    "scoreRelevancia": 66,
    ...
  },
  "redirect_url": "http://localhost:3000/resultados?submission_id=xxx&nombre=Juan+P%C3%A9rez&scores=..."
}
```

---

## ✅ Checklist Final

Antes de lanzar a producción:

- [ ] Webhook configurado en Tally con URL correcta
- [ ] Redirección configurada en Tally con `{{response_id}}`
- [ ] Los 20 campos calculados tienen nombres correctos
- [ ] Probado localmente con ngrok
- [ ] Desplegado a Vercel
- [ ] Webhook actualizado con URL de producción
- [ ] Redirección actualizada con URL de producción
- [ ] Probado en producción con formulario real

---

## 🎉 ¡Listo!

Tu aplicación está completamente configurada y **NO NECESITA NOTION**. Los usuarios verán sus resultados inmediatamente después de completar el formulario.

**Flujo final:**
1. Usuario completa formulario →
2. Tally calcula scores (70%/30%) →
3. **Paralelo:**
   - Tally envía webhook a `/api/tally-webhook` (background)
   - Tally redirige al usuario a `/resultados?submission_id=XXX`
4. Webhook procesa y **guarda en caché** →
5. La página recupera del caché (con reintentos automáticos) →
6. Usuario ve su radar chart! 🎉

**Ventajas de este sistema:**
- ✅ El usuario es redirigido inmediatamente (no espera el procesamiento)
- ✅ Si el webhook tarda, la página reintenta automáticamente
- ✅ No se requiere base de datos (caché en memoria)
- ✅ Los datos expiran automáticamente después de 1 hora

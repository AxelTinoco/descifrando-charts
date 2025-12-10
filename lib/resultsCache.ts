// Cache simple en memoria para almacenar resultados temporalmente
// En producción, considera usar Redis, Upstash, o una base de datos

interface CachedResult {
  submission_id: string;
  nombre: string;
  scores: {
    scoreCalidad: number;
    scoreRelevancia: number;
    scoreIdentidad: number;
    scoreConsistencia: number;
    scoreAdopcion: number;
    scoreValores: number;
    scoreConveniencia: number;
    scoreEficienciaExp: number;
    scoreFamiliaridad: number;
    scoreReconocimiento: number;
  };
  timestamp: number;
}

// Almacenamiento en memoria (se reinicia cuando se reinicia el servidor)
const resultsCache = new Map<string, CachedResult>();

// Tiempo de expiración: 1 hora
const CACHE_EXPIRATION_MS = 60 * 60 * 1000;

export function saveResult(submission_id: string, data: CachedResult) {
  resultsCache.set(submission_id, {
    ...data,
    timestamp: Date.now(),
  });

  console.log(`💾 Resultado guardado en caché: ${submission_id}`);
}

export function getResult(submission_id: string): CachedResult | null {
  const result = resultsCache.get(submission_id);

  if (!result) {
    console.log(`❌ No se encontró resultado en caché: ${submission_id}`);
    console.log(`📋 IDs disponibles en caché (${resultsCache.size}):`);
    Array.from(resultsCache.keys()).forEach(key => {
      console.log(`   - ${key}`);
    });
    return null;
  }

  // Verificar si expiró
  const age = Date.now() - result.timestamp;
  if (age > CACHE_EXPIRATION_MS) {
    resultsCache.delete(submission_id);
    console.log(`⏰ Resultado expirado en caché: ${submission_id}`);
    return null;
  }

  console.log(`✅ Resultado encontrado en caché: ${submission_id}`);
  return result;
}

export function clearExpiredResults() {
  const now = Date.now();
  let cleared = 0;

  for (const [key, value] of resultsCache.entries()) {
    if (now - value.timestamp > CACHE_EXPIRATION_MS) {
      resultsCache.delete(key);
      cleared++;
    }
  }

  if (cleared > 0) {
    console.log(`🧹 Limpiados ${cleared} resultados expirados del caché`);
  }
}

export function getAllCachedIds(): string[] {
  return Array.from(resultsCache.keys());
}

export function getCacheStats() {
  const now = Date.now();
  const entries = Array.from(resultsCache.entries()).map(([id, data]) => ({
    id,
    nombre: data.nombre,
    age_seconds: Math.floor((now - data.timestamp) / 1000),
  }));

  return {
    total: resultsCache.size,
    entries,
  };
}

// Limpiar resultados expirados cada 10 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(clearExpiredResults, 10 * 60 * 1000);
}

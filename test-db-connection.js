const { Client } = require("@notionhq/client");
require('dotenv').config();

async function testConnection() {
  console.log("Probando conexión a Notion...\n");

  // Verificar variables de entorno
  if (!process.env.NOTION_API_KEY) {
    console.error("❌ Error: NOTION_API_KEY no está configurada en .env");
    return;
  }

  if (!process.env.NOTION_DATABASE_ID) {
    console.error("❌ Error: NOTION_DATABASE_ID no está configurada en .env");
    return;
  }

  console.log("✓ Variables de entorno encontradas");
  console.log(`  - NOTION_DATABASE_ID: ${process.env.NOTION_DATABASE_ID}`);
  console.log(`  - NOTION_API_KEY: ${process.env.NOTION_API_KEY.substring(0, 10)}...\n`);

  // Inicializar cliente de Notion
  const notion = new Client({ auth: process.env.NOTION_API_KEY });

  try {
    // Intentar obtener información de la base de datos
    console.log("Intentando conectar a la base de datos...");
    const database = await notion.databases.retrieve({
      database_id: process.env.NOTION_DATABASE_ID,
    });

    console.log("✅ ¡Conexión exitosa!\n");
    console.log("Información de la base de datos:");
    console.log(`  - Título: ${database.title?.[0]?.plain_text || 'Sin título'}`);
    console.log(`  - ID: ${database.id}`);
    console.log(`  - Creada: ${database.created_time}`);
    console.log(`  - Última edición: ${database.last_edited_time}\n`);

    // Intentar consultar la base de datos
    console.log("Probando consulta a la base de datos...");
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
    });

    console.log(`✅ Consulta exitosa!`);
    console.log(`  - Registros encontrados: ${response.results.length}\n`);

    if (response.results.length > 0) {
      console.log("Estructura del primer registro:");
      const firstPage = response.results[0];
      console.log(`  - ID: ${firstPage.id}`);
      console.log(`  - Propiedades disponibles:`, Object.keys(firstPage.properties));
    }

  } catch (error) {
    console.error("❌ Error al conectar con Notion:");
    console.error(`  - Código: ${error.code}`);
    console.error(`  - Mensaje: ${error.message}`);
    
    if (error.code === 'object_not_found') {
      console.error("\n💡 Sugerencia: Verifica que:");
      console.error("  1. El NOTION_DATABASE_ID es correcto");
      console.error("  2. La integración tiene acceso a esta base de datos");
      console.error("  3. Has compartido la base de datos con tu integración");
    } else if (error.code === 'unauthorized') {
      console.error("\n💡 Sugerencia: Verifica que:");
      console.error("  1. El NOTION_API_KEY es correcto");
      console.error("  2. La integración está activa");
    }
  }
}

testConnection();

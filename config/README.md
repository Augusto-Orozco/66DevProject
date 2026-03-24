Formato de los archivos de configuración:
Los archivos se encuentran en formato JSON y cada archivo representa un entorno distinto.
- development.json
- staging.json
- production.json
Los archivos siguen la misma estructura unicamente cambiando los valores dependiendo del entorno.

| Parámetro        | Descripción |
|------------------|------------|
| APP_NAME         | Nombre de la aplicación |
| PORT             | Puerto en el que corre la aplicación |
| ENVIRONMENT      | Entorno actual (development, staging, production) |
| DB_HOST          | Dirección del servidor de base de datos |
| DB_PORT          | Puerto de la base de datos |
| DEBUG            | Activa o desactiva logs de depuración |
| FEATURE_FLAGS    | Objeto para habilitar o deshabilitar funcionalidades |

Convenciones de nomenclatura
- Los nombres de variables están en MAYÚSCULAS con guiones bajos (FEATURE_FLAGS por ejemplo).
- Los archivos siguen el nombre del entorno:
    - development.json
    - staging.json
    - production.json
- Los valores deben ser coherentes con el entorno:
    - development - entorno local
    - staging - pruebas
    - production - entorno final

Cada archivo JSON define cómo se comportará la aplicación dependiendo del entorno en el que se ejecute. A continuación se muestra un ejemplo práctico:
{
  "APP_NAME": "MiAplicacion",
  "PORT": 3000,
  "ENVIRONMENT": "development",
  "DB_HOST": "localhost",
  "DB_PORT": 5432,
  "DEBUG": true,
  "FEATURE_FLAGS": {
    "ENABLE_LOGIN": true,
    "ENABLE_PAYMENTS": false
  }
}


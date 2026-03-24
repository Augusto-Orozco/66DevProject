Formato de los archivos de configuración:
Los archivos se encuentran en formato JSON y cada archivo representa un entorno distinto.
- development.json
- staging.json
- production.json
Los archivos siguen la misma estructura unicamente cambiando los valores dependiendo del entorno.

| Parámetro             | Descripción |
| APP_NAME              | Nombre de la aplicación |
| PORT              | Puerto en el que corre la aplicación |
| ENVIRONMENT               | Entorno actual (development, staging, production) |
| DB_HOST               | Dirección del servidor de base de datos |
| DB_PORT               | Puerto de la base de datos |
| DEBUG             | Activa o desactiva logs de depuración |
| FEATURE_FLAGS             | Objeto para habilitar o deshabilitar funcionalidades |
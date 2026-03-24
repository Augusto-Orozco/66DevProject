# Guía de Proceso de Contribución  (`config/`)
El presente documento especifica los lineamientos obligatorios a seguir durante la propuesta de cambios, con el fin de mantener el orden y la consistencia en el entorno del proyecto.

## 1. Proceso para Proponer Cambios
* **Creación de ramas:** Se debe crear una nueva rama desde la principal (`main`) utilizando el siguiente formato:
    * `config/<descripcion>`

* **Uso de Pull Requests:** Una vez hechos todos los cambios, se debe generar un Pull Request hacia la rama principal donde se definan los cambios específicos.

## 2. Proceso de Revisión
* **Aprobación requerida:** Se necesita la aprobación de **al menos un (1) revisor** que sea distinto al autor del Pull Request.
* **Validación del contenido:** El revisor debe verificar que los cambios tengan sentido para el contexto del proyecto y no generen vulnerabilides de seguridad para el sistema.

## 3. Validaciones Mínimas
Asegurarse de cumplir las siguientes validaciones:
* **Verificación de sintaxis:** Los archivos modificados deben poseer una sintaxis correcta, sobre todo si se hacen cambios en los `.json` o `.yaml`.
* **Consistencia estructural:** Los cambios deben respetar la estructura ya definida en el proyecto, sin alterar el tipo de dato de las variables previamente establecidas.

## 4. Criterios de Aceptación
* **Claridad del cambio:** El propósito y función de la nueva configuración debe ser evidente y estar bien justificado dentro del pull request.
* **Coherencia entre entornos:** Las variables agregadas deben ser consistentes entre los distintos entornos, porporcionando valores por defecto para asegurar el correcto funcionamiento del sistema en general.
* **Correcta documentación:** Los conceptos y/o configuraciones nuevas deben ser documentadas correctamente en el `README.md`, además, si se requieren acciones manuales estas deben estar claramente explicadas.
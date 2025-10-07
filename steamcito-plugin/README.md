# Steamcito Millennium Plugin

Este plugin muestra todos los productos de la tienda de Steam en pesos argentinos con impuestos incluidos. Es una adaptación del popular [Steamcito](https://steamcito.com.ar/) para la plataforma Millennium.

## Características

- Convierte los precios de la tienda de Steam a pesos argentinos
- Incluye impuestos nacionales en los cálculos
- Soporta diferentes métodos de pago (Tarjeta, Crypto, MEP)
- Muestra información de cambio en tiempo real
- Compatible con todas las páginas de la tienda de Steam

## Instalación

1. Clona este repositorio
2. Ejecuta `npm install` o `pnpm install` en el directorio del plugin
3. Ejecuta `npm run build` para construir el plugin
4. Copia la carpeta `.millennium` a tu directorio de plugins de Millennium

## Desarrollo

Para desarrollar y probar el plugin, puedes usar el siguiente comando:

```
npm run dev
```

Este comando compilará el plugin en modo desarrollo y lo actualizará automáticamente cuando realices cambios.

## Cómo funciona

El plugin utiliza las siguientes técnicas para mostrar los precios convertidos:

1. Obtiene las tasas de cambio actuales
2. Identifica elementos de precio en la tienda de Steam
3. Calcula el precio en pesos argentinos con impuestos incluidos
4. Muestra el precio convertido junto al precio original

## Licencia

MIT

## Contribuciones

Las contribuciones son bienvenidas. Por favor, crea un issue o pull request para sugerir mejoras o reportar problemas.
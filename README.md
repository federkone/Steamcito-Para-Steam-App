# Complemento de Conversión de Precios de Steam

Este complemento permite traducir los precios de Steam a pesos argentinos para la aplicación de escritorio.

Si lo deseas, puedes cambiar las APIs de obtención de valores de tipo de cambio contenidos en `main.py` para adaptarlo a tu región.

## ¿Cómo funciona?

Esto es posible gracias a una versión de Steam modificada llamada **"Millennium Steam Homebrew"** que nos permite agregar mods a Steam, tanto temas como plugins. Esta capa de abstracción de APIs no es oficial de Steam, pero es open source y podemos revisar el código si lo deseamos.

### ¿Por qué es posible editar los datos de Steam?

Steam se trata simplemente de un navegador web adaptado a una aplicación de escritorio que utiliza los mismos protocolos y librerías de Front End que un navegador convencional como **Chromium**. Por lo tanto, es posible:

- Leer las clases HTML contenidas en el navegador de Steam
- Editarlas según sea necesario

Steam hace uso de **React** para renderizar componentes web.

## Inspiración

He tomado la idea original de [Steamcito](https://github.com/emilianog94/Steamcito-Precios-Steam-Argentina-Impuestos-Incluidos) y la implementé en Steam gracias al cliente [Millennium Steam Homebrew](https://steambrew.app), el cual expone la facilidad de inyectar modificaciones.

## Requisitos de Instalación

1. **Primero instalar**: [SteamBrew](https://steambrew.app)
2. **Luego poner la carpeta** dentro de la ruta de instalación de Steam  
   *Ejemplo (en mi caso):* `C:\Launchers\steam\plugins`
3. **Abrir Steam** y activar el complemento

## Demo de Funcionamiento

[![Ver demo](https://img.shields.io/badge/Ver-Demo-red?style=for-the-badge)](https://youtu.be/xQTYkRzK8q0)

**Enlace directo al video**: https://youtu.be/xQTYkRzK8q0

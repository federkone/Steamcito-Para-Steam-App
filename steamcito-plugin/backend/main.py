import Millennium, PluginUtils # type: ignore
logger = PluginUtils.Logger()

import time
import json
import urllib.request
import urllib.error
import re
from datetime import datetime

class Backend:
    @staticmethod 
    def receive_frontend_message(message: str, status: bool, count: int):
        logger.log(f"received: {[message, status, count]}")

        # accepted return types [str, int, bool]
        if count == 69:
            return True
        else:
            return False
    
    @staticmethod
    def _make_request(url: str, headers: dict = None):
        if headers is None:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as response:
                return response.read().decode('utf-8')
        except Exception as e:
            logger.error(f"Error making request to {url}: {e}")
            return None
    
    @staticmethod
    def get_exchange_rates():
        try:
            # Obtener tasa de cambio de tarjeta (Dólar Tarjeta)
            card_rate = Backend._get_card_rate()
            logger.log(f"Card rate obtained: {card_rate}")
            
            # Calcular tasa con impuestos (21% IVA)
            exchange_rates = {
                "tarjeta": {
                    "rate": card_rate,  # Solo el dólar tarjeta sin impuestos
                    "date": time.time(),
                    "taxAmount": 21  # Solo 21% IVA
                }
            }
            
            logger.log(f"Exchange rates obtained: {exchange_rates}")
            return json.dumps(exchange_rates)
            
        except Exception as e:
            logger.error(f"Error getting exchange rates: {e}")
            return json.dumps({})
    
    @staticmethod
    def _get_card_rate():
        try:
            # Obtener el valor del dólar tarjeta de DolarApi
            response = Backend._make_request("https://dolarapi.com/v1/dolares/oficial")   #el dolar tarjeta ya contiene el 30% de ganancias, pero ahora se usa el dolar oficial
            if response:
                data = json.loads(response)
                rate = float(data['venta'])
                logger.log(f"DolarApi rate: {rate}")
                return rate
            
            logger.warning("Using default card rate value")
            return 1
            
        except Exception as e:
            logger.error(f"Error getting card rate: {e}")
            return 1
    
    @staticmethod
    def get_taxes():
        # Devuelve solo el IVA
        taxes = {
            "standard": [
                {
                    "name": "IVA Servicios Digitales - RG AFIP",
                    "value": 21,
                    "moreInfo": "https://www.afip.gob.ar/iva/servicios-digitales/"
                }
            ],
            "province": [] 
        }
        return json.dumps(taxes)

    @staticmethod
    def _calculate_rate_with_tax(base_rate, tax_type):
        # Calcula la tasa con el IVA aplicado (21%) + percepcion de gananancias del 30% segun rg arca 5617
        iva_amount = base_rate * 0.21
        return base_rate + iva_amount 

def get_steam_path():
    logger.log("getting steam path")
    return Millennium.steam_path()

class Plugin:
    def _front_end_loaded(self):
        # The front end has successfully mounted in the steam app.
        logger.log("The front end has loaded!")
        
        # Una vez que el frontend está cargado, podemos enviar datos como las tasas de cambio
        try:
            exchange_rates = Backend.get_exchange_rates()
            taxes = Backend.get_taxes()
            
            # Enviar datos al frontend sin emojis
            Millennium.call_frontend_method("steamcito.setExchangeRates", [exchange_rates])
            Millennium.call_frontend_method("steamcito.setTaxes", [taxes])
            
            logger.log("Sent exchange rates and taxes to frontend")
        except Exception as e:
            logger.error(f"Error sending data to frontend: {e}")

    def _load(self):     
        # This code is executed when your plugin loads. 
        logger.log(f"Bootstrapping Steamcito plugin, millennium {Millennium.version()}")
            
        Millennium.ready() # this is required to tell Millennium that the backend is ready.

    def _unload(self):
        logger.log("unloading Steamcito plugin")
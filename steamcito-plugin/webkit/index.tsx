import { callable } from "@steambrew/webkit"
import { render } from "preact";
import { useEffect, useState, useRef } from "preact/hooks";

// Definición de los métodos del backend
const getExchangeRates = callable<[], string>("Backend.get_exchange_rates");
const getTaxes = callable<[], string>("Backend.get_taxes");

// Declaración de tipos para extender el objeto window
declare global {
	interface Window {
		steamcito: {
			setExchangeRates: (ratesJson: string) => boolean;
			setTaxes: (taxesJson: string) => boolean;
		}
	}
}

// Métodos para el frontend expuestos para backend
window.steamcito = {
	setExchangeRates: (ratesJson: string) => {
		try {
			const rates = JSON.parse(ratesJson);
			localStorage.setItem('steamcito-cotizacion-tarjeta', JSON.stringify(rates.tarjeta));
			// Guardamos solo lo que necesitamos
			console.log("Exchange rates updated");
			return true;
		} catch (e) {
			console.error("Error setting exchange rates:", e);
			return false;
		}
	},
	setTaxes: (taxesJson: string) => {
		try {
			const taxes = JSON.parse(taxesJson);
			localStorage.setItem('steamcito-taxes', taxesJson);
			console.log("Taxes updated");
			return true;
		} catch (e) {
			console.error("Error setting taxes:", e);
			return false;
		}
	}
};

// Constantes para la conversión de monedas
const attributeName = "data-original-price";

// Componente principal
interface SteamcitoProps {
	exchangeRates: any;
	taxes: any;
}

const Steamcito: preact.FunctionalComponent<SteamcitoProps> = ({ exchangeRates, taxes }): preact.VNode => {
	const [isConverting, setIsConverting] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState("tarjeta");
	const processingRef = useRef(new Set<HTMLElement>());
	const observerRef = useRef<MutationObserver | null>(null);
	const debounceTimerRef = useRef<number | null>(null);
	const pricesLoadedRef = useRef(false);

	const selectorList = `
	.discount_original_price, 
	.discount_final_price, 
	.game_purchase_price,
	[class*=salepreviewwidgets_StoreSalePriceBox], 
	[class*=salepreviewwidgets_StoreOrignalPrice], 
	[class*=salepreviewwidgets_StoreOriginalPrice], 
	.search_price, 
	.regular_price, 
	.match_price, 
	.cart_item .price,
	.price.bundle_final_package_price,
	.price.bundle_final_price_with_discount,
	.bundle_savings,
	.package_info_block_content .price,
	#package_savings_bar .savings,
	.promo_item_list .price span,
	.apphub_StorePrice .price,
	.item_def_price,
	.match_subtitle,
	.regional-meter-price,
	.StoreSalePriceWidgetContainer.Discounted >div >div,
	.StoreSalePriceWidgetContainer:not(.Discounted) >div,
	.AppCapsuleCtn >span >span
`.replace(/\s+/g, ''); // eliminamos saltos de línea y espacios innecesarios

	useEffect(() => {
		// Iniciar conversión cuando el DOM esté listo
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => {
				startPriceConversion();
			});
		} else {
			// Si el DOM ya está cargado, iniciar inmediatamente
			startPriceConversion();
		}
		
		// Establecer un observador para detectar cambios en el DOM
		observerRef.current = new MutationObserver((mutations) => {
			// Verificar si hay cambios relevantes para los precios
			const hasPriceChanges = mutations.some(mutation => {
				if (mutation.type === 'childList') {
					return Array.from(mutation.addedNodes).some(node => {
						if (node instanceof HTMLElement) {
							return node instanceof HTMLElement && node.querySelector(selectorList) !== null;
						}
						return false;
					});
				}
				return false;
			});
			
			if (hasPriceChanges && !isConverting) {
				// Usar requestIdleCallback si está disponible para no interferir con la interfaz
				if (window.requestIdleCallback) {
					if (debounceTimerRef.current) {
						window.cancelIdleCallback(debounceTimerRef.current);
					}
					debounceTimerRef.current = window.requestIdleCallback(() => {
						startPriceConversion();
					});
				} else {
					// Fallback a requestAnimationFrame si requestIdleCallback no está disponible
					requestAnimationFrame(() => {
						startPriceConversion();
					});
				}
			}
		});

		

		// Configurar el observador optimizado para rendimiento
		observerRef.current.observe(document.body, { 
			childList: true, 
			subtree: true,
			attributes: false
		});

		// Detectar cuando la página ha terminado de cargar completamente
		window.addEventListener('load', () => {
			// Marcar que la página está completamente cargada y ejecutar la conversión
			pricesLoadedRef.current = true;
			startPriceConversion();
		});

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
			if (debounceTimerRef.current && window.cancelIdleCallback) {
				window.cancelIdleCallback(debounceTimerRef.current);
			}
		};
	}, []);

	const startPriceConversion = () => {
		if (isConverting) return;
		setIsConverting(true);
		
		// Usar requestAnimationFrame para sincronizarse con el ciclo de renderizado
		requestAnimationFrame(() => {
			const priceContainers = `
				.discount_original_price:not([${attributeName}]), 
				.discount_final_price:not([${attributeName}]), 
				.game_purchase_price:not([${attributeName}]),
				[class*=salepreviewwidgets_StoreSalePriceBox]:not([${attributeName}]), 
				[class*=salepreviewwidgets_StoreOrignalPrice]:not([${attributeName}]), 
				[class*=salepreviewwidgets_StoreOriginalPrice]:not([${attributeName}]), 
				.search_price:not([${attributeName}]), 
				.regular_price:not([${attributeName}]), 
				.match_price:not([${attributeName}]), 
				.cart_item .price:not([${attributeName}]),
				.price.bundle_final_package_price:not([${attributeName}]),
				.price.bundle_final_price_with_discount:not([${attributeName}]),
				.bundle_savings:not([${attributeName}]),
				.package_info_block_content .price:not([${attributeName}]),
				#package_savings_bar .savings:not([${attributeName}]),
				.promo_item_list .price span:not([${attributeName}]),
				.apphub_StorePrice .price:not([${attributeName}]),
				.item_def_price:not([${attributeName}]),
				.match_subtitle:not([${attributeName}]),
				.regional-meter-price:not([${attributeName}]),
				.StoreSalePriceWidgetContainer.Discounted >div >div:not([${attributeName}]),
				.StoreSalePriceWidgetContainer:not(.Discounted) >div:not([${attributeName}]),
				.AppCapsuleCtn >span >span:not([${attributeName}])
			`;
			
			const prices = document.querySelectorAll(priceContainers); //original se porcesa cada componente declarado arriba

			// Procesar precios de forma eficiente usando el sistema de lotes
			processPricesInBatches(Array.from(prices) as HTMLElement[]);
		});
	};

	/*const startPriceConversion = () => { //test
		if (isConverting) return;
		setIsConverting(true);
	
		requestAnimationFrame(() => {
			// Obtenemos todos los elementos posibles del DOM
			const allElements = Array.from(document.querySelectorAll('*'));
	
			// Expresión regular para capturar precios en USD con diferentes formatos
			const usdRegex = /\b(?:US\$|\$|USD\s?)\s?\d{1,3}(?:[.,]\d{2})?\b/i;
	
			// Filtrar elementos con texto que coincida con un patrón de precio en USD
			const priceCandidates = allElements.filter(el => {
				return (
					!el.hasAttribute(attributeName) &&
					el.children.length === 0 && // asegurarse que sea un nodo de texto final
					usdRegex.test(el.textContent || '')
				);
			});
	
			// Marcar para no volver a convertirlos
			priceCandidates.forEach(el => el.setAttribute(attributeName, 'true'));
	
			processPricesInBatches(priceCandidates as HTMLElement[]);
		});
	};
	*/


	const processPricesInBatches = (prices: HTMLElement[], batchSize = 10, index = 0) => {
		// Procesar un lote a la vez
		const end = Math.min(index + batchSize, prices.length);
		
		// Procesar este lote
		for (let i = index; i < end; i++) {
			const price = prices[i];
			if (!processingRef.current.has(price)) {
				processingRef.current.add(price);
				setArgentinaPrice(price);
			}
		}
		
		// Si hay más lotes, programarlos para el próximo frame
		if (end < prices.length) {
			requestAnimationFrame(() => {
				processPricesInBatches(prices, batchSize, end);
			});
		} else {
			// Terminamos todos los lotes
			setIsConverting(false);
		}
	};

	const setArgentinaPrice = (price: HTMLElement) => {
		// Verificar que el elemento tenga un precio en formato $XX.XX
		if (!price || !price.innerText || !price.innerText.includes('$')) return;
		
		const baseNumericPrice = extractNumberFromString(price.innerText);
		if (!baseNumericPrice) return;
		
		const selectedRate = exchangeRates[paymentMethod].rate;
		
		price.dataset.originalPrice = String(baseNumericPrice);
		price.dataset.argentinaPrice = String(calculateTaxesAndExchange(baseNumericPrice, selectedRate));
		renderPrices(price);
	};

	const extractNumberFromString = (string: string): number => {
		// Intentar regex básico para formatos como "$9.99" o "$ 9,99"
		let matches = string.match(/\$\s?(\d+(?:[.,]\d+)?)/);
		
		// Si no coincide, probar otros formatos comunes en Steam
		if (!matches || !matches[1]) {
			// Buscar cualquier número con decimales o sin ellos en el texto
			matches = string.match(/(\d+(?:[.,]\d+)?)/);
		}
		
		if (matches && matches[1]) {
			// Normalizar: reemplazar comas por puntos para el parseFloat
			return parseFloat(matches[1].replace(',', '.'));
		}
		
		return 0;
	};

	const calculateTaxesAndExchange = (initialPrice: number, exchangeRate: number): number => {
		if (!initialPrice) return 0;
		
		let totalTax = 0;
		if (taxes && taxes.standard) {
			taxes.standard.forEach((tax: any) => {
				totalTax += parseFloat(tax.value);
			});
		}
		
		const totalWithTaxes = initialPrice * (1 + totalTax / 100);
		const totalInArs = totalWithTaxes * exchangeRate;
		
		return Math.round(totalInArs * 100) / 100;
	};

	const renderPrices = (price: HTMLElement) => {
		if (!price.dataset.originalPrice || !price.dataset.argentinaPrice) return;
		
		const argentinaPrice = price.dataset.argentinaPrice;
		
		// Guardar el contenido original en caso de que necesitemos restaurarlo
		if (!price.dataset.originalHtml) {
			price.dataset.originalHtml = price.innerHTML;
		}
		
		// Reemplazar completamente el contenido con el precio en ARS
		const arsPrice = document.createElement('span');
		arsPrice.classList.add('steamcito-ars-price');
		arsPrice.innerText = `$${parseFloat(argentinaPrice).toLocaleString('es-AR')} ARS`;
		arsPrice.style.cssText = 'color: #a3cf06; font-size: 1em;';
		
		// Limpiar el contenido actual y mostrar solo el precio en ARS
		price.innerHTML = '';
		price.appendChild(arsPrice);
	};

	return null; // Este componente no renderiza UI directamente
};

// Tipado para requestIdleCallback
interface IdleRequestOptions {
    timeout: number;
}

interface IdleDeadline {
    didTimeout: boolean;
    timeRemaining: () => number;
}

export default async function WebkitMain() {
	try {
		// Cargar recursos necesarios
		const exchangeRatesResponse = await getExchangeRates();
		const taxesResponse = await getTaxes();
		
		// Parsear las respuestas
		const exchangeRates = JSON.parse(exchangeRatesResponse);
		const taxes = JSON.parse(taxesResponse);
		
		// Inicializar la app cuando el DOM esté listo
		const initializeSteamcito = () => {
			// Crear elemento contenedor
			const container = document.createElement('div');
			container.id = 'steamcito-container';
			container.style.display = 'none'; // Oculto ya que es solo funcional
			document.body.appendChild(container);
			
			// Renderizar componente
			render(<Steamcito exchangeRates={exchangeRates} taxes={taxes} />, container);
			
			console.log('Steamcito initialized');
		};
		
		// Inicializar junto con la carga de la página
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', initializeSteamcito);
		} else {
			initializeSteamcito();
		}
		
	} catch (error) {
		console.error('Error initializing Steamcito:', error);
	}
}
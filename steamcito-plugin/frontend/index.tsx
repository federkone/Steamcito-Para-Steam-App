import { callable, Millennium } from "@steambrew/client";

class classname {
    static method(country: string, age: number) {
        console.log(`age: ${age}, country: ${country}`);
        return "method called"
    }
}

// export classname class to global context
Millennium.exposeObj({ classname });

// Función más segura para cargar CSS usando Fetch API
async function loadCSSContent(path: string) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to load CSS: ${response.statusText}`);
        }
        const cssText = await response.text();
        
        // Crear un elemento style en lugar de link
        const style = document.createElement('style');
        style.textContent = cssText;
        document.head.appendChild(style);
        return true;
    } catch (e) {
        console.error("Error loading CSS:", e);
        return false;
    }
}

// Declare a function that exists on the backend
const backendMethod = callable<[{ message: string, status: boolean, count: number }], boolean>('Backend.receive_frontend_message')

// Entry point on the front end of your plugin
export default async function PluginMain() {
    // Call the backend method
    try {
        const message = await backendMethod({ message: "Hello World From Frontend!", status: true, count: 69 })
        console.log("Result from callServerMethod:", message)
        
        // Cargar CSS sin depender de staticEmbed
        await loadCSSContent("../styles/styles.css");
        console.log("CSS loaded successfully");
    } catch (e) {
        console.error("Error in plugin initialization:", e);
    }
}

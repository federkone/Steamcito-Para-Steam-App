const pluginName = "steamcito_millennium";
function InitializePlugins() {
    /**
     * This function is called n times depending on n plugin count,
     * Create the plugin list if it wasn't already created
     */
    !window.PLUGIN_LIST && (window.PLUGIN_LIST = {});
    // initialize a container for the plugin
    if (!window.PLUGIN_LIST[pluginName]) {
        window.PLUGIN_LIST[pluginName] = {};
    }
}
InitializePlugins()
const __call_server_method__ = (methodName, kwargs) => Millennium.callServerMethod(pluginName, methodName, kwargs)
const __wrapped_callable__ = (route) => MILLENNIUM_API.callable(__call_server_method__, route)
var millennium_main=function(e,t){"use strict";!function(){const e={};try{if(process)return process.env=Object.assign({},process.env),void Object.assign(process.env,e)}catch(e){}globalThis.process={env:e}}();t.Millennium.exposeObj(e,{classname:class{static method(e,t){return console.log(`age: ${t}, country: ${e}`),"method called"}}});const o=__wrapped_callable__("Backend.receive_frontend_message");return e.default=async function(){try{const e=await o({message:"Hello World From Frontend!",status:!0,count:69});console.log("Result from callServerMethod:",e),await async function(e){try{const t=await fetch(e);if(!t.ok)throw new Error(`Failed to load CSS: ${t.statusText}`);const o=await t.text(),n=document.createElement("style");return n.textContent=o,document.head.appendChild(n),!0}catch(e){return console.error("Error loading CSS:",e),!1}}("../styles/styles.css"),console.log("CSS loaded successfully")}catch(e){console.error("Error in plugin initialization:",e)}},Object.defineProperty(e,"__esModule",{value:!0}),e}({},window.MILLENNIUM_API);

function ExecutePluginModule() {
    // Assign the plugin on plugin list.
    Object.assign(window.PLUGIN_LIST[pluginName], millennium_main);
    // Run the rolled up plugins default exported function
    millennium_main["default"]();
    MILLENNIUM_BACKEND_IPC.postMessage(1, { pluginName: pluginName });
}
ExecutePluginModule()
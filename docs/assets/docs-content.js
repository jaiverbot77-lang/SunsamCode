// Documentación del producto Sunsam Code (docs/documentation.html).
// Cada idioma tiene la misma lista de secciones; los idiomas sin una sección caen al inglés.
// El HTML de cada sección es contenido estático de este repositorio (no entra texto de usuarios).
window.SUNSAM_DOCS = {
  es: {
    title: "Documentación",
    lead: "Todo lo necesario para instalar, configurar y usar Sunsam Code, el agente de programación de escritorio con tus propios modelos.",
    toc: "En esta página",
    back: "← Volver al inicio",
    sections: [
      {
        id: "intro",
        title: "¿Qué es Sunsam Code?",
        html: `<p>Sunsam Code es una aplicación de escritorio (Windows, macOS y Linux) con un agente de programación que lee, escribe y ejecuta código en tus proyectos. Es un fork de código abierto de <a href="https://github.com/zai-org/ZCode">ZCode</a> (Apache-2.0) que añade:</p>
<ul>
<li><b>Tus propios proveedores de modelos</b>: cualquier API compatible con OpenAI o Anthropic (LM Studio, Ollama, vLLM, OpenRouter…), con el proveedor oficial de Z.ai como opción.</li>
<li><b>Extensiones MCP en un clic</b>: instala paquetes <code>.mcpb</code> / <code>.dxt</code> como en Claude Desktop, o desde los marketplaces de conectores.</li>
<li><b>Sunsam Mesh</b>: un router que envía cada petición a un modelo local pequeño o a modelos grandes en otras máquinas de tu red.</li>
<li><b>Actualizaciones desde GitHub</b> e interfaz en 7 idiomas.</li>
</ul>
<p>Se instala junto a ZCode sin interferir (identidad <code>dev.sunsam.code</code>).</p>`,
      },
      {
        id: "install",
        title: "Instalación",
        html: `<p>Descarga el instalador de la <a href="https://github.com/jhonsu01/SunsamCode/releases/latest">última versión</a> o desde la <a href="./#descargas">sección de descargas</a>.</p>
<table><tr><th>Sistema</th><th>Archivo</th><th>Notas</th></tr>
<tr><td>Windows 10/11 (x64)</td><td><code>Sunsam-Code-&lt;versión&gt;-win-x64.exe</code></td><td>Firmado con un certificado propio. Si aparece SmartScreen: <i>Más información → Ejecutar de todas formas</i>.</td></tr>
<tr><td>macOS 11+ (Apple silicon e Intel)</td><td><code>.dmg</code> o <code>.zip</code></td><td>Tras copiarla a Aplicaciones: <code>xattr -rd com.apple.quarantine "/Applications/Sunsam Code.app"</code></td></tr>
<tr><td>Linux (x64 / arm64)</td><td><code>.AppImage</code>, <code>.deb</code>, <code>.rpm</code>, <code>.pkg.tar.zst</code></td><td>AppImage: <code>chmod +x Sunsam*.AppImage && ./Sunsam*.AppImage</code></td></tr></table>`,
      },
      {
        id: "start",
        title: "Primeros pasos",
        html: `<ol>
<li><b>Abre una carpeta de proyecto</b>: en la pantalla de inicio elige la carpeta donde trabajará el agente.</li>
<li><b>Elige un modelo</b> en el selector bajo el cuadro de texto (configúralo antes en <a href="#providers">Proveedores</a>).</li>
<li><b>Elige el nivel de acceso</b>: el modo determina qué puede hacer el agente sin preguntarte (leer, editar archivos, ejecutar comandos). Empieza con el modo que pide confirmación y amplíalo cuando confíes en el flujo.</li>
<li><b>Escribe la tarea</b>. Usa <code>@</code> para añadir archivos o carpetas como contexto y <code>/</code> para comandos y capacidades.</li>
<li>Revisa los cambios propuestos, acepta o pide ajustes. Cada conversación queda en la barra lateral.</li>
</ol>
<p>La primera vez aparece una breve introducción (tu perfil y preferencias); puedes omitirla.</p>`,
      },
      {
        id: "providers",
        title: "Proveedores y modelos",
        html: `<p>Ve a <b>Ajustes → Ajustes de modelos → Añadir proveedor</b>:</p>
<ul>
<li><b>Compatible con OpenAI</b>: URL base (por ejemplo <code>http://localhost:1234/v1</code> para LM Studio u <code>http://localhost:11434/v1</code> para Ollama), clave de API si hace falta y los modelos que quieras usar.</li>
<li><b>Compatible con Anthropic</b>: para APIs con el formato de mensajes de Anthropic.</li>
<li><b>Z.ai (opcional)</b>: el proveedor oficial con su plan y su consumo.</li>
</ul>
<p>Consejo: con modelos locales prioriza una ventana de contexto amplia; un modelo pequeño con mucho contexto suele rendir mejor que uno grande con poco.</p>`,
      },
      {
        id: "extensions",
        title: "Extensiones MCP",
        html: `<p>Las extensiones dan al agente herramientas nuevas (editar vídeo, fotos, PDF, documentos…) mediante el <a href="https://modelcontextprotocol.io">Model Context Protocol</a>.</p>
<h4>Instalar un paquete .mcpb / .dxt</h4>
<ol><li>Abre <b>Ajustes → Servidores MCP</b>.</li>
<li>Pulsa <b>Instalar extensión (.mcpb / .dxt)</b> o arrastra los archivos a la pantalla.</li>
<li>Si la extensión pide datos, las rutas se <b>detectan automáticamente</b>; con <b>Examinar…</b> eliges otra.</li>
<li>Pulsa <b>Reiniciar ahora</b> para que el agente la cargue.</li></ol>
<p>Volver a subir el mismo paquete lo <b>actualiza</b> conservando tu configuración. Si el equipo no tiene Node.js, se usa el que trae Sunsam Code.</p>
<h4>Marketplaces</h4>
<p>En <b>Ajustes → Servidores MCP → Marketplaces</b> está el <a href="https://github.com/jhonsu01/marketplace-SunsamCode">marketplace de Sunsam</a> con conectores listos (FilmCraft, PhotoCraft, WordCraft, PdfCraft, Audacity…). Pulsa <b>Instalar</b>; cuando hay versión nueva aparece <b>Actualizar</b>. Puedes añadir otros marketplaces con su <code>usuario/repositorio</code> o la URL de su <code>marketplace.json</code>.</p>`,
      },
      {
        id: "mesh",
        title: "Sunsam Mesh",
        html: `<p>Sunsam Mesh es una pasarela local (<code>http://127.0.0.1:4141</code>) que decide, petición a petición, si responde un modelo pequeño en tu equipo o uno grande en otra máquina de tu red.</p>
<pre>pnpm sunsam:mesh:init   # crea ~/.sunsam/mesh.json (añade tus equipos)
pnpm sunsam:mesh        # inicia la pasarela</pre>
<p>En la app añade un proveedor compatible con OpenAI con la URL <code>http://127.0.0.1:4141</code> y elige <code>sunsam-auto</code>, <code>sunsam-local</code> o <code>sunsam-swarm</code>. Detalles en el <a href="https://github.com/jhonsu01/SunsamCode/blob/claude/nice-brown-v1jufb/packages/sunsam-mesh/README.md">README de Sunsam Mesh</a>.</p>`,
      },
      {
        id: "features",
        title: "Funciones de la versión 3.15",
        html: `<ul>
<li><b>UI Plugins</b>: plugins con interfaz propia dentro de la app (por ejemplo un flujo con Excalidraw para diagramas).</li>
<li><b>Control remoto web</b>: sigue y dirige tus tareas desde el navegador del móvil.</li>
<li><b>Flujos de trabajo dinámicos</b> y subagentes en segundo plano para tareas largas.</li>
<li><b>Automatizaciones</b> programadas y tareas para el tiempo libre del equipo.</li>
</ul>`,
      },
      {
        id: "settings",
        title: "Idioma, tema y actualizaciones",
        html: `<ul>
<li><b>Idioma</b>: Ajustes → General. Español, English, Português, Français, Русский, 한국어 y 简体中文; «Sistema» sigue el idioma del equipo.</li>
<li><b>Tema</b>: Ajustes → Apariencia (claro, oscuro o el del sistema).</li>
<li><b>Actualizaciones</b>: la app comprueba al iniciar y cada hora las <a href="https://github.com/jhonsu01/SunsamCode/releases">versiones de GitHub</a>; también en <b>Ayuda → Buscar actualizaciones</b>. En Windows y con la AppImage de Linux se instalan con un botón; en macOS descarga el <code>.dmg</code> nuevo.</li>
</ul>`,
      },
      {
        id: "help",
        title: "Ayuda, problemas y sugerencias",
        html: `<ul>
<li><b>Ayuda → Informar de un problema</b> abre un formulario de issue en GitHub con la versión y el sistema ya rellenados. Añade los pasos para reproducirlo y capturas sin datos privados.</li>
<li><b>Ayuda → Solicitar una función</b> abre el formulario de propuestas.</li>
<li><b>Ayuda → Exportar registros</b> guarda los registros del día para adjuntarlos al issue.</li>
<li>Los problemas de un conector MCP van al repositorio de ese conector.</li>
</ul>`,
      },
      {
        id: "faq",
        title: "Solución de problemas",
        html: `<dl>
<dt>Windows bloquea el instalador</dt><dd>SmartScreen muestra un aviso porque el certificado no es de una autoridad pública: <i>Más información → Ejecutar de todas formas</i>.</dd>
<dt>macOS dice que la app está dañada</dt><dd>Ejecuta <code>xattr -rd com.apple.quarantine "/Applications/Sunsam Code.app"</code>.</dd>
<dt>Error [1210] con modelos de Z.ai / GLM</dt><dd>Sunsam Code adapta los esquemas de las herramientas automáticamente; si persiste con una extensión concreta, informa del problema indicando cuál.</dd>
<dt>Una extensión no encuentra su programa</dt><dd>Abre sus ajustes en Servidores MCP, pulsa <b>Examinar…</b> y elige la carpeta o el ejecutable; después <b>Reiniciar ahora</b>.</dd>
<dt>El modelo local no responde</dt><dd>Comprueba que el servidor (LM Studio, Ollama…) está en marcha y que la URL base termina en <code>/v1</code>.</dd>
</dl>`,
      },
    ],
  },

  en: {
    title: "Documentation",
    lead: "Everything you need to install, set up and use Sunsam Code, the desktop coding agent that runs on your own models.",
    toc: "On this page",
    back: "← Back to home",
    sections: [
      {
        id: "intro",
        title: "What is Sunsam Code?",
        html: `<p>Sunsam Code is a desktop app (Windows, macOS and Linux) with a coding agent that reads, writes and runs code in your projects. It is an open-source fork of <a href="https://github.com/zai-org/ZCode">ZCode</a> (Apache-2.0) that adds:</p>
<ul>
<li><b>Your own model providers</b>: any OpenAI- or Anthropic-compatible API (LM Studio, Ollama, vLLM, OpenRouter…), with the official Z.ai provider as an option.</li>
<li><b>One-click MCP extensions</b>: install <code>.mcpb</code> / <code>.dxt</code> packages as in Claude Desktop, or from connector marketplaces.</li>
<li><b>Sunsam Mesh</b>: a router that sends each request to a small local model or to larger models on other machines in your network.</li>
<li><b>Updates from GitHub</b> and an interface in 7 languages.</li>
</ul>
<p>It installs side by side with ZCode (identity <code>dev.sunsam.code</code>).</p>`,
      },
      {
        id: "install",
        title: "Installation",
        html: `<p>Download the installer from the <a href="https://github.com/jhonsu01/SunsamCode/releases/latest">latest release</a> or the <a href="./#descargas">downloads section</a>.</p>
<table><tr><th>System</th><th>File</th><th>Notes</th></tr>
<tr><td>Windows 10/11 (x64)</td><td><code>Sunsam-Code-&lt;version&gt;-win-x64.exe</code></td><td>Signed with the author's own certificate. If SmartScreen appears: <i>More info → Run anyway</i>.</td></tr>
<tr><td>macOS 11+ (Apple silicon and Intel)</td><td><code>.dmg</code> or <code>.zip</code></td><td>After copying it to Applications: <code>xattr -rd com.apple.quarantine "/Applications/Sunsam Code.app"</code></td></tr>
<tr><td>Linux (x64 / arm64)</td><td><code>.AppImage</code>, <code>.deb</code>, <code>.rpm</code>, <code>.pkg.tar.zst</code></td><td>AppImage: <code>chmod +x Sunsam*.AppImage && ./Sunsam*.AppImage</code></td></tr></table>`,
      },
      {
        id: "start",
        title: "Getting started",
        html: `<ol>
<li><b>Open a project folder</b>: on the home screen pick the folder the agent will work in.</li>
<li><b>Pick a model</b> in the selector under the text box (set it up first in <a href="#providers">Providers</a>).</li>
<li><b>Choose the access level</b>: the mode decides what the agent may do without asking (read, edit files, run commands). Start with the mode that asks for confirmation and widen it once you trust the flow.</li>
<li><b>Type the task</b>. Use <code>@</code> to add files or folders as context and <code>/</code> for commands and capabilities.</li>
<li>Review the proposed changes, accept them or ask for adjustments. Every conversation stays in the sidebar.</li>
</ol>
<p>The first time, a short introduction appears (your profile and preferences); you can skip it.</p>`,
      },
      {
        id: "providers",
        title: "Providers and models",
        html: `<p>Go to <b>Settings → Model settings → Add provider</b>:</p>
<ul>
<li><b>OpenAI-compatible</b>: base URL (for example <code>http://localhost:1234/v1</code> for LM Studio or <code>http://localhost:11434/v1</code> for Ollama), an API key if needed and the models you want.</li>
<li><b>Anthropic-compatible</b>: for APIs that use Anthropic's messages format.</li>
<li><b>Z.ai (optional)</b>: the official provider with its plan and usage.</li>
</ul>
<p>Tip: with local models prefer a large context window; a small model with a long context often does better than a big one with a short context.</p>`,
      },
      {
        id: "extensions",
        title: "MCP extensions",
        html: `<p>Extensions give the agent new tools (video, photo, PDF and document editing…) through the <a href="https://modelcontextprotocol.io">Model Context Protocol</a>.</p>
<h4>Install a .mcpb / .dxt package</h4>
<ol><li>Open <b>Settings → MCP Servers</b>.</li>
<li>Click <b>Install extension (.mcpb / .dxt)</b> or drag the files onto the screen.</li>
<li>If the extension asks for settings, paths are <b>detected automatically</b>; <b>Browse…</b> picks another one.</li>
<li>Click <b>Restart now</b> so the agent loads it.</li></ol>
<p>Uploading the same package again <b>updates</b> it and keeps your settings. Without Node.js on the computer, the one bundled with Sunsam Code is used.</p>
<h4>Marketplaces</h4>
<p><b>Settings → MCP Servers → Marketplaces</b> includes the <a href="https://github.com/jhonsu01/marketplace-SunsamCode">Sunsam marketplace</a> with ready-made connectors (FilmCraft, PhotoCraft, WordCraft, PdfCraft, Audacity…). Click <b>Install</b>; when a new version is out, <b>Update</b> appears. Add other marketplaces by <code>user/repository</code> or the URL of their <code>marketplace.json</code>.</p>`,
      },
      {
        id: "mesh",
        title: "Sunsam Mesh",
        html: `<p>Sunsam Mesh is a local gateway (<code>http://127.0.0.1:4141</code>) that decides, request by request, whether a small model on your computer or a large one on another machine in your network answers.</p>
<pre>pnpm sunsam:mesh:init   # creates ~/.sunsam/mesh.json (add your machines)
pnpm sunsam:mesh        # starts the gateway</pre>
<p>In the app add an OpenAI-compatible provider with the URL <code>http://127.0.0.1:4141</code> and pick <code>sunsam-auto</code>, <code>sunsam-local</code> or <code>sunsam-swarm</code>. Details in the <a href="https://github.com/jhonsu01/SunsamCode/blob/claude/nice-brown-v1jufb/packages/sunsam-mesh/README.md">Sunsam Mesh README</a>.</p>`,
      },
      {
        id: "features",
        title: "What's new in 3.15",
        html: `<ul>
<li><b>UI Plugins</b>: plugins with their own interface inside the app (for example an Excalidraw flow for diagrams).</li>
<li><b>Web remote control</b>: follow and steer your tasks from your phone's browser.</li>
<li><b>Dynamic workflows</b> and background subagents for long tasks.</li>
<li>Scheduled <b>automations</b> and idle-time tasks.</li>
</ul>`,
      },
      {
        id: "settings",
        title: "Language, theme and updates",
        html: `<ul>
<li><b>Language</b>: Settings → General. Español, English, Português, Français, Русский, 한국어 and 简体中文; "System" follows the computer.</li>
<li><b>Theme</b>: Settings → Appearance (light, dark or system).</li>
<li><b>Updates</b>: the app checks the <a href="https://github.com/jhonsu01/SunsamCode/releases">GitHub releases</a> on launch and every hour, or via <b>Help → Check for updates</b>. On Windows and with the Linux AppImage they install with one click; on macOS download the new <code>.dmg</code>.</li>
</ul>`,
      },
      {
        id: "help",
        title: "Help, issues and ideas",
        html: `<ul>
<li><b>Help → Report an issue</b> opens a GitHub issue form with the version and system already filled in. Add the steps to reproduce it and screenshots without private data.</li>
<li><b>Help → Request a feature</b> opens the proposal form.</li>
<li><b>Help → Export logs</b> saves today's logs to attach to the issue.</li>
<li>Problems with an MCP connector go to that connector's repository.</li>
</ul>`,
      },
      {
        id: "faq",
        title: "Troubleshooting",
        html: `<dl>
<dt>Windows blocks the installer</dt><dd>SmartScreen warns because the certificate is not from a public authority: <i>More info → Run anyway</i>.</dd>
<dt>macOS says the app is damaged</dt><dd>Run <code>xattr -rd com.apple.quarantine "/Applications/Sunsam Code.app"</code>.</dd>
<dt>Error [1210] with Z.ai / GLM models</dt><dd>Sunsam Code adapts tool schemas automatically; if it persists with a specific extension, report it and name the extension.</dd>
<dt>An extension cannot find its program</dt><dd>Open its settings in MCP Servers, click <b>Browse…</b> and pick the folder or executable, then <b>Restart now</b>.</dd>
<dt>The local model does not answer</dt><dd>Check that the server (LM Studio, Ollama…) is running and that the base URL ends in <code>/v1</code>.</dd>
</dl>`,
      },
    ],
  },
};

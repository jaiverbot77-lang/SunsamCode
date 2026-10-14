/* oxlint-disable eslint(max-lines) -- contenido de la documentación en 7 idiomas, no lógica. */
// Traducciones de la documentación (docs/documentation.html). Los nombres de menús citan los
// textos reales de la app en ese idioma; en alemán, italiano y japonés la app se muestra en
// inglés, así que los menús aparecen en inglés.
Object.assign(window.SUNSAM_DOCS, {
  pt: {
    title: "Documentação",
    lead: "Tudo o que você precisa para instalar, configurar e usar o Sunsam Code, o agente de programação de desktop com seus próprios modelos.",
    toc: "Nesta página",
    back: "← Voltar ao início",
    sections: [
      {
        id: "intro",
        title: "O que é o Sunsam Code?",
        html: `<p>O Sunsam Code é um app de desktop (Windows, macOS e Linux) com um agente de programação que lê, escreve e executa código nos seus projetos. É um fork de código aberto do <a href="https://github.com/zai-org/ZCode">ZCode</a> (Apache-2.0) que adiciona:</p>
<ul>
<li><b>Seus próprios provedores de modelos</b>: qualquer API compatível com OpenAI ou Anthropic (LM Studio, Ollama, vLLM, OpenRouter…), com o provedor oficial da Z.ai como opção.</li>
<li><b>Extensões MCP com um clique</b>: instale pacotes <code>.mcpb</code> / <code>.dxt</code> como no Claude Desktop, ou pelos marketplaces de conectores.</li>
<li><b>Sunsam Mesh</b>: um roteador que envia cada pedido a um modelo local pequeno ou a modelos grandes em outras máquinas da sua rede.</li>
<li><b>Atualizações pelo GitHub</b> e interface em 7 idiomas.</li>
</ul>
<p>Instala-se ao lado do ZCode sem interferir (identidade <code>dev.sunsam.code</code>).</p>`,
      },
      {
        id: "install",
        title: "Instalação",
        html: `<p>Baixe o instalador da <a href="https://github.com/jhonsu01/SunsamCode/releases/latest">versão mais recente</a> ou na <a href="./#descargas">seção de downloads</a>.</p>
<table><tr><th>Sistema</th><th>Arquivo</th><th>Observações</th></tr>
<tr><td>Windows 10/11 (x64)</td><td><code>Sunsam-Code-&lt;versão&gt;-win-x64.exe</code></td><td>Assinado com um certificado próprio. Se aparecer o SmartScreen: <i>Mais informações → Executar assim mesmo</i>.</td></tr>
<tr><td>macOS 11+ (Apple silicon e Intel)</td><td><code>.dmg</code> ou <code>.zip</code></td><td>Depois de copiar para Aplicativos: <code>xattr -rd com.apple.quarantine "/Applications/Sunsam Code.app"</code></td></tr>
<tr><td>Linux (x64 / arm64)</td><td><code>.AppImage</code>, <code>.deb</code>, <code>.rpm</code>, <code>.pkg.tar.zst</code></td><td>AppImage: <code>chmod +x Sunsam*.AppImage && ./Sunsam*.AppImage</code></td></tr></table>`,
      },
      {
        id: "start",
        title: "Primeiros passos",
        html: `<ol>
<li><b>Abra uma pasta de projeto</b>: na tela inicial escolha a pasta onde o agente vai trabalhar.</li>
<li><b>Escolha um modelo</b> no seletor abaixo da caixa de texto (configure-o antes em <a href="#providers">Provedores</a>).</li>
<li><b>Escolha o nível de acesso</b>: o modo define o que o agente pode fazer sem perguntar (ler, editar arquivos, executar comandos). Comece pelo modo que pede confirmação.</li>
<li><b>Escreva a tarefa</b>. Use <code>@</code> para adicionar arquivos ou pastas como contexto e <code>/</code> para comandos e recursos.</li>
<li>Revise as mudanças propostas, aceite ou peça ajustes. Cada conversa fica na barra lateral.</li>
</ol>`,
      },
      {
        id: "providers",
        title: "Provedores e modelos",
        html: `<p>Vá em <b>Configurações → Configurações de modelo → Adicionar provedor</b>:</p>
<ul>
<li><b>Compatível com OpenAI</b>: URL base (por exemplo <code>http://localhost:1234/v1</code> para LM Studio ou <code>http://localhost:11434/v1</code> para Ollama), chave de API se necessário e os modelos desejados.</li>
<li><b>Compatível com Anthropic</b>: para APIs no formato de mensagens da Anthropic.</li>
<li><b>Z.ai (opcional)</b>: o provedor oficial com seu plano e consumo.</li>
</ul>
<p>Dica: com modelos locais prefira uma janela de contexto grande.</p>`,
      },
      {
        id: "extensions",
        title: "Extensões MCP",
        html: `<p>As extensões dão ao agente novas ferramentas (vídeo, fotos, PDF, documentos…) pelo <a href="https://modelcontextprotocol.io">Model Context Protocol</a>.</p>
<h4>Instalar um pacote .mcpb / .dxt</h4>
<ol><li>Abra <b>Configurações → Servidores MCP</b>.</li>
<li>Clique em <b>Instalar extensão (.mcpb / .dxt)</b> ou arraste os arquivos para a tela.</li>
<li>Se a extensão pedir dados, os caminhos são <b>detectados automaticamente</b>; <b>Procurar…</b> escolhe outro.</li>
<li>Clique em <b>Reiniciar agora</b> para o agente carregá-la.</li></ol>
<p>Enviar o mesmo pacote de novo o <b>atualiza</b> mantendo suas configurações.</p>
<h4>Marketplaces</h4>
<p>Em <b>Configurações → Servidores MCP → Marketplaces</b> está o <a href="https://github.com/jhonsu01/marketplace-SunsamCode">marketplace do Sunsam</a> com conectores prontos. Clique em <b>Instalar</b>; quando há versão nova aparece <b>Atualizar</b>.</p>`,
      },
      {
        id: "mesh",
        title: "Sunsam Mesh",
        html: `<p>O Sunsam Mesh é um gateway local (<code>http://127.0.0.1:4141</code>) que decide, pedido a pedido, se responde um modelo pequeno no seu computador ou um grande em outra máquina da rede.</p>
<pre>pnpm sunsam:mesh:init   # cria ~/.sunsam/mesh.json
pnpm sunsam:mesh        # inicia o gateway</pre>
<p>No app adicione um provedor compatível com OpenAI com a URL <code>http://127.0.0.1:4141</code> e escolha <code>sunsam-auto</code>, <code>sunsam-local</code> ou <code>sunsam-swarm</code>.</p>`,
      },
      {
        id: "features",
        title: "Novidades da versão 3.15",
        html: `<ul><li><b>UI Plugins</b>: plugins com interface própria dentro do app (por exemplo um fluxo com Excalidraw).</li>
<li><b>Controle remoto web</b>: acompanhe e dirija suas tarefas pelo navegador do celular.</li>
<li><b>Fluxos de trabalho dinâmicos</b> e subagentes em segundo plano.</li>
<li><b>Automações</b> agendadas.</li></ul>`,
      },
      {
        id: "settings",
        title: "Idioma, tema e atualizações",
        html: `<ul><li><b>Idioma</b>: Configurações → Geral.</li>
<li><b>Tema</b>: Configurações → Aparência.</li>
<li><b>Atualizações</b>: o app verifica as <a href="https://github.com/jhonsu01/SunsamCode/releases">versões do GitHub</a> ao iniciar e a cada hora, ou em <b>Ajuda → Verificar atualizações</b>.</li></ul>`,
      },
      {
        id: "help",
        title: "Ajuda, problemas e ideias",
        html: `<ul><li><b>Ajuda → Relatar um problema</b> abre um formulário de issue no GitHub com a versão e o sistema já preenchidos.</li>
<li><b>Ajuda → Solicitar um recurso</b> abre o formulário de propostas.</li>
<li><b>Ajuda → Exportar logs</b> salva os logs do dia para anexar ao issue.</li></ul>`,
      },
      {
        id: "faq",
        title: "Solução de problemas",
        html: `<dl><dt>O Windows bloqueia o instalador</dt><dd><i>Mais informações → Executar assim mesmo</i>.</dd>
<dt>O macOS diz que o app está danificado</dt><dd><code>xattr -rd com.apple.quarantine "/Applications/Sunsam Code.app"</code></dd>
<dt>Erro [1210] com modelos Z.ai / GLM</dt><dd>Os esquemas das ferramentas são adaptados automaticamente; se persistir, relate o problema indicando a extensão.</dd>
<dt>O modelo local não responde</dt><dd>Verifique se o servidor está rodando e se a URL base termina em <code>/v1</code>.</dd></dl>`,
      },
    ],
  },

  fr: {
    title: "Documentation",
    lead: "Tout ce qu'il faut pour installer, configurer et utiliser Sunsam Code, l'agent de programmation de bureau qui fonctionne avec vos propres modèles.",
    toc: "Sur cette page",
    back: "← Retour à l'accueil",
    sections: [
      {
        id: "intro",
        title: "Qu'est-ce que Sunsam Code ?",
        html: `<p>Sunsam Code est une application de bureau (Windows, macOS et Linux) avec un agent de programmation qui lit, écrit et exécute du code dans vos projets. C'est un fork open source de <a href="https://github.com/zai-org/ZCode">ZCode</a> (Apache-2.0) qui ajoute :</p>
<ul>
<li><b>Vos propres fournisseurs de modèles</b> : toute API compatible OpenAI ou Anthropic (LM Studio, Ollama, vLLM, OpenRouter…), le fournisseur officiel Z.ai restant optionnel.</li>
<li><b>Des extensions MCP en un clic</b> : paquets <code>.mcpb</code> / <code>.dxt</code> comme dans Claude Desktop, ou depuis les marketplaces de connecteurs.</li>
<li><b>Sunsam Mesh</b> : un routeur qui envoie chaque requête à un petit modèle local ou à de grands modèles sur d'autres machines de votre réseau.</li>
<li><b>Mises à jour depuis GitHub</b> et une interface en 7 langues.</li>
</ul>
<p>Il s'installe à côté de ZCode sans le gêner (identité <code>dev.sunsam.code</code>).</p>`,
      },
      {
        id: "install",
        title: "Installation",
        html: `<p>Téléchargez l'installateur depuis la <a href="https://github.com/jhonsu01/SunsamCode/releases/latest">dernière version</a> ou la <a href="./#descargas">section Téléchargements</a>.</p>
<table><tr><th>Système</th><th>Fichier</th><th>Remarques</th></tr>
<tr><td>Windows 10/11 (x64)</td><td><code>Sunsam-Code-&lt;version&gt;-win-x64.exe</code></td><td>Signé avec un certificat de l'auteur. Si SmartScreen apparaît : <i>Informations complémentaires → Exécuter quand même</i>.</td></tr>
<tr><td>macOS 11+ (Apple silicon et Intel)</td><td><code>.dmg</code> ou <code>.zip</code></td><td>Après la copie dans Applications : <code>xattr -rd com.apple.quarantine "/Applications/Sunsam Code.app"</code></td></tr>
<tr><td>Linux (x64 / arm64)</td><td><code>.AppImage</code>, <code>.deb</code>, <code>.rpm</code>, <code>.pkg.tar.zst</code></td><td>AppImage : <code>chmod +x Sunsam*.AppImage && ./Sunsam*.AppImage</code></td></tr></table>`,
      },
      {
        id: "start",
        title: "Premiers pas",
        html: `<ol>
<li><b>Ouvrez un dossier de projet</b> depuis l'écran d'accueil.</li>
<li><b>Choisissez un modèle</b> sous la zone de texte (configurez-le d'abord dans <a href="#providers">Fournisseurs</a>).</li>
<li><b>Choisissez le niveau d'accès</b> : le mode détermine ce que l'agent peut faire sans demander (lire, modifier des fichiers, exécuter des commandes). Commencez par le mode qui demande confirmation.</li>
<li><b>Décrivez la tâche</b>. <code>@</code> ajoute des fichiers ou des dossiers comme contexte, <code>/</code> ouvre les commandes et capacités.</li>
<li>Relisez les modifications proposées, acceptez-les ou demandez des ajustements.</li>
</ol>`,
      },
      {
        id: "providers",
        title: "Fournisseurs et modèles",
        html: `<p>Allez dans <b>Paramètres → Paramètres des modèles → Ajouter un fournisseur</b> :</p>
<ul>
<li><b>Compatible OpenAI</b> : URL de base (par exemple <code>http://localhost:1234/v1</code> pour LM Studio ou <code>http://localhost:11434/v1</code> pour Ollama), clé d'API si nécessaire et modèles voulus.</li>
<li><b>Compatible Anthropic</b> : pour les API au format de messages d'Anthropic.</li>
<li><b>Z.ai (optionnel)</b> : le fournisseur officiel avec son forfait et sa consommation.</li>
</ul>`,
      },
      {
        id: "extensions",
        title: "Extensions MCP",
        html: `<p>Les extensions donnent à l'agent de nouveaux outils (vidéo, photo, PDF, documents…) grâce au <a href="https://modelcontextprotocol.io">Model Context Protocol</a>.</p>
<h4>Installer un paquet .mcpb / .dxt</h4>
<ol><li>Ouvrez <b>Paramètres → Serveurs MCP</b>.</li>
<li>Cliquez sur <b>Installer une extension (.mcpb / .dxt)</b> ou glissez les fichiers sur l'écran.</li>
<li>Les chemins demandés sont <b>détectés automatiquement</b> ; <b>Parcourir…</b> permet d'en choisir un autre.</li>
<li>Cliquez sur <b>Redémarrer maintenant</b>.</li></ol>
<p>Renvoyer le même paquet le <b>met à jour</b> en gardant vos réglages.</p>
<h4>Marketplaces</h4>
<p><b>Paramètres → Serveurs MCP → Marketplaces</b> propose le <a href="https://github.com/jhonsu01/marketplace-SunsamCode">marketplace Sunsam</a> avec des connecteurs prêts à l'emploi.</p>`,
      },
      {
        id: "mesh",
        title: "Sunsam Mesh",
        html: `<p>Sunsam Mesh est une passerelle locale (<code>http://127.0.0.1:4141</code>) qui choisit, requête par requête, entre un petit modèle sur votre ordinateur et un grand modèle sur une autre machine du réseau.</p>
<pre>pnpm sunsam:mesh:init   # crée ~/.sunsam/mesh.json
pnpm sunsam:mesh        # démarre la passerelle</pre>
<p>Dans l'app, ajoutez un fournisseur compatible OpenAI avec l'URL <code>http://127.0.0.1:4141</code> et choisissez <code>sunsam-auto</code>, <code>sunsam-local</code> ou <code>sunsam-swarm</code>.</p>`,
      },
      {
        id: "features",
        title: "Nouveautés de la 3.15",
        html: `<ul><li><b>UI Plugins</b> : des plugins avec leur propre interface (par exemple un flux Excalidraw).</li>
<li><b>Contrôle à distance web</b> depuis le navigateur du téléphone.</li>
<li><b>Workflows dynamiques</b> et sous-agents en arrière-plan.</li>
<li><b>Automatisations</b> planifiées.</li></ul>`,
      },
      {
        id: "settings",
        title: "Langue, thème et mises à jour",
        html: `<ul><li><b>Langue</b> : Paramètres → Général.</li><li><b>Thème</b> : Paramètres → Apparence.</li>
<li><b>Mises à jour</b> : l'app consulte les <a href="https://github.com/jhonsu01/SunsamCode/releases">versions GitHub</a> au démarrage et toutes les heures, ou via <b>Aide → Rechercher des mises à jour</b>.</li></ul>`,
      },
      {
        id: "help",
        title: "Aide, problèmes et idées",
        html: `<ul><li><b>Aide → Signaler un problème</b> ouvre un formulaire d'issue GitHub avec la version et le système déjà remplis.</li>
<li><b>Aide → Demander une fonctionnalité</b> ouvre le formulaire de propositions.</li>
<li><b>Aide → Exporter les journaux</b> enregistre les journaux du jour à joindre à l'issue.</li></ul>`,
      },
      {
        id: "faq",
        title: "Dépannage",
        html: `<dl><dt>Windows bloque l'installateur</dt><dd><i>Informations complémentaires → Exécuter quand même</i>.</dd>
<dt>macOS indique que l'app est endommagée</dt><dd><code>xattr -rd com.apple.quarantine "/Applications/Sunsam Code.app"</code></dd>
<dt>Erreur [1210] avec Z.ai / GLM</dt><dd>Les schémas d'outils sont adaptés automatiquement ; si l'erreur persiste, signalez-la en nommant l'extension.</dd>
<dt>Le modèle local ne répond pas</dt><dd>Vérifiez que le serveur tourne et que l'URL de base se termine par <code>/v1</code>.</dd></dl>`,
      },
    ],
  },

  de: {
    title: "Dokumentation",
    lead: "Alles, um Sunsam Code zu installieren, einzurichten und zu nutzen – den Desktop-Coding-Agenten mit deinen eigenen Modellen. Die App gibt es auf Deutsch noch nicht; Menünamen stehen deshalb auf Englisch.",
    toc: "Auf dieser Seite",
    back: "← Zur Startseite",
    sections: [
      {
        id: "intro",
        title: "Was ist Sunsam Code?",
        html: `<p>Sunsam Code ist eine Desktop-App (Windows, macOS und Linux) mit einem Coding-Agenten, der in deinen Projekten Code liest, schreibt und ausführt. Es ist ein Open-Source-Fork von <a href="https://github.com/zai-org/ZCode">ZCode</a> (Apache-2.0) mit:</p>
<ul>
<li><b>Eigenen Modellanbietern</b>: jede OpenAI- oder Anthropic-kompatible API (LM Studio, Ollama, vLLM, OpenRouter…), der offizielle Z.ai-Anbieter ist optional.</li>
<li><b>MCP-Erweiterungen per Klick</b>: <code>.mcpb</code>/<code>.dxt</code>-Pakete wie in Claude Desktop oder aus Connector-Marketplaces.</li>
<li><b>Sunsam Mesh</b>: ein Router, der jede Anfrage an ein kleines lokales Modell oder an große Modelle auf anderen Rechnern im Netz schickt.</li>
<li><b>Updates über GitHub</b>.</li>
</ul>`,
      },
      {
        id: "install",
        title: "Installation",
        html: `<p>Lade das Installationsprogramm aus dem <a href="https://github.com/jhonsu01/SunsamCode/releases/latest">neuesten Release</a> herunter.</p>
<table><tr><th>System</th><th>Datei</th><th>Hinweise</th></tr>
<tr><td>Windows 10/11 (x64)</td><td><code>Sunsam-Code-&lt;Version&gt;-win-x64.exe</code></td><td>Mit eigenem Zertifikat signiert. Bei SmartScreen: <i>Weitere Informationen → Trotzdem ausführen</i>.</td></tr>
<tr><td>macOS 11+</td><td><code>.dmg</code> / <code>.zip</code></td><td><code>xattr -rd com.apple.quarantine "/Applications/Sunsam Code.app"</code></td></tr>
<tr><td>Linux (x64 / arm64)</td><td><code>.AppImage</code>, <code>.deb</code>, <code>.rpm</code>, <code>.pkg.tar.zst</code></td><td><code>chmod +x Sunsam*.AppImage</code></td></tr></table>`,
      },
      {
        id: "start",
        title: "Erste Schritte",
        html: `<ol><li><b>Öffne einen Projektordner</b> auf dem Startbildschirm.</li>
<li><b>Wähle ein Modell</b> unter dem Eingabefeld (vorher unter <a href="#providers">Anbieter</a> einrichten).</li>
<li><b>Wähle die Zugriffsstufe</b>: Der Modus legt fest, was der Agent ohne Rückfrage darf. Beginne mit dem Modus, der nachfragt.</li>
<li><b>Beschreibe die Aufgabe</b>. <code>@</code> fügt Dateien oder Ordner als Kontext hinzu, <code>/</code> öffnet Befehle.</li>
<li>Prüfe die vorgeschlagenen Änderungen und nimm sie an oder bitte um Anpassungen.</li></ol>`,
      },
      {
        id: "providers",
        title: "Anbieter und Modelle",
        html: `<p><b>Settings → Model settings → Add provider</b>:</p>
<ul><li><b>OpenAI-kompatibel</b>: Basis-URL (z. B. <code>http://localhost:1234/v1</code> für LM Studio oder <code>http://localhost:11434/v1</code> für Ollama), API-Schlüssel falls nötig und die Modelle.</li>
<li><b>Anthropic-kompatibel</b>: für APIs im Nachrichtenformat von Anthropic.</li>
<li><b>Z.ai (optional)</b>: der offizielle Anbieter mit Tarif und Verbrauch.</li></ul>`,
      },
      {
        id: "extensions",
        title: "MCP-Erweiterungen",
        html: `<ol><li><b>Settings → MCP Servers</b> öffnen.</li>
<li><b>Install extension (.mcpb / .dxt)</b> klicken oder Dateien in das Fenster ziehen.</li>
<li>Pfade werden <b>automatisch erkannt</b>; mit <b>Browse…</b> wählst du einen anderen.</li>
<li><b>Restart now</b> klicken.</li></ol>
<p>Dasselbe Paket erneut hochladen <b>aktualisiert</b> es und behält die Einstellungen. Unter <b>Settings → MCP Servers → Marketplaces</b> findest du den <a href="https://github.com/jhonsu01/marketplace-SunsamCode">Sunsam-Marketplace</a>.</p>`,
      },
      {
        id: "mesh",
        title: "Sunsam Mesh",
        html: `<p>Ein lokales Gateway (<code>http://127.0.0.1:4141</code>), das pro Anfrage zwischen einem kleinen lokalen und einem großen entfernten Modell entscheidet.</p>
<pre>pnpm sunsam:mesh:init
pnpm sunsam:mesh</pre>
<p>In der App einen OpenAI-kompatiblen Anbieter mit dieser URL hinzufügen und <code>sunsam-auto</code>, <code>sunsam-local</code> oder <code>sunsam-swarm</code> wählen.</p>`,
      },
      {
        id: "features",
        title: "Neu in 3.15",
        html: `<ul><li><b>UI Plugins</b> mit eigener Oberfläche (z. B. ein Excalidraw-Workflow).</li><li><b>Web-Fernsteuerung</b> über den Browser des Handys.</li><li><b>Dynamische Workflows</b> und Hintergrund-Subagenten.</li><li>Geplante <b>Automatisierungen</b>.</li></ul>`,
      },
      {
        id: "settings",
        title: "Sprache, Design und Updates",
        html: `<ul><li><b>Sprache</b>: Settings → General.</li><li><b>Design</b>: Settings → Appearance.</li><li><b>Updates</b>: beim Start, stündlich oder über <b>Help → Check for updates</b>.</li></ul>`,
      },
      {
        id: "help",
        title: "Hilfe, Probleme und Ideen",
        html: `<ul><li><b>Help → Report an issue</b> öffnet ein GitHub-Issue-Formular mit vorausgefüllter Version und System.</li><li><b>Help → Request a feature</b> öffnet das Vorschlagsformular.</li><li><b>Help → Export logs</b> speichert die Protokolle des Tages.</li></ul>`,
      },
      {
        id: "faq",
        title: "Fehlerbehebung",
        html: `<dl><dt>Windows blockiert das Installationsprogramm</dt><dd><i>Weitere Informationen → Trotzdem ausführen</i>.</dd><dt>macOS meldet eine beschädigte App</dt><dd><code>xattr -rd com.apple.quarantine "/Applications/Sunsam Code.app"</code></dd><dt>Lokales Modell antwortet nicht</dt><dd>Läuft der Server und endet die Basis-URL auf <code>/v1</code>?</dd></dl>`,
      },
    ],
  },

  it: {
    title: "Documentazione",
    lead: "Tutto il necessario per installare, configurare e usare Sunsam Code, l'agente di programmazione desktop con i tuoi modelli. L'app non è ancora in italiano: i nomi dei menu sono in inglese.",
    toc: "In questa pagina",
    back: "← Torna alla home",
    sections: [
      {
        id: "intro",
        title: "Cos'è Sunsam Code?",
        html: `<p>Sunsam Code è un'app desktop (Windows, macOS e Linux) con un agente che legge, scrive ed esegue codice nei tuoi progetti. È un fork open source di <a href="https://github.com/zai-org/ZCode">ZCode</a> (Apache-2.0) che aggiunge:</p>
<ul><li><b>I tuoi fornitori di modelli</b>: qualsiasi API compatibile con OpenAI o Anthropic (LM Studio, Ollama, vLLM, OpenRouter…), con Z.ai come opzione.</li>
<li><b>Estensioni MCP con un clic</b>: pacchetti <code>.mcpb</code>/<code>.dxt</code> come in Claude Desktop o dai marketplace di connettori.</li>
<li><b>Sunsam Mesh</b>: un router che invia ogni richiesta a un modello locale piccolo o a modelli grandi su altre macchine della rete.</li>
<li><b>Aggiornamenti da GitHub</b>.</li></ul>`,
      },
      {
        id: "install",
        title: "Installazione",
        html: `<p>Scarica l'installer dall'<a href="https://github.com/jhonsu01/SunsamCode/releases/latest">ultima versione</a>.</p>
<table><tr><th>Sistema</th><th>File</th><th>Note</th></tr>
<tr><td>Windows 10/11 (x64)</td><td><code>Sunsam-Code-&lt;versione&gt;-win-x64.exe</code></td><td>Firmato con un certificato dell'autore. Con SmartScreen: <i>Ulteriori informazioni → Esegui comunque</i>.</td></tr>
<tr><td>macOS 11+</td><td><code>.dmg</code> / <code>.zip</code></td><td><code>xattr -rd com.apple.quarantine "/Applications/Sunsam Code.app"</code></td></tr>
<tr><td>Linux (x64 / arm64)</td><td><code>.AppImage</code>, <code>.deb</code>, <code>.rpm</code>, <code>.pkg.tar.zst</code></td><td><code>chmod +x Sunsam*.AppImage</code></td></tr></table>`,
      },
      {
        id: "start",
        title: "Primi passi",
        html: `<ol><li><b>Apri una cartella di progetto</b> dalla schermata iniziale.</li><li><b>Scegli un modello</b> sotto la casella di testo (configuralo prima in <a href="#providers">Fornitori</a>).</li><li><b>Scegli il livello di accesso</b>: inizia con la modalità che chiede conferma.</li><li><b>Scrivi l'attività</b>: <code>@</code> aggiunge file o cartelle, <code>/</code> apre i comandi.</li><li>Rivedi le modifiche proposte e accettale o chiedi correzioni.</li></ol>`,
      },
      {
        id: "providers",
        title: "Fornitori e modelli",
        html: `<p><b>Settings → Model settings → Add provider</b>:</p><ul><li><b>Compatibile OpenAI</b>: URL di base (ad es. <code>http://localhost:1234/v1</code> per LM Studio o <code>http://localhost:11434/v1</code> per Ollama), chiave API se serve e modelli.</li><li><b>Compatibile Anthropic</b>.</li><li><b>Z.ai (facoltativo)</b>.</li></ul>`,
      },
      {
        id: "extensions",
        title: "Estensioni MCP",
        html: `<ol><li>Apri <b>Settings → MCP Servers</b>.</li><li>Fai clic su <b>Install extension (.mcpb / .dxt)</b> o trascina i file.</li><li>I percorsi sono <b>rilevati automaticamente</b>; <b>Browse…</b> ne sceglie un altro.</li><li>Fai clic su <b>Restart now</b>.</li></ol><p>Ricaricare lo stesso pacchetto lo <b>aggiorna</b>. In <b>Settings → MCP Servers → Marketplaces</b> trovi il <a href="https://github.com/jhonsu01/marketplace-SunsamCode">marketplace Sunsam</a>.</p>`,
      },
      {
        id: "mesh",
        title: "Sunsam Mesh",
        html: `<p>Un gateway locale (<code>http://127.0.0.1:4141</code>) che sceglie per ogni richiesta tra un modello locale piccolo e uno grande in rete.</p><pre>pnpm sunsam:mesh:init
pnpm sunsam:mesh</pre><p>Aggiungi un fornitore compatibile OpenAI con quell'URL e scegli <code>sunsam-auto</code>, <code>sunsam-local</code> o <code>sunsam-swarm</code>.</p>`,
      },
      {
        id: "features",
        title: "Novità della 3.15",
        html: `<ul><li><b>UI Plugins</b> con interfaccia propria (ad es. un flusso Excalidraw).</li><li><b>Controllo remoto web</b> dal browser del telefono.</li><li><b>Workflow dinamici</b> e subagenti in background.</li><li><b>Automazioni</b> pianificate.</li></ul>`,
      },
      {
        id: "settings",
        title: "Lingua, tema e aggiornamenti",
        html: `<ul><li><b>Lingua</b>: Settings → General.</li><li><b>Tema</b>: Settings → Appearance.</li><li><b>Aggiornamenti</b>: all'avvio, ogni ora o con <b>Help → Check for updates</b>.</li></ul>`,
      },
      {
        id: "help",
        title: "Aiuto, problemi e idee",
        html: `<ul><li><b>Help → Report an issue</b> apre un modulo di issue su GitHub con versione e sistema già compilati.</li><li><b>Help → Request a feature</b> apre il modulo delle proposte.</li><li><b>Help → Export logs</b> salva i log del giorno.</li></ul>`,
      },
      {
        id: "faq",
        title: "Risoluzione dei problemi",
        html: `<dl><dt>Windows blocca l'installer</dt><dd><i>Ulteriori informazioni → Esegui comunque</i>.</dd><dt>macOS dice che l'app è danneggiata</dt><dd><code>xattr -rd com.apple.quarantine "/Applications/Sunsam Code.app"</code></dd><dt>Il modello locale non risponde</dt><dd>Controlla che il server sia attivo e che l'URL termini con <code>/v1</code>.</dd></dl>`,
      },
    ],
  },

  zh: {
    title: "文档",
    lead: "安装、配置和使用 Sunsam Code 所需的一切。Sunsam Code 是一款使用你自己模型的桌面编程智能体。",
    toc: "本页内容",
    back: "← 返回首页",
    sections: [
      {
        id: "intro",
        title: "什么是 Sunsam Code？",
        html: `<p>Sunsam Code 是一款桌面应用（Windows、macOS、Linux），其编程智能体可以在你的项目中读取、编写和运行代码。它是 <a href="https://github.com/zai-org/ZCode">ZCode</a>（Apache-2.0）的开源分支，并增加了：</p>
<ul><li><b>自有模型供应商</b>：任何兼容 OpenAI 或 Anthropic 的 API（LM Studio、Ollama、vLLM、OpenRouter…），Z.ai 官方供应商可选。</li>
<li><b>一键安装 MCP 扩展</b>：像 Claude Desktop 一样安装 <code>.mcpb</code> / <code>.dxt</code> 包，或从连接器市场安装。</li>
<li><b>Sunsam Mesh</b>：把每个请求分配给本地小模型或局域网中其他机器上的大模型的路由器。</li>
<li><b>通过 GitHub 更新</b>，界面支持 7 种语言。</li></ul>`,
      },
      {
        id: "install",
        title: "安装",
        html: `<p>从<a href="https://github.com/jhonsu01/SunsamCode/releases/latest">最新版本</a>下载安装包。</p>
<table><tr><th>系统</th><th>文件</th><th>说明</th></tr>
<tr><td>Windows 10/11 (x64)</td><td><code>Sunsam-Code-&lt;版本&gt;-win-x64.exe</code></td><td>使用作者自有证书签名。出现 SmartScreen 时：<i>更多信息 → 仍要运行</i>。</td></tr>
<tr><td>macOS 11+</td><td><code>.dmg</code> / <code>.zip</code></td><td><code>xattr -rd com.apple.quarantine "/Applications/Sunsam Code.app"</code></td></tr>
<tr><td>Linux (x64 / arm64)</td><td><code>.AppImage</code>、<code>.deb</code>、<code>.rpm</code>、<code>.pkg.tar.zst</code></td><td><code>chmod +x Sunsam*.AppImage</code></td></tr></table>`,
      },
      {
        id: "start",
        title: "快速开始",
        html: `<ol><li>在首页<b>打开项目文件夹</b>。</li><li>在输入框下方<b>选择模型</b>（先在<a href="#providers">供应商</a>中配置）。</li><li><b>选择访问级别</b>：建议从需要确认的模式开始。</li><li><b>输入任务</b>：<code>@</code> 添加文件或文件夹作为上下文，<code>/</code> 打开命令与能力。</li><li>检查建议的修改，接受或要求调整。</li></ol>`,
      },
      {
        id: "providers",
        title: "供应商与模型",
        html: `<p>打开 <b>设置 → 模型设置 → 添加供应商</b>：</p><ul><li><b>OpenAI 兼容</b>：Base URL（例如 LM Studio 的 <code>http://localhost:1234/v1</code> 或 Ollama 的 <code>http://localhost:11434/v1</code>）、需要时填写 API Key，以及要使用的模型。</li><li><b>Anthropic 兼容</b>。</li><li><b>Z.ai（可选）</b>：官方供应商及其套餐与用量。</li></ul>`,
      },
      {
        id: "extensions",
        title: "MCP 扩展",
        html: `<ol><li>打开 <b>设置 → MCP 服务器</b>。</li><li>点击 <b>安装扩展（.mcpb / .dxt）</b> 或把文件拖到窗口中。</li><li>路径会<b>自动检测</b>；点击 <b>浏览…</b> 可手动选择。</li><li>点击 <b>立即重启</b>。</li></ol><p>再次上传同一个包会<b>更新</b>它并保留设置。在 <b>设置 → MCP 服务器 → 插件市场</b> 中可找到 <a href="https://github.com/jhonsu01/marketplace-SunsamCode">Sunsam 市场</a>。</p>`,
      },
      {
        id: "mesh",
        title: "Sunsam Mesh",
        html: `<p>本地网关（<code>http://127.0.0.1:4141</code>），按请求决定由本机小模型还是网络中的大模型回答。</p><pre>pnpm sunsam:mesh:init
pnpm sunsam:mesh</pre><p>在应用中添加 OpenAI 兼容供应商并选择 <code>sunsam-auto</code>、<code>sunsam-local</code> 或 <code>sunsam-swarm</code>。</p>`,
      },
      {
        id: "features",
        title: "3.15 新功能",
        html: `<ul><li><b>UI Plugins</b>：在应用内拥有自己界面的插件（例如 Excalidraw 工作流）。</li><li><b>Web 远程控制</b>：在手机浏览器中跟进和操控任务。</li><li><b>动态工作流</b>与后台子智能体。</li><li>定时<b>自动化</b>。</li></ul>`,
      },
      {
        id: "settings",
        title: "语言、主题与更新",
        html: `<ul><li><b>语言</b>：设置 → 常规。</li><li><b>主题</b>：设置 → 外观。</li><li><b>更新</b>：启动时及每小时检查 <a href="https://github.com/jhonsu01/SunsamCode/releases">GitHub 版本</a>，或通过 <b>帮助 → 检查更新</b>。</li></ul>`,
      },
      {
        id: "help",
        title: "帮助、问题与建议",
        html: `<ul><li><b>帮助 → 问题上报</b> 会打开 GitHub issue 表单，已预填版本和系统。</li><li><b>帮助 → 给产品提需求</b> 打开需求表单。</li><li><b>帮助 → 导出日志</b> 保存当天日志以附在 issue 中。</li></ul>`,
      },
      {
        id: "faq",
        title: "故障排查",
        html: `<dl><dt>Windows 阻止安装</dt><dd><i>更多信息 → 仍要运行</i>。</dd><dt>macOS 提示应用已损坏</dt><dd><code>xattr -rd com.apple.quarantine "/Applications/Sunsam Code.app"</code></dd><dt>Z.ai / GLM 报错 [1210]</dt><dd>工具 schema 会自动适配；若仍出现，请上报并注明扩展名称。</dd><dt>本地模型无响应</dt><dd>确认服务已启动，且 Base URL 以 <code>/v1</code> 结尾。</dd></dl>`,
      },
    ],
  },

  ja: {
    title: "ドキュメント",
    lead: "自分のモデルで動くデスクトップのコーディングエージェント Sunsam Code のインストール、設定、使い方。アプリはまだ日本語に対応していないため、メニュー名は英語で記載しています。",
    toc: "このページの内容",
    back: "← ホームに戻る",
    sections: [
      {
        id: "intro",
        title: "Sunsam Code とは",
        html: `<p>Sunsam Code は Windows・macOS・Linux 向けのデスクトップアプリで、エージェントがプロジェクトのコードを読み書きし、実行します。<a href="https://github.com/zai-org/ZCode">ZCode</a>（Apache-2.0）のオープンソースのフォークで、次の機能を追加しています：</p>
<ul><li><b>自分のモデルプロバイダー</b>：OpenAI / Anthropic 互換の任意の API（LM Studio、Ollama、vLLM、OpenRouter…）。Z.ai 公式プロバイダーは任意。</li>
<li><b>ワンクリックの MCP 拡張機能</b>：Claude Desktop と同じ <code>.mcpb</code> / <code>.dxt</code> パッケージ、またはコネクターのマーケットプレイスから。</li>
<li><b>Sunsam Mesh</b>：各リクエストをローカルの小さなモデルか、ネットワーク上の別マシンの大きなモデルに振り分けるルーター。</li>
<li><b>GitHub からの自動更新</b>。</li></ul>`,
      },
      {
        id: "install",
        title: "インストール",
        html: `<p><a href="https://github.com/jhonsu01/SunsamCode/releases/latest">最新リリース</a>からダウンロードします。</p>
<table><tr><th>OS</th><th>ファイル</th><th>注意</th></tr>
<tr><td>Windows 10/11 (x64)</td><td><code>Sunsam-Code-&lt;バージョン&gt;-win-x64.exe</code></td><td>作者の証明書で署名。SmartScreen が出たら <i>詳細情報 → 実行</i>。</td></tr>
<tr><td>macOS 11+</td><td><code>.dmg</code> / <code>.zip</code></td><td><code>xattr -rd com.apple.quarantine "/Applications/Sunsam Code.app"</code></td></tr>
<tr><td>Linux (x64 / arm64)</td><td><code>.AppImage</code>、<code>.deb</code>、<code>.rpm</code>、<code>.pkg.tar.zst</code></td><td><code>chmod +x Sunsam*.AppImage</code></td></tr></table>`,
      },
      {
        id: "start",
        title: "はじめに",
        html: `<ol><li>ホーム画面で<b>プロジェクトフォルダーを開きます</b>。</li><li>入力欄の下で<b>モデルを選びます</b>（先に<a href="#providers">プロバイダー</a>を設定）。</li><li><b>アクセスレベルを選びます</b>。まずは確認を求めるモードがおすすめです。</li><li><b>タスクを入力します</b>。<code>@</code> でファイルやフォルダーを追加、<code>/</code> でコマンド。</li><li>提案された変更を確認し、承認するか修正を依頼します。</li></ol>`,
      },
      {
        id: "providers",
        title: "プロバイダーとモデル",
        html: `<p><b>Settings → Model settings → Add provider</b>：</p><ul><li><b>OpenAI 互換</b>：ベース URL（LM Studio は <code>http://localhost:1234/v1</code>、Ollama は <code>http://localhost:11434/v1</code>）、必要なら API キー、使うモデル。</li><li><b>Anthropic 互換</b>。</li><li><b>Z.ai（任意）</b>。</li></ul>`,
      },
      {
        id: "extensions",
        title: "MCP 拡張機能",
        html: `<ol><li><b>Settings → MCP Servers</b> を開きます。</li><li><b>Install extension (.mcpb / .dxt)</b> をクリックするか、ファイルをドラッグします。</li><li>パスは<b>自動検出</b>され、<b>Browse…</b> で変更できます。</li><li><b>Restart now</b> をクリックします。</li></ol><p>同じパッケージを再度アップロードすると設定を保ったまま<b>更新</b>されます。<b>Settings → MCP Servers → Marketplaces</b> に <a href="https://github.com/jhonsu01/marketplace-SunsamCode">Sunsam マーケットプレイス</a>があります。</p>`,
      },
      {
        id: "mesh",
        title: "Sunsam Mesh",
        html: `<p>ローカルゲートウェイ（<code>http://127.0.0.1:4141</code>）が、リクエストごとに手元の小さなモデルとネットワーク上の大きなモデルを選びます。</p><pre>pnpm sunsam:mesh:init
pnpm sunsam:mesh</pre><p>アプリで OpenAI 互換プロバイダーとして追加し、<code>sunsam-auto</code>・<code>sunsam-local</code>・<code>sunsam-swarm</code> を選びます。</p>`,
      },
      {
        id: "features",
        title: "3.15 の新機能",
        html: `<ul><li>独自 UI を持つ <b>UI Plugins</b>（例：Excalidraw のワークフロー）。</li><li>スマートフォンのブラウザからの <b>Web リモートコントロール</b>。</li><li><b>動的ワークフロー</b>とバックグラウンドのサブエージェント。</li><li>スケジュールされた<b>オートメーション</b>。</li></ul>`,
      },
      {
        id: "settings",
        title: "言語・テーマ・更新",
        html: `<ul><li><b>言語</b>：Settings → General。</li><li><b>テーマ</b>：Settings → Appearance。</li><li><b>更新</b>：起動時と 1 時間ごと、または <b>Help → Check for updates</b>。</li></ul>`,
      },
      {
        id: "help",
        title: "ヘルプ・問題・要望",
        html: `<ul><li><b>Help → Report an issue</b> でバージョンと OS が入力済みの GitHub issue フォームが開きます。</li><li><b>Help → Request a feature</b> で要望フォームが開きます。</li><li><b>Help → Export logs</b> で当日のログを保存できます。</li></ul>`,
      },
      {
        id: "faq",
        title: "トラブルシューティング",
        html: `<dl><dt>Windows がインストーラーをブロックする</dt><dd><i>詳細情報 → 実行</i>。</dd><dt>macOS で「壊れている」と表示される</dt><dd><code>xattr -rd com.apple.quarantine "/Applications/Sunsam Code.app"</code></dd><dt>ローカルモデルが応答しない</dt><dd>サーバーが起動していて、ベース URL が <code>/v1</code> で終わるか確認します。</dd></dl>`,
      },
    ],
  },

  ko: {
    title: "문서",
    lead: "내 모델로 동작하는 데스크톱 코딩 에이전트 Sunsam Code를 설치하고 설정하고 사용하는 데 필요한 모든 것.",
    toc: "이 페이지의 내용",
    back: "← 홈으로",
    sections: [
      {
        id: "intro",
        title: "Sunsam Code란?",
        html: `<p>Sunsam Code는 Windows, macOS, Linux용 데스크톱 앱으로, 에이전트가 프로젝트의 코드를 읽고 쓰고 실행합니다. <a href="https://github.com/zai-org/ZCode">ZCode</a>(Apache-2.0)의 오픈 소스 포크로 다음을 추가합니다:</p>
<ul><li><b>나만의 모델 공급자</b>: OpenAI 또는 Anthropic 호환 API(LM Studio, Ollama, vLLM, OpenRouter…), Z.ai 공식 공급자는 선택 사항.</li>
<li><b>클릭 한 번으로 MCP 확장 설치</b>: Claude Desktop처럼 <code>.mcpb</code> / <code>.dxt</code> 패키지를 설치하거나 커넥터 마켓플레이스에서 설치.</li>
<li><b>Sunsam Mesh</b>: 요청마다 로컬의 작은 모델 또는 네트워크의 다른 컴퓨터에 있는 큰 모델로 보내는 라우터.</li>
<li><b>GitHub를 통한 업데이트</b>와 7개 언어 인터페이스.</li></ul>`,
      },
      {
        id: "install",
        title: "설치",
        html: `<p><a href="https://github.com/jhonsu01/SunsamCode/releases/latest">최신 릴리스</a>에서 설치 파일을 내려받으세요.</p>
<table><tr><th>시스템</th><th>파일</th><th>참고</th></tr>
<tr><td>Windows 10/11 (x64)</td><td><code>Sunsam-Code-&lt;버전&gt;-win-x64.exe</code></td><td>작성자 인증서로 서명됨. SmartScreen이 나타나면 <i>추가 정보 → 실행</i>.</td></tr>
<tr><td>macOS 11+</td><td><code>.dmg</code> / <code>.zip</code></td><td><code>xattr -rd com.apple.quarantine "/Applications/Sunsam Code.app"</code></td></tr>
<tr><td>Linux (x64 / arm64)</td><td><code>.AppImage</code>, <code>.deb</code>, <code>.rpm</code>, <code>.pkg.tar.zst</code></td><td><code>chmod +x Sunsam*.AppImage</code></td></tr></table>`,
      },
      {
        id: "start",
        title: "시작하기",
        html: `<ol><li>홈 화면에서 <b>프로젝트 폴더를 엽니다</b>.</li><li>입력란 아래에서 <b>모델을 선택합니다</b>(먼저 <a href="#providers">공급자</a>에서 설정).</li><li><b>접근 수준을 고릅니다</b>. 확인을 요청하는 모드부터 시작하세요.</li><li><b>작업을 입력합니다</b>. <code>@</code>로 파일이나 폴더를 추가하고 <code>/</code>로 명령을 엽니다.</li><li>제안된 변경을 검토하고 수락하거나 수정을 요청합니다.</li></ol>`,
      },
      {
        id: "providers",
        title: "공급자와 모델",
        html: `<p><b>설정 → 모델 설정 → 공급자 추가</b>:</p><ul><li><b>OpenAI 호환</b>: 기본 URL(LM Studio는 <code>http://localhost:1234/v1</code>, Ollama는 <code>http://localhost:11434/v1</code>), 필요하면 API 키, 사용할 모델.</li><li><b>Anthropic 호환</b>.</li><li><b>Z.ai(선택)</b>.</li></ul>`,
      },
      {
        id: "extensions",
        title: "MCP 확장",
        html: `<ol><li><b>설정 → MCP 서버</b>를 엽니다.</li><li><b>확장 설치 (.mcpb / .dxt)</b>를 누르거나 파일을 끌어다 놓습니다.</li><li>경로는 <b>자동으로 감지</b>되며 <b>찾아보기…</b>로 바꿀 수 있습니다.</li><li><b>지금 다시 시작</b>을 누릅니다.</li></ol><p>같은 패키지를 다시 올리면 설정을 유지한 채 <b>업데이트</b>됩니다. <b>설정 → MCP 서버 → 마켓플레이스</b>에 <a href="https://github.com/jhonsu01/marketplace-SunsamCode">Sunsam 마켓플레이스</a>가 있습니다.</p>`,
      },
      {
        id: "mesh",
        title: "Sunsam Mesh",
        html: `<p>로컬 게이트웨이(<code>http://127.0.0.1:4141</code>)가 요청마다 내 컴퓨터의 작은 모델과 네트워크의 큰 모델 중 하나를 고릅니다.</p><pre>pnpm sunsam:mesh:init
pnpm sunsam:mesh</pre><p>앱에서 OpenAI 호환 공급자로 추가하고 <code>sunsam-auto</code>, <code>sunsam-local</code>, <code>sunsam-swarm</code> 중에서 고르세요.</p>`,
      },
      {
        id: "features",
        title: "3.15의 새 기능",
        html: `<ul><li>자체 UI를 가진 <b>UI Plugins</b>(예: Excalidraw 워크플로).</li><li>휴대폰 브라우저에서 쓰는 <b>웹 원격 제어</b>.</li><li><b>동적 워크플로</b>와 백그라운드 하위 에이전트.</li><li>예약 <b>자동화</b>.</li></ul>`,
      },
      {
        id: "settings",
        title: "언어, 테마, 업데이트",
        html: `<ul><li><b>언어</b>: 설정 → 일반.</li><li><b>테마</b>: 설정 → 모양.</li><li><b>업데이트</b>: 시작할 때와 매시간 <a href="https://github.com/jhonsu01/SunsamCode/releases">GitHub 릴리스</a>를 확인하며, <b>도움말 → 업데이트 확인</b>으로도 확인합니다.</li></ul>`,
      },
      {
        id: "help",
        title: "도움말, 문제, 제안",
        html: `<ul><li><b>도움말 → 문제 신고</b>는 버전과 시스템이 미리 입력된 GitHub issue 양식을 엽니다.</li><li><b>도움말 → 기능 요청</b>은 제안 양식을 엽니다.</li><li><b>도움말 → 로그 내보내기</b>로 오늘의 로그를 저장합니다.</li></ul>`,
      },
      {
        id: "faq",
        title: "문제 해결",
        html: `<dl><dt>Windows가 설치 파일을 차단함</dt><dd><i>추가 정보 → 실행</i>.</dd><dt>macOS에서 앱이 손상되었다고 표시됨</dt><dd><code>xattr -rd com.apple.quarantine "/Applications/Sunsam Code.app"</code></dd><dt>Z.ai / GLM에서 [1210] 오류</dt><dd>도구 스키마가 자동으로 조정됩니다. 계속되면 확장 이름과 함께 신고하세요.</dd><dt>로컬 모델이 응답하지 않음</dt><dd>서버가 실행 중이고 기본 URL이 <code>/v1</code>로 끝나는지 확인하세요.</dd></dl>`,
      },
    ],
  },
});

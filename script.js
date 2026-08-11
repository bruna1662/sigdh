// ==========================================
// JARVIS WEB 1.0
// ==========================================


// ELEMENTOS
const micButton = document.getElementById("micButton");
const assistantStatus = document.getElementById("assistantStatus");
const voiceStatus = document.getElementById("voiceStatus");
const chat = document.getElementById("chat");
const textInput = document.getElementById("textInput");
const sendButton = document.getElementById("sendButton");
const consoleStatus = document.getElementById("consoleStatus");


// ==========================================
// RELÓGIO
// ==========================================

function updateClock() {

    const now = new Date();

    const time = now.toLocaleTimeString("pt-BR");

    document.getElementById("clock").textContent = time;
}

setInterval(updateClock, 1000);

updateClock();


// ==========================================
// VOZ DO JARVIS
// ==========================================

function speak(text) {

    if (!("speechSynthesis" in window)) {
        console.log("Speech Synthesis não disponível.");
        return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "pt-BR";
    speech.rate = 0.95;
    speech.pitch = 0.9;
    speech.volume = 1;

    window.speechSynthesis.speak(speech);
}


// ==========================================
// CHAT
// ==========================================

function addMessage(sender, text) {

    const message = document.createElement("div");

    message.className =
        sender === "JARVIS"
            ? "message jarvis"
            : "message user";

    message.innerHTML = `
        <span class="message-label">${sender}</span>
        <p>${text}</p>
    `;

    chat.appendChild(message);

    chat.scrollTop = chat.scrollHeight;
}


// ==========================================
// RESPOSTAS
// ==========================================

function respond(text) {

    const command = text.toLowerCase().trim();

    addMessage("VOCÊ", text);

    assistantStatus.textContent = "PROCESSANDO...";
    consoleStatus.textContent = "PROCESSING";

    let response = "";


    // SAUDAÇÕES

    if (
        command.includes("olá") ||
        command.includes("ola") ||
        command.includes("oi")
    ) {

        response = "Olá. É um prazer falar com você. Estou pronto.";

    }


    // QUEM É VOCÊ

    else if (
        command.includes("quem é você") ||
        command.includes("quem e voce") ||
        command.includes("quem é o jarvis") ||
        command.includes("quem e o jarvis")
    ) {

        response =
            "Eu sou JARVIS, seu assistente virtual. Esta é minha primeira versão web.";


    }


    // HORA

    else if (
        command.includes("que horas") ||
        command.includes("horas são") ||
        command.includes("horas sao")
    ) {

        const now = new Date();

        response =
            `Agora são ${now.toLocaleTimeString("pt-BR")}.`;


    }


    // DATA

    else if (
        command.includes("que dia") ||
        command.includes("data de hoje")
    ) {

        const now = new Date();

        response =
            `Hoje é ${now.toLocaleDateString("pt-BR")}.`;


    }


    // YOUTUBE

    else if (
        command.includes("abrir youtube") ||
        command.includes("youtube")
    ) {

        response = "Abrindo o YouTube.";

        window.open("https://www.youtube.com", "_blank");


    }


    // GOOGLE

    else if (
        command.includes("abrir google") ||
        command === "google"
    ) {

        response = "Abrindo o Google.";

        window.open("https://www.google.com", "_blank");


    }


    // GITHUB

    else if (command.includes("abrir github")) {

        response = "Abrindo o GitHub.";

        window.open("https://github.com", "_blank");


    }


    // PESQUISA

    else if (
        command.startsWith("pesquisar ") ||
        command.startsWith("pesquise ")
    ) {

        let search = command
            .replace("pesquisar ", "")
            .replace("pesquise ", "")
            .trim();

        response = `Pesquisando por ${search}.`;

        window.open(
            "https://www.google.com/search?q=" +
            encodeURIComponent(search),
            "_blank"
        );


    }


    // LIMPAR CONVERSA

    else if (
        command.includes("limpar conversa") ||
        command.includes("limpar chat")
    ) {

        chat.innerHTML = "";

        response = "Conversa limpa.";


    }


    // DESPEDIDA

    else if (
        command.includes("tchau") ||
        command.includes("até mais") ||
        command.includes("ate mais")
    ) {

        response = "Até mais. Permanecerei aguardando.";


    }


    // COMANDO DESCONHECIDO

    else {

        response =
            `Entendi o comando "${text}", mas ainda não possuo essa função. Podemos adicioná-la em uma próxima versão.`;
    }


    setTimeout(() => {

        addMessage("JARVIS", response);

        assistantStatus.textContent = "AGUARDANDO COMANDO";
        consoleStatus.textContent = "SYSTEM READY";

        speak(response);

    }, 500);
}


// ==========================================
// RECONHECIMENTO DE VOZ
// ==========================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


let recognition = null;


if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "pt-BR";

    recognition.continuous = false;

    recognition.interimResults = false;


    recognition.onstart = function () {

        micButton.classList.add("listening");

        assistantStatus.textContent = "OUVINDO...";
        voiceStatus.textContent = "ESCUTANDO";

        consoleStatus.textContent = "LISTENING";

    };


    recognition.onresult = function (event) {

        const transcript =
            event.results[0][0].transcript;

        textInput.value = transcript;

        respond(transcript);

    };


    recognition.onerror = function (event) {

        console.error(event.error);

        assistantStatus.textContent =
            "ERRO NO RECONHECIMENTO";

        voiceStatus.textContent = "ERRO";

        speak(
            "Desculpe. Não consegui entender o comando."
        );

    };


    recognition.onend = function () {

        micButton.classList.remove("listening");

        voiceStatus.textContent = "AGUARDANDO";

        if (
            assistantStatus.textContent === "OUVINDO..."
        ) {
            assistantStatus.textContent =
                "AGUARDANDO COMANDO";
        }

    };

} else {

    micButton.disabled = true;

    voiceStatus.textContent = "NÃO SUPORTADO";

    assistantStatus.textContent =
        "NAVEGADOR NÃO COMPATÍVEL";

}


// ==========================================
// BOTÃO MICROFONE
// ==========================================

micButton.addEventListener("click", function () {

    if (!recognition) {

        alert(
            "Seu navegador não suporta reconhecimento de voz. Use o Google Chrome."
        );

        return;
    }

    try {

        recognition.start();

    } catch (error) {

        console.log(error);

    }

});


// ==========================================
// BOTÃO ENVIAR
// ==========================================

sendButton.addEventListener("click", function () {

    const text = textInput.value.trim();

    if (text === "") {
        return;
    }

    textInput.value = "";

    respond(text);

});


// ==========================================
// ENTER PARA ENVIAR
// ==========================================

textInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        sendButton.click();

    }

});


// ==========================================
// DIAGNÓSTICO SIMULADO
// ==========================================

function updateDiagnostics() {

    const cpu =
        Math.floor(Math.random() * 35) + 30;

    const memory =
        Math.floor(Math.random() * 30) + 45;


    document.getElementById("cpuValue").textContent =
        cpu + "%";

    document.getElementById("cpuBar").style.width =
        cpu + "%";


    document.getElementById("memoryValue").textContent =
        memory + "%";

    document.getElementById("memoryBar").style.width =
        memory + "%";

}

setInterval(updateDiagnostics, 2500);


// ==========================================
// INICIALIZAÇÃO
// ==========================================

console.log(
    "J.A.R.V.I.S. WEB 1.0 iniciado."
);
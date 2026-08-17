/* =========================================================
   SIGDH 3.0
   Sistema de Análise de SAC
   JavaScript
========================================================= */

"use strict";

/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const CONFIG = {
    colunasAnalise: [
        "A",
        "G",
        "I",
        "L",
        "P",
        "Q",
        "AD",
        "AE",
        "AM",
        "AV",
        "BB"
    ],

    classificacoes: [
        "MATERIAL",
        "MEDICAMENTO",
        "LOGISTICA",
        "COMPRA",
        "OPME"
    ],

    linhasPorPagina: 15
};

/* =========================================================
   ESTADO DO SISTEMA
========================================================= */

const state = {
    dadosOriginais: [],
    demandas: [],
    filtradas: [],

    paginaAtual: 1,

    arquivoAtual: null,

    estatisticas: {
        total: 0,
        material: 0,
        medicamento: 0,
        logistica: 0,
        compra: 0,
        opme: 0,
        criticas: 0
    }
};

/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    inicializarSistema();

});

/* =========================================================
   INICIALIZAR
========================================================= */

function inicializarSistema() {

    configurarMenu();

    configurarUpload();

    configurarPesquisa();

    configurarFiltros();

    configurarModal();

    configurarBotoes();

    atualizarRelogio();

    setInterval(atualizarRelogio, 1000);

    carregarDadosLocais();

    esconderLoading();

    mostrarSecao("dashboard");

}

/* =========================================================
   LOADING
========================================================= */

function esconderLoading() {

    const loading = document.querySelector(".loading-screen");

    if (!loading) return;

    setTimeout(() => {
        loading.classList.add("hidden");
    }, 500);
}

/* =========================================================
   MENU
========================================================= */

function configurarMenu() {

    const menuItems = document.querySelectorAll(".menu-item");

    menuItems.forEach(item => {

        item.addEventListener("click", () => {

            const secao =
                item.dataset.section ||
                item.dataset.target ||
                item.getAttribute("data-page");

            if (!secao) return;

            menuItems.forEach(menu => {
                menu.classList.remove("active");
            });

            item.classList.add("active");

            mostrarSecao(secao);

        });

    });

    const menuToggle =
        document.querySelector("#menuToggle") ||
        document.querySelector(".menu-toggle");

    const sidebar =
        document.querySelector(".sidebar");

    if (menuToggle && sidebar) {

        menuToggle.addEventListener("click", () => {

            sidebar.classList.toggle("open");

        });

    }
}

/* =========================================================
   MOSTRAR SEÇÃO
========================================================= */

function mostrarSecao(nome) {

    const secoes =
        document.querySelectorAll(".content-section");

    secoes.forEach(secao => {

        secao.classList.remove("active");

    });

    const alvo =
        document.getElementById(nome) ||
        document.querySelector(`[data-section-content="${nome}"]`);

    if (alvo) {

        alvo.classList.add("active");

    }

    atualizarTituloPagina(nome);

    if (nome === "dashboard") {
        atualizarDashboard();
    }

    if (nome === "indicadores") {
        atualizarIndicadores();
    }

    if (nome === "ranking") {
        atualizarRanking();
    }

    if (nome === "demandas") {
        renderizarTabela();
    }
}

/* =========================================================
   TÍTULO DA PÁGINA
========================================================= */

function atualizarTituloPagina(nome) {

    const titulos = {
        dashboard: [
            "Dashboard",
            "Visão geral das demandas analisadas"
        ],

        demandas: [
            "Demandas",
            "Consulta e análise dos registros"
        ],

        indicadores: [
            "Indicadores",
            "Indicadores de desempenho do SAC"
        ],

        ranking: [
            "Ranking",
            "Ranking dos principais ofensores"
        ],

        exportacao: [
            "Exportação",
            "Exporte os resultados da análise"
        ],

        usuarios: [
            "Usuários",
            "Gerenciamento dos usuários do sistema"
        ],

        configuracoes: [
            "Configurações",
            "Configurações do SIGDH"
        ]
    };

    const dados = titulos[nome] || [
        "SIGDH",
        "Sistema Integrado de Gestão de Demandas"
    ];

    const titulo =
        document.querySelector(".page-title h1");

    const subtitulo =
        document.querySelector(".page-title p");

    if (titulo) {
        titulo.textContent = dados[0];
    }

    if (subtitulo) {
        subtitulo.textContent = dados[1];
    }
}

/* =========================================================
   RELÓGIO
========================================================= */

function atualizarRelogio() {

    const agora = new Date();

    const hora = agora.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    const data = agora.toLocaleDateString("pt-BR");

    const clock =
        document.querySelector("#systemClock") ||
        document.querySelector(".system-clock");

    if (!clock) return;

    const strong = clock.querySelector("strong");
    const span = clock.querySelector("span");

    if (strong) strong.textContent = hora;

    if (span) span.textContent = data;
}

/* =========================================================
   UPLOAD
========================================================= */

function configurarUpload() {

    const input =
        document.querySelector("#excelFile") ||
        document.querySelector('input[type="file"]');

    const zone =
        document.querySelector(".upload-zone");

    if (!input) return;

    input.addEventListener("change", evento => {

        const arquivo = evento.target.files[0];

        if (!arquivo) return;

        processarArquivo(arquivo);

    });

    if (!zone) return;

    zone.addEventListener("dragover", evento => {

        evento.preventDefault();

        zone.classList.add("dragover");

    });

    zone.addEventListener("dragleave", () => {

        zone.classList.remove("dragover");

    });

    zone.addEventListener("drop", evento => {

        evento.preventDefault();

        zone.classList.remove("dragover");

        const arquivo =
            evento.dataTransfer.files[0];

        if (!arquivo) return;

        if (!arquivo.name.match(/\.(xlsx|xls|csv)$/i)) {

            mostrarToast(
                "Arquivo inválido",
                "Escolha um arquivo Excel (.xlsx/.xls) ou CSV.",
                "error"
            );

            return;
        }

        processarArquivo(arquivo);

    });
}

/* =========================================================
   PROCESSAR ARQUIVO
========================================================= */

function processarArquivo(arquivo) {

    if (typeof XLSX === "undefined") {

        mostrarToast(
            "Biblioteca Excel não encontrada",
            "A biblioteca XLSX ainda não foi carregada no index.html.",
            "error"
        );

        return;
    }

    state.arquivoAtual = arquivo;

    mostrarProgresso(10);

    const reader = new FileReader();

    reader.onload = evento => {

        try {

            mostrarProgresso(30);

            const dados =
                new Uint8Array(evento.target.result);

            const workbook =
                XLSX.read(dados, {
                    type: "array"
                });

            mostrarProgresso(50);

            const primeiraAba =
                workbook.SheetNames[0];

            const worksheet =
                workbook.Sheets[primeiraAba];

            const json =
                XLSX.utils.sheet_to_json(
                    worksheet,
                    {
                        header: 1,
                        defval: ""
                    }
                );

            mostrarProgresso(70);

            if (!json || json.length === 0) {

                throw new Error(
                    "A planilha está vazia."
                );

            }

            state.dadosOriginais = json;

            analisarPlanilha(json);

            mostrarProgresso(100);

            salvarDadosLocais();

            setTimeout(() => {

                esconderProgresso();

                mostrarToast(
                    "Importação concluída",
                    `${state.demandas.length} registros processados.`,
                    "success"
                );

                mostrarSecao("dashboard");

            }, 500);

        } catch (erro) {

            console.error(erro);

            esconderProgresso();

            mostrarToast(
                "Erro na importação",
                erro.message || "Não foi possível analisar a planilha.",
                "error"
            );

        }

    };

    reader.onerror = () => {

        esconderProgresso();

        mostrarToast(
            "Erro",
            "Não foi possível ler o arquivo.",
            "error"
        );

    };

    reader.readAsArrayBuffer(arquivo);
}

/* =========================================================
   ANALISAR PLANILHA
========================================================= */

function analisarPlanilha(linhas) {

    state.demandas = [];

    if (!linhas || linhas.length < 2) {
        atualizarTudo();
        return;
    }

    const cabecalho = linhas[0];

    for (let i = 1; i < linhas.length; i++) {

        const linha = linhas[i];

        if (!linha || linha.length === 0) {
            continue;
        }

        const registro =
            criarRegistro(linha, cabecalho, i + 1);

        if (!registro.temConteudo) {
            continue;
        }

        state.demandas.push(registro);

    }

    state.filtradas =
        [...state.demandas];

    recalcularEstatisticas();

    atualizarTudo();
}

/* =========================================================
   CRIAR REGISTRO
========================================================= */

function criarRegistro(linha, cabecalho, numeroLinha) {

    const valoresAnalise = [];

    CONFIG.colunasAnalise.forEach(letra => {

        const indice =
            colunaParaIndice(letra);

        if (indice < linha.length) {

            valoresAnalise.push(
                normalizarTexto(linha[indice])
            );

        }

    });

    const textoCompleto =
        valoresAnalise
            .filter(Boolean)
            .join(" ");

    const classificacao =
        classificarOfensor(textoCompleto);

    const registro =
        encontrarValor(
            linha,
            cabecalho,
            [
                "REGISTRO",
                "ID REGISTRO",
                "Nº REGISTRO",
                "NUMERO REGISTRO",
                "NÚMERO REGISTRO"
            ]
        );

    const protocolo =
        encontrarValor(
            linha,
            cabecalho,
            [
                "PROTOCOLO",
                "Nº PROTOCOLO",
                "NUMERO PROTOCOLO"
            ]
        );

    const beneficiario =
        encontrarValor(
            linha,
            cabecalho,
            [
                "BENEFICIARIO",
                "BENEFICIÁRIO",
                "NOME",
                "PACIENTE"
            ]
        );

    const prioridade =
        detectarPrioridade(textoCompleto);

    return {

        id: registro || numeroLinha,

        registro:
            registro || numeroLinha,

        protocolo:
            protocolo || "",

        beneficiario:
            beneficiario || "",

        classificacao,

        prioridade,

        linhaOriginal: linha,

        textoAnalise: textoCompleto,

        numeroLinha,

        temConteudo:
            textoCompleto.trim().length > 0
    };
}

/* =========================================================
   CONVERTER COLUNA EXCEL
========================================================= */

function colunaParaIndice(coluna) {

    let resultado = 0;

    for (let i = 0; i < coluna.length; i++) {

        resultado =
            resultado * 26 +
            coluna.charCodeAt(i) -
            64;

    }

    return resultado - 1;
}

/* =========================================================
   NORMALIZAR TEXTO
========================================================= */

function normalizarTexto(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }

    return String(valor)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();
}

/* =========================================================
   CLASSIFICAÇÃO AUTOMÁTICA
========================================================= */

function classificarOfensor(texto) {

    const valor =
        normalizarTexto(texto);

    if (!valor) {
        return "NÃO CLASSIFICADO";
    }

    const regras = {

        OPME: [
            "OPME",
            "PROTESE",
            "PRÓTESE",
            "ORTOPEDIA",
            "IMPLANTE",
            "MATERIAL ORTOPEDICO"
        ],

        MEDICAMENTO: [
            "MEDICAMENTO",
            "REMEDIO",
            "REMÉDIO",
            "FARMACO",
            "FARMÁCIA",
            "FARMACIA",
            "DROGA",
            "MEDICACAO",
            "MEDICAÇÃO"
        ],

        LOGISTICA: [
            "LOGISTICA",
            "LOGÍSTICA",
            "TRANSPORTE",
            "ENTREGA",
            "ENTREGAR",
            "MOTORISTA",
            "AMBULANCIA",
            "AMBULÂNCIA",
            "TRANSFERENCIA",
            "TRANSFERÊNCIA",
            "LOCALIZACAO",
            "LOCALIZAÇÃO"
        ],

        COMPRA: [
            "COMPRA",
            "COMPRAS",
            "AQUISICAO",
            "AQUISIÇÃO",
            "COTACAO",
            "COTAÇÃO",
            "FORNECEDOR",
            "ORCAMENTO",
            "ORÇAMENTO"
        ],

        MATERIAL: [
            "MATERIAL",
            "INSUMO",
            "EQUIPAMENTO",
            "DESCARTAVEL",
            "DESCARTÁVEL",
            "ESTOQUE",
            "ALMOXARIFADO"
        ]
    };

    const pontuacao = {};

    CONFIG.classificacoes.forEach(tipo => {
        pontuacao[tipo] = 0;
    });

    Object.entries(regras).forEach(
        ([categoria, palavras]) => {

            palavras.forEach(palavra => {

                const termo =
                    normalizarTexto(palavra);

                if (valor.includes(termo)) {

                    pontuacao[categoria] += 1;

                }

            });

        }
    );

    let melhor =
        "NÃO CLASSIFICADO";

    let maiorPontuacao = 0;

    Object.entries(pontuacao).forEach(
        ([categoria, pontos]) => {

            if (pontos > maiorPontuacao) {

                maiorPontuacao = pontos;

                melhor = categoria;

            }

        }
    );

    return melhor;
}

/* =========================================================
   PRIORIDADE
========================================================= */

function detectarPrioridade(texto) {

    const valor =
        normalizarTexto(texto);

    if (
        valor.includes("URGENTE") ||
        valor.includes("CRITICO") ||
        valor.includes("CRÍTICO") ||
        valor.includes("GRAVE") ||
        valor.includes("RISCO")
    ) {
        return "ALTA";
    }

    if (
        valor.includes("ATENCAO") ||
        valor.includes("ATENÇÃO") ||
        valor.includes("PRAZO") ||
        valor.includes("ATRASO")
    ) {
        return "MEDIA";
    }

    return "BAIXA";
}

/* =========================================================
   ENCONTRAR VALOR PELO CABEÇALHO
========================================================= */

function encontrarValor(
    linha,
    cabecalho,
    nomes
) {

    if (!Array.isArray(cabecalho)) {
        return "";
    }

    const nomesNormalizados =
        nomes.map(normalizarTexto);

    for (let i = 0; i < cabecalho.length; i++) {

        const nome =
            normalizarTexto(cabecalho[i]);

        if (
            nomesNormalizados.includes(nome)
        ) {

            return linha[i] ?? "";

        }

    }

    return "";
}

/* =========================================================
   ESTATÍSTICAS
========================================================= */

function recalcularEstatisticas() {

    const demandas =
        state.demandas;

    state.estatisticas = {

        total: demandas.length,

        material:
            demandas.filter(
                item =>
                    item.classificacao === "MATERIAL"
            ).length,

        medicamento:
            demandas.filter(
                item =>
                    item.classificacao === "MEDICAMENTO"
            ).length,

        logistica:
            demandas.filter(
                item =>
                    item.classificacao === "LOGISTICA"
            ).length,

        compra:
            demandas.filter(
                item =>
                    item.classificacao === "COMPRA"
            ).length,

        opme:
            demandas.filter(
                item =>
                    item.classificacao === "OPME"
            ).length,

        criticas:
            demandas.filter(
                item =>
                    item.prioridade === "ALTA"
            ).length
    };
}

/* =========================================================
   ATUALIZAR TUDO
========================================================= */

function atualizarTudo() {

    recalcularEstatisticas();

    atualizarDashboard();

    atualizarIndicadores();

    atualizarRanking();

    renderizarTabela();

    atualizarContadores();

}

/* =========================================================
   CONTADORES
========================================================= */

function atualizarContadores() {

    const s =
        state.estatisticas;

    definirTexto(
        [
            "#totalDemandas",
            "[data-stat='total']"
        ],
        formatarNumero(s.total)
    );

    definirTexto(
        [
            "#totalMaterial",
            "[data-stat='material']"
        ],
        formatarNumero(s.material)
    );

    definirTexto(
        [
            "#totalMedicamento",
            "[data-stat='medicamento']"
        ],
        formatarNumero(s.medicamento)
    );

    definirTexto(
        [
            "#totalLogistica",
            "[data-stat='logistica']"
        ],
        formatarNumero(s.logistica)
    );

    definirTexto(
        [
            "#totalCompra",
            "[data-stat='compra']"
        ],
        formatarNumero(s.compra)
    );

    definirTexto(
        [
            "#totalOpme",
            "[data-stat='opme']"
        ],
        formatarNumero(s.opme)
    );

    definirTexto(
        [
            "#totalCriticas",
            "[data-stat='criticas']"
        ],
        formatarNumero(s.criticas)
    );
}

/* =========================================================
   DASHBOARD
========================================================= */

function atualizarDashboard() {

    atualizarContadores();

    atualizarResumo();

    atualizarAlertas();

    atualizarGraficoOfensores();
}

/* =========================================================
   RESUMO
========================================================= */

function atualizarResumo() {

    const elemento =
        document.querySelector(
            ".executive-summary"
        );

    if (!elemento) return;

    if (state.demandas.length === 0) {

        elemento.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-chart-line"></i>
                <h4>Nenhuma planilha importada.</h4>
                <p>
                    Importe uma planilha Excel para
                    visualizar o resumo executivo.
                </p>
            </div>
        `;

        return;
    }

    const s =
        state.estatisticas;

    const ranking =
        obterRanking();

    const principal =
        ranking[0];

    elemento.innerHTML = `
        <div style="
            display:grid;
            grid-template-columns:repeat(3,1fr);
            gap:15px;
        ">

            <div>
                <small style="color:#94a3b8">
                    TOTAL ANALISADO
                </small>

                <h2 style="margin-top:6px">
                    ${s.total}
                </h2>
            </div>

            <div>
                <small style="color:#94a3b8">
                    DEMANDAS CRÍTICAS
                </small>

                <h2 style="
                    margin-top:6px;
                    color:#dc2626;
                ">
                    ${s.criticas}
                </h2>
            </div>

            <div>
                <small style="color:#94a3b8">
                    PRINCIPAL OFENSOR
                </small>

                <h2 style="
                    margin-top:6px;
                    color:#2563eb;
                ">
                    ${principal
                        ? principal.tipo
                        : "-"
                    }
                </h2>
            </div>

        </div>
    `;
}

/* =========================================================
   ALERTAS
========================================================= */

function atualizarAlertas() {

    const elemento =
        document.querySelector(
            ".alerts-container"
        );

    if (!elemento) return;

    const criticas =
        state.demandas.filter(
            item =>
                item.prioridade === "ALTA"
        );

    if (criticas.length === 0) {

        elemento.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-check"></i>
                <h4>Nenhum alerta encontrado.</h4>
                <p>
                    Não existem demandas críticas
                    no momento.
                </p>
            </div>
        `;

        return;
    }

    elemento.innerHTML = `
        <div style="
            display:flex;
            flex-direction:column;
            gap:10px;
        ">

            ${criticas.slice(0, 5).map(item => `

                <div style="
                    padding:12px;
                    border-radius:9px;
                    background:#fef2f2;
                    border:1px solid #fecaca;
                ">

                    <strong style="
                        font-size:11px;
                        color:#b91c1c;
                    ">
                        Registro ${escapeHTML(item.registro)}
                    </strong>

                    <div style="
                        margin-top:4px;
                        font-size:10px;
                        color:#475569;
                    ">
                        ${escapeHTML(
                            item.classificacao
                        )}
                        • Prioridade alta
                    </div>

                </div>

            `).join("")}

        </div>
    `;
}

/* =========================================================
   GRÁFICO
========================================================= */

function atualizarGraficoOfensores() {

    if (typeof Chart === "undefined") {
        return;
    }

    const canvas =
        document.querySelector(
            "#offenderChart"
        ) ||
        document.querySelector(
            "#demandasPorOfensor"
        );

    if (!canvas) return;

    if (
        window.sigdChart &&
        typeof window.sigdChart.destroy === "function"
    ) {

        window.sigdChart.destroy();

    }

    const s =
        state.estatisticas;

    window.sigdChart =
        new Chart(canvas, {

            type: "doughnut",

            data: {

                labels: [
                    "MATERIAL",
                    "MEDICAMENTO",
                    "LOGISTICA",
                    "COMPRA",
                    "OPME"
                ],

                datasets: [
                    {
                        data: [
                            s.material,
                            s.medicamento,
                            s.logistica,
                            s.compra,
                            s.opme
                        ]
                    }
                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        position: "bottom"
                    }

                }

            }

        });
}

/* =========================================================
   INDICADORES
========================================================= */

function atualizarIndicadores() {

    const s =
        state.estatisticas;

    definirTexto(
        ["#indicadorTotal"],
        formatarNumero(s.total)
    );

    definirTexto(
        ["#indicadorCriticas"],
        formatarNumero(s.criticas)
    );

    const maior =
        obterRanking()[0];

    definirTexto(
        ["#indicadorPrincipal"],
        maior
            ? maior.tipo
            : "-"
    );

    const taxa =
        s.total > 0
            ? (
                ((s.total - s.criticas) /
                s.total) * 100
            ).toFixed(1)
            : "0";

    definirTexto(
        ["#indicadorTaxa"],
        `${taxa}%`
    );
}

/* =========================================================
   RANKING
========================================================= */

function obterRanking() {

    const s =
        state.estatisticas;

    return [
        {
            tipo: "MATERIAL",
            quantidade: s.material
        },
        {
            tipo: "MEDICAMENTO",
            quantidade: s.medicamento
        },
        {
            tipo: "LOGISTICA",
            quantidade: s.logistica
        },
        {
            tipo: "COMPRA",
            quantidade: s.compra
        },
        {
            tipo: "OPME",
            quantidade: s.opme
        }
    ].sort(
        (a, b) =>
            b.quantidade -
            a.quantidade
    );
}

function atualizarRanking() {

    const container =
        document.querySelector(
            ".ranking-list"
        );

    if (!container) return;

    const ranking =
        obterRanking();

    if (
        state.demandas.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-ranking-star"></i>
                <h4>Nenhum dado disponível.</h4>
                <p>
                    Importe uma planilha para
                    gerar o ranking.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        ranking.map(
            (item, index) => `

                <div class="ranking-item">

                    <div class="ranking-position">
                        ${index + 1}
                    </div>

                    <div class="ranking-info">

                        <strong>
                            ${item.tipo}
                        </strong>

                        <span>
                            Demandas classificadas
                        </span>

                    </div>

                    <div class="ranking-value">
                        ${item.quantidade}
                    </div>

                </div>

            `
        ).join("");
}

/* =========================================================
   PESQUISA
========================================================= */

function configurarPesquisa() {

    const campo =
        document.querySelector(
            "#searchInput"
        ) ||
        document.querySelector(
            "#pesquisa"
        ) ||
        document.querySelector(
            'input[placeholder*="Pesquisar"]'
        );

    if (!campo) return;

    campo.addEventListener(
        "input",
        () => {

            aplicarFiltros();

        }
    );
}

/* =========================================================
   FILTROS
========================================================= */

function configurarFiltros() {

    const elementos =
        document.querySelectorAll(
            "select[data-filter], " +
            "#filtroOfensor, " +
            "#filtroPrioridade"
        );

    elementos.forEach(elemento => {

        elemento.addEventListener(
            "change",
            aplicarFiltros
        );

    });
}

function aplicarFiltros() {

    const campo =
        document.querySelector(
            "#searchInput"
        ) ||
        document.querySelector(
            "#pesquisa"
        ) ||
        document.querySelector(
            'input[placeholder*="Pesquisar"]'
        );

    const busca =
        campo
            ? normalizarTexto(campo.value)
            : "";

    const filtroOfensor =
        obterValorFiltro([
            "#filtroOfensor",
            "[data-filter='ofensor']"
        ]);

    const filtroPrioridade =
        obterValorFiltro([
            "#filtroPrioridade",
            "[data-filter='prioridade']"
        ]);

    state.filtradas =
        state.demandas.filter(item => {

            const texto =
                normalizarTexto(
                    `${item.registro}
                     ${item.protocolo}
                     ${item.beneficiario}
                     ${item.classificacao}`
                );

            const passouBusca =
                !busca ||
                texto.includes(busca);

            const passouOfensor =
                !filtroOfensor ||
                filtroOfensor === "TODOS" ||
                normalizarTexto(
                    item.classificacao
                ) ===
                normalizarTexto(
                    filtroOfensor
                );

            const passouPrioridade =
                !filtroPrioridade ||
                filtroPrioridade === "TODAS" ||
                normalizarTexto(
                    item.prioridade
                ) ===
                normalizarTexto(
                    filtroPrioridade
                );

            return (
                passouBusca &&
                passouOfensor &&
                passouPrioridade
            );

        });

    state.paginaAtual = 1;

    renderizarTabela();
}

/* =========================================================
   TABELA
========================================================= */

function renderizarTabela() {

    const tbody =
        document.querySelector(
            "#demandasTableBody"
        ) ||
        document.querySelector(
            "tbody"
        );

    if (!tbody) return;

    const dados =
        state.filtradas.length ||
        state.demandas.length
            ? state.filtradas
            : [];

    if (dados.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="table-empty"
                >
                    <i class="fa-solid fa-file-excel"></i>
                    <div>
                        Nenhuma demanda encontrada.
                    </div>
                </td>
            </tr>
        `;

        atualizarPaginacao(0);

        return;
    }

    const inicio =
        (state.paginaAtual - 1) *
        CONFIG.linhasPorPagina;

    const fim =
        inicio +
        CONFIG.linhasPorPagina;

    const pagina =
        dados.slice(inicio, fim);

    tbody.innerHTML =
        pagina.map(
            item => `

            <tr>

                <td>
                    ${escapeHTML(item.registro)}
                </td>

                <td>
                    ${escapeHTML(item.protocolo)}
                </td>

                <td>
                    ${escapeHTML(
                        item.beneficiario ||
                        "-"
                    )}
                </td>

                <td>

                    <span class="
                        classification-tag
                        ${classeClassificacao(
                            item.classificacao
                        )}
                    ">
                        ${escapeHTML(
                            item.classificacao
                        )}
                    </span>

                </td>

                <td>

                    <span class="
                        priority-badge
                        ${item.prioridade
                            .toLowerCase()
                            .replace("á","a")
                        }
                    ">
                        ${escapeHTML(
                            item.prioridade
                        )}
                    </span>

                </td>

                <td>
                    ${item.numeroLinha}
                </td>

                <td>

                    <button
                        class="table-action"
                        title="Ver detalhes"
                        onclick="verDetalhes('${escapeAttribute(item.registro)}')"
                    >
                        <i class="fa-solid fa-eye"></i>
                    </button>

                </td>

            </tr>

        `
        ).join("");

    atualizarPaginacao(
        dados.length
    );
}

/* =========================================================
   CLASSE CLASSIFICAÇÃO
========================================================= */

function classeClassificacao(tipo) {

    return normalizarTexto(tipo)
        .toLowerCase()
        .replace(/\s+/g, "-");
}

/* =========================================================
   PAGINAÇÃO
========================================================= */

function atualizarPaginacao(total) {

    const totalPaginas =
        Math.max(
            1,
            Math.ceil(
                total /
                CONFIG.linhasPorPagina
            )
        );

    const atual =
        state.paginaAtual;

    const info =
        document.querySelector(
            "#paginationInfo"
        );

    if (info) {

        info.textContent =
            total === 0
                ? "0 registros"
                : `Página ${atual} de ${totalPaginas}`;

    }

    const anterior =
        document.querySelector(
            "#prevPage"
        );

    const proximo =
        document.querySelector(
            "#nextPage"
        );

    if (anterior) {
        anterior.disabled =
            atual <= 1;
    }

    if (proximo) {
        proximo.disabled =
            atual >= totalPaginas;
    }
}

function irPagina(direcao) {

    const total =
        state.filtradas.length;

    const totalPaginas =
        Math.max(
            1,
            Math.ceil(
                total /
                CONFIG.linhasPorPagina
            )
        );

    state.paginaAtual += direcao;

    if (state.paginaAtual < 1) {
        state.paginaAtual = 1;
    }

    if (
        state.paginaAtual >
        totalPaginas
    ) {
        state.paginaAtual =
            totalPaginas;
    }

    renderizarTabela();
}

/* =========================================================
   DETALHES
========================================================= */

function verDetalhes(registro) {

    const item =
        state.demandas.find(
            demanda =>
                String(demanda.registro) ===
                String(registro)
        );

    if (!item) return;

    const modal =
        document.querySelector("#detailModal") ||
        document.querySelector(".modal");

    if (!modal) {

        mostrarToast(
            "Detalhes",
            `Registro ${registro} — ${item.classificacao}`,
            "success"
        );

        return;
    }

    const body =
        modal.querySelector(
            ".modal-body"
        );

    if (body) {

        body.innerHTML = `

            <div class="settings-grid">

                <div class="form-group">

                    <label>
                        Registro
                    </label>

                    <input
                        value="${escapeAttribute(
                            item.registro
                        )}"
                        readonly
                    >

                </div>

                <div class="form-group">

                    <label>
                        Protocolo
                    </label>

                    <input
                        value="${escapeAttribute(
                            item.protocolo
                        )}"
                        readonly
                    >

                </div>

                <div class="form-group">

                    <label>
                        Beneficiário
                    </label>

                    <input
                        value="${escapeAttribute(
                            item.beneficiario
                        )}"
                        readonly
                    >

                </div>

                <div class="form-group">

                    <label>
                        Ofensor
                    </label>

                    <input
                        value="${escapeAttribute(
                            item.classificacao
                        )}"
                        readonly
                    >

                </div>

            </div>

            <div class="form-group">

                <label>
                    Conteúdo analisado
                </label>

                <textarea readonly>${escapeHTML(
                    item.textoAnalise
                )}</textarea>

            </div>

        `;

    }

    modal.classList.add("active");
}

/* =========================================================
   MODAL
========================================================= */

function configurarModal() {

    document.addEventListener(
        "click",
        evento => {

            if (
                evento.target.matches(
                    ".modal-overlay, .modal-close"
                )
            ) {

                fecharModal();

            }

        }
    );
}

function fecharModal() {

    document
        .querySelectorAll(".modal.active")
        .forEach(modal => {

            modal.classList.remove(
                "active"
            );

        });
}

/* =========================================================
   BOTÕES
========================================================= */

function configurarBotoes() {

    const importar =
        document.querySelector(
            "#btnImportar"
        );

    const input =
        document.querySelector(
            "#excelFile"
        ) ||
        document.querySelector(
            'input[type="file"]'
        );

    if (importar && input) {

        importar.addEventListener(
            "click",
            () => input.click()
        );

    }

    const anterior =
        document.querySelector(
            "#prevPage"
        );

    if (anterior) {

        anterior.addEventListener(
            "click",
            () => irPagina(-1)
        );

    }

    const proximo =
        document.querySelector(
            "#nextPage"
        );

    if (proximo) {

        proximo.addEventListener(
            "click",
            () => irPagina(1)
        );

    }

    const exportar =
        document.querySelectorAll(
            "[data-export]"
        );

    exportar.forEach(botao => {

        botao.addEventListener(
            "click",
            exportarResultado
        );

    });

}

/* =========================================================
   EXPORTAR EXCEL
========================================================= */

function exportarResultado() {

    if (
        typeof XLSX === "undefined"
    ) {

        mostrarToast(
            "Erro",
            "Biblioteca XLSX não encontrada.",
            "error"
        );

        return;
    }

    if (
        state.demandas.length === 0
    ) {

        mostrarToast(
            "Nada para exportar",
            "Importe uma planilha primeiro.",
            "warning"
        );

        return;
    }

    const dados =
        state.demandas.map(item => ({

            REGISTRO:
                item.registro,

            PROTOCOLO:
                item.protocolo,

            BENEFICIARIO:
                item.beneficiario,

            CLASSIFICACAO:
                item.classificacao,

            PRIORIDADE:
                item.prioridade,

            LINHA_PLANILHA:
                item.numeroLinha,

            TEXTO_ANALISADO:
                item.textoAnalise

        }));

    const worksheet =
        XLSX.utils.json_to_sheet(
            dados
        );

    const workbook =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Resultado"
    );

    const agora =
        new Date()
            .toISOString()
            .slice(0, 10);

    XLSX.writeFile(
        workbook,
        `resultado_SIGDH_${agora}.xlsx`
    );

    mostrarToast(
        "Exportação concluída",
        "O resultado foi baixado em Excel.",
        "success"
    );
}

/* =========================================================
   PROGRESSO
========================================================= */

function mostrarProgresso(valor) {

    const progress =
        document.querySelector(
            ".import-progress"
        );

    const fill =
        document.querySelector(
            ".progress-fill"
        );

    if (progress) {
        progress.style.display =
            "block";
    }

    if (fill) {
        fill.style.width =
            `${valor}%`;
    }
}

function esconderProgresso() {

    const progress =
        document.querySelector(
            ".import-progress"
        );

    if (progress) {

        progress.style.display =
            "none";

    }
}

/* =========================================================
   TOAST
========================================================= */

function mostrarToast(
    titulo,
    mensagem,
    tipo = "success"
) {

    let container =
        document.querySelector(
            ".toast-container"
        );

    if (!container) {

        container =
            document.createElement(
                "div"
            );

        container.className =
            "toast-container";

        document.body.appendChild(
            container
        );

    }

    const icones = {

        success:
            "fa-circle-check",

        warning:
            "fa-triangle-exclamation",

        error:
            "fa-circle-xmark"
    };

    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        `toast ${tipo}`;

    toast.innerHTML = `

        <i class="
            fa-solid
            ${icones[tipo] || icones.success}
        "></i>

        <div class="toast-content">

            <strong>
                ${escapeHTML(titulo)}
            </strong>

            <span>
                ${escapeHTML(mensagem)}
            </span>

        </div>

    `;

    container.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 5000);
}

/* =========================================================
   LOCAL STORAGE
========================================================= */

function salvarDadosLocais() {

    try {

        localStorage.setItem(
            "sigdh_demandas",
            JSON.stringify(
                state.demandas
            )
        );

        localStorage.setItem(
            "sigdh_importacao",
            JSON.stringify({
                nome:
                    state.arquivoAtual
                        ? state.arquivoAtual.name
                        : "",
                data:
                    new Date().toISOString(),
                quantidade:
                    state.demandas.length
            })
        );

    } catch (erro) {

        console.warn(
            "Não foi possível salvar os dados:",
            erro
        );

    }
}

function carregarDadosLocais() {

    try {

        const dados =
            localStorage.getItem(
                "sigdh_demandas"
            );

        if (!dados) return;

        const demandas =
            JSON.parse(dados);

        if (
            !Array.isArray(demandas)
        ) {
            return;
        }

        state.demandas =
            demandas;

        state.filtradas =
            [...demandas];

        recalcularEstatisticas();

        atualizarTudo();

    } catch (erro) {

        console.warn(
            "Erro ao carregar dados:",
            erro
        );

    }
}

/* =========================================================
   UTILITÁRIOS
========================================================= */

function definirTexto(
    seletores,
    valor
) {

    seletores.forEach(seletor => {

        document
            .querySelectorAll(seletor)
            .forEach(elemento => {

                elemento.textContent =
                    valor;

            });

    });
}

function obterValorFiltro(
    seletores
) {

    for (const seletor of seletores) {

        const elemento =
            document.querySelector(
                seletor
            );

        if (elemento) {

            return elemento.value || "";

        }

    }

    return "";
}

function formatarNumero(numero) {

    return Number(numero || 0)
        .toLocaleString("pt-BR");
}

function escapeHTML(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(valor) {

    return escapeHTML(valor)
        .replace(/`/g, "&#096;");
}

/* =========================================================
   DISPONIBILIZAR FUNÇÕES GLOBALMENTE
========================================================= */

window.SIGDH = {

    state,

    processarArquivo,

    analisarPlanilha,

    exportarResultado,

    aplicarFiltros,

    mostrarSecao,

    mostrarToast,

    verDetalhes,

    fecharModal,

    irPagina

};

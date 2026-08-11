// =====================================================
// SIGDH - SISTEMA INTEGRADO DE GESTÃO DE DEMANDAS
// =====================================================

let dados = [];
let dadosFiltrados = [];
let graficoOfensor = null;
let graficoPrioridade = null;
let graficoOperadora = null;
let graficoEvolucao = null;


// =====================================================
// DATA E HORA
// =====================================================

function atualizarDataHora() {

    const agora = new Date();

    const data = agora.toLocaleDateString("pt-BR");

    const hora = agora.toLocaleTimeString("pt-BR");

    const dataElemento =
        document.getElementById("dataAtual");

    const horaElemento =
        document.getElementById("horaAtual");

    if (dataElemento) {
        dataElemento.textContent = data;
    }

    if (horaElemento) {
        horaElemento.textContent = hora;
    }
}


setInterval(atualizarDataHora, 1000);

atualizarDataHora();


// =====================================================
// IMPORTAÇÃO DO EXCEL
// =====================================================

function importarExcel() {

    const arquivo =
        document.getElementById("arquivoExcel");

    if (!arquivo || !arquivo.files.length) {

        alert(
            "Selecione uma planilha Excel primeiro."
        );

        return;
    }

    const file = arquivo.files[0];

    const reader = new FileReader();


    reader.onload = function(event) {

        try {

            const data =
                new Uint8Array(event.target.result);

            const workbook =
                XLSX.read(data, {
                    type: "array"
                });


            const primeiraAba =
                workbook.SheetNames[0];

            const worksheet =
                workbook.Sheets[primeiraAba];


            const linhas =
                XLSX.utils.sheet_to_json(
                    worksheet,
                    {
                        defval: ""
                    }
                );


            if (!linhas.length) {

                alert(
                    "A planilha está vazia."
                );

                return;
            }


            dados =
                linhas.map(
                    (linha, index) => {

                        const texto =
                            Object.values(linha)
                                .join(" ")
                                .toLowerCase();


                        return {

                            id:
                                index + 1,

                            registro:
                                obterValor(
                                    linha,
                                    [
                                        "REGISTRO",
                                        "DATA",
                                        "Data",
                                        "PROTOCOLO"
                                    ]
                                ),

                            protocolo:
                                obterValor(
                                    linha,
                                    [
                                        "PROTOCOLO",
                                        "Protocolo"
                                    ]
                                ),

                            beneficiario:
                                obterValor(
                                    linha,
                                    [
                                        "BENEFICIÁRIO",
                                        "BENEFICIARIO",
                                        "Beneficiário"
                                    ]
                                ),

                            operadora:
                                obterValor(
                                    linha,
                                    [
                                        "OPERADORA",
                                        "Operadora"
                                    ]
                                ),

                            prestador:
                                obterValor(
                                    linha,
                                    [
                                        "PRESTADOR",
                                        "Prestador"
                                    ]
                                ),

                            reclamacao:
                                obterValor(
                                    linha,
                                    [
                                        "RECLAMAÇÃO",
                                        "RECLAMACAO",
                                        "Reclamação",
                                        "DESCRIÇÃO",
                                        "DESCRICAO"
                                    ]
                                ),

                            ofensor:
                                identificarOfensor(
                                    texto
                                ),

                            prioridade:
                                identificarPrioridade(
                                    texto
                                ),

                            status:
                                "Analisado",

                            original:
                                linha
                        };

                    }
                );


            dadosFiltrados =
                [...dados];


            atualizarSistema();


            alert(
                `${dados.length} demanda(s) importada(s) com sucesso!`
            );


        } catch (erro) {

            console.error(erro);

            alert(
                "Erro ao processar a planilha."
            );

        }

    };


    reader.readAsArrayBuffer(file);

}


// =====================================================
// OBTER VALOR DA PLANILHA
// =====================================================

function obterValor(linha, nomes) {

    for (const nome of nomes) {

        if (
            linha[nome] !== undefined &&
            linha[nome] !== null
        ) {

            return linha[nome];

        }

    }

    return "";

}


// =====================================================
// IDENTIFICAÇÃO DO OFENSOR
// =====================================================

function identificarOfensor(texto) {

    if (
        texto.includes("medicamento") ||
        texto.includes("remédio") ||
        texto.includes("remedio") ||
        texto.includes("medicação") ||
        texto.includes("medicacao") ||
        texto.includes("dose") ||
        texto.includes("farmac")
    ) {

        return "Medicamento";

    }


    if (
        texto.includes("material") ||
        texto.includes("insumo") ||
        texto.includes("material hospitalar")
    ) {

        return "Material";

    }


    if (
        texto.includes("opme") ||
        texto.includes("prótese") ||
        texto.includes("protese") ||
        texto.includes("órtese") ||
        texto.includes("ortese") ||
        texto.includes("implante")
    ) {

        return "OPME";

    }


    if (
        texto.includes("entrega") ||
        texto.includes("entreg") ||
        texto.includes("transporte") ||
        texto.includes("atraso") ||
        texto.includes("logística") ||
        texto.includes("logistica") ||
        texto.includes("prazo")
    ) {

        return "Logística";

    }


    if (
        texto.includes("farmácia") ||
        texto.includes("farmacia") ||
        texto.includes("dispensação") ||
        texto.includes("dispensacao")
    ) {

        return "Farmácia";

    }


    if (
        texto.includes("autorização") ||
        texto.includes("autorizacao") ||
        texto.includes("autorização") ||
        texto.includes("regulação") ||
        texto.includes("regulacao") ||
        texto.includes("senha") ||
        texto.includes("guia")
    ) {

        return "Regulação";

    }


    return "Não Identificado";

}


// =====================================================
// PRIORIDADE
// =====================================================

function identificarPrioridade(texto) {

    if (
        texto.includes("urgente") ||
        texto.includes("grave") ||
        texto.includes("risco") ||
        texto.includes("emergência") ||
        texto.includes("emergencia") ||
        texto.includes("óbito") ||
        texto.includes("obito")
    ) {

        return "Alta";

    }


    if (
        texto.includes("atraso") ||
        texto.includes("demora") ||
        texto.includes("reclamação") ||
        texto.includes("reclamacao")
    ) {

        return "Média";

    }


    return "Baixa";

}


// =====================================================
// ATUALIZAR SISTEMA
// =====================================================

function atualizarSistema() {

    atualizarCards();

    atualizarTabela();

    atualizarGraficos();

    atualizarRanking();

    atualizarResumo();

    atualizarAlertas();

    atualizarContador();

}


// =====================================================
// CARDS
// =====================================================

function atualizarCards() {

    const total =
        dados.length;

    alterarTexto(
        "totalDemandas",
        total
    );


    alterarTexto(
        "totalMaterial",
        contarOfensor("Material")
    );


    alterarTexto(
        "totalMedicamento",
        contarOfensor("Medicamento")
    );


    alterarTexto(
        "totalFarmacia",
        contarOfensor("Farmácia")
    );


    alterarTexto(
        "totalLogistica",
        contarOfensor("Logística")
    );


    alterarTexto(
        "totalOpme",
        contarOfensor("OPME")
    );


    alterarTexto(
        "totalRegulacao",
        contarOfensor("Regulação")
    );


    alterarTexto(
        "totalCriticas",
        dados.filter(
            item =>
                item.prioridade === "Alta"
        ).length
    );

}


function alterarTexto(id, valor) {

    const elemento =
        document.getElementById(id);

    if (elemento) {

        elemento.textContent = valor;

    }

}


function contarOfensor(ofensor) {

    return dados.filter(
        item =>
            item.ofensor === ofensor
    ).length;

}


// =====================================================
// TABELA
// =====================================================

function atualizarTabela() {

    const tabela =
        document.getElementById(
            "tabelaDemandas"
        );

    if (!tabela) return;


    tabela.innerHTML = "";


    if (!dadosFiltrados.length) {

        tabela.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="empty-table">

                    <i class="fa-solid fa-file-circle-question"></i>

                    <span>
                        Nenhuma demanda encontrada.
                    </span>

                </td>

            </tr>

        `;

        return;

    }


    dadosFiltrados.forEach(
        item => {

            const linha =
                document.createElement("tr");


            linha.innerHTML = `

                <td>${escapar(item.id)}</td>

                <td>${escapar(item.registro)}</td>

                <td>${escapar(item.protocolo)}</td>

                <td>${escapar(item.beneficiario)}</td>

                <td>${escapar(item.operadora)}</td>

                <td>${escapar(item.prestador)}</td>

                <td>${escapar(item.reclamacao)}</td>

                <td>

                    <span class="badge badge-ofensor">

                        ${escapar(item.ofensor)}

                    </span>

                </td>

                <td>

                    <span class="badge prioridade-${item.prioridade.toLowerCase()}">

                        ${escapar(item.prioridade)}

                    </span>

                </td>

                <td>

                    <span class="badge status-ok">

                        ${escapar(item.status)}

                    </span>

                </td>

            `;


            tabela.appendChild(linha);

        }
    );

}


// =====================================================
// FILTROS
// =====================================================

function aplicarFiltros() {

    const busca =
        (
            document.getElementById(
                "busca"
            )?.value || ""
        )
        .toLowerCase()
        .trim();


    const ofensor =
        document.getElementById(
            "filtroOfensor"
        )?.value || "";


    const prioridade =
        document.getElementById(
            "filtroPrioridade"
        )?.value || "";


    dadosFiltrados =
        dados.filter(
            item => {

                const texto = [

                    item.protocolo,

                    item.beneficiario,

                    item.operadora,

                    item.prestador,

                    item.reclamacao

                ]
                .join(" ")
                .toLowerCase();


                return (

                    (!busca ||
                        texto.includes(busca))

                    &&

                    (!ofensor ||
                        item.ofensor === ofensor)

                    &&

                    (!prioridade ||
                        item.prioridade === prioridade)

                );

            }
        );


    atualizarTabela();

    atualizarContador();

}


// =====================================================
// CONTADOR
// =====================================================

function atualizarContador() {

    const elemento =
        document.getElementById(
            "contadorRegistros"
        );

    if (elemento) {

        elemento.textContent =
            `${dadosFiltrados.length} registro(s)`;

    }

}


// =====================================================
// GRÁFICOS
// =====================================================

function atualizarGraficos() {

    if (
        typeof Chart ===
        "undefined"
    ) {

        return;

    }


    criarGraficoOfensor();

    criarGraficoPrioridade();

    criarGraficoOperadora();

}


// =====================================================
// GRÁFICO OFENSOR
// =====================================================

function criarGraficoOfensor() {

    const canvas =
        document.getElementById(
            "graficoOfensor"
        );

    if (!canvas) return;


    const contagem = {};


    dados.forEach(
        item => {

            contagem[item.ofensor] =
                (contagem[item.ofensor] || 0) + 1;

        }
    );


    if (graficoOfensor) {

        graficoOfensor.destroy();

    }


    graficoOfensor =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        Object.keys(contagem),

                    datasets: [{

                        label:
                            "Demandas",

                        data:
                            Object.values(contagem)

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            }
        );

}


// =====================================================
// GRÁFICO PRIORIDADE
// =====================================================

function criarGraficoPrioridade() {

    const canvas =
        document.getElementById(
            "graficoPrioridade"
        );

    if (!canvas) return;


    const prioridades = {

        Alta: 0,

        Média: 0,

        Baixa: 0

    };


    dados.forEach(
        item => {

            if (
                prioridades[item.prioridade]
                !== undefined
            ) {

                prioridades[item.prioridade]++;

            }

        }
    );


    if (graficoPrioridade) {

        graficoPrioridade.destroy();

    }


    graficoPrioridade =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels:
                        Object.keys(prioridades),

                    datasets: [{

                        data:
                            Object.values(
                                prioridades
                            )

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false

                }

            }
        );

}


// =====================================================
// GRÁFICO OPERADORA
// =====================================================

function criarGraficoOperadora() {

    const canvas =
        document.getElementById(
            "graficoOperadora"
        );

    if (!canvas) return;


    const operadoras = {};


    dados.forEach(
        item => {

            const nome =
                item.operadora ||
                "Não informado";


            operadoras[nome] =
                (operadoras[nome] || 0) + 1;

        }
    );


    const lista =
        Object.entries(
            operadoras
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .slice(0, 10);


    if (graficoOperadora) {

        graficoOperadora.destroy();

    }


    graficoOperadora =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        lista.map(
                            item => item[0]
                        ),

                    datasets: [{

                        label:
                            "Demandas",

                        data:
                            lista.map(
                                item => item[1]
                            )

                    }]

                },

                options: {

                    indexAxis: "y",

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            }
        );

}


// =====================================================
// RANKING
// =====================================================

function atualizarRanking() {

    const elemento =
        document.getElementById(
            "rankingOfensores"
        );

    if (!elemento) return;


    const contagem = {};


    dados.forEach(
        item => {

            contagem[item.ofensor] =
                (contagem[item.ofensor] || 0) + 1;

        }
    );


    const ranking =
        Object.entries(
            contagem
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        );


    elemento.innerHTML = "";


    ranking.forEach(
        ([nome, quantidade]) => {

            const li =
                document.createElement("li");


            li.innerHTML = `

                <span>
                    ${escapar(nome)}
                </span>

                <strong>
                    ${quantidade}
                </strong>

            `;


            elemento.appendChild(li);

        }
    );

}


// =====================================================
// RESUMO
// =====================================================

function atualizarResumo() {

    const elemento =
        document.getElementById(
            "resumoSistema"
        );

    if (!elemento) return;


    if (!dados.length) return;


    const total =
        dados.length;


    const criticas =
        dados.filter(
            item =>
                item.prioridade === "Alta"
        ).length;


    const identificadas =
        dados.filter(
            item =>
                item.ofensor !==
                "Não Identificado"
        ).length;


    const percentual =
        total
            ? Math.round(
                (identificadas / total) * 100
            )
            : 0;


    elemento.innerHTML = `

        <div class="summary-grid">

            <div>

                <strong>
                    ${total}
                </strong>

                <span>
                    Demandas analisadas
                </span>

            </div>


            <div>

                <strong>
                    ${identificadas}
                </strong>

                <span>
                    Com ofensor identificado
                </span>

            </div>


            <div>

                <strong>
                    ${percentual}%
                </strong>

                <span>
                    Taxa de identificação
                </span>

            </div>


            <div>

                <strong>
                    ${criticas}
                </strong>

                <span>
                    Demandas críticas
                </span>

            </div>

        </div>

    `;

}


// =====================================================
// ALERTAS
// =====================================================

function atualizarAlertas() {

    const elemento =
        document.getElementById(
            "alertaSistema"
        );

    if (!elemento) return;


    const criticas =
        dados.filter(
            item =>
                item.prioridade === "Alta"
        ).length;


    const naoIdentificadas =
        dados.filter(
            item =>
                item.ofensor ===
                "Não Identificado"
        ).length;


    if (
        !criticas &&
        !naoIdentificadas
    ) {

        elemento.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-circle-check"></i>

                <span>
                    Nenhum alerta encontrado.
                </span>

            </div>

        `;

        return;

    }


    let html = "";


    if (criticas) {

        html += `

            <div class="system-alert warning">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <span>

                    Existem
                    <strong>${criticas}</strong>
                    demanda(s) de alta prioridade.

                </span>

            </div>

        `;

    }


    if (naoIdentificadas) {

        html += `

            <div class="system-alert info">

                <i class="fa-solid fa-circle-question"></i>

                <span>

                    Existem
                    <strong>${naoIdentificadas}</strong>
                    demanda(s) sem ofensor identificado.

                </span>

            </div>

        `;

    }


    elemento.innerHTML = html;

}


// =====================================================
// EXPORTAR RESULTADO
// =====================================================

function exportarTratada() {

    if (!dados.length) {

        alert(
            "Não existem dados para exportar."
        );

        return;

    }


    const resultado =
        dados.map(
            item => ({

                ID:
                    item.id,

                REGISTRO:
                    item.registro,

                PROTOCOLO:
                    item.protocolo,

                BENEFICIÁRIO:
                    item.beneficiario,

                OPERADORA:
                    item.operadora,

                PRESTADOR:
                    item.prestador,

                RECLAMAÇÃO:
                    item.reclamacao,

                OFENSOR:
                    item.ofensor,

                PRIORIDADE:
                    item.prioridade,

                STATUS:
                    item.status

            })
        );


    const worksheet =
        XLSX.utils.json_to_sheet(
            resultado
        );


    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Resultado"
    );


    XLSX.writeFile(
        workbook,
        "resultado.xlsx"
    );

}


// =====================================================
// LIMPAR DADOS
// =====================================================

function limparDados() {

    if (!dados.length) {

        return;

    }


    const confirmar =
        confirm(
            "Deseja realmente limpar os dados importados?"
        );


    if (!confirmar) {

        return;

    }


    dados = [];

    dadosFiltrados = [];


    atualizarSistema();


    const arquivo =
        document.getElementById(
            "arquivoExcel"
        );


    if (arquivo) {

        arquivo.value = "";

    }


    const nomeArquivo =
        document.getElementById(
            "nomeArquivo"
        );


    if (nomeArquivo) {

        nomeArquivo.textContent =
            "Nenhum arquivo selecionado";

    }

}


// =====================================================
// ESCAPAR HTML
// =====================================================

function escapar(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(valor)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// BUSCA AUTOMÁTICA
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const busca =
            document.getElementById(
                "busca"
            );


        if (busca) {

            busca.addEventListener(
                "input",
                aplicarFiltros
            );

        }


        const darkMode =
            document.getElementById(
                "darkMode"
            );


        if (darkMode) {

            darkMode.addEventListener(
                "click",
                function() {

                    document.body.classList.toggle(
                        "dark-mode"
                    );

                }
            );

        }

    }
);

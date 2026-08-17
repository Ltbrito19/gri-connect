/*
=========================================
GRI CONNECT SYS
PEDIDOS.JS
Versão 5.0
=========================================
*/

let pedidos = [];
let pedidosPortal = [];

let statusSelecionado = "TODOS";


/* ==========================================
   CARREGAMENTO
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    carregarPedidosPortal();

});


async function carregarPedidosPortal() {

    try {

        const resposta = await fetch("../json/pedidos.json");

        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar pedidos.json."
            );

        }

        pedidos = await resposta.json();

        /*
        O Portal mostra todos os pedidos ativos.

        Finalizado é pedido encerrado e não aparece.
        */
        pedidosPortal = pedidos.filter(p =>
            p.status !== "Finalizado"
        );


        configurarPesquisa();

        configurarModal();

        configurarFiltrosStatus();

        atualizarIndicadores();

        aplicarFiltros();

        abrirPesquisaAutomatica();


    } catch (erro) {

        console.error(
            "ERRO PORTAL GRI:",
            erro
        );

        alert(
            "Erro no Portal GRI:\n\n" +
            erro.message
        );

    }

}


/* ==========================================
   INDICADORES
========================================== */

function atualizarIndicadores() {

    let agendados = 0;
    let emAndamento = 0;
    let comunicadoSys = 0;
    let pendenteCia = 0;
    let pendenteKm = 0;


    pedidosPortal.forEach(pedido => {

        switch (pedido.status) {

            case "Agendado":

                agendados++;

            break;


            case "Em Andamento":

                emAndamento++;

            break;


            case "Comunicado Sys":

                comunicadoSys++;

            break;


            case "Pendente Cia":

                pendenteCia++;

            break;


            case "Pendente KM":

                pendenteKm++;

            break;

        }

    });


    document.getElementById(
        "qtAgendados"
    ).textContent = agendados;


    document.getElementById(
        "qtEmAndamento"
    ).textContent = emAndamento;


    document.getElementById(
        "qtComunicadoSys"
    ).textContent = comunicadoSys;


    document.getElementById(
        "qtPendenteCia"
    ).textContent = pendenteCia;


    document.getElementById(
        "qtPendenteKm"
    ).textContent = pendenteKm;


    document.getElementById(
        "qtTodos"
    ).textContent = pedidosPortal.length;

}


/* ==========================================
   FILTROS DOS INDICADORES
========================================== */

function configurarFiltrosStatus() {

    const indicadores =
        document.querySelectorAll(
            ".filtro-status"
        );


    indicadores.forEach(indicador => {

        indicador.style.cursor = "pointer";


        indicador.addEventListener(
            "click",
            () => {

                const status =
                    indicador.dataset.status;


                /*
                Clicou novamente no mesmo indicador:
                volta para todos.
                */
                if (
                    statusSelecionado === status
                ) {

                    statusSelecionado =
                        "TODOS";

                } else {

                    statusSelecionado =
                        status;

                }


                atualizarEstadoIndicadores();

                aplicarFiltros();

            }
        );

    });


    atualizarEstadoIndicadores();

}


/* ==========================================
   ESTADO VISUAL DOS INDICADORES
========================================== */

function atualizarEstadoIndicadores() {

    const indicadores =
        document.querySelectorAll(
            ".filtro-status"
        );


    indicadores.forEach(indicador => {

        const status =
            indicador.dataset.status;


        if (
            status === statusSelecionado
        ) {

            indicador.style.transform =
                "scale(1.03)";

            indicador.style.boxShadow =
                "0 0 0 3px rgba(21,101,192,0.25)";

        } else {

            indicador.style.transform =
                "scale(1)";

            indicador.style.boxShadow =
                "none";

        }

    });

}


/* ==========================================
   APLICA FILTROS
========================================== */

function aplicarFiltros() {

    const campo =
        document.getElementById(
            "txtPesquisa"
        );


    const texto =
        campo
            ? campo.value.toLowerCase().trim()
            : "";


    let resultado =
        [...pedidosPortal];


    /*
    FILTRO POR STATUS
    */

    if (
        statusSelecionado !== "TODOS"
    ) {

        resultado =
            resultado.filter(pedido =>
                pedido.status ===
                statusSelecionado
            );

    }


    /*
    FILTRO POR PESQUISA
    */

    if (texto !== "") {

        resultado =
            resultado.filter(pedido =>

                String(
                    pedido.numero || ""
                )
                .toLowerCase()
                .includes(texto)

                ||

                String(
                    pedido.companhia || ""
                )
                .toLowerCase()
                .includes(texto)

                ||

                String(
                    pedido.cidade || ""
                )
                .toLowerCase()
                .includes(texto)

                ||

                String(
                    pedido.inspetor || ""
                )
                .toLowerCase()
                .includes(texto)

                ||

                String(
                    pedido.produto || ""
                )
                .toLowerCase()
                .includes(texto)

            );

    }


    carregarPedidos(resultado);

}


/* ==========================================
   LISTA DE PEDIDOS
========================================== */

function carregarPedidos(lista) {

    const container =
        document.getElementById(
            "listaPedidos"
        );


    container.innerHTML = "";


    if (lista.length === 0) {

        container.innerHTML = `
            <div class="sem-pedidos">
                Nenhum pedido encontrado.
            </div>
        `;

        return;

    }


    lista.forEach(pedido => {

        const dias =
            calcularDias(
                pedido.recebido
            );


        const cor =
            obterCorDias(dias);


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "pedido";


        card.innerHTML = `

            <h2>
                ${pedido.numero}
            </h2>

            <span>
                ${pedido.companhia}
            </span>

            <p>
                📅 Recebido
                ${pedido.recebido}
            </p>

            <p class="dias ${cor}">
                ${iconeStatus(cor)}
                ${dias} dias em aberto
            </p>

            <p>
                🏢 ${pedido.produto}
            </p>

            <p>
                👤 ${pedido.inspetor}
            </p>

            <div
                class="status
                ${classeStatus(pedido.status)}">

                ${pedido.status}

            </div>

            <button
                class="detalhes">

                VER DETALHES

            </button>

        `;


        card
            .querySelector(".detalhes")
            .addEventListener(
                "click",
                () => {

                    abrirModal(pedido);

                }
            );


        container.appendChild(card);

    });

}


/* ==========================================
   PESQUISA
========================================== */

function configurarPesquisa() {

    const campo =
        document.getElementById(
            "txtPesquisa"
        );


    const botao =
        document.getElementById(
            "btnPesquisar"
        );


    if (!campo || !botao)
        return;


    botao.addEventListener(
        "click",
        pesquisarPedidos
    );


    campo.addEventListener(
        "keyup",
        function(e) {

            if (
                e.key === "Enter"
            ) {

                pesquisarPedidos();

            }

        }
    );

}


function pesquisarPedidos() {

    aplicarFiltros();

}


/* ==========================================
   FUNÇÕES AUXILIARES
========================================== */

function calcularDias(dataTexto) {

    if (!dataTexto)
        return 0;


    const data =
        new Date(dataTexto);


    if (
        isNaN(
            data.getTime()
        )
    )
        return 0;


    const hoje =
        new Date();


    hoje.setHours(
        0,
        0,
        0,
        0
    );


    data.setHours(
        0,
        0,
        0,
        0
    );


    const diferenca =
        hoje - data;


    return Math.floor(
        diferenca / 86400000
    );

}


function obterCorDias(dias) {

    if (dias <= 2)
        return "verde";


    if (dias <= 4)
        return "amarelo";


    return "vermelho";

}


function iconeStatus(cor) {

    switch (cor) {

        case "verde":

            return "🟢";


        case "amarelo":

            return "🟡";


        default:

            return "🔴";

    }

}


function classeStatus(status) {

    switch (status) {

        case "Em Andamento":

            return "pendente";


        case "Agendado":

            return "agendado";


        case "Finalizado":

            return "finalizado";


        case "Comunicado Sys":

            return "cobrado";


        case "Pendente Cia":

            return "pcia";


        case "Pendente KM":

            return "pkm";


        default:

            return "";

    }

}


/* ==========================================
   MODAL
========================================== */

function configurarModal() {

    const modal =
        document.getElementById(
            "modalPedido"
        );


    const fechar =
        document.getElementById(
            "btnFecharModal"
        );


    fechar.addEventListener(
        "click",
        fecharModal
    );


    modal.addEventListener(
        "click",
        function(e) {

            if (
                e.target === modal
            ) {

                fecharModal();

            }

        }
    );

}


function abrirModal(pedido) {

    document.getElementById(
        "modalNumero"
    ).textContent =
        pedido.numero;


    document.getElementById(
        "modalRecebido"
    ).textContent =
        pedido.recebido;


    document.getElementById(
        "modalDias"
    ).textContent =
        calcularDias(
            pedido.recebido
        ) + " dias";


    document.getElementById(
        "modalCompanhia"
    ).textContent =
        pedido.companhia;


    document.getElementById(
        "modalProduto"
    ).textContent =
        pedido.produto;


    document.getElementById(
        "modalCidade"
    ).textContent =
        pedido.cidade;


    document.getElementById(
        "modalInspetor"
    ).textContent =
        pedido.inspetor;


    document.getElementById(
        "modalAgendamento"
    ).textContent =
        pedido.agendamento || "--";


    configurarStatusModal(
        pedido.status
    );


    configurarBotaoWhatsapp(
        pedido
    );


    document
        .getElementById(
            "modalPedido"
        )
        .classList
        .add("ativo");

}


function fecharModal() {

    document
        .getElementById(
            "modalPedido"
        )
        .classList
        .remove("ativo");

}


/* ==========================================
   STATUS DO MODAL
========================================== */

function configurarStatusModal(status) {

    const statusModal =
        document.getElementById(
            "modalStatus"
        );


    statusModal.className =
        "status";


    switch (status) {

        case "Em Andamento":

            statusModal.classList.add(
                "pendente"
            );

            statusModal.textContent =
                "Em Andamento";

        break;


        case "Agendado":

            statusModal.classList.add(
                "agendado"
            );

            statusModal.textContent =
                "Agendado";

        break;


        case "Finalizado":

            statusModal.classList.add(
                "finalizado"
            );

            statusModal.textContent =
                "Finalizado";

        break;


        case "Comunicado Sys":

            statusModal.classList.add(
                "cobrado"
            );

            statusModal.textContent =
                "Comunicado Sys";

        break;


        case "Pendente Cia":

            statusModal.classList.add(
                "pcia"
            );

            statusModal.textContent =
                "Pendente Cia";

        break;


        case "Pendente KM":

            statusModal.classList.add(
                "pkm"
            );

            statusModal.textContent =
                "Pendente KM";

        break;


        default:

            statusModal.textContent =
                status;

    }

}


/* ==========================================
   WHATSAPP
========================================== */

function configurarBotaoWhatsapp(pedido) {

    const botao =
        document.getElementById(
            "btnWhatsapp"
        );


    if (
        pedido.status === "Agendado"
    ) {

        botao.innerHTML =
            "📄 COBRAR LAUDO";

    } else {

        botao.innerHTML =
            "💬 COBRAR AGENDAMENTO";

    }


    botao.style.display =
        "block";


    botao.onclick =
        function() {

            let mensagem = "";


            if (
                pedido.status ===
                "Agendado"
            ) {

                mensagem =
`Olá, ${pedido.inspetor}.

Poderia verificar a situação do pedido ${pedido.numero}?

Consta como AGENDADO e ainda aguardamos o envio do laudo.

Obrigado.

GRI Gerenciamento e Inspeção de Risco`;

            } else {

                mensagem =
`Olá, ${pedido.inspetor}.

Poderia verificar a situação do pedido ${pedido.numero}?

Ainda aguardamos o agendamento.

Obrigado.

GRI Gerenciamento e Inspeção de Risco`;

            }


            const numero =
                String(
                    pedido.whatsapp || ""
                )
                .replace(
                    /\D/g,
                    ""
                );


            if (!numero) {

                alert(
                    "Número de WhatsApp não cadastrado para este pedido."
                );

                return;

            }


            const url =
                `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`;


            window.open(
                url,
                "_blank"
            );

        };

}


/* ==========================================
   PESQUISA AUTOMÁTICA
========================================== */

function abrirPesquisaAutomatica() {

    const numero =
        sessionStorage.getItem(
            "pedidoPesquisa"
        );


    if (!numero) {

        return;

    }


    const pedido =
        pedidosPortal.find(
            p =>
                p.numero === numero
        );


    if (pedido) {

        abrirModal(pedido);

    }


    sessionStorage.removeItem(
        "pedidoPesquisa"
    );

}

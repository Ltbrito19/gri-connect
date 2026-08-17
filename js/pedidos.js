/*
=========================================
GRI CONNECT SYS
PEDIDOS.JS
Versão 3.0
=========================================
*/

let pedidos = [];
let pedidosPortal = [];

/* ==========================================
   CARREGAMENTO
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    carregarPedidosPortal();

});

async function carregarPedidosPortal() {

    try {

        const resposta = await fetch("../json/pedidos.json");

        pedidos = await resposta.json();

        // Apenas pedidos que devem aparecer no Portal
        pedidosPortal = pedidos;
       
        carregarPedidos(pedidosPortal);

        atualizarIndicadores(pedidosPortal);

        configurarPesquisa();

        configurarModal();

        abrirPesquisaAutomatica();

    } catch (erro) {

        console.error(erro);

        alert("Erro ao carregar pedidos.json");

    }

}

/* ==========================================
   INDICADORES
========================================== */

function atualizarIndicadores(lista){

    let agendados = 0;
    let emAndamento = 0;

    lista.forEach(pedido => {

        if (pedido.status === "Agendado")
            agendados++;

        if (pedido.status === "Em Andamento")
            emAndamento++;

    });

    document.getElementById("qtCriticos").textContent = agendados;
    document.getElementById("qtAguardando").textContent = emAndamento;

}

/* ==========================================
   LISTA DE PEDIDOS
========================================== */

function carregarPedidos(lista) {

    const container = document.getElementById("listaPedidos");

    container.innerHTML = "";

    if (lista.length === 0) {

        container.innerHTML = `
            <div class="sem-pedidos">
                Nenhum pedido encontrado.
            </div>
        `;

        return;

    }

    lista.forEach((pedido) => {

        const dias = calcularDias(pedido.recebido);

        const cor = obterCorDias(dias);

        const card = document.createElement("div");

        card.className = "pedido";

        card.innerHTML = `

            <h2>${pedido.numero}</h2>

            <span>${pedido.companhia}</span>

            <p>
                📅 Recebido ${pedido.recebido}
            </p>

            <p class="dias ${cor}">
                ${iconeStatus(cor)} ${dias} dias em aberto
            </p>

            <p>
                🏢 ${pedido.produto}
            </p>

            <p>
                👤 ${pedido.inspetor}
            </p>

            <div class="status ${classeStatus(pedido.status)}">
                ${pedido.status}
            </div>

            <button class="detalhes">
                VER DETALHES
            </button>

        `;

        card
            .querySelector(".detalhes")
            .addEventListener("click", () => {

                abrirModal(pedido);

            });

        container.appendChild(card);

    });

}

/* ==========================================
   PESQUISA
========================================== */

function configurarPesquisa() {

    const campo = document.getElementById("txtPesquisa");
    const botao = document.getElementById("btnPesquisar");

    if (!campo || !botao) return;

    botao.addEventListener("click", pesquisarPedidos);

    campo.addEventListener("keyup", function(e){

        if(e.key === "Enter"){

            pesquisarPedidos();

        }

    });

}

function pesquisarPedidos() {

    const texto = document
        .getElementById("txtPesquisa")
        .value
        .toLowerCase()
        .trim();

    if (texto === "") {

        carregarPedidos(pedidosPortal);
        atualizarIndicadores(pedidosPortal);
        return;

    }

    const resultado = pedidosPortal.filter(p =>

        p.numero.toLowerCase().includes(texto) ||
        p.companhia.toLowerCase().includes(texto) ||
        p.cidade.toLowerCase().includes(texto) ||
        p.inspetor.toLowerCase().includes(texto) ||
        p.produto.toLowerCase().includes(texto)

    );

    carregarPedidos(resultado);
    atualizarIndicadores(resultado);

}

/* ==========================================
   FUNÇÕES AUXILIARES
========================================== */

function calcularDias(dataTexto){

    if(!dataTexto) return 0;

    const data = new Date(dataTexto);

    if(isNaN(data.getTime())) return 0;

    const hoje = new Date();

    hoje.setHours(0,0,0,0);
    data.setHours(0,0,0,0);

    const diferenca = hoje - data;

    return Math.floor(diferenca / 86400000);

}

function obterCorDias(dias){

    if(dias <= 2) return "verde";

    if(dias <= 4) return "amarelo";

    return "vermelho";

}

function iconeStatus(cor){

    switch(cor){

        case "verde":
            return "🟢";

        case "amarelo":
            return "🟡";

        default:
            return "🔴";

    }

}

function classeStatus(status){

    switch(status){

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

        case "Pendente Km":
            return "pkm";

        default:
            return "";

    }

}

/* ==========================================
   MODAL
========================================== */

function configurarModal() {

    const modal = document.getElementById("modalPedido");
    const fechar = document.getElementById("btnFecharModal");

    fechar.addEventListener("click", fecharModal);

    modal.addEventListener("click", function(e){

        if(e.target === modal){

            fecharModal();

        }

    });

}

function abrirModal(pedido){

    document.getElementById("modalNumero").textContent =
        pedido.numero;

    document.getElementById("modalRecebido").textContent =
        pedido.recebido;

    document.getElementById("modalDias").textContent =
        calcularDias(pedido.recebido) + " dias";

    document.getElementById("modalCompanhia").textContent =
        pedido.companhia;

    document.getElementById("modalProduto").textContent =
        pedido.produto;

    document.getElementById("modalCidade").textContent =
        pedido.cidade;

    document.getElementById("modalInspetor").textContent =
        pedido.inspetor;

    document.getElementById("modalAgendamento").textContent =
        pedido.agendamento || "--";

    configurarStatusModal(pedido.status);

    configurarBotaoWhatsapp(pedido);

    document
        .getElementById("modalPedido")
        .classList
        .add("ativo");

}

function fecharModal(){

    document
        .getElementById("modalPedido")
        .classList
        .remove("ativo");

}

/* ==========================================
   STATUS DO MODAL
========================================== */

function configurarStatusModal(status){

    const statusModal =
        document.getElementById("modalStatus");

    statusModal.className = "status";

    switch(status){

        case "Em Andamento":

            statusModal.classList.add("pendente");
            statusModal.textContent = "Em Andamento";

        break;

        case "Agendado":

            statusModal.classList.add("agendado");
            statusModal.textContent = "Agendado";

        break;

        case "Finalizado":

            statusModal.classList.add("finalizado");
            statusModal.textContent = "Finalizado";

        break;

        case "Comunicado Sys":

            statusModal.classList.add("cobrado");
            statusModal.textContent = "Comunicado Sys";

        break;

        case "Pendente Cia":

            statusModal.classList.add("pcia");
            statusModal.textContent = "Pendente Cia";

        break;

        case "Pendente Km":

            statusModal.classList.add("pkm");
            statusModal.textContent = "Pendente Km";

        break;

        default:

            statusModal.textContent = status;

    }

}

/* ==========================================
   WHATSAPP
========================================== */

function configurarBotaoWhatsapp(pedido){

    const botao =
        document.getElementById("btnWhatsapp");

    if(pedido.status === "Agendado"){

        botao.innerHTML =
            "📄 COBRAR LAUDO";

    }else{

        botao.innerHTML =
            "💬 COBRAR AGENDAMENTO";

    }

    botao.style.display = "block";

    botao.onclick = function(){

        let mensagem = "";

        if(pedido.status === "Agendado"){

            mensagem =
`Olá, ${pedido.inspetor}.

Poderia verificar a situação do pedido ${pedido.numero}?

Consta como AGENDADO e ainda aguardamos o envio do laudo.

Obrigado.

GRI Gerenciamento e Inspeção de Risco`;

        }else{

            mensagem =
`Olá, ${pedido.inspetor}.

Poderia verificar a situação do pedido ${pedido.numero}?

Ainda aguardamos o agendamento.

Obrigado.

GRI Gerenciamento e Inspeção de Risco`;

        }

        const numero = pedido.whatsapp.replace(/\D/g, "");

        const url =
            `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`;

        window.open(url, "_blank");

    };

}

function abrirPesquisaAutomatica(){

    const numero =
        sessionStorage.getItem("pedidoPesquisa");

    if(!numero){

        return;

    }

    const pedido =
        pedidosPortal.find(p =>
            p.numero === numero
        );

    if(pedido){

        abrirModal(pedido);

    }

    sessionStorage.removeItem("pedidoPesquisa");

}

document.addEventListener("DOMContentLoaded", () => {

    carregarSincronizacao();

    document
        .getElementById("btnPesquisar")
        .addEventListener("click", pesquisarPedido);

    document
        .getElementById("pesquisa")
        .addEventListener("keypress", function(e){

            if(e.key === "Enter"){

                pesquisarPedido();

            }

        });

});

function carregarSincronizacao(){

    fetch("../json/portal.json?t=" + new Date().getTime())

    .then(res => res.json())

    .then(json => {

        document.getElementById("dataSync").innerHTML = json.data;

        document.getElementById("horaSync").innerHTML = json.hora;

    })

    .catch(erro => {

        console.error(erro);

    });

}

async function pesquisarPedido(){

    const texto = document
        .getElementById("pesquisa")
        .value
        .trim()
        .toLowerCase();

    if(texto === ""){

        alert("Informe o pedido para pesquisa.");

        return;

    }

    try{

        const resposta = await fetch(
            "../json/pedidos.json?t=" + new Date().getTime()
        );

        const pedidos = await resposta.json();

        const pedido = pedidos.find(p =>

            p.numero.toLowerCase().includes(texto) ||
            p.cidade.toLowerCase().includes(texto) ||
            p.companhia.toLowerCase().includes(texto) ||
            p.inspetor.toLowerCase().includes(texto)

        );

        if(!pedido){

            alert("Pedido não encontrado.");

            return;

        }

        sessionStorage.setItem(
            "pedidoPesquisa",
            pedido.numero
        );

        window.location.href = "pedidos.html";

    }

    catch(erro){

        console.error(erro);

        alert("Erro ao pesquisar o pedido.");

    }

}
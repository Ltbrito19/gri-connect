document.addEventListener("DOMContentLoaded", () => {

    carregarSincronizacao();

    document
        .getElementById("btnPesquisar")
        .addEventListener("click", pesquisarPedido);

    document
        .getElementById("pesquisa")
        .addEventListener("keypress", function(e){

            if(e.key==="Enter"){

                pesquisarPedido();

            }

        });

});

function carregarSincronizacao(){

    fetch("../json/portal.json")

    .then(res=>res.json())

    .then(json=>{

        document.getElementById("dataSync").innerHTML=json.data;

        document.getElementById("horaSync").innerHTML=json.hora;

    });

}

function pesquisarPedido(){

    let pesquisa=document
        .getElementById("pesquisa")
        .value
        .trim();

    if(pesquisa===""){

        alert("Informe o pedido para pesquisa.");

        return;

    }

    alert("Pesquisa: "+pesquisa);

}
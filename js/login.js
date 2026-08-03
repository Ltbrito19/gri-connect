document.addEventListener("DOMContentLoaded", () => {

    const usuario = document.getElementById("usuario");
    const senha = document.getElementById("senha");

    const form = document.getElementById("loginForm");

    const btn = document.getElementById("btnEntrar");

    const loading = document.getElementById("loading");

    const dataSync = document.getElementById("dataSync");

    const horaSync = document.getElementById("horaSync");

    carregarSincronizacao();

    usuario.focus();

    senha.addEventListener("keypress", function (e) {

        if (e.key === "Enter") {

            e.preventDefault();

            form.requestSubmit();

        }

    });

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        if (usuario.value.trim() === "") {

            alert("Informe o usuário.");

            usuario.focus();

            return;

        }

        if (senha.value.trim() === "") {

            alert("Informe a senha.");

            senha.focus();

            return;

        }

        btn.disabled = true;

        btn.innerHTML = "CONECTANDO...";

        form.style.display = "none";

        loading.classList.remove("oculto");

        setTimeout(function () {

            window.location.href = "html/home.html";

        }, 3000);

    });

    function carregarSincronizacao() {

        fetch("json/portal.json")

            .then(response => response.json())

            .then(json => {

                dataSync.innerHTML = json.data;

                horaSync.innerHTML = json.hora;

            })

            .catch(() => {

                dataSync.innerHTML = "--/--/----";

                horaSync.innerHTML = "--:--";

            });

    }

});
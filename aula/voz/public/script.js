const botao = document.getElementById("enviar");
const textarea = document.getElementById("texto");
const audio = document.getElementById("audio");

botao.addEventListener("click", async () => {

    const texto = textarea.value;

    if (!texto.trim()) {
        alert("Digite algum texto.");
        return;
    }

    botao.disabled = true;
    botao.innerText = "Gerando áudio...";

    try {

        const resposta = await fetch("/voz", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                texto
            })

        });

        const dados = await resposta.json();
        audio.src = dados.audio;
        audio.load();
        audio.play();

    }

    catch (erro) {

        alert("Erro ao gerar áudio.");
        console.error(erro);

    }

    finally {

        botao.disabled = false;
        botao.innerText = "Enviar";

    }

});
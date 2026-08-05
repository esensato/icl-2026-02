const adicionar = document.getElementById("adicionar");
const listaLivros = document.getElementById("livros");
const listaSelecionados = document.getElementById("selecionados");

adicionar.onclick = () => {

    const livro = listaLivros.value;

    for (let option of listaSelecionados.options) {

        if (option.value === livro)
            return;

    }

    const opt = document.createElement("option");

    opt.text = livro;
    opt.value = livro;

    listaSelecionados.appendChild(opt);

};

document.getElementById("confirmar").onclick = async () => {

    const nome = document.getElementById("nome").value.trim();

    if (!nome) {

        alert("Informe seu nome.");

        return;

    }

    const livros = [];

    for (let option of listaSelecionados.options)
        livros.push(option.value);

    if (livros.length === 0) {

        alert("Selecione pelo menos um livro.");

        return;

    }

    const pedido = {

        nome,
        livros

    };

    const resposta = await fetch("/pedido", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify(pedido)

    });

    const json = await resposta.json();

    document.getElementById("resultado").innerHTML =
        json.mensagem;

    console.log(json);

};
const botao = document.getElementById("buscarPedidos");
const cards = document.getElementById("cardsPedidos");
const mensagem = document.getElementById("mensagemFila");

botao.addEventListener("click", async () => {

    mensagem.textContent = "";

    const resposta = await fetch("/pedido");

    const pedido = await resposta.json();

    if (pedido === "") {

        mensagem.textContent =
            "Não existem mais pedidos para serem processados na fila";

        return;
    }

    const card = document.createElement("div");
    card.className = "pedido-card";

    const titulo = document.createElement("h3");
    titulo.textContent = "👤 " + pedido.nome;

    const lista = document.createElement("ul");

    pedido.livros.forEach(livro => {

        const li = document.createElement("li");
        li.textContent = livro;
        lista.appendChild(li);

    });

    card.appendChild(titulo);
    card.appendChild(lista);

    cards.prepend(card);

});
### AV-ICL-02-Azure

- Uma empresa quer desenvolver uma pequena aplicação para avaliar o sentimento de seus clientes a partir de comentários deixados em seu site
- Um *end-point* foi disponibilizado para obter, de forma aleatória, tais comentários: `https://backend-n75y.onrender.com/comentarios`
- Desta maneira, utilizando os recursos da **Azure** implementar:
    - Uma *timer function* que consulta o *end-point* a cada 10 segundos e obtém o comentário
    - O comentário deve ser analisado pela API *cognitive service* para avaliar o sentimento inferido do comentário: *positive*, *neutral* ou *negative*
    - O resultado da análise deve ser encaminhado para uma fila implementada por uma *queue function* que, ao receber o resultado, deve inserir em uma tabela de banco de dados **SQL Server** também hospedado na *Azure*
    - Finalmente, uma *http function* deverá listar os totais de sentimentos registrados no banco de dados, retornando os valores em um JSON: `{ positive: 0, neutral: 0, negative: 1 }`

- Entrega: 

    - link para repositório *git* com as implementações
    - incluir num arquivo .md (README, por exemplo) dentro do repo a lista de todos os comandos que foram executados para a criação dos recursos na **Azure**
    - link para acesso ao *end-point* para visualizar os totais de sentimentos registrados no banco de dados (último item de implementação)
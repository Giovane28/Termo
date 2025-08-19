// ESTADOS DO JOGO
// Armazena o estado de cada linha de cada coluna (6 tentativas, 5 letras)
const estadoDoJogo1 = Array.from({ length: 6 }, () => ['', '', '', '', '']);
const estadoDoJogo2 = Array.from({ length: 6 }, () => ['', '', '', '', '']);

// PALAVRAS CERTAS
// Palavra correta de cada coluna
const palavraCerta1 = ['P', 'E', 'T', 'S', 'I'];
const palavraCerta2 = ['J', 'O', 'G', 'O', 'S'];

// VARIÁVEIS DE CONTROLE
let tentativaAtual = 0;
let coluna1Acertada = false;
let coluna2Acertada = false;

// FUNÇÕES AUXILIARES
// Bloqueia inputs que já foram classificados (correta, presente, ausente)
function bloquearInputsClassificados() {
    const todasAsLetras = document.querySelectorAll('.quadrado');
    todasAsLetras.forEach(input => {
        if (input.classList.contains('correta') ||
            input.classList.contains('presente') ||
            input.classList.contains('ausente')) {
            input.disabled = true;
        } else {
            input.disabled = false;
        }
    });
}

// Verifica o status de uma coluna: correta, presente ou ausente
function verificarStatusColuna(inputs, palavraCerta, estadoDoJogo, tentativaAtual) {
    let status = [];
    let status_do_jogo = true;

    // Contar ocorrência de cada letra na palavra secreta
    let contagem = {};
    palavraCerta.forEach(l => contagem[l] = (contagem[l] || 0) + 1);

    // 1ª passagem: marcar corretas
    inputs.forEach((input, index) => {
        const letraDigitada = input.value.toUpperCase();
        if (letraDigitada === palavraCerta[index]) {
            input.classList.add('correta');
            status.push('correta');
            contagem[letraDigitada]--;
        } else {
            status.push(null); // indefinido por enquanto
            status_do_jogo = false;
        }
    });

    // 2ª passagem: marcar presentes ou ausentes
    inputs.forEach((input, index) => {
        if (status[index] === null) {
            const letraDigitada = input.value.toUpperCase();
            if (contagem[letraDigitada] > 0) {
                input.classList.add('presente');
                contagem[letraDigitada]--;
            } else {
                input.classList.add('ausente');
            }
        }
    });

    if (!status_do_jogo) estadoDoJogo[tentativaAtual] = status;
    return status_do_jogo;
}

// Remove a classe "espera" da linha indicada
function reinicializarLinha(tentativa, blocoId) {
    const inputs = document.querySelectorAll(`#${blocoId} .linha`)[tentativa].querySelectorAll('.quadrado');
    inputs.forEach(input => input.classList.remove('espera'));
}

// Verifica se todos os quadrados de uma linha foram preenchidos
function linhaCompleta(inputs) {
    return Array.from(inputs).every(input => input.value !== '');
}

// Move o foco para o próximo quadrado vazio da linha
function focarProximoVazio(blocoId) {
    const inputs = document.querySelectorAll(`#${blocoId} .linha`)[tentativaAtual].querySelectorAll('.quadrado');
    for (let input of inputs) {
        if (input.value === '' && !input.disabled) {
            input.focus();
            return;
        }
    }
    inputs[inputs.length - 1].blur();
}

// Preenche a letra no quadrado ativo e espelha para a outra coluna se necessário
function preencherLetra(letra) {
    const inputsColuna1 = document.querySelectorAll(`#bloco1 .linha`)[tentativaAtual].querySelectorAll('.quadrado');
    const inputsColuna2 = document.querySelectorAll(`#bloco2 .linha`)[tentativaAtual].querySelectorAll('.quadrado');

    const inputAtual = document.activeElement;
    if (!inputAtual.classList.contains('quadrado')) return;

    const idx1 = Array.from(inputsColuna1).indexOf(inputAtual);
    const idx2 = Array.from(inputsColuna2).indexOf(inputAtual);

    // Preenche coluna correspondente ao input ativo, se não estiver acertada
    if (idx1 !== -1 && !coluna1Acertada) inputsColuna1[idx1].value = letra;
    if (idx2 !== -1 && !coluna2Acertada) inputsColuna2[idx2].value = letra;

    // Espelha a letra na outra coluna se nenhuma coluna estiver acertada
    if (!coluna1Acertada && !coluna2Acertada) {
        if (idx1 !== -1 && idx2 === -1) inputsColuna2[idx1].value = letra;
        if (idx2 !== -1 && idx1 === -1) inputsColuna1[idx2].value = letra;
    }

    // Move foco para o próximo quadrado
    let proximo = idx1 !== -1 ? idx1 + 1 : idx2 + 1;
    const linha = idx1 !== -1 ? inputsColuna1 : inputsColuna2;
    if (proximo < linha.length) linha[proximo].focus();
    else linha[linha.length - 1].blur();
}

// Deleta a última letra preenchida na linha, respeitando colunas já acertadas
function deletarLetra() {
    const inputsColuna1 = document.querySelectorAll(`#bloco1 .linha`)[tentativaAtual].querySelectorAll('.quadrado');
    const inputsColuna2 = document.querySelectorAll(`#bloco2 .linha`)[tentativaAtual].querySelectorAll('.quadrado');

    // Itera de trás para frente nas duas colunas
    [inputsColuna2, inputsColuna1].forEach(inputs => {
        if (inputs === inputsColuna1 && coluna1Acertada) return;
        if (inputs === inputsColuna2 && coluna2Acertada) return;

        for (let i = inputs.length - 1; i >= 0; i--) {
            if (inputs[i].value !== '') {
                inputs[i].value = '';
                inputs[i].focus();
                return;
            }
        }
    });
}

// Avalia a linha atual e avança a tentativa e move o foco para a primeira coluna não acertada da linha seguinte
function processarEnter() {
    const inputsColuna1 = document.querySelectorAll(`#bloco1 .linha`)[tentativaAtual].querySelectorAll('.quadrado');
    const inputsColuna2 = document.querySelectorAll(`#bloco2 .linha`)[tentativaAtual].querySelectorAll('.quadrado');

    let linhaFoiAvaliadas = false;

    // Avalia cada coluna se não estiver acertada e se a linha estiver completa
    if (!coluna1Acertada && linhaCompleta(inputsColuna1)) {
        coluna1Acertada = verificarStatusColuna(inputsColuna1, palavraCerta1, estadoDoJogo1, tentativaAtual);
        linhaFoiAvaliadas = true;
    }
    if (!coluna2Acertada && linhaCompleta(inputsColuna2)) {
        coluna2Acertada = verificarStatusColuna(inputsColuna2, palavraCerta2, estadoDoJogo2, tentativaAtual);
        linhaFoiAvaliadas = true;
    }

    if (linhaFoiAvaliadas) {
        // Se ambas colunas estiverem corretas
        if (coluna1Acertada && coluna2Acertada) {
            document.querySelectorAll('.quadrado').forEach(el => el.disabled = true);
            alert("Parabéns! Você acertou as duas palavras!");
            return;
        }

        // Avança a linha
        if (tentativaAtual < 5) {
            tentativaAtual++;
            if (!coluna1Acertada) reinicializarLinha(tentativaAtual, 'bloco1');
            if (!coluna2Acertada) reinicializarLinha(tentativaAtual, 'bloco2');

            // Foco no primeiro quadrado da linha da coluna não acertada
            if (!coluna1Acertada) {
                document.querySelectorAll(`#bloco1 .linha`)[tentativaAtual].querySelectorAll('.quadrado')[0].focus();
            } else if (!coluna2Acertada) {
                document.querySelectorAll(`#bloco2 .linha`)[tentativaAtual].querySelectorAll('.quadrado')[0].focus();
            }
        } else {
            // Fim de jogo
            alert(`Fim de jogo! As palavras eram: ${palavraCerta1.join('')} e ${palavraCerta2.join('')}`);
        }
    }
}

// TECLADO FÍSICO
document.addEventListener('keydown', (e) => {
    const letra = e.key.toUpperCase();
    const inputsColuna1 = document.querySelectorAll(`#bloco1 .linha`)[tentativaAtual].querySelectorAll('.quadrado');
    const inputsColuna2 = document.querySelectorAll(`#bloco2 .linha`)[tentativaAtual].querySelectorAll('.quadrado');
    const todas = [...inputsColuna1, ...inputsColuna2];
    let inputAtual = document.activeElement;

    // Letras 
    if (/^[A-ZÇ]$/.test(letra)) {
        e.preventDefault();
        preencherLetra(letra);
    } 
    // Backspace
    else if (e.key === 'Backspace') {
        e.preventDefault();
        deletarLetra();
    } 
    // Enter
    else if (e.key === 'Enter') {
        e.preventDefault();
        processarEnter();
    } 
    // Espaço funciona como Tab
    else if (e.key === ' ') {
        e.preventDefault();
        let idx = todas.indexOf(inputAtual);
        if (idx !== -1) {
            let proximo = (idx + 1) % todas.length;
            todas[proximo].focus();
        }
    } 
    // Setas
    else if (e.key === 'ArrowRight') {
        e.preventDefault();
        let idx = todas.indexOf(inputAtual);
        if (idx !== -1 && idx < todas.length - 1) todas[idx + 1].focus();
    } 
    else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        let idx = todas.indexOf(inputAtual);
        if (idx > 0) todas[idx - 1].focus();
    } 
    else {
        e.preventDefault(); // bloqueia símbolos e números
    }
});

// TECLADO VIRTUAL
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa todos os quadrados
    document.querySelectorAll('.quadrado').forEach(input => {
        input.value = '';
        input.classList.remove('correta', 'presente', 'ausente');
        input.disabled = false;
    });

    // Adiciona classe 'espera' para linhas que não estão ativas
    for (let linha = 1; linha <= 5; linha++) {
        document.querySelectorAll(`#L${linha} .quadrado`).forEach(input => input.classList.add('espera'));
    }
    document.querySelectorAll('#L0 .quadrado').forEach(input => input.classList.remove('espera'));

    bloquearInputsClassificados();

    // Foco inicial
    document.querySelector('#L0 .quadrado').focus();

    // Configura botões do teclado virtual
    document.querySelectorAll('.teclado').forEach(botao => {
        botao.addEventListener('click', () => {
            const letra = botao.textContent.trim().toUpperCase();
            preencherLetra(letra);
        });
    });

    const deletarBotao = document.querySelector('#letras .delete');
    if (deletarBotao) deletarBotao.addEventListener('click', deletarLetra);

    const enterBotao = document.querySelector('#letras .enter');
    if (enterBotao) enterBotao.addEventListener('click', processarEnter);
});
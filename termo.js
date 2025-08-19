// Estado do jogo
// Matriz que armazena o estado de cada letra em cada tentativa (6 tentativas, 5 letras por tentativa)
const estadoDoJogo = [
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']
];

// Palavra correta
// Array que contém a palavra que deve ser adivinhada
const palavraCerta = ['C', 'A', 'S', 'A', 'R'];

// Contadores de tentativa
// Variável para controlar a tentativa atual (linha em que o jogador está)
// Variável para controlar a letra atual (posição dentro da linha)
let tentativaAtual = 0;
let letraAtual = 0;

// Função para bloquear inputs já classificados
// Desativa inputs que já receberam alguma classificação (correta, presente ou ausente)
function bloquearInputsClassificados() {
    const todasAsLetras = document.querySelectorAll('.quadrado'); // seleciona todos os quadrados
    todasAsLetras.forEach(input => {
        if (
            input.classList.contains('correta') ||
            input.classList.contains('espera') ||
            input.classList.contains('presente') ||
            input.classList.contains('ausente')
        ) {
            input.disabled = true; // bloqueia o input se já classificado
        } else {
            input.disabled = false; // mantém desbloqueado se não classificado
        }
    });
}

// Função para verificar o status da tentativa
// Retorna true se o jogador acertou a palavra inteira
function verificarStatus() {
    const inputs = document.querySelectorAll(`#L${tentativaAtual} .quadrado`); // quadrados da linha atual

    let status = []; // array que vai guardar o status de cada letra
    let status_do_jogo = true; // assume que a palavra está correta

    // Conta quantas vezes cada letra aparece na palavra correta
    let contagem = {};
    palavraCerta.forEach(letra => {
        contagem[letra] = (contagem[letra] || 0) + 1;
    });

    // Primeira passada: verifica letras corretas na posição correta
    inputs.forEach((input, index) => {
        const letraDigitada = input.value.toUpperCase();
        const letraSecreta = palavraCerta[index];

        if (letraDigitada === letraSecreta) {
            input.classList.add('correta'); // marca letra correta
            status.push('correta');
            contagem[letraDigitada]--; // reduz a contagem da letra
        } else {
            status.push(null); // ainda indefinido (vai verificar se está presente em outra posição)
            status_do_jogo = false; // a palavra ainda não está completa
        }
    });

    // Segunda passada: verifica letras que estão na palavra mas na posição errada
    inputs.forEach((input, index) => {
        if (status[index] === null) { // apenas letras ainda não classificadas
            const letraDigitada = input.value.toUpperCase();

            if (contagem[letraDigitada] > 0) {
                input.classList.add('presente'); // letra presente mas na posição errada
                status[index] = 'presente';
                contagem[letraDigitada]--; // reduz a contagem da letra
            } else {
                input.classList.add('ausente'); // letra não existe na palavra
                status[index] = 'ausente';
            }
        }
    });

    // Atualiza o estado do jogo na matriz
    if (!status_do_jogo) {
        estadoDoJogo[tentativaAtual] = status;
    }

    return status_do_jogo; // retorna true se a palavra inteira estiver correta
}

// Função para reinicializar a linha de espera
// Remove a classe 'espera' dos quadrados da linha
function reinicializarLinha(tentativaAtual) {
    const inputs = document.querySelectorAll(`#L${tentativaAtual} .quadrado`);
    inputs.forEach((input, index) => {
        input.classList.remove('espera');
    });
}

// Listener para teclado físico
// Controla digitação de letras, backspace, enter, espaço e setas
document.addEventListener('keydown', (e) => {
    const letra = e.key.toUpperCase(); // transforma tecla em maiúscula
    const inputs = document.querySelectorAll(`#L${tentativaAtual} .quadrado`); // linha atual
    let inputAtual = document.activeElement; // input atualmente em foco

    // Digitar letras A-Z e Ç
    if (/^[A-ZÇ]$/i.test(letra)) {
        e.preventDefault(); // impede comportamento padrão
        if (inputAtual && inputAtual.classList.contains("quadrado") && !inputAtual.disabled) {
            inputAtual.value = letra.toUpperCase(); // insere letra

            // Foca no próximo quadrado vazio
            for (let j = Array.from(inputs).indexOf(inputAtual) + 1; j < inputs.length; j++) {
                if (inputs[j].value === '' && !inputs[j].disabled) {
                    inputs[j].focus();
                    break;
                }
            }
        }
    }

    // Backspace
    else if (e.key === 'Backspace') {
        e.preventDefault();
        if (inputAtual && inputAtual.classList.contains("quadrado") && !inputAtual.disabled) {
            if (inputAtual.value !== '') {
                inputAtual.value = ''; // apaga letra atual
            } else {
                // volta para o quadrado anterior se estiver vazio
                let idx = Array.from(inputs).indexOf(inputAtual);
                for (let j = idx - 1; j >= 0; j--) {
                    if (!inputs[j].disabled) {
                        inputs[j].value = '';
                        inputs[j].focus();
                        break;
                    }
                }
            }
        }
    }

    // Enter
    else if (e.key === 'Enter') {
        e.preventDefault();
        if ([...inputs].every(inp => inp.value)) { // verifica se todos os inputs estão preenchidos
            let status_do_jogo = verificarStatus(); // verifica acertos

            if (status_do_jogo) {
                // desabilita todos os quadrados se acertou
                document.querySelectorAll('.quadrado').forEach(el => el.disabled = true);
                alert("Parabéns! Você acertou!");
                return;
            }

            // Passa para a próxima tentativa
            if (tentativaAtual < 5) {
                tentativaAtual++;
                letraAtual = 0;
                reinicializarLinha(tentativaAtual); // remove 'espera' da linha
                bloquearInputsClassificados(); // bloqueia letras já classificadas
                document.querySelector(`#L${tentativaAtual} .quadrado`).focus(); // foca no primeiro quadrado da linha
            } else {
                alert(`Fim de jogo! A palavra era: ${palavraCerta.join('')}`);
            }
        }
    }

    // Espaço funciona como Tab
    else if (e.key === ' ') {
        e.preventDefault();
        if (inputAtual && inputAtual.classList.contains("quadrado")) {
            let idx = Array.from(inputs).indexOf(inputAtual);
            let proximo = (idx + 1) % inputs.length; // volta para o primeiro se estiver no último
            inputs[proximo].focus();
        }
    }

    // Setas para mover foco
    else if (e.key === "ArrowRight") {
        e.preventDefault();
        let idx = Array.from(inputs).indexOf(inputAtual);
        if (idx < inputs.length - 1) inputs[idx + 1].focus();
    } 
    else if (e.key === "ArrowLeft") {
        e.preventDefault();
        let idx = Array.from(inputs).indexOf(inputAtual);
        if (idx > 0) inputs[idx - 1].focus();
    }
    else {
        e.preventDefault(); // impede qualquer tecla não prevista
    }
});

// Clique no quadrado foca o input
document.querySelectorAll('.quadrado').forEach(input => {
    input.addEventListener('click', () => {
        if (!input.disabled) input.focus();
    });
});

// Inicialização do jogo
document.addEventListener('DOMContentLoaded', () => {
    
    // Limpa todos os quadrados e remove classes de status
    document.querySelectorAll('.quadrado').forEach(input => {
        input.value = '';
        input.classList.remove('correta', 'presente', 'ausente');
        input.disabled = false;
    });

    // Marca as linhas 1 a 5 como 'espera'
    for (let linha = 1; linha <= 5; linha++) {
        document.querySelectorAll(`#L${linha} .quadrado`).forEach(input => {
            input.classList.add('espera');
        });
    }
    // Remove 'espera' da primeira linha
    document.querySelectorAll('#L0 .quadrado').forEach(input => {
        input.classList.remove('espera');
    });

    tentativaAtual = 0;
    letraAtual = 0;

    bloquearInputsClassificados(); // bloqueia inputs conforme necessário
    document.querySelector('#L0 .quadrado').focus(); // foca no primeiro quadrado

    // Clique no teclado virtual
    document.querySelectorAll('.teclado').forEach(botao => {
        botao.addEventListener('click', () => {
            const letra = botao.textContent.trim().toUpperCase();
            const inputs = document.querySelectorAll(`#L${tentativaAtual} .quadrado`);
            
            for (let i = 0; i < inputs.length; i++) {
                if (inputs[i].value === '' && !inputs[i].disabled) {
                    inputs[i].value = letra;
                    for (let j = i + 1; j < inputs.length; j++) {
                        if (inputs[j].value === '' && !inputs[j].disabled) {
                            inputs[j].focus();
                            break;
                        }
                    }
                    break;
                }
            }   
        });
    });
});

// Tecla Enter virtual
const enter = document.querySelector('#letras .enter');
if (enter) enter.addEventListener('click', () => {
    const eventoFake = new KeyboardEvent('keydown', { key: 'Enter' });
    document.dispatchEvent(eventoFake);
});

// Tecla Delete virtual
const deletar = document.querySelector('#letras .delete');
if(deletar) deletar.addEventListener('click', () => {
    const inputs = document.querySelectorAll(`#L${tentativaAtual} .quadrado`);
    for (let i = inputs.length - 1; i >= 0; i--) {
        if (inputs[i].disabled) continue;
        if (inputs[i].value !== '') {
            inputs[i].value = '';
            break;
        }
    };
});
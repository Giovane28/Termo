const estadoDoJogo = [
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']
];

const palavraCerta = ['M', 'E', 'I', 'A', 'O'];

let tentativaAtual = 0;
let letraAtual = 0;

function bloquearInputsClassificados() {
    const todasAsLetras = document.querySelectorAll('.quadrado');
    todasAsLetras.forEach(input => {
        if (
            input.classList.contains('correta') ||
            input.classList.contains('espera') ||
            input.classList.contains('presente') ||
            input.classList.contains('ausente')
        ) {
            input.disabled = true;
        }
        else {
            input.disabled = false;
        }
    })
}

function verificarStatus() {
    const inputs = document.querySelectorAll(`#L${tentativaAtual} .quadrado`);
    
    let status = []

    let status_do_jogo = true;

    inputs.forEach((input, index) => {
        const letraDigitada = input.value.toUpperCase();
        const letraSecreta = palavraCerta[index];

        if (letraDigitada==letraSecreta) {
            input.classList.add('correta');
            status.push('correta');
        } else if (palavraCerta.includes(letraDigitada)) {
            input.classList.add('presente');
            status.push('presente')
            status_do_jogo = false;
        } else {
            input.classList.add('ausente');
            status.push('ausente')
            status_do_jogo = false;
        }
    });

    if(!status_do_jogo) {
        estadoDoJogo[tentativaAtual] = status;
    }

    return status_do_jogo;
}

 function reinicializarLinha(tentativaAtual) {
    const inputs = document.querySelectorAll(`#L${tentativaAtual} .quadrado`);

    inputs.forEach((input, index) => {
        input.classList.remove('espera');
    });
 }

 document.addEventListener('keydown', (e) => {
	
    if (e.key === 'Enter') {
        const inputs = document.querySelectorAll(`#L${tentativaAtual} .quadrado`);
        
        if (
				inputs[0].value !== '' &&
				inputs[1].value !== '' &&
				inputs[2].value !== '' &&
				inputs[3].value !== '' &&
				inputs[4].value !== ''
			) {
			
            let status_do_jogo = verificarStatus();

            if(status_do_jogo){
                document.querySelectorAll('.quadrado').forEach(elemento => elemento.disabled = true);
                return;
            }

            if (tentativaAtual < 5) {
                tentativaAtual++;
                letraAtual = 0;
				reinicializarLinha(tentativaAtual);
                bloquearInputsClassificados();
                document.querySelector(`#L${tentativaAtual} .quadrado`).focus();
            }
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    
    bloquearInputsClassificados();

    document.querySelectorAll('.teclado').forEach(botao => {
        botao.addEventListener('click', () => {
            const letra = botao.textContent.trim().toUpperCase();
            const inputs = document.querySelectorAll(`#L${tentativaAtual} .quadrado`);
            
            for (let i = 0; i < inputs.length; i++) {
                if (inputs[i].value === '' && !inputs[i].disabled) {
                    inputs[i].value = letra;
                    break;
                }
            }
        });
    });
});

const enter = document.querySelector('#letras .enter');
if(enter) enter.addEventListener('click', () => {

    const eventoEnter = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true,
    });
    document.dispatchEvent(eventoEnter);
});

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
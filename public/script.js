// =============================
// CONFIGURAÇÕES DO JOGO
// =============================

let tempoRestante = 30;
let pontos = 0;
let vidas = 3;

let tempoMosquito = 1500;

let cronometroInterval = null;
let spawnInterval = null;


// URL da API
const API_URL = '/api/ranking';


// =============================
// ELEMENTOS DA CÂMERA
// =============================

const cameraVideo =
    document.getElementById('camera');

const cameraStatus =
    document.getElementById('camera-status');


// =============================
// VARIÁVEIS DA MÃO
// =============================

let maoDetectada = false;

let maoX = 0;
let maoY = 0;


// =============================
// RECONHECIMENTO DA MÃO
// =============================

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});


hands.setOptions({
    maxNumHands: 1,

    modelComplexity: 1,

    minDetectionConfidence: 0.6,

    minTrackingConfidence: 0.6
});


hands.onResults((resultado) => {

    if (
        resultado.multiHandLandmarks &&
        resultado.multiHandLandmarks.length > 0
    ) {

        const pontosMao =
            resultado.multiHandLandmarks[0];


        // Ponta do dedo indicador
        const dedoIndicador =
            pontosMao[8];


        // Coordenadas do dedo na câmera
        const x =
            dedoIndicador.x;

        const y =
            dedoIndicador.y;


        // Converte a posição para a tela
        maoX =
            (1 - x) *
            window.innerWidth;

        maoY =
            y *
            window.innerHeight;


        maoDetectada = true;


        // =============================
        // MOVER A MIRA
        // =============================

        const mira =
            document.getElementById('mira');


        if (mira) {

            mira.style.left =
                `${maoX}px`;

            mira.style.top =
                `${maoY}px`;

            mira.style.display =
                'flex';
        }


        cameraStatus.innerText =
            '✋ Mão detectada';


        // Verifica se acertou o mosquito
        verificarColisaoMao();


    } else {

        maoDetectada = false;


        const mira =
            document.getElementById('mira');


        if (mira) {
            mira.style.display = 'none';
        }


        cameraStatus.innerText =
            '🔍 Procurando sua mão';
    }

});


// =============================
// INICIAR CÂMERA
// =============================

async function iniciarCamera() {

    try {

        const camera =
            new Camera(
                cameraVideo,
                {
                    onFrame: async () => {

                        await hands.send({
                            image: cameraVideo
                        });

                    },

                    width: 640,

                    height: 480
                }
            );


        camera.start();


        cameraStatus.innerText =
            '📷 Câmera ligada';


    } catch (erro) {

        console.error(
            'Erro ao acessar câmera:',
            erro
        );


        cameraStatus.innerText =
            '❌ Erro na câmera';
    }
}


// Inicia a câmera
iniciarCamera();


// =============================
// CARREGAR RANKING
// =============================

document.addEventListener(
    'DOMContentLoaded',
    carregarRanking
);


async function carregarRanking() {

    const tabela =
        document.getElementById(
            'tabela-ranking'
        );


    tabela.innerHTML =
        '<tr><td colspan="4">Carregando ranking...</td></tr>';


    try {

        const resposta =
            await fetch(API_URL);


        if (!resposta.ok) {

            throw new Error(
                'Erro ao buscar ranking'
            );
        }


        const dados =
            await resposta.json();


        tabela.innerHTML = '';


        if (dados.length === 0) {

            tabela.innerHTML =
                '<tr><td colspan="4">Nenhum registro encontrado.</td></tr>';

            return;
        }


        dados.forEach((item, index) => {

            const linha =
                document.createElement('tr');


            linha.innerHTML = `
                <td>
                    <strong>
                        #${index + 1}
                    </strong>
                </td>

                <td>
                    ${item.nickname}
                </td>

                <td>
                    ${item.pontos} pts
                </td>

                <td>
                    ${item.data_formatada || '-'}
                </td>
            `;


            tabela.appendChild(linha);

        });


    } catch (erro) {

        console.error(
            'Erro:',
            erro
        );


        tabela.innerHTML =
            '<tr><td colspan="4">Erro ao carregar o ranking.</td></tr>';
    }
}


// =============================
// INICIAR JOGO
// =============================

function iniciarJogo() {

    tempoMosquito =
        parseInt(
            document.getElementById(
                'dificuldade'
            ).value
        );


    pontos = 0;

    vidas = 3;

    tempoRestante = 30;


    atualizarVidasUI();


    document.getElementById(
        'pontos-atuais'
    ).innerText = pontos;


    document.getElementById(
        'tempo'
    ).innerText = tempoRestante;


    document.getElementById(
        'tela-inicial'
    ).classList.add('hidden');


    document.getElementById(
        'modal-game-over'
    ).classList.add('hidden');


    document.getElementById(
        'tela-jogo'
    ).classList.remove('hidden');


    // Cronômetro
    cronometroInterval =
        setInterval(
            atualizarCronometro,
            1000
        );


    // Primeiro mosquito
    criarMosquito();


    // Próximos mosquitos
    spawnInterval =
        setInterval(
            criarMosquito,
            tempoMosquito
        );
}


// =============================
// CRIAR MOSQUITO
// =============================

function criarMosquito() {

    const mosquitoExistente =
        document.getElementById(
            'mosquito'
        );


    // Se o mosquito anterior não foi pego
    if (mosquitoExistente) {

        mosquitoExistente.remove();

        vidas--;

        atualizarVidasUI();


        if (vidas <= 0) {

            finalizarJogo(false);

            return;
        }
    }


    const palco =
        document.getElementById(
            'palco-jogo'
        );


    const mosquito =
        document.createElement('img');


    // Imagem do mosquito
    mosquito.src =
        'imagens/mosquito.png';


    // Caso a imagem não seja encontrada
    mosquito.onerror = () => {

        mosquito.src =
            'data:image/svg+xml;utf8,' +
            '<svg xmlns="http://www.w3.org/2000/svg" ' +
            'viewBox="0 0 100 100">' +
            '<circle cx="50" cy="50" r="40" ' +
            'fill="%23e94560"/>' +
            '</svg>';
    };


    mosquito.id =
        'mosquito';


    mosquito.className =
        `mosquito ${tamanhoAleatorio()} ${ladoAleatorio()}`;


    // =============================
    // POSIÇÃO ALEATÓRIA
    // =============================

    const larguraMax =
        window.innerWidth - 100;


    const alturaMax =
        window.innerHeight - 170;


    const posX =
        Math.max(
            10,
            Math.floor(
                Math.random() * larguraMax
            )
        );


    const posY =
        Math.max(
            10,
            Math.floor(
                Math.random() * alturaMax
            )
        );


    mosquito.style.left =
        `${posX}px`;


    mosquito.style.top =
        `${posY}px`;


    // =============================
    // PEGAR COM O MOUSE
    // =============================

    mosquito.onclick = function () {

        pegarMosquito();

    };


    palco.appendChild(mosquito);
}


// =============================
// TAMANHO ALEATÓRIO
// =============================

function tamanhoAleatorio() {

    const classe =
        Math.floor(
            Math.random() * 3
        );


    return `tam${classe}`;
}


// =============================
// LADO ALEATÓRIO
// =============================

function ladoAleatorio() {

    return Math.random() < 0.5
        ? 'ladoA'
        : 'ladoB';
}


// =============================
// PEGAR MOSQUITO
// =============================

function pegarMosquito() {

    const mosquito =
        document.getElementById(
            'mosquito'
        );


    if (!mosquito) {
        return;
    }


    // Adiciona 10 pontos
    pontos += 10;


    document.getElementById(
        'pontos-atuais'
    ).innerText = pontos;


    // Remove o mosquito
    mosquito.remove();
}


// =============================
// COLISÃO DA MÃO
// =============================

function verificarColisaoMao() {

    if (!maoDetectada) {
        return;
    }


    const mosquito =
        document.getElementById(
            'mosquito'
        );


    if (!mosquito) {
        return;
    }


    const areaMosquito =
        mosquito.getBoundingClientRect();


    // Centro do mosquito
    const mosquitoX =
        areaMosquito.left +
        areaMosquito.width / 2;


    const mosquitoY =
        areaMosquito.top +
        areaMosquito.height / 2;


    // Distância entre dedo e mosquito
    const distanciaX =
        maoX - mosquitoX;


    const distanciaY =
        maoY - mosquitoY;


    const distancia =
        Math.sqrt(
            distanciaX * distanciaX +
            distanciaY * distanciaY
        );


    const tamanhoMosquito =
        Math.max(
            areaMosquito.width,
            areaMosquito.height
        );


    // Se o dedo chegar perto
    if (
        distancia <
        tamanhoMosquito / 2 + 70
    ) {

        pegarMosquito();
    }
}


// =============================
// ATUALIZAR VIDAS
// =============================

function atualizarVidasUI() {

    for (
        let i = 1;
        i <= 3;
        i++
    ) {

        const coracao =
            document.getElementById(
                `v${i}`
            );


        if (i <= vidas) {

            coracao.style.opacity =
                '1';

            coracao.innerText =
                '❤️';

        } else {

            coracao.style.opacity =
                '0.3';

            coracao.innerText =
                '🖤';
        }
    }
}


// =============================
// CRONÔMETRO
// =============================

function atualizarCronometro() {

    tempoRestante--;


    document.getElementById(
        'tempo'
    ).innerText =
        tempoRestante;


    if (tempoRestante <= 0) {

        finalizarJogo(true);
    }
}


// =============================
// FINALIZAR JOGO
// =============================

function finalizarJogo(vitoria) {

    clearInterval(
        cronometroInterval
    );


    clearInterval(
        spawnInterval
    );


    const mosquitoExistente =
        document.getElementById(
            'mosquito'
        );


    if (mosquitoExistente) {

        mosquitoExistente.remove();
    }


    document.getElementById(
        'titulo-fim'
    ).innerText =
        vitoria
            ? '🎉 Tempo Esgotado!'
            : '💀 Game Over!';


    document.getElementById(
        'pontos-finais'
    ).innerText =
        pontos;


    document.getElementById(
        'modal-game-over'
    ).classList.remove('hidden');
}


// =============================
// SALVAR PONTUAÇÃO
// =============================

async function salvarPontuacao(event) {

    event.preventDefault();


    const nickname =
        document.getElementById(
            'nickname'
        ).value;


    const btnSalvar =
        document.getElementById(
            'btn-salvar'
        );


    if (!nickname.trim()) {
        return;
    }


    btnSalvar.disabled =
        true;


    btnSalvar.innerText =
        'Salvando...';


    try {

        const resposta =
            await fetch(
                API_URL,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({
                        nickname: nickname,
                        pontos: pontos
                    })
                }
            );


        if (!resposta.ok) {

            throw new Error(
                'Erro ao salvar no ranking'
            );
        }


        document.getElementById(
            'nickname'
        ).value = '';


        reiniciarJogo();


    } catch (erro) {

        alert(
            'Erro ao salvar pontuação. Tente novamente.'
        );


        console.error(
            erro
        );


    } finally {

        btnSalvar.disabled =
            false;


        btnSalvar.innerText =
            'Salvar no Ranking';
    }
}


// =============================
// REINICIAR JOGO
// =============================

function reiniciarJogo() {

    document.getElementById(
        'modal-game-over'
    ).classList.add('hidden');


    document.getElementById(
        'tela-jogo'
    ).classList.add('hidden');


    document.getElementById(
        'tela-inicial'
    ).classList.remove('hidden');


    carregarRanking();
}
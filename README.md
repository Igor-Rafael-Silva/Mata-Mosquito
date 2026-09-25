# 🦟 Mata Mosquito

Jogo web desenvolvido com HTML, CSS, JavaScript, Node.js e MySQL.

O objetivo do jogo é eliminar o maior número possível de mosquitos antes que o tempo acabe ou que o jogador perca todas as vidas.

## 🎮 Funcionalidades

- 🦟 Mosquitos aparecem em posições aleatórias
- ❤️ Sistema de vidas
- ⏱️ Cronômetro de 30 segundos
- 🎯 Sistema de pontuação
- ✋ Controle utilizando a câmera e a mão
- 🎯 Mira controlada pelo dedo indicador
- 🏆 Sistema de ranking
- 🎚️ Diferentes níveis de dificuldade
- 💾 Armazenamento das pontuações no MySQL

## 🛠️ Tecnologias

### Front-end

- HTML5
- CSS3
- JavaScript
- MediaPipe Hands

### Back-end

- Node.js
- Express
- MySQL
- MySQL2
- CORS
- Dotenv

## 📁 Estrutura do projeto

```text
mata-mosquito/
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── config/
│   └── db.js
│
├── controllers/
│   └── rankingController.js
│
├── routes/
│   └── rankingRoutes.js
│
├── public/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── imagens/
│
├── database.sql
├── package.json
├── package-lock.json
└── server.js

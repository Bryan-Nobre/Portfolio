// Seleciona o elemento <canvas> e obtém o contexto 2D para desenhar
const canvas = document.getElementById("ropeCanvas");
const ctx = canvas.getContext("2d");

// Define o ponto fixo de origem da corda (topo central do canvas)
let origin = { x: canvas.width / 2, y: 0 };
// Define a posição inicial da "alça" da corda (ponto móvel)
let handle = { x: canvas.width / 2, y: 150 };

// Vetor de velocidade da alça em X e Y (para simulação física)
let velocity = { x: 0, y: 0 };

// Controle se o usuário está arrastando a alça
let isDragging = false;

// Parâmetros físicos da simulação
let friction = 0.9;  // fator que reduz a velocidade (amortecimento)
let spring = 0.1;    // força da mola que puxa a alça para a origem

// Flag para evitar múltiplas trocas de tema em curto período
let pulled = false;

// Evento para detectar início do clique/arrasto na alça da corda
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();

  // Calcula posição do clique dentro do canvas
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Calcula distância do clique até a alça (ponto móvel)
  const dx = x - handle.x;
  const dy = y - handle.y;

  // Se o clique está dentro do círculo da alça (raio 30px), inicia arrasto
  if (Math.sqrt(dx * dx + dy * dy) < 30) {
    isDragging = true;
  }
});

// Evento para detectar quando o usuário solta o clique (fim do arrasto)
canvas.addEventListener("mouseup", () => {
  // Se estava arrastando e puxou a alça para baixo além do limite (y > 220)
  // e ainda não trocou o tema recentemente
  if (isDragging && handle.y > 220 && !pulled) {
    toggleTheme();   // Alterna o tema dark/light
    pulled = true;   // Marca que a troca já aconteceu

    // Após 1 segundo, permite nova troca de tema
    setTimeout(() => pulled = false, 1000);
  }
  isDragging = false; // Finaliza arrasto
});

// Evento para mover a alça conforme o mouse durante o arrasto
canvas.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const rect = canvas.getBoundingClientRect();

    // Atualiza a posição da alça conforme o mouse no canvas
    handle.x = e.clientX - rect.left;
    handle.y = e.clientY - rect.top;
  }
});

// Função que alterna o tema entre dark e light

function toggleTheme() {
  const body = document.body;
  const isDark = body.classList.contains("dark");

  // Alterna as classes 'dark' e 'light' no <body>
  body.classList.toggle("dark", !isDark);
  body.classList.toggle("light", isDark);

  // Armazena a preferência no localStorage para persistência
  localStorage.setItem("theme", !isDark ? "dark" : "light");

  // Reproduz som de clique para feedback auditivo
  const audio = new Audio("https://freesound.org/data/previews/256/256113_3263906-lq.mp3");
  audio.volume = 0.5;
  audio.play();
}

// Função para restaurar o tema salvo no localStorage ao carregar a página
function restoreTheme() {
  const saved = localStorage.getItem("theme") || "dark";
  document.body.classList.add(saved);
}

// Função principal que atualiza a física da corda e redesenha a cena
function updatePhysics() {
  if (!isDragging) {
    // Calcula a força da mola puxando a alça de volta para a origem
    let forceX = (origin.x - handle.x) * spring;
    let forceY = (origin.y + 150 - handle.y) * spring;

    // Aplica a força na velocidade atual
    velocity.x += forceX;
    velocity.y += forceY;

    // Aplica atrito para reduzir a velocidade gradualmente (amortecimento)
    velocity.x *= friction;
    velocity.y *= friction;

    // Atualiza a posição da alça conforme a velocidade calculada
    handle.x += velocity.x;
    handle.y += velocity.y;
  }

  // Desenha o estado atual no canvas
  draw();

  // Solicita a próxima atualização do quadro (loop de animação)
  requestAnimationFrame(updatePhysics);
}

// Função que desenha a corda, a alça, o emoji e o efeito de luz no canvas
function draw() {
  // Limpa o canvas para novo desenho
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Desenha a corda (linha entre a origem fixa e a alça móvel)
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(handle.x, handle.y);
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Se a corda foi puxada recentemente, desenha efeito de luz (glow) na alça
  if (pulled) {
    const gradient = ctx.createRadialGradient(handle.x, handle.y, 10, handle.x, handle.y, 40);
    gradient.addColorStop(0, "rgba(255, 255, 100, 0.8)");
    gradient.addColorStop(1, "rgba(255, 255, 100, 0)");
    ctx.beginPath();
    ctx.arc(handle.x, handle.y, 40, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  // Desenha a alça da corda (círculo preenchido)
  ctx.beginPath();
  ctx.arc(handle.x, handle.y, 25, 0, Math.PI * 2);
  ctx.fillStyle = "#999";
  ctx.fill();

  // Desenha o emoji (sol ou lua) no centro da alça, conforme o tema atual
  ctx.font = "20px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const emoji = document.body.classList.contains("dark") ? "☀️" : "🌙";
  ctx.fillText(emoji, handle.x, handle.y);
}



// Inicializa o tema salvo e começa o loop de física
restoreTheme();
updatePhysics();


(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreText = document.getElementById("score");
  const welcome = document.getElementById("welcome");
  const ending = document.getElementById("ending");
  const bestScoreText = document.getElementById("best-score");
  const lastScoreText = document.getElementById("last-score");
  const scoreList = document.getElementById("score-list");
  const music = document.getElementById("music");
  const hitSound = new Audio("assets/hit.wav");

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const GROUND_Y = 520;
  const PIPE_WIDTH = 68;
  const PIPE_CAP_HEIGHT = 34;
  const BIRD_RADIUS = 14;
  const GRAVITY = 1400;
  const STORAGE_KEY = "flappyBirdClassicTopScores";
  const images = {};

  const assetFiles = {
    sky: "svg",
    bird: "png",
    "bird-flap": "png",
    "pipe-body": "png",
    "pipe-cap-top": "png",
    "pipe-cap-bottom": "png",
    ground: "svg",
  };
  Object.entries(assetFiles).forEach(([name, extension]) => {
    const image = new Image();
    image.src = "assets/" + name + "." + extension;
    images[name] = image;
  });

  let state = "welcome";
  let score = 0;
  let previousScore = 0;
  let records = readRecords();
  let bird = { x: 120, y: 270, velocity: 0, angle: 0 };
  let pipes = [];
  let wingFrameTime = 0;
  let groundOffset = 0;
  let pipeTimer = 0;

  function readRecords() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) {
        return saved
          .filter((value) => Number.isFinite(value) && value >= 0)
          .sort((a, b) => b - a)
          .slice(0, 5);
      }
    } catch (error) {}
    return [];
  }

  function setScreen(next) {
    state = next;
    welcome.hidden = next !== "welcome";
    ending.hidden = next !== "gameover";
    if (ending.hidden) return;

    bestScoreText.textContent = String(records[0] || 0);
    lastScoreText.textContent = String(previousScore);
    scoreList.replaceChildren();

    (records.length ? records : [0]).forEach((value, index) => {
      const item = document.createElement("li");
      const rank = document.createElement("span");
      const result = document.createElement("strong");
      const points = document.createElement("span");

      rank.className = "rank";
      rank.textContent = "Miejsce " + (index + 1);
      result.textContent = String(value);
      points.className = "points";
      points.textContent = "pkt";
      item.append(rank, result, points);
      scoreList.appendChild(item);
    });
  }

  function makePipe(x) {
    const gap = 150 + Math.random() * 20;
    const center = 180 + Math.random() * 175;
    const top = center - gap / 2;
    return { x, top, bottom: top + gap, scored: false };
  }

  function startGame() {
    score = 0;
    bird = { x: 120, y: 270, velocity: 0, angle: 0 };
    pipes = [makePipe(220), makePipe(450)];
    wingFrameTime = 0;
    groundOffset = 0;
    pipeTimer = 0;
    previousScore = 0;
    setScreen("playing");
    music.currentTime = 0;
    music.volume = 0.2;
    music.play().catch(() => {});
  }

  function flap() {
    bird.velocity = -480;
  }

  function hitPipe() {
    return pipes.some((pipe) => {
      const overlapsX =
        bird.x + BIRD_RADIUS > pipe.x &&
        bird.x - BIRD_RADIUS < pipe.x + PIPE_WIDTH;
      const outsideGap =
        bird.y - BIRD_RADIUS < pipe.top || bird.y + BIRD_RADIUS > pipe.bottom;
      return overlapsX && outsideGap;
    });
  }

  function crash() {
    if (state !== "playing") return;
    state = "crashing";
    bird.velocity = Math.max(bird.velocity, 100);
    music.pause();
    hitSound.currentTime = 0;
    hitSound.play().catch(() => {});
  }

  function finishGame() {
    previousScore = score;
    records = records
      .concat(score)
      .sort((a, b) => b - a)
      .slice(0, 5);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {}
    setScreen("gameover");
  }

  function update(delta) {
    if (state === "welcome") {
      return;
    }

    if (state === "crashing") {
      bird.velocity += GRAVITY * delta;
      bird.y += bird.velocity * delta;
      bird.angle += (1.1 - bird.angle) * Math.min(1, delta * 8);
      if (bird.y >= GROUND_Y - BIRD_RADIUS) {
        bird.y = GROUND_Y - BIRD_RADIUS;
        finishGame();
      }
      return;
    }

    if (state !== "playing") return;

    wingFrameTime += delta;
    bird.velocity += GRAVITY * delta;
    bird.y += bird.velocity * delta;
    const targetAngle = Math.max(-0.5, Math.min(1, bird.velocity / 650));
    bird.angle += (targetAngle - bird.angle) * Math.min(1, delta * 8);

    const speed = 125;
    pipes.forEach((pipe) => {
      pipe.x -= speed * delta;
      if (!pipe.scored && pipe.x + PIPE_WIDTH < bird.x) {
        pipe.scored = true;
        score += 1;
      }
    });
    pipes = pipes.filter((pipe) => pipe.x > -PIPE_WIDTH);

    pipeTimer += delta;
    if (pipeTimer >= 1.84) {
      pipeTimer -= 1.84;
      const lastPipe = pipes[pipes.length - 1];
      pipes.push(makePipe(lastPipe.x + 230));
    }

    groundOffset = (groundOffset + speed * delta) % 120;

    if (
      hitPipe() ||
      bird.y - BIRD_RADIUS < 0 ||
      bird.y + BIRD_RADIUS >= GROUND_Y
    ) {
      crash();
    }
  }

  function drawBird() {
    const frame =
      state === "playing" && Math.floor(wingFrameTime / 0.14) % 2
        ? images["bird-flap"]
        : images.bird;
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.angle);
    if (frame.complete && frame.naturalWidth) {
      ctx.drawImage(frame, -22, -18, 44, 36);
    }
    ctx.restore();
  }

  function drawPipe(pipe, topPipe) {
    const body = images["pipe-body"];
    const cap = images[topPipe ? "pipe-cap-bottom" : "pipe-cap-top"];
    if (
      !body.complete ||
      !body.naturalWidth ||
      !cap.complete ||
      !cap.naturalWidth
    )
      return;

    if (topPipe) {
      const bodyHeight = Math.max(0, pipe.top - PIPE_CAP_HEIGHT);
      ctx.drawImage(body, pipe.x, 0, PIPE_WIDTH, bodyHeight);
      ctx.drawImage(
        cap,
        pipe.x,
        pipe.top - PIPE_CAP_HEIGHT,
        PIPE_WIDTH,
        PIPE_CAP_HEIGHT,
      );
    } else {
      const bodyY = pipe.bottom + PIPE_CAP_HEIGHT;
      ctx.drawImage(cap, pipe.x, pipe.bottom, PIPE_WIDTH, PIPE_CAP_HEIGHT);
      ctx.drawImage(
        body,
        pipe.x,
        bodyY,
        PIPE_WIDTH,
        Math.max(0, GROUND_Y - bodyY),
      );
    }
  }

  function draw() {
    ctx.imageSmoothingEnabled = false;
    if (images.sky.complete && images.sky.naturalWidth) {
      ctx.drawImage(images.sky, 0, 0, WIDTH, HEIGHT);
    } else {
      ctx.fillStyle = "#70c5ce";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    pipes.forEach((pipe) => {
      drawPipe(pipe, true);
      drawPipe(pipe, false);
    });

    const ground = images.ground;
    if (ground.complete && ground.naturalWidth) {
      for (let x = -groundOffset; x < WIDTH; x += 120) {
        ctx.drawImage(ground, x, GROUND_Y, 120, HEIGHT - GROUND_Y);
      }
    }

    drawBird();
    scoreText.textContent = String(score);
  }

  document.getElementById("start").addEventListener("click", startGame);
  document.getElementById("replay").addEventListener("click", startGame);

  document.addEventListener("keydown", (event) => {
    if (event.code !== "Space") return;
    event.preventDefault();
    if (event.repeat) return;
    if (state === "welcome") {
      startGame();
      flap();
    } else if (state === "playing") {
      flap();
    }
  });

  let previousFrame = 0;
  function loop(timestamp) {
    const delta = Math.min((timestamp - previousFrame) / 1000 || 0, 0.033);
    previousFrame = timestamp;
    update(delta);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

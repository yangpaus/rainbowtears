class TearSystem {
  constructor(liquid) {
    this.tears = [];
    this.liquid = liquid;

    this.SPAWN_INTERVAL_TABLE = [
      Infinity, // 0 ❌ 절대 생성 안 함
      180, // 1 거의 안 떨어짐 (3초)
      120, // 2 매우 느림 (2초)
      90, // 3 느림
      65, // 4
      45, // 5 보통
      32, // 6
      24, // 7 빠름
      18, // 8 매우 빠름
      12, // 9 폭포
    ];

    this.words = ["으", "으", "으", "으", "으", "응", "흥"];
    this.currentIndex = 0;

    this.spawnIntervalFrames = 18;
    this.lastSpawnFrame = -99999;
    this.speedThreshold = 0;

    this.spawnEnabled = true;
  }

  update(faceX, dx) {
    // 🔥 밸브 단계 반영
    const interval = this.SPAWN_INTERVAL_TABLE[valveStep];

    if (!Number.isFinite(interval)) {
      this.spawnEnabled = false; // 0단계 → 완전 차단
    } else {
      this.spawnEnabled = true;
      this.spawnIntervalFrames = interval;
    }
    // --- 스폰 제어 ---
    const speedX = Math.abs(dx);
    const tooFast = speedX > this.speedThreshold;

    if (
      this.spawnEnabled &&
      !tooFast &&
      frameCount - this.lastSpawnFrame >= this.spawnIntervalFrames
    ) {
      this.spawnNextLetterAt(faceX - 20);
      this.lastSpawnFrame = frameCount;
    }

    // --- 개별 Tear 업데이트 ---
    for (let i = this.tears.length - 1; i >= 0; i--) {
      const m = this.tears[i];

      if (m.isDead()) {
        this.tears.splice(i, 1);
        continue;
      }

      if (this.liquid.contains(m)) {
        m.applyForce(this.liquid.calculateDrag(m));
      }

      const gravity = createVector(0, 0.1 * m.mass);
      m.applyForce(gravity);

      m.update();
      m.checkEdges();
      m.show();

      if (m.position.y - m.radius > height) {
        this.tears.splice(i, 1);
      }

      if (!isFiniteVec(m.velocity)) console.log("BAD VEL", i, m.velocity);
      if (!isFiniteVec(m.acceleration))
        console.log("BAD ACC", i, m.acceleration);
    }

    this.handleCollisions();

    this.liquid.updateLevelFromTears(this.tears);
  }

  spawnNextLetterAt(x) {
    const ch = this.words[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.words.length;

    const mass = random(0.5, 1);
    const a = new Tear(x, 0, mass, ch);
    const b = new Tear(x + 45, 0, mass, ch);

    a.velocity.x = random(-0.1, 0.1);
    b.velocity.x = random(-0.1, 0.1);

    this.tears.push(a, b);
  }

  handleCollisions() {
    const restitution = 0.2;
    const percent = 0.8;

    for (let i = 0; i < this.tears.length; i++) {
      for (let j = i + 1; j < this.tears.length; j++) {
        const A = this.tears[i];
        const B = this.tears[j];

        let n = p5.Vector.sub(B.position, A.position);
        let dist = n.mag();
        const minDist = A.radius + B.radius;

        if (dist < EPS) {
          n.set(1, 0);
          dist = EPS;
        }

        if (dist < minDist) {
          n.div(dist);
          const overlap = minDist - dist;

          const invA = 1 / max(A.mass, EPS);
          const invB = 1 / max(B.mass, EPS);
          const invSum = invA + invB;

          let corrMag = (overlap * percent) / max(invSum, EPS);
          corrMag = min(corrMag, minDist);

          const correction = n.copy().mult(corrMag);
          A.position.sub(correction.copy().mult(invA));
          B.position.add(correction.copy().mult(invB));

          const rv = p5.Vector.sub(B.velocity, A.velocity);
          const velAlongNormal = rv.dot(n);
          if (velAlongNormal > 0) continue;

          let jImpulse = -(1 + restitution) * velAlongNormal;
          jImpulse /= max(invSum, EPS);
          jImpulse = constrain(jImpulse, -MAX_IMPULSE, MAX_IMPULSE);

          const impulse = n.copy().mult(jImpulse);
          A.velocity.sub(impulse.copy().mult(invA));
          B.velocity.add(impulse.copy().mult(invB));

          A.velocity.limit(MAX_SPEED);
          B.velocity.limit(MAX_SPEED);
        }
      }
    }
  }

  reset() {
    this.tears = [];
    this.currentIndex = 0;
    this.lastSpawnFrame = -99999;
  }
}

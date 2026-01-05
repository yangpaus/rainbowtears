class Liquid {
  constructor(x, y, w, h, c) {
    this.x = x; 
    this.y = y; 
    this.w = int(w);

    this.baseH = int(h);   // 초기 높이
    this.h = int(h);       // 현재 높이(가변)
    this.c = c;            // 항력 계수
  }

 
  updateLevelFromTears(tears) {
  const GROUND_EPS = 0.5; // 로컬 상수로 사용
  const SLOW = 0.4;

  let massSum = 0;
  for (const m of tears) {
    const onGround = (m.position.y >= height - (m.radius ?? 12) - GROUND_EPS);
    const slow = (abs(m.velocity.y) < SLOW);
    // sleeping 의존 X
    if (onGround && slow) {
      massSum += (m.mass ?? 1);
    }
  }

  const LEVEL_PER_MASS = 6;
  const targetH = constrain(this.baseH + LEVEL_PER_MASS * massSum, 0, height);
  const SMOOTH = 0.12;
  this.h = lerp(this.h, targetH, SMOOTH);
  this.y = height - this.h;
}

  contains(mover) {
    const p = mover.position;
    return (p.x > this.x && p.x < this.x + this.w &&
            p.y > this.y && p.y < this.y + this.h);
  }

  calculateDrag(mover) {
    const speed = mover.velocity.mag();
    const dragMagnitude = this.c * speed * speed;
    let dragForce = mover.velocity.copy().mult(-1);
    dragForce.setMag(dragMagnitude);
    return dragForce;
  }

  // ★ 단색(예전처럼)
  show() {
    noStroke();
    fill(116, 204, 244, 100);         // 예전 물 색
    rect(this.x, this.y, this.w, this.h);
  }
}

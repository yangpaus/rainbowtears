class Tear {
  constructor(x, y, mass, chara) {
    this.mass = mass;
    this.radius = 18;
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.chara = chara;

    this.birthTime = millis();
    this.lifespan = random(60000, 120000);

    this.h = random(360); // 시작 hue 무작위
    this.hSpeed = 0; // hue 회전 속도(원하면 고정값도 ok)
    this.sat = 90; // 채도
    this.bri = 100; // 명도
  }

  isDead() {
    return millis() - this.birthTime > this.lifespan;
  }

  applyForce(force) {
    if (!force) return;
    const f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.mult(0.99);
    this.velocity.limit(MAX_SPEED);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    this.h = (this.h + this.hSpeed) % 360;
  }

  show() {
    push();
    colorMode(HSB, 360, 100, 100);
    noStroke();
    fill(this.h, this.sat, this.bri);
    textSize(this.radius * 6);
    text(this.chara, this.position.x, this.position.y);
    pop();
  }

  checkEdges() {
    const restitution = 0.3;

    if (this.position.x < this.radius) {
      this.position.x = this.radius;
      if (this.velocity.x < 0) this.velocity.x *= -restitution;
    }
    if (this.position.x > width - this.radius) {
      this.position.x = width - this.radius;
      if (this.velocity.x > 0) this.velocity.x *= -restitution;
    }
    if (this.position.y < this.radius) {
      this.position.y = this.radius;
      if (this.velocity.y < 0) this.velocity.y *= -restitution;
    }
    if (this.position.y > height - this.radius) {
      this.position.y = height - this.radius;
      if (this.velocity.y > 0) this.velocity.y *= -restitution;
      this.velocity.x *= 0.95; // 바닥 마찰(천천히 멈추도록)

      this.velocity.limit(MAX_SPEED);
    }
  }
}

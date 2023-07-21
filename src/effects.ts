import P5 from "p5";

const Explosions = new Array<Explosion>();

class Explosion {
    private age = 0;
    constructor(private x: number, private y: number, private lifetime: number) {}

    public draw(p5: P5) {
        p5.strokeWeight(2);
        p5.stroke(255, 5)
        for(let i=0; i< 180; i++) {
            let angle = i * (360 / 52);
            p5.angleMode(p5.DEGREES);
            p5.line(this.x, this.y, this.x + Math.cos(angle) * 130, this.y + Math.sin(angle) * 130)
        }

        p5.noStroke();
        p5.fill(255, 0, 0, 2);
        p5.circle(this.x, this.y, 250);
        p5.fill(255, 10, 0, 2);
        p5.circle(this.x, this.y, 175);
        p5.fill(255, 20, 0, 2);
        p5.circle(this.x, this.y, 100);

        
        this.age += 0.1;
        if(this.age >= this.lifetime) deleteExplosion(this);
    }
}

export function explode(x: number, y: number, lifetime: number = 0.001) {
    Explosions.push(new Explosion(x, y, lifetime));
}

export function deleteExplosion(ex: Explosion) {
    for(let i=0; i<Explosions.length; i++) {
        if(Explosions[i] == ex) {
            Explosions.splice(i, 1);
        }
    }
}

export function drawExplosions(p5: P5) {
    for(const e of Explosions) e.draw(p5);
}
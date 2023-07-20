import P5 from "p5";
import { arraySum } from "./utilities";

export const Bodies = new Array<Body>();

export class Body {
    public color: [number, number, number, number];
    
    public p5: P5;
    public mass: number;
    public charge: number;
    public radius: number;
    public x: number;
    public y: number;
    public velX: number;
    public velY: number;
    public accX: number;
    public accY: number;

    constructor(p5: P5, mass: number, charge: number, radius: number, x: number, y: number, color: [number, number, number, number]) {
        this.p5 = p5;
        this.mass = mass;
        this.charge = charge;
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.velX = 0;
        this.velY = 0;
        this.accX = 0;
        this.accY = 0;
        this.color = color;
    }

    public draw() {
        this.p5.fill(this.color[0], this.color[1], this.color[2], this.color[3]);
        this.p5.circle(this.x, this.y, this.radius);
    }

    public update(deltaTime: number) {
        this.velX += this.accX * deltaTime;
        this.velY += this.accY * deltaTime;
        this.accX = 0;
        this.accY = 0;
        // Check Boundary
        if(this.x <= 0 || this.x >= window.innerWidth) this.velX = -this.velX;
        if(this.y <= 0 || this.y >= window.innerHeight) this.velY = -this.velY;
        if(this.x <= 0) this.x = 0;
        if(this.x >= window.innerWidth) this.x = window.innerWidth;
        if(this.y <= 0) this.y = 0;
        if(this.y >= window.innerHeight) this.y = window.innerHeight;

        this.x += this.velX * deltaTime;
        this.y += this.velY * deltaTime;
        this.velX *= 0.95;
        this.velY *= 0.95;
    }

    public addForce(forceX: number, forceY: number) {
        this.accX += forceX;
        this.accY += forceY;
    }
}

export class Particle extends Body {
    constructor(p5: P5, mass: number, charge: number, radius: number, x: number, y: number) {
        let color: [number, number, number, number] = [0, 0, 0, 0];
        if(charge == 0) color = [255, 255, 255, 255]; // white for neutral
        if(charge > 0) color = [255, 0, 0, 255]; // red for plus
        if(charge < 0) color = [0, 125, 255, 255]; // blue for minus
        
        super(p5, mass, charge, radius, x, y, color);
    }
}

export class Neutron extends Particle {
    constructor(p5: P5, x: number, y: number) {
        super(p5, 11, 0, 5, x, y);
    }
}

export class Proton extends Particle {
    constructor(p5: P5, x: number, y: number) {
        super(p5, 10, 1, 5, x, y);
    }
}

export class Electron extends Particle {
    constructor(p5: P5, x: number, y: number) {
        super(p5, 1, -1, 5, x, y);
    }
}

export class Nucleus extends Body {
    static NuclearOrbital = [
        [0.3 * 1  + 0.0, 4],
        [0.3 * 2  + 0.2, 8],
        [0.3 * 3  + 0.4, 12],
        [0.3 * 4  + 0.6, 16],
        [0.3 * 5  + 0.8, 24],
        [0.3 * 6  + 1.0, 28],
        [0.3 * 7  + 1.2, 38],
        [0.3 * 8  + 1.4, 42],
        [0.3 * 9  + 1.6, 48],
        [0.3 * 10 + 1.8, 50],
        [0.3 * 11 + 2.0, 62],
        [0.3 * 12 + 2.4, 64],
        [0.3 * 13 + 2.6, 64],
        [0.3 * 14 + 2.8, 64],
        [0.3 * 15 + 3.0, 64],
        [0.3 * 16 + 3.2, 64],
    ]
    public angle = 0;
    public angularVel = 1;
    public startingOrbital = 0;
    public amountOfNeutron = 0;
    public amountOfProton = 0;
    constructor(p5: P5, particles: Array<Particle>) {
        // calculate centroid
        const Gx = new Array<number>();
        const Gy = new Array<number>();
        let totalCharge = 0;
        let totalMass = 0;
        let totalRadius = 0;
        let neutCount = 0;
        let protCount = 0
        for(const particle of particles) {
            if(particle instanceof Neutron) neutCount += 1;
            if(particle instanceof Proton) protCount += 1;
            Gx.push(particle.x);
            Gy.push(particle.y);
            totalCharge += particle.charge;
            totalMass += particle.mass;
            totalRadius += particle.radius;
        }

        const x = arraySum(Gx) / Gx.length;
        const y = arraySum(Gy) / Gy.length;
        

        super(p5, totalMass, totalCharge, totalRadius / 2, x, y, [255, 255, 255, 25]);
        console.log("charge", totalCharge)
        this.amountOfNeutron = neutCount;
        this.amountOfProton = protCount;
    }

    private __draw(p5: P5, x: number, y: number, fill: [number, number, number], angle: number, orbitRadius: number, offset: number) {
        p5.stroke(0, 255);
        p5.strokeWeight(1)
        p5.fill(...fill);
        p5.circle(
            x + (7 * orbitRadius) * p5.cos(angle + (Math.PI * offset)),
            y + (7 * orbitRadius) * p5.sin(angle + (Math.PI * offset)),
            5
        );
    }

    public draw() {
        const waited = [];
        const totalCount = this.amountOfNeutron + this.amountOfProton;
        let mode = 1;
        let neutTrack = 0;
        let protTrack = 0;
        let currentOrbitals = 0;
        let offset = 0 + this.angle;
        for(let i=0; i<totalCount; i ++) {
            let orbitRadius = Nucleus.NuclearOrbital[currentOrbitals][0];
            let maxOrbitParticle = Nucleus.NuclearOrbital[currentOrbitals][1];
            let angle = i * (360 / maxOrbitParticle);
            let fill = [255, 255, 255];

            if(mode == 0) {
                fill = [255, 255, 255];
                if(protTrack < this.amountOfProton) {
                    mode = 1;
                    neutTrack += 1;
                }
            } else {
                fill = [255, 0, 0];
                if(neutTrack < this.amountOfNeutron) {
                    mode = 0;
                    protTrack += 1;
                }
            }

            waited.push([
                this.__draw, 
                [this.p5, this.x, this.y, fill, angle, orbitRadius, offset]
            ]);
            if((neutTrack + protTrack) >= maxOrbitParticle){
                currentOrbitals += 1;
                neutTrack = 0;
                protTrack = 0;
                let jiggleAmount = (((this.amountOfNeutron*1.8) + (this.amountOfProton * 1.8)) / 1500) - 0.05;
                if(this.amountOfNeutron + this.amountOfProton >= 136) {
                    jiggleAmount = (((this.amountOfNeutron*1.8) + (this.amountOfProton * 1.8)) / 110) - 1.88;
                }
                offset += (Math.random() * jiggleAmount) * 2;
            }
        };
        
        let sum = 15;
        for(let i=0; i<currentOrbitals+1; i++) sum += (Nucleus.NuclearOrbital[i][0] * 2);
        this.p5.fill(255, 255, 255, 50);
        if(this.amountOfNeutron + this.amountOfProton < 136) {
            this.p5.circle(this.x, this.y, (sum * 1.5) + 5);
        } else {
            this.p5.circle(this.x, this.y, (sum * 1.5) - 5);
        }
        this.p5.angleMode(this.p5.DEGREES);
        waited.reverse().map(v => v[0](...v[1]));
    }

    public update(deltaTime: number) {
        super.update(deltaTime);
        // this.x += (Math.random() * 1) - 0.5;
        // this.y += (Math.random() * 1) - 0.5;
        // this.angle += this.angularVel;
    }
}

export function deleteBody(body: Body) {
    for (let i = 0; i < Bodies.length; i++) {
        if (Bodies[i] == body) {
            Bodies.splice(i, 1);
        }
    }
}


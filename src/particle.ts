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

    public age: number;
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
        this.age = 0;
    }

    public get kineticEnergy() {
        return 0.5 * this.mass * ((this.velX ** 2) + (this.velY ** 2));
    }

    public get energy() {
        return (this.mass / 2) + this.kineticEnergy;
    }

    public draw() {
        this.p5.fill(this.color[0], this.color[1], this.color[2], this.color[3]);
        this.p5.strokeWeight(1);
        this.p5.stroke(0, 0, 0);
        this.p5.circle(this.x, this.y, this.radius);
    }
    
    public drawForce() {
        // Draw direction and magnitude of force
        // this.p5.strokeWeight(1);
        // this.p5.stroke(255, 0, 0, 12.5);
        // this.p5.line(this.x, this.y, this.x + this.accX * 1000, this.y + this.accY * 1000);
    
        // // Draw direction and magnitude of velocity
        // this.p5.stroke(0, 0, 255, 12.5);
        // this.p5.line(this.x, this.y, this.x + this.velX * 10, this.y + this.velY * 10);
    }

    public update(deltaTime: number) {
        this.velX += this.accX * deltaTime;
        this.velY += this.accY * deltaTime;

        this.checkBoundary();
        
        this.x += this.velX * deltaTime;
        this.y += this.velY * deltaTime;
        this.velX *= 0.995;
        this.velY *= 0.995;
        this.age += deltaTime;
    }
    
    public checkBoundary() {
        // Check Boundary
        if(this.x <= 0 || this.x >= window.innerWidth) this.velX = -this.velX;
        if(this.y <= 0 || this.y >= window.innerHeight) this.velY = -this.velY;
        if(this.x <= 0) this.x = 0;
        if(this.x >= window.innerWidth) this.x = window.innerWidth;
        if(this.y <= 0) this.y = 0;
        if(this.y >= window.innerHeight) this.y = window.innerHeight;
    }

    public resetAcc() {
        this.accX = 0;
        this.accY = 0;
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

const NUCLEON_RADIUS = 10
export class Neutron extends Particle {
    static RestMass = 1.1;
    static RestEnergy = this.RestMass / 2;

    public lifetime: number;
    constructor(p5: P5, x: number, y: number) {
        super(p5, 1.1, 0, NUCLEON_RADIUS, x, y);

        this.lifetime = (Math.random() * 100) + 25;
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);

        if(this.age >= this.lifetime) {
            deleteBody(this);

            const p = new Proton(this.p5, ((Math.random() * 10) - 5) + this.x, ((Math.random() * 10) - 5) + this.y)
            const e = new Electron(this.p5, ((Math.random() * 10) - 5) + this.x, ((Math.random() * 10) - 5) + this.y)

            p.velX = this.velX + ((Math.random() * 10) - 5);
            p.velY = this.velY + ((Math.random() * 10) - 5);
            e.velX = this.velX + ((Math.random() * 10) - 5);
            e.velY = this.velY + ((Math.random() * 10) - 5);

            Bodies.push(p);
            Bodies.push(e);
        }
    }
}

export class Proton extends Particle {
    static RestMass = 1.0;
    static RestEnergy = this.RestMass / 2;
    constructor(p5: P5, x: number, y: number) {
        super(p5, 1.0, 1, NUCLEON_RADIUS, x, y);
    }
}

export class AntiProton extends Particle {
    static RestMass = 1.0;
    static RestEnergy = this.RestMass / 2;
    constructor(p5: P5, x: number, y: number) {
        super(p5, 1.0, -1, NUCLEON_RADIUS, x, y);
        super.color = [255, 0, 255, 255];
        this.color = [255, 0, 255, 255];
    }
}

export class Electron extends Particle {
    static RestMass = 0.1;
    static RestEnergy = this.RestMass / 2;
    constructor(p5: P5, x: number, y: number) {
        super(p5, 0.1, -1, 5, x, y);
    }
}

export class AntiElectron extends Particle {
    static RestMass = 0.1;
    static RestEnergy = this.RestMass / 2;
    constructor(p5: P5, x: number, y: number) {
        super(p5, 0.1, +1, 5, x, y);
        this.color = [255, 125, 0, 255];
        super.color = [255, 125, 0, 255];
    }
}

export class Photon extends Particle {
    static RestMass = 0;
    static RestEnergy = 0;
    constructor(p5: P5, x: number, y: number) {
        super(p5, 0, 0, 2, x, y);
        this.color = [0, 0, 0, 255];
        super.color = [0, 0, 0, 255];
        this.velX = ((Math.random() * 2) - 1) * 100;
        this.velY = ((Math.random() * 2) - 1) * 100;
    }

    public get kineticEnergy() {
        return 0.01;
    }

    public get energy() {
        return 0.01;
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);
        if(Math.floor(this.velX) != 0) {
            if(Math.abs(this.velX) < 50) {
                if(this.velX < 0) {
                    this.velX = -50;
                } else {
                    this.velX = 50;
                }
            }
        }

        if(Math.floor(this.velY) != 0) {
            if(Math.abs(this.velY) < 50) {
                if(this.velY < 0) {
                    this.velY = -50;
                } else {
                    this.velY = 50;
                }
            }
        }
    }

    public drawForce(): void {
        
    }
}

export class Nucleus extends Body {
    // static NuclearOrbital = [
    //     [0.6 * 5 * 1  + 0.0, 4 , 0.0],
    //     [0.6 * 5 * 2  + 0.2, 8 , 0.2],
    //     [0.6 * 5 * 3  + 0.4, 12, 0.4],
    //     [0.6 * 5 * 4  + 0.6, 16, 0.6],
    //     [0.6 * 5 * 5  + 0.8, 24, 0.8],
    //     [0.6 * 5 * 6  + 1.0, 28, 1.0],
    //     [0.6 * 5 * 7  + 1.2, 38, 1.2],
    //     [0.6 * 5 * 8  + 1.4, 42, 1.4],
    //     [0.6 * 5 * 9  + 1.6, 48, 1.6],
    //     [0.6 * 5 * 10 + 1.8, 50, 1.8],
    //     [0.6 * 5 * 11 + 2.0, 62, 2.0],
    //     [0.6 * 5 * 12 + 2.4, 64, 2.4],
    //     [0.6 * 5 * 13 + 2.6, 64, 2.6],
    //     [0.6 * 5 * 14 + 2.8, 64, 2.8],
    //     [0.6 * 5 * 15 + 3.0, 64, 3.0],
    //     [0.6 * 5 * 16 + 3.2, 64, 3.2],
    // ]
    static NuclearOrbital = [
        [1 * (NUCLEON_RADIUS / 2) * 1 , 4 ],
        [1 * (NUCLEON_RADIUS / 2) * 2 , 8 ],
        [1 * (NUCLEON_RADIUS / 2) * 3 , 12],
        [1 * (NUCLEON_RADIUS / 2) * 4 , 16],
        [1 * (NUCLEON_RADIUS / 2) * 5 , 24],
        [1 * (NUCLEON_RADIUS / 2) * 6 , 28],
        [1 * (NUCLEON_RADIUS / 2) * 7 , 38],
        [1 * (NUCLEON_RADIUS / 2) * 8 , 42],
        [1 * (NUCLEON_RADIUS / 2) * 9 , 48],
        [1 * (NUCLEON_RADIUS / 2) * 10, 50],
        [1 * (NUCLEON_RADIUS / 2) * 11, 62],
        [1 * (NUCLEON_RADIUS / 2) * 12, 64],
        [1 * (NUCLEON_RADIUS / 2) * 13, 64],
        [1 * (NUCLEON_RADIUS / 2) * 14, 64],
        [1 * (NUCLEON_RADIUS / 2) * 15, 64],
        [1 * (NUCLEON_RADIUS / 2) * 16, 64],
    ]
    public amountOfNeutron = 0;
    public amountOfProton = 0;
    constructor(p5: P5, particles: Array<Particle>) {
        // calculate centroid
        const Gx = new Array<number>();
        const Gy = new Array<number>();

        let currentOrbital = 0;
        let orbitParticleCount = 0
        let totalCharge = 0;
        let totalMass = 0;
        let neutCount = 0;
        let protCount = 0;
        let radius = NUCLEON_RADIUS;
        for(const particle of particles) {
            if(particle instanceof Neutron) neutCount += 1;
            if(particle instanceof Proton) protCount += 1;
            orbitParticleCount += 1;
            Gx.push(particle.x);
            Gy.push(particle.y);
            totalCharge += particle.charge;
            totalMass += particle.mass;
            console.log(protCount + neutCount, orbitParticleCount, Nucleus.NuclearOrbital[currentOrbital][1])
            if(orbitParticleCount >= Nucleus.NuclearOrbital[currentOrbital][1]) {
                radius += NUCLEON_RADIUS / 2;
                currentOrbital += 1;
                orbitParticleCount = 0;
            }
        }

        if(orbitParticleCount == 0) {
            radius -= NUCLEON_RADIUS / 2;
        }
        const x = arraySum(Gx) / Gx.length;
        const y = arraySum(Gy) / Gy.length;
        
        super(p5, totalMass, totalCharge, radius, x, y, [255, 255, 255, 25]);
        this.amountOfNeutron = neutCount;
        this.amountOfProton = protCount;
        this.radius = radius;

    }

    private __draw(p5: P5, x: number, y: number, fill: [number, number, number], angle: number, orbitRadius: number) {
        p5.stroke(0, 255);
        p5.strokeWeight(1)
        p5.fill(...fill);
        p5.circle(x + (orbitRadius) * p5.cos(angle), y + (orbitRadius) * p5.sin(angle), NUCLEON_RADIUS);
    }

    public draw() {
        const waited = [];
        const totalCount = this.amountOfNeutron + this.amountOfProton;
        let mode = 1;
        let neutTrack = 0;
        let protTrack = 0;
        let currentOrbitals = 0;
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
                [this.p5, this.x, this.y, fill, angle, orbitRadius]
            ]);
            if((neutTrack + protTrack) >= maxOrbitParticle){
                currentOrbitals += 1;
                neutTrack = 0;
                protTrack = 0;
            }
        };
        
        this.p5.angleMode(this.p5.DEGREES);
        waited.reverse().map(v => v[0](...v[1]));
        this.p5.fill(255, 0, 255, 100);
        this.p5.circle(this.x, this.y, this.radius * 2);
    }

    public update(deltaTime: number) {
        super.update(deltaTime);
        // this.x += Math.random() * 2 - 1;
        // this.y += Math.random() * 2 - 1;
    }
}

export function deleteBody(body: Body) {
    for (let i = 0; i < Bodies.length; i++) {
        if (Bodies[i] == body) {
            Bodies.splice(i, 1);
        }
    }
}


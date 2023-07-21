import P5 from "p5";
import { arraySum } from "./utilities";
import ElementNames from "../elements.json";
import { explode } from "./effects";
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
        this.p5.stroke(255);
        this.p5.circle(this.x, this.y, this.radius);
    }
    
    public drawForce(magnitude = 1) {
        // // Draw direction and magnitude of force
        // this.p5.strokeWeight(1);
        // this.p5.stroke(255, 0, 0, 255);
        // this.p5.line(this.x, this.y, this.x + this.accX * 50 * magnitude, this.y + this.accY * 50 * magnitude);
    
        // // Draw direction and magnitude of velocity
        // this.p5.stroke(0, 0, 255, 255);
        // this.p5.line(this.x, this.y, this.x + this.velX * 10 * magnitude, this.y + this.velY * 10 * magnitude);
    }

    public update(deltaTime: number) {
        this.velX += this.accX * deltaTime * 0.5;
        this.velY += this.accY * deltaTime * 0.5;
        if(Math.abs(this.velX) >= Photon.Speed / 2) {
            if(this.velX < 0) {
                this.velX = -Photon.Speed / 2 - 0.01;
            } else {
                this.velX = +Photon.Speed / 2 - 0.01;
            }
        }
        if(Math.abs(this.velY) >= Photon.Speed / 2) {
            if(this.velY < 0) {
                this.velY = -Photon.Speed / 2 - 0.01;
            } else {
                this.velY = +Photon.Speed / 2 - 0.01;
            }
        }

        this.checkBoundary();
        this.x += this.velX * deltaTime;
        this.y += this.velY * deltaTime;

        this.velX += this.accX * deltaTime * 0.5;
        this.velY += this.accY * deltaTime * 0.5;
        this.checkBoundary();
        this.velX *= 0.999;
        this.velY *= 0.999;
        this.age += deltaTime;
    }
    
    public checkBoundary() {
        // Check Boundary
        if(this.x >= window.innerWidth && this.velX > 0) this.velX = -this.velX;
        if(this.x <= 0 && this.velX < 0) this.velX = -this.velX;

        if(this.y>= window.innerHeight && this.velY > 0) this.velY = -this.velY;
        if(this.y<= 0 && this.velY < 0) this.velY = -this.velY;


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

export class AntiNeutron extends Particle {
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

            const p = new AntiProton(this.p5, ((Math.random() * 10) - 5) + this.x, ((Math.random() * 10) - 5) + this.y)
            const e = new AntiElectron(this.p5, ((Math.random() * 10) - 5) + this.x, ((Math.random() * 10) - 5) + this.y)

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
        super(p5, Proton.RestMass, 1, NUCLEON_RADIUS, x, y);
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
    public lifetime: number;
    constructor(p5: P5, x: number, y: number) {
        super(p5, 0, 0, 3, x, y);
        this.color =  [255, 255, 255, 255];
        super.color = [255, 255, 255, 255];
        this.velX = ((Math.random() * 2) - 1) * 100;
        this.velY = ((Math.random() * 2) - 1) * 100;
        this.age = Math.random() * 10;
        this.lifetime = (Math.random() * 100) + 10;
    }

    public get kineticEnergy() {
        return 0.01;
    }

    public get energy() {
        return 0.01;
    }

    static Speed = 25;
    public update(deltaTime: number): void {
        super.update(deltaTime);

        if(this.age >= this.lifetime) {
            deleteBody(this);
            return;
        }
        if(Math.floor(this.velX) != 0) {
            if(this.velX < 0) {
                this.velX = -Photon.Speed;
            } else {
                this.velX = Photon.Speed;
            }
        } else {
            this.velX = 0;
        }

        if(Math.floor(this.velY) != 0) {
            if(this.velY < 0) {
                this.velY = -Photon.Speed;
            } else {
                this.velY = Photon.Speed;
            }
        } else {
            this.velY = 0;
        }
        if(this.velX == 0 && this.velY == 0) {
            this.velX += (Math.floor(Math.random() * 100) - 50) / 100
            this.velX += (Math.floor(Math.random() * 100) - 50) / 100
        }
    }

    public draw(): void {
        const osilX = -Math.sin(this.age) * 2;
        const osilY = Math.sin(this.age) * 2;
        this.x += osilX;
        this.y += osilY;
        super.draw();
        
        this.p5.noStroke()
        this.p5.fill(this.color[0], this.color[1], this.color[2], 7);
        this.p5.circle(this.x, this.y, this.radius * 10);
        this.p5.fill(this.color[0], this.color[1], this.color[2], 7);
        this.p5.circle(this.x, this.y, this.radius * 8);
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
        // [1 * (NUCLEON_RADIUS / 2) * 0.5 , 2 ],
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
    public radioactiveCount = 1;
    public nextDecayModulus = 0;
    constructor(p5: P5, particles: Array<Particle>) {
        let created = "Created";
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
            if(particle instanceof AntiNeutron) neutCount -= 1;
            if(particle instanceof Proton) protCount += 1;
            if(particle instanceof AntiProton) protCount -= 1;

            orbitParticleCount += 1;
            Gx.push(particle.x);
            Gy.push(particle.y);
            totalCharge += particle.charge;
            totalMass += particle.mass * 0.99;
            if(orbitParticleCount >= Nucleus.NuclearOrbital[currentOrbital][1]) {
                radius += NUCLEON_RADIUS / 2;
                currentOrbital += 1;
                orbitParticleCount = 0;
            }
        }


        if(orbitParticleCount == 0) {
            radius -= NUCLEON_RADIUS / 2;
        }
        radius += 2.5;
        const x = arraySum(Gx) / Gx.length;
        const y = arraySum(Gy) / Gy.length;

        if(protCount > ElementNames.length) {
            const dt = protCount - ElementNames.length;
            protCount -= dt;
            const particles = [];
            let nprot = Math.ceil(dt / 2);
            let nneut = dt - nprot;
            for(let i=0; i<nprot; i++) {
                particles.push(new Proton(p5, x + Math.random() * 15, y + Math.random() * 15))
            }
            for(let i=0; i<nneut; i++) {
                particles.push(new Neutron(p5, x + Math.random() * 15, y + Math.random() * 15))
            }

            const n = new Nucleus(p5, particles);
            n.velX = Math.random() * 10;
            n.velY = Math.random() * 10;
            Bodies.push();
        }

        
        super(p5, totalMass, totalCharge, radius, x, y, [255, 255, 255, 25]);
        this.amountOfNeutron = neutCount;
        this.amountOfProton = protCount;
        this.radius = radius;
        this.nextDecayModulus = Math.ceil(Math.random() * 100) + 50;

        if(this.amountOfNeutron != this.amountOfProton) {
            console.log(`Radioactive Element ${created}:`, ElementNames[this.amountOfProton-1][0], protCount, neutCount);
        } else {
            console.log(`Stable Element ${created}:`, ElementNames[this.amountOfProton-1][0]);
        }
    }

    public decay() {
        let lastName = ElementNames[this.amountOfProton-1][0];
        let lastNeut = this.amountOfNeutron;
        let lastProt = this.amountOfProton
        // determine type of decay
        let decayType: "helium4" | "beta" | "anti-beta" | "neutron-release" | "proton-release";
        if(this.amountOfProton == 0) {
            if(this.amountOfNeutron == 1) { // neutral hydrogen
                decayType = "beta";
                this.radioactiveCount = Math.floor(this.nextDecayModulus / 10);
            } else { // neutral heavy hydrogen
                decayType = "neutron-release";
                this.radioactiveCount = Math.floor(this.nextDecayModulus / 10);
            }
        } else if (this.amountOfProton == 1) { // hydrogen isotope
            if(this.amountOfNeutron == 0) { // stable (protium)
                this.radioactiveCount = 1;
                return
            } else if (this.amountOfNeutron == 1) { // stable (deuteurium)
                this.radioactiveCount = 1;
                return
            } else if (this.amountOfNeutron == 2) { // beta decay (tritium)
                decayType = "beta";
            }
        } else if (this.amountOfProton == 2) { // Helium isotope
            if(this.amountOfNeutron == 0) { // proton emission (Helium 2)
                decayType = "proton-release"
                this.radioactiveCount = Math.floor(this.nextDecayModulus / 2);
            } else if (this.amountOfNeutron == 1) { // stable (Helium 3)
                this.radioactiveCount = 1;
                return
            } else if (this.amountOfNeutron == 2) { // semi-long life (Stable)
                this.radioactiveCount = 1;
                return;
            } else if (this.amountOfNeutron == 3) { // neutron emission (Helium 5)
                decayType = "neutron-release";
                this.radioactiveCount = Math.floor(this.nextDecayModulus / 2);
            } else if(this.amountOfNeutron == 4) { // neutron emission (Helium 6)
                decayType = "beta";
                this.radioactiveCount = Math.floor(this.nextDecayModulus / 2);
            } else if(this.amountOfNeutron == 5) { // neutron emission (Helium 7)
                decayType = "neutron-release";
                this.radioactiveCount = Math.floor(this.nextDecayModulus / 2);
            } else if(this.amountOfNeutron == 6) { // neutron emission (Helium 8)
                decayType = "beta";
                this.radioactiveCount = Math.floor(this.nextDecayModulus / 2);
            } else if(this.amountOfNeutron == 7) { // neutron emission (Helium 9)
                decayType = "neutron-release";
                this.radioactiveCount = Math.floor(this.nextDecayModulus / 2);
            } else if(this.amountOfNeutron == 8) { // neutron emission (Helium 10)
                decayType = "neutron-release";
                this.radioactiveCount = Math.floor(this.nextDecayModulus / 2);
            }
        } else {
            if(this.amountOfProton > 28 && this.amountOfNeutron > 4) { // heavier than nickel
                if(Math.random() < 0.5) decayType = "helium4";
            }
        }
        if(!decayType) {
            let random = Math.random() < 0.5 ? "release" : "beta";
            if(random == "release") {
                decayType = Math.random() < 0.5 ? "proton-release" : "neutron-release";
            } else {
                if(this.amountOfNeutron > this.amountOfProton) {
                    decayType = "beta";
                } else if (this.amountOfProton > this.amountOfNeutron) {
                    decayType = "anti-beta";
                } else {
                    decayType = Math.random() < 0.5 ? "proton-release" : "neutron-release";
                }
            }
        }

        let emission = "";
        let el: Electron | AntiElectron | Proton | Neutron | Nucleus;
        if(decayType == "beta") {
            el = new Electron(this.p5, ((Math.random() * this.radius * 1.5) - 5) + this.x, ((Math.random() * 10) - 5) + this.y);
            this.amountOfNeutron -= 1;
            this.amountOfProton += 1;
            this.mass -= Neutron.RestMass;
            this.mass += Proton.RestMass;
            emission = "n -> p + e-";
        } else if (decayType == "anti-beta") {
            el = new AntiElectron(this.p5, ((Math.random() * this.radius * 1.5) - 5) + this.x, ((Math.random() * 10) - 5) + this.y);
            this.amountOfNeutron += 1;
            this.amountOfProton -= 1;
            this.mass += Neutron.RestMass;
            this.mass -= Proton.RestMass;
            emission = "p -> n + e+";
        } else if (decayType == "helium4") {
            el = new Nucleus(this.p5, [
                new Neutron(this.p5, ((Math.random() * this.radius * 1.5) - 5) + this.x, ((Math.random() * 10) - 5) + this.y),
                new Proton(this.p5, ((Math.random() * this.radius * 1.5) - 5) + this.x, ((Math.random() * 10) - 5) + this.y),
                new Neutron(this.p5, ((Math.random() * this.radius * 1.5) - 5) + this.x, ((Math.random() * 10) - 5) + this.y),
                new Proton(this.p5, ((Math.random() * this.radius * 1.5) - 5) + this.x, ((Math.random() * 10) - 5) + this.y),
            ])
            this.amountOfNeutron -= 4;
            this.amountOfProton -= 4;
            this.mass -= Neutron.RestMass * 4;
            this.mass -= Proton.RestMass * 4;
            emission = "He4";
        } else if (decayType == "proton-release") {
            el = new Proton(this.p5, ((Math.random() * this.radius * 1.5) - 5) + this.x, ((Math.random() * 10) - 5) + this.y);
            this.amountOfProton -= 1;
            this.mass -= Proton.RestMass;
            emission = "p";
        } else {
            el = new Neutron(this.p5, ((Math.random() * this.radius * 1.5) - 5) + this.x, ((Math.random() * 10) - 5) + this.y);
            this.amountOfNeutron -= 1;
            this.mass -= Neutron.RestMass;
            emission = "n";
        }
        
        el.velX = this.velX + ((Math.random() * 10) - 5);
        el.velY = this.velY + ((Math.random() * 10) - 5);
        Bodies.push(el);
        explode(this.x, this.y);
        if(this.amountOfNeutron == this.amountOfProton) {
            console.log(lastName, lastProt, lastNeut, "Decaying", emission, `become Stable`, ElementNames[this.amountOfProton-1][0])
        } else {
            console.log(lastName, lastProt, lastNeut, "Decaying", emission, `become Radioactive`, ElementNames[this.amountOfProton-1][0], this.amountOfProton, this.amountOfNeutron)
        }
    }

    public drawName() {
        this.p5.textFont("monospace");
        this.p5.fill(255, 255, 255);
        this.p5.stroke(0, 0, 0, 255);
        this.p5.strokeWeight(5);
        this.p5.textSize(20);
        this.p5.text((ElementNames[this.amountOfProton-1][1] as string).padStart(2, " "), this.x + this.radius, this.y - this.radius);
        this.p5.textSize(14);
        this.p5.text(this.amountOfProton + this.amountOfNeutron, this.x + this.radius + 25, this.y - this.radius-10)
        this.p5.text(this.amountOfProton, this.x + this.radius + 25, this.y - this.radius+7)
    }

    private __draw(p5: P5, x: number, y: number, fill: [number, number, number], angle: number, orbitRadius: number, offset: number) {
        p5.stroke(0, 255);
        p5.strokeWeight(1)
        p5.fill(...fill);
        p5.circle(x + (orbitRadius) * p5.cos(angle + offset), y + (orbitRadius) * p5.sin(angle + offset), NUCLEON_RADIUS);
    }

    public draw() {
        this.p5.stroke(0, 255);
        this.p5.strokeWeight(1)
        if(this.amountOfProton == 0 && this.amountOfNeutron == 1) {
            this.p5.fill(255, 255, 255);
            this.p5.circle(this.x + NUCLEON_RADIUS / 4, this.y - NUCLEON_RADIUS / 4, NUCLEON_RADIUS);
            this.p5.fill(255, 0, 255, 100);
            this.p5.circle(this.x, this.y, this.radius * 2);
            return;
        }
        if(this.amountOfProton == 1 && this.amountOfNeutron == 1) {
            this.p5.fill(255, 0, 0);
            this.p5.circle(this.x - NUCLEON_RADIUS / 4, this.y + NUCLEON_RADIUS / 4, NUCLEON_RADIUS);
            this.p5.fill(255, 255, 255);
            this.p5.circle(this.x + NUCLEON_RADIUS / 4, this.y - NUCLEON_RADIUS / 4, NUCLEON_RADIUS);
            this.p5.fill(255, 0, 255, 100);
            this.p5.circle(this.x, this.y, this.radius * 2);
            return;
        }
        const waited = [];
        const totalCount = this.amountOfNeutron + this.amountOfProton;
        let modeIsNeutron = true;
        let neutronCount = this.amountOfNeutron;
        let protonCount = this.amountOfProton;
        let neutTrack = 0;
        let protTrack = 0;
        let currentOrbitals = 0;
        let offset = 0;
        for(let i=0; i<totalCount; i ++) {
            let orbitRadius = Nucleus.NuclearOrbital[currentOrbitals][0];
            let maxOrbitParticle = Nucleus.NuclearOrbital[currentOrbitals][1];
            let angle = i * (360 / maxOrbitParticle);

            if(modeIsNeutron) {
                waited.push([
                    this.__draw, 
                    [this.p5, this.x, this.y, [255, 255, 255, 255], angle, orbitRadius, offset]
                ]);
                neutTrack += 1;
                neutronCount -= 1;
            } else {
                waited.push([
                    this.__draw, 
                    [this.p5, this.x, this.y, [255, 0, 0, 255], angle, orbitRadius, offset]
                ]);
                protTrack += 1;
                protonCount -= 1;
            }

            if((neutTrack + protTrack) >= maxOrbitParticle){
                currentOrbitals += 1;
                neutTrack = 0;
                protTrack = 0;
                offset += 7.5;
            }

            modeIsNeutron = !modeIsNeutron;
            if(neutronCount <= 0) modeIsNeutron = false;
            if(protonCount <= 0) modeIsNeutron = true;
        };
        
        this.p5.angleMode(this.p5.DEGREES);
        waited.reverse().map(v => v[0](...v[1]));
        this.p5.fill(255, 0, 255, 100);
        // this.p5.circle(this.x, this.y, this.radius * 2);

    }

    public update(deltaTime: number) {
        if(this.amountOfProton != this.amountOfNeutron || this.amountOfProton > 83) {
            // console.log(this.radioactiveCount, this.nextDecayModulus, this.radioactiveCount % this.nextDecayModulus)
            this.radioactiveCount++;
            if(this.radioactiveCount % this.nextDecayModulus == 0) {
                this.nextDecayModulus = Math.ceil(Math.random() * 100) + 50;
                this.radioactiveCount = 1;
                this.decay();
            }
        }
        super.update(deltaTime);
        // this.x += Math.random() * 2 - 1;
        // this.y += Math.random() * 2 - 1;
    }
}

// Electron Orbit
const S = 1;
const P = 6;
const D = 10;
const F = 14;

class ElectronOrbit {
    public configs = [];
    constructor(orbital: "S" | "P" | "D" | "F", amountOfElectron: number) {
        for(let i=0; i<amountOfElectron; i++) {
            
        }
    }
}

class Element extends Particle {
    public nucleus: Nucleus;
    public electrons = [
        [0, 0],

    ];

    constructor(p5: P5, nucleus: Nucleus) {
        super(p5, nucleus.mass, nucleus.charge, nucleus.radius, nucleus.x, nucleus.y);
    }

}

export function deleteBody(body: Body) {
    for (let i = 0; i < Bodies.length; i++) {
        if (Bodies[i] == body) {
            Bodies.splice(i, 1);
        }
    }
}

export function annihilate(p5: P5, baseX: number, baseY: number, totalEnergy: number) {
    const createdParticles = new Array<Photon>();
    createdParticles.push(new Photon(p5, baseX + ((Math.random() * 30) - 15), baseY + ((Math.random() * 30) - 15)));
    createdParticles.push(new Photon(p5, baseX + ((Math.random() * 30) - 15), baseY + ((Math.random() * 30) - 15)));
    totalEnergy -= 0.01 * 2;
    while(totalEnergy > 0) {
        const createdParticle = new Photon(p5, baseX + ((Math.random() * 30) - 15), baseY + ((Math.random() * 30) - 15));
        if((totalEnergy - createdParticle.energy) > 0) {
            createdParticles.push(createdParticle);
            totalEnergy -= createdParticle.energy * 2;
        }

        if(totalEnergy <= 0.01) {
            return;
        }
    }

    Bodies.push(...createdParticles);
}
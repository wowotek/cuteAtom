import P5 from "p5";
import { Particle, Nucleus, Proton, Bodies, Neutron, Electron, deleteBody, AntiProton, AntiElectron, Photon } from "./particle";
import { drawExplosions, explode } from "./effects";

new P5((p5: P5) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    let totalKE = 0;
    let maxKE = 0;

    p5.setup = () => {
        const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
        canvas.parent("app");

        p5.frameRate(1440000);
        // p5.angleMode(p5.DEGREES);
        p5.background("black");
        p5.textSize(32);
        const x = (Math.random() * window.innerWidth / 2) + (window.innerWidth / 4);
        const y = (Math.random() * window.innerHeight / 2) + (window.innerHeight / 4);
        const particles = [];
        // for(let j=0; j<25; j++) {
        //     if(j%2 == 0) {
        //         const p = new Proton(p5, (Math.random() * width / 10) + width / 3, (Math.random() * height / 10) + height / 3);
        //         particles.push(p);
        //     } else {
        //         const p = new Neutron(p5, (Math.random() * width / 10) + width / 3, (Math.random() * height / 10) + height / 3);
        //         particles.push(p);
        //     }
        // }

        // Bodies.push(
        //     new Nucleus(
        //         p5,
        //         particles
        //     ),
        // );
        const e = new Proton(p5,
            width / 2 - 150, height / 2 - 1
        );
        const p = new Proton(p5,
            width / 2 + 150, height / 2 + 1
        );
        e.velX += 15
        p.velX -= 15


        Bodies.push(e, p)

        // for(let j=75; j<window.innerHeight-50; j+=100) {
        //     for(let i=75; i<window.innerWidth-50; i+=100) {
        //         const e = new Electron(p5,i+25,j);
        //         e.velX = 0;
        //         const p = new Proton(p5,i,j);
        //         Bodies.push(e, p);
        //     }
        // }
    }

    p5.draw = () => {
        const dt = p5.deltaTime / 50;
        // p5.translate(-width/2, -height/2)
        p5.background("white");
        drawExplosions(p5);

        Bodies.map(p => {
            p.draw();
            p.drawForce();
        });

        Bodies.map(p => {
            p.resetAcc();
        });

        Bodies.map(p1 => {
            Bodies.map(p2 => {
                if (p1 == p2) return;
                if (p1 instanceof Photon || p2 instanceof Photon) return;
                
                const cx = (p1.x + p2.x) / 2;
                const cy = (p1.y + p2.y) / 2;
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = p5.sqrt(dx * dx + dy * dy);
                const radDiff = p1.radius + p2.radius;
                const emForce = (p1.charge * p2.charge) / (distance / 2.5);
                const weakForce = 1 / distance * 5;
                const angle = p5.atan2(p2.y - p1.y, p2.x - p1.x);

                if (distance >= radDiff * 2) {
                    if (p1 instanceof Neutron || p2 instanceof Neutron) return;
                    p1.addForce((-emForce / p1.mass) * Math.cos(angle), (-emForce / p1.mass) * Math.sin(angle));
                    p2.addForce((emForce / p2.mass) * Math.cos(angle), (emForce / p2.mass) * Math.sin(angle));
                } else if (distance > radDiff / 3 && distance < radDiff * 2) {
                    if (p1 instanceof Electron && p2 instanceof Electron) return;
                    p1.addForce((-weakForce / p1.mass) * Math.cos(angle), (-weakForce / p1.mass) * Math.sin(angle));
                    p2.addForce((weakForce / p2.mass) * Math.cos(angle), (weakForce / p2.mass) * Math.sin(angle));
                } else if (distance <= radDiff / 3) {
                    if ((p1 instanceof Proton && p2 instanceof Proton)) { // Proton + Proton Collision can create new Particle
                        p1.update(dt);
                        p2.update(dt);
                        let totalEnergy = Math.ceil((p1.energy + p2.energy) / 1.25);
                        const createdParticle = [];
                        while (totalEnergy >= 0) {
                            const choice = [Proton, AntiProton, Neutron, Electron, AntiElectron];
                            let choised = choice[Math.floor(Math.random() * choice.length)];
                            for(let i=0; i<100; i++) {
                                choised = choice[Math.floor(Math.random() * choice.length)];
                            }

                            // Calculate the maximum allowed kinetic energy for the new particle
                            const maxKineticEnergy = (totalEnergy - choised.RestEnergy) / choised.RestMass;

                            // Randomly generate velocity components for the new particle
                            const choisedVelX = Math.random() * ((Math.abs(p1.velX) + Math.abs(p2.velX)) / 2);
                            const choisedVelY = Math.random() * ((Math.abs(p1.velY) + Math.abs(p2.velY)) / 2);

                            // Calculate the kinetic energy of the new particle
                            const newParticleKineticEnergy = 0.5 * choised.RestMass * (choisedVelX ** 2 + choisedVelY ** 2);

                            // Check if the new particle's kinetic energy is within the allowed range
                            if (newParticleKineticEnergy <= maxKineticEnergy) {
                                totalEnergy -= (choised.RestMass + newParticleKineticEnergy);
                                if(totalEnergy < 0.1) {
                                    console.log(Math.floor(totalEnergy * 100))
                                    for(let i=0; i<Math.floor(totalEnergy * 100); i++) {
                                        createdParticle.push(new Photon(p5, cx + ((Math.random() * 30) - 15), cy + ((Math.random() * 30) - 15)))
                                    }
                                    totalEnergy = -0.01
                                }

                                // Create the new particle and add it to the array
                                const newParticle = new choised(p5, cx + ((Math.random() * 30) - 15), cy + ((Math.random() * 30) - 15)); // Set the initial position to (0, 0) or any other appropriate value
                                newParticle.velX = choisedVelX;
                                newParticle.velY = choisedVelY;
                                createdParticle.push(newParticle);
                            }
                            let sumEnergy = 0;
                            for(const particle of createdParticle) {
                                sumEnergy += particle.energy;
                            }

                            console.log(sumEnergy,  Math.ceil((p1.energy + p2.energy) / 1.25));
                            explode(cx, cy, 0.25);
                        }

                        deleteBody(p1);
                        deleteBody(p2);
                        console.log(createdParticle)
                        Bodies.push(...createdParticle);
                        if ((p1 instanceof Electron && p2 instanceof Proton) ||
                            (p2 instanceof Proton && p1 instanceof Electron)
                        ) {
                            if (p1.age < 100 || p2.age < 100) return;
                            deleteBody(p1);
                            deleteBody(p2);
                            const n = new Neutron(p5, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
                            const newX = (p1.x * p1.mass + p2.x * p2.mass) / n.mass;
                            const newY = (p1.y * p1.mass + p2.y * p2.mass) / n.mass;

                            const newVelX = (p1.velX * p1.mass + p2.velX * p2.mass) / n.mass;
                            const newVelY = (p1.velY * p1.mass + p2.velY * p2.mass) / n.mass;
                            n.x = newX;
                            n.y = newY;
                            n.velX = newVelX;
                            n.velY = newVelY;

                            Bodies.push(n)
                        }
                        return;
                    }
                };
            });
        })

        Bodies.map(p => {
            p.update(dt);
        });
    }
});


import P5 from "p5";
import { Particle, Nucleus, Proton, Bodies, Neutron, Electron, deleteBody, AntiProton, AntiElectron, Photon, annihilate, AntiNeutron } from "./particle";
import { drawExplosions, explode } from "./effects";

new P5((p5: P5) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    let totalKE = 0;
    let maxKE = 0;

    p5.setup = () => {
        const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
        canvas.parent("app");

        p5.frameRate(120);
        // p5.angleMode(p5.DEGREES);
        p5.background("black");
        p5.textSize(32);
        const x = (Math.random() * window.innerWidth / 2) + (window.innerWidth / 4);
        const y = (Math.random() * window.innerHeight / 2) + (window.innerHeight / 4);
        // const particles1 = [
        //     new Proton(p5, (Math.random() * width / 2) + (width / 4) + 50, (Math.random() * height / 2) + (height / 4) + 50),
        //     new Proton(p5, (Math.random() * width / 2) + (width / 4) + 50, (Math.random() * height / 2) + (height / 4) + 50),
        //     new Neutron(p5, (Math.random() * width / 2) + (width / 4) + 50, (Math.random() * height / 2) + (height / 4) + 50)
        // ];
        // const particles2 = [
        //     new Proton(p5, (Math.random() * width / 2) + (width / 4) - 25, (Math.random() * height / 2) + (height / 4) - 25),
        //     new Neutron(p5, (Math.random() * width / 2) + (width / 4) - 25, (Math.random() * height / 2) + (height / 4) - 25),
        //     new Neutron(p5, (Math.random() * width / 2) + (width / 4) - 25, (Math.random() * height / 2) + (height / 4) - 25),
        // ];
        // for(let j=0; j<Math.ceil(Math.random() * 208); j++) {
        //     if(Math.random() * 100 >= 75) {
        //         const p = new Proton(p5, (Math.random() * width / 2) + (width / 4) + 50, (Math.random() * height / 2) + (height / 4) + 50);
        //         particles1.push(p);
        //     } else {
        //         const p = new Neutron(p5, (Math.random() * width / 2) + (width / 4) + 50, (Math.random() * height / 2) + (height / 4) + 50);
        //         particles1.push(p);
        //     }
        // }
        // for(let j=0; j<Math.ceil(Math.random() * 208); j++) {
        //     if(Math.random() * 100 >= 50) {
        //         const p = new Proton(p5, (Math.random() * width / 2) + (width / 4) - 25, (Math.random() * height / 2) + (height / 4) - 25);
        //         particles2.push(p);
        //     } else {
        //         const p = new Neutron(p5, (Math.random() * width / 2) + (width / 4) - 25, (Math.random() * height / 2) + (height / 4) - 25);
        //         particles2.push(p);
        //     }
        // }
        // Bodies.push(
        //     new Nucleus(
        //         p5,
        //         particles1
        //     ),
        // );
        // Bodies.push(
        //     new Nucleus(
        //         p5,
        //         particles2
        //     ),
        // );

        const e = new Proton(p5,
            width / 2, height / 2 - 500
        );
        // const p = new Proton(p5,
        //     width / 2, height / 2 + 500
        // );
        e.velY += 50
        // p.velY -= 50
        Bodies.push(e)

        // for(let j=0; j<=25; j+=8) {
        //     for(let i=0; i<=25; i+=8) {
        //         const p = new Proton(p5,i -50 + window.innerWidth / 2,j- 232 + window.innerHeight / 2);
        //         const c = new Proton(p5,i -50 + window.innerWidth / 2,j- 232 + window.innerHeight / 2);
        //         p.velY += 50;
        //         Bodies.push(c, p);
        //     }
        // }

        const constituent = [];
        for(let p=0; p<92; p++) {
            constituent.push(new Proton(p5, window.innerWidth / 2, window.innerHeight / 2))
        }

        for(let p=0; p<143; p++) {
            constituent.push(new Neutron(p5, window.innerWidth / 2, window.innerHeight / 2))
        }

        Bodies.push(new Nucleus(p5, constituent));
    }

    p5.draw = () => {
        // p5.translate(-width/2, -height/2)
        p5.background(25, 255);
        drawExplosions(p5);

        Bodies.map(p => {
            p.draw();
        });

        Bodies.map(p => {
            if(p instanceof Nucleus) {
                p.drawForce(100);
                p.drawName();
            } else {
            }
        });
    }
    
    let t = new Date().getTime();
    function update() {
        const dt = 0.5;
        Bodies.map(p => {
            p.resetAcc();
        });

        Bodies.map(p1 => {
            Bodies.map(p2 => {
                if (p1 == p2) return;
                if (p1 instanceof Photon || p2 instanceof Photon) return;

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = p5.sqrt(dx * dx + dy * dy);
                const radDiff = p1.radius + p2.radius;
                const emForce = (10 * p1.charge * p2.charge) / (distance * distance);
                const weakForce = (10 * p1.mass / p2.mass) / (distance * distance);
                const angle = p5.atan2(p2.y - p1.y, p2.x - p1.x);

                if (distance <= radDiff) {
                    return;
                }
                if (distance > radDiff * 4) {
                    if (p1 instanceof Neutron || p2 instanceof Neutron) return;
                    if (p1 instanceof AntiNeutron || p2 instanceof AntiNeutron) return;
                    if (p1 instanceof Neutron || p2 instanceof AntiNeutron) return;
                    if (p1 instanceof AntiNeutron || p2 instanceof Neutron) return;
                    p1.addForce((-emForce / p1.mass) * Math.cos(angle), (-emForce / p1.mass) * Math.sin(angle));
                    p2.addForce((emForce / p2.mass) * Math.cos(angle), (emForce / p2.mass) * Math.sin(angle));
                } else if (distance > radDiff + 2 && distance <= radDiff * 4) {
                    if (p1 instanceof Electron && p2 instanceof Electron) return;
                    if (p1 instanceof AntiElectron && p2 instanceof AntiElectron) return;
                    if (p1 instanceof AntiElectron && p2 instanceof Electron) return;
                    if (p1 instanceof Electron && p2 instanceof AntiElectron) return;
                    if (p1 instanceof AntiProton && p2 instanceof Proton) return;
                    if (p1 instanceof Proton && p2 instanceof AntiProton) return;
                    p1.addForce((-weakForce / p1.mass) * Math.cos(angle), (-weakForce / p1.mass) * Math.sin(angle));
                    p2.addForce((weakForce / p2.mass) * Math.cos(angle), (weakForce / p2.mass) * Math.sin(angle));
                } else if (distance < radDiff - 4) return;
            });
        });

        Bodies.map(p1 => {
            p1.update(dt);
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
                const angle = p5.atan2(p2.y - p1.y, p2.x - p1.x);

                if (distance <= radDiff / 2) {
                    let totalEnergy = Math.ceil((p1.energy + p2.energy) / 2);
                    if(
                        (p1 instanceof Proton && p2 instanceof Neutron) || (p1 instanceof Neutron && p2 instanceof Proton)
                    ) {
                        if(p1.age < 10 || p2.age < 10) return;
                        deleteBody(p1);
                        deleteBody(p2);
                        const n = new Nucleus(p5, [p1, p2]);
                        n.velX = dx * Math.cos(angle) / n.mass;
                        n.velY = dy * Math.sin(angle) / n.mass;
                        Bodies.push(
                            n
                        )
                    }
                    if(
                        (p1 instanceof (Proton || Neutron || AntiProton || AntiNeutron) && p2 instanceof Nucleus) || (p1 instanceof Nucleus && p2 instanceof (Proton || Neutron || AntiProton || AntiNeutron))
                    ) {
                        if(p1.age < 10 || p2.age < 10) return;
                        let nucleus: Nucleus = p1 instanceof Nucleus ? p1 : p2 as Nucleus;
                        let p: Proton = p1 instanceof Nucleus ? p2 : p1 as Proton;
                        deleteBody(nucleus);
                        deleteBody(p);
                        
                        const constituents = [];
                        for(let i=0; i<nucleus.amountOfNeutron; i++) {
                            constituents.push(new Neutron(p5, nucleus.x, nucleus.y))
                        }
                        for(let i=0; i<nucleus.amountOfProton; i++) {
                            constituents.push(new Proton(p5, nucleus.x, nucleus.y))
                        }

                        console.log(constituents);

                        const n = new Nucleus(p5, [p, ...constituents]);
                        n.velX = dx * Math.cos(angle) / n.mass;
                        n.velY = dy * Math.sin(angle) / n.mass;
                        Bodies.push(
                            n
                        )
                    }
                    if(
                        (p1 instanceof Nucleus && p2 instanceof Nucleus)
                    ) {
                        if(p1.age < 50 || p2.age < 50) return;
                        deleteBody(p1);
                        deleteBody(p2);

                        const cx = (p1.x + p2.x) / 2;
                        const cy = (p1.y + p2.y) / 2;

                        const constituents = [];
                        for(let i=0; i<p1.amountOfNeutron + p2.amountOfNeutron; i++) {
                            constituents.push(new Neutron(p5, cx, cy));
                        }
                        for(let i=0; i<p1.amountOfProton + p2.amountOfProton; i++) {
                            constituents.push(new Proton(p5, cx, cy))
                        }

                        const n = new Nucleus(p5, constituents);
                        n.velX = dx * Math.cos(angle) / n.mass;
                        n.velY = dy * Math.sin(angle) / n.mass;
                        Bodies.push(
                            n
                        );
                        explode(cx, cy);
                    }
                    if (
                        (p1 instanceof Proton && p2 instanceof AntiProton) || (p1 instanceof AntiProton && p2 instanceof Proton) ||
                        (p1 instanceof Electron && p2 instanceof AntiElectron) || (p1 instanceof AntiElectron && p2 instanceof Electron) ||
                        (p1 instanceof Neutron && p2 instanceof AntiNeutron) || (p1 instanceof Neutron && p2 instanceof AntiNeutron)
                    ) {
                        deleteBody(p1);
                        deleteBody(p2);
                        annihilate(p5, cx, cy, totalEnergy * 10);
                        explode(cx, cy)
                    }
                    if (
                        (p1 instanceof Proton && p2 instanceof Electron) || (p1 instanceof Electron && p2 instanceof Proton)
                    ) {
                        if (p1.age < 20 || p2.age < 20) return;
                        deleteBody(p1);
                        deleteBody(p2);
                        const n = new Neutron(p5, cx + Math.random() * 10, cy + Math.random() * 10);
                        n.velX = dx * Math.cos(angle) / n.mass;
                        n.velY = dy * Math.sin(angle) / n.mass;
                        Bodies.push(n);
                        explode(cx, cy);
                    }
                    if (
                        (p1 instanceof AntiProton && p2 instanceof AntiElectron) || (p1 instanceof AntiElectron && p2 instanceof AntiProton)
                    ) {
                        if (p1.age < 20 || p2.age < 20) return;
                        const n = new AntiNeutron(p5, cx, cy);
                        n.velX = dx * Math.cos(angle) / n.mass;
                        n.velY = dy * Math.sin(angle) / n.mass;
                        Bodies.push(n);
                        deleteBody(p1);
                        deleteBody(p2);
                        explode(cx, cy);
                    }
                    if ((p1 instanceof Proton && p2 instanceof Proton) || (p1 instanceof AntiProton && p2 instanceof AntiProton)) { // Proton + Proton Collision can create new Particle
                        const createdParticle = [];
                        while (totalEnergy >= 0) {
                            const choice = [Proton, AntiProton, Neutron, Electron, AntiElectron];
                            let choised = choice[Math.floor(Math.random() * choice.length)];
                            // for (let i = 0; i < 100; i++) {
                            //     choised = choice[Math.floor(Math.random() * choice.length)];
                            // }

                            // Calculate the maximum allowed kinetic energy for the new particle
                            const maxKineticEnergy = (totalEnergy - choised.RestEnergy) / choised.RestMass;

                            // Randomly generate velocity components for the new particle
                            const choisedVelX = (Math.random() * ((Math.abs(p1.velX) + Math.abs(p2.velX)))) - ((Math.abs(p1.velX) + Math.abs(p2.velX))) / 2;
                            const choisedVelY = (Math.random() * ((Math.abs(p1.velY) + Math.abs(p2.velY)))) - ((Math.abs(p1.velY) + Math.abs(p2.velY))) / 2;

                            // Calculate the kinetic energy of the new particle
                            const newParticleKineticEnergy = (0.5 * choised.RestMass * (choisedVelX * choisedVelX + choisedVelY * choisedVelY)) / 2;

                            // Check if the new particle's kinetic energy is within the allowed range
                            if (newParticleKineticEnergy <= maxKineticEnergy) {
                                totalEnergy -= (choised.RestMass + newParticleKineticEnergy) + 0.01;
                                if (totalEnergy < 0.1) {
                                    for (let i = 0; i < Math.floor(totalEnergy * 100); i++) {
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
                            for (const particle of createdParticle) {
                                sumEnergy += particle.energy;
                            }

                            explode(cx, cy);
                        }

                        deleteBody(p1);
                        deleteBody(p2);
                        Bodies.push(...createdParticle);
                        return;
                    }
                };
            })
        });

        t = new Date().getTime();
        requestAnimationFrame(update);
    }
    setTimeout(() => {
        t = new Date().getTime();
        requestAnimationFrame(update)
    }, 1500)
});



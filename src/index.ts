import P5 from "p5";
import { Particle, Nucleus, Proton, Bodies, Neutron, Electron } from "./particle";

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
        for (let i = 0; i < 1; i++) {
            const x = (Math.random() * window.innerWidth / 2) + (window.innerWidth / 4);
            const y = (Math.random() * window.innerHeight / 2) + (window.innerHeight / 4);
            const particles = [];
            for(let j=0; j<Math.floor(Math.random() * 360); j++) {
                let p = new Neutron(p5, (Math.random() * width / 10) + width / 3, (Math.random() * height / 10) + height / 3);
                if(j%2 == 0) {
                    p = new Proton(p5, (Math.random() * width / 10) + width / 3, (Math.random() * height / 10) + height / 3);
                }
                particles.push(
                    p,
                )
            }
            // Bodies.push(
            //     new Nucleus(
            //         p5,
            //         particles
            //     ),
            // );
            for(let j=50; j<window.innerHeight-50; j+=100) {
                for(let i=50; i<window.innerWidth-50; i+=100) {
                    Bodies.push(new Electron(
                        p5,
                        i,
                        j
                    ));
                }
            }

            for(let j=50; j<window.innerHeight-50; j+=100) {
                for(let i=100; i<window.innerWidth-50; i+=100) {
                    Bodies.push(new Proton(
                        p5,
                        i,
                        j
                    ));
                }
            }

            for(let j=100; j<window.innerHeight-50; j+=100) {
                for(let i=100; i<window.innerWidth-50; i+=100) {
                    Bodies.push(new Neutron(
                        p5,
                        i,
                        j
                    ));
                }
            }
        }
    }

    p5.draw = () => {
        const dt = p5.deltaTime / 10;
        p5.background("black");

        Bodies.map(p => {
            p.draw();
        });

        Bodies.map(p1 => {
            Bodies.map(p2 => {
                if(p1 == p2) return;
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = p5.sqrt(dx * dx + dy * dy);
                
                if(distance < ((p1.radius + p2.radius) / 2)) return;
                if(p1 instanceof Neutron && p2 instanceof Neutron) return;

                const force = ((p2.charge * p1.charge) / (distance * 2));
                const angle = p5.atan2(p2.y - p1.y, p2.x - p1.x);
                p1.addForce(-(force / p1.mass) * Math.cos(angle), -(force / p1.mass) * Math.sin(angle));
                p2.addForce((force / p2.mass) * Math.cos(angle), (force / p2.mass) * Math.sin(angle));
            })
        })
        
        Bodies.map(p => {
            p.update(dt);
        });
    }
});


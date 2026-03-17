const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

/* responsive canvas */
function resizeCanvas(){
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* matrix characters */
const letters = "アカサタナハマヤラワ01ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const chars = letters.split("");

const fontSize = 14;
let columns = Math.floor(canvas.width / fontSize);

/* rain drops */
let drops = [];
function initDrops(){
    columns = Math.floor(canvas.width / fontSize);
    drops = [];
    for(let i = 0; i < columns; i++){
        drops[i] = Math.random() * canvas.height;
    }
}
initDrops();
window.addEventListener("resize", initDrops);

/* signature */
let showSignature = false;
let opacity = 0;
let glowPulse = 0;

const message = "MADE BY MANU♥";
const msgArray = message.split("");

/* center horizontally */
function getStartX(){
    return Math.floor(columns / 2 - msgArray.length / 2);
}

/* trigger from unlock */
function triggerSignature(){
    showSignature = true;
}

/* main draw */
function draw(){

    /* fade trail */
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "#0F0";
    ctx.font = fontSize + "px monospace";

    /* matrix rain */
    for(let i = 0; i < drops.length; i++){

        const text = chars[Math.floor(Math.random()*chars.length)];

        ctx.fillText(text, i*fontSize, drops[i]*fontSize);

        if(drops[i]*fontSize > canvas.height && Math.random() > 0.9){
            drops[i] = 0;
        }

        drops[i]++;
    }

    /* signature */
    if(showSignature){

        const panel = document.querySelector(".panel");

        if(panel){

            const rect = panel.getBoundingClientRect();

            /* position just below panel */
            const safeGap = 30; // 👈 controls distance from panel
            const startY = Math.floor((rect.bottom + safeGap) / fontSize);
            const startX = getStartX();

            /* fade in */
            if(opacity < 1){
                opacity += 0.02;
            }

            ctx.globalAlpha = opacity;

            for(let i = 0; i < msgArray.length; i++){
                ctx.fillStyle = "#00ff00";
                ctx.fillText(
                    msgArray[i],
                    (startX + i) * fontSize,
                    startY * fontSize
                );
            }

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }
    }
}

/* loop */
setInterval(draw, 50);

/* make global */
window.triggerSignature = triggerSignature;
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

/* matrix characters */
const letters = "アカサタナハマヤラワ01ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const chars = letters.split("");

const fontSize = 14;
const columns = Math.floor(canvas.width / fontSize);

/* rain drops */
const drops = [];
for(let i = 0; i < columns; i++){
    drops[i] = Math.random() * canvas.height;
}

/* signature */
let showSignature = false;
let opacity = 0;
let glowPulse = 0;

const message = "MADE BY MANU♥";
const msgArray = message.split("");

/* center horizontally */
const startX = Math.floor(columns / 2 - msgArray.length / 2);

/* bottom position */
const startY = Math.floor(canvas.height / fontSize) - 3;

/* trigger from outside (unlock) */
function triggerSignature(){
    showSignature = true;
}

/* main draw */
function draw(){

    /* fade effect */
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "#0F0";
    ctx.font = fontSize + "px monospace";

    /* matrix rain */
    for(let i = 0; i < drops.length; i++){

        const text = chars[Math.floor(Math.random()*chars.length)];

        ctx.fillText(text, i*fontSize, drops[i]*fontSize);

        if(drops[i]*fontSize > canvas.height && Math.random() > 0.975){
            drops[i] = 0;
        }

        drops[i]++;
    }

    /* signature display */
    if(showSignature){

        /* smooth fade-in */
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

/* animation loop */
setInterval(draw, 50);

/* make function global (important) */
window.triggerSignature = triggerSignature;
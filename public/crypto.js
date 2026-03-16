/* ===== KEY GENERATION ===== */

async function getKey(password){

const enc = new TextEncoder();

const keyMaterial = await crypto.subtle.importKey(
"raw",
enc.encode(password),
"PBKDF2",
false,
["deriveKey"]
);

return crypto.subtle.deriveKey(
{
name:"PBKDF2",
salt:enc.encode("ciphernote"),
iterations:100000,
hash:"SHA-256"
},
keyMaterial,
{name:"AES-GCM",length:256},
false,
["encrypt","decrypt"]
);

}


/* ===== ENCRYPT NOTE ===== */

async function encrypt(text,password){

const iv = crypto.getRandomValues(new Uint8Array(12));
const key = await getKey(password);

const encrypted = await crypto.subtle.encrypt(
{name:"AES-GCM",iv},
key,
new TextEncoder().encode(text)
);

return{
iv:Array.from(iv),
data:Array.from(new Uint8Array(encrypted))
};

}


/* ===== DECRYPT NOTE ===== */

async function decrypt(data,password){

const key = await getKey(password);

const decrypted = await crypto.subtle.decrypt(
{name:"AES-GCM",iv:new Uint8Array(data.iv)},
key,
new Uint8Array(data.data)
);

return new TextDecoder().decode(decrypted);

}


/* ===== LOCK NOTE ===== */

async function saveNote(){

const noteField = document.getElementById("note");
const passwordField = document.getElementById("password");

const note = noteField.value;
const password = passwordField.value;

if(!note || !password){
alert("Enter password and note");
return;
}

const encrypted = await encrypt(note,password);

const now = new Date();

const payload = {
data: encrypted,
date: now.toLocaleDateString(),
time: now.toLocaleTimeString()
};

/* save to server */

await fetch("/save",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(payload)
});

alert("Note locked 🔐");

/* clear fields */

noteField.value="";
passwordField.value="";

/* allow new note */

noteField.readOnly=false;

}


/* ===== UNLOCK NOTE ===== */

async function loadNote(){

const password=document.getElementById("password").value;

if(!password){
alert("Enter password");
return;
}

try{

const res=await fetch("/load");
const notes=await res.json();

let unlockedText=null;

/* try decrypting every note */

for(let note of notes){

try{

const text=await decrypt(note.data,password);

unlockedText=text;
break;

}catch{

}

}

if(!unlockedText){
alert("No note found for this password ❌");
return;
}

const noteField=document.getElementById("note");

/* show note */

noteField.value=unlockedText;

/* prevent editing */

noteField.readOnly=true;

/* auto focus */

noteField.focus();

/* auto select */

noteField.select();

}catch{

alert("Unlock failed");

}

}


/* ===== PAGE LOAD ===== */

window.onload=()=>{

const noteField=document.getElementById("note");

noteField.readOnly=false;

};
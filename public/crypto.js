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


/* ===== PASSWORD HASHING ===== */

async function hashPassword(password){

const enc = new TextEncoder();
const data = enc.encode(password);

const hashBuffer = await crypto.subtle.digest("SHA-256", data);

return Array.from(new Uint8Array(hashBuffer))
.map(b => b.toString(16).padStart(2,"0"))
.join("");

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

/* encrypt note */

const encrypted = await encrypt(note,password);

/* hash password */

const passHash = await hashPassword(password);

const now = new Date();

const payload = {
data: encrypted,
date: now.toLocaleDateString(),
time: now.toLocaleTimeString(),
passHash: passHash
};

/* send to server */

const res = await fetch("https://ciphernote.onrender.com/save",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(payload)
});

const result = await res.json();

/* duplicate password check */

if(result.error){
alert("Password already used ❌");
return;
}

alert("Note locked 🔐");

/* clear fields */

noteField.value="";
passwordField.value="";
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

/* hash entered password */

const passHash = await hashPassword(password);

/* get notes */

const res = await fetch("https://ciphernote.onrender.com/load",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({ passHash })
});

const note = await res.json();

if(note.error){
alert("No note found ❌");
return;
};
const notes=await res.json();

/* decrypt */

const text = await decrypt(note.data,password);

const noteField=document.getElementById("note");

/* show note */

noteField.value=text;

/* prevent editing */

noteField.readOnly=true;

/* auto focus */

noteField.focus();

/* auto select */

noteField.select();

}catch{

alert("Unlock failed ❌");

}

}


/* ===== PAGE LOAD ===== */

window.onload=()=>{

const noteField=document.getElementById("note");

noteField.readOnly=false;

};
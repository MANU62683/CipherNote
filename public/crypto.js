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


/* ===== PASSWORD HASH ===== */

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

return {
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

/* create password hash */

const passHash = await hashPassword(password);

const now = new Date();

const payload = {
data: encrypted,
date: now.toLocaleDateString(),
time: now.toLocaleTimeString(),
passHash: passHash
};

try{

const res = await fetch("/save",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(payload)
});

const result = await res.json();

if(result.error){
alert("Password already used ❌");
return;
}

alert("Note locked 🔐");

/* clear fields */

noteField.value="";
passwordField.value="";

/* allow new note */

noteField.readOnly=false;

}catch(err){

alert("Save failed ❌");

}
document.getElementById("copyBtn").style.display = "none";/* hide copy button */

}


/* ===== UNLOCK NOTE ===== */

async function loadNote(){

const password=document.getElementById("password").value;

if(!password){
alert("Enter password");
return;
}

try{

/* hash password */

const passHash = await hashPassword(password);

/* get all notes */

const res = await fetch("/load");

const notes = await res.json();

/* find matching note */

const note = notes.find(n => n.passHash === passHash);

if(!note){
alert("No note found for this password ❌");
return;
}

/* decrypt */

const text = await decrypt(note.data,password);

const noteField=document.getElementById("note");
document.getElementById("copyBtn").style.display = "block";/* show copy button */

/* display note */

noteField.value=text;

/* disable editing */

noteField.readOnly=true;
triggerSignature();/* trigger matrix signature */
/* auto focus */

noteField.focus();


}catch{

alert("Unlock failed ❌");

}

}


/* ===== PAGE LOAD ===== */

window.onload = ()=>{

const noteField=document.getElementById("note");
document.getElementById("password").addEventListener("focus", resetUI); /* reset UI when password field is focused */
/* allow writing new note */

noteField.readOnly=false;

};

/***** COPY NOTE TO CLIPBOARD *****/
function copyNote(){

const noteField = document.getElementById("note");
const copyBtn = document.getElementById("copyBtn");

/* copy text */
navigator.clipboard.writeText(noteField.value)
.then(()=>{

/* optional feedback */
copyBtn.innerText = "✔";

/* reset after short delay */
setTimeout(()=>{

/* clear note */
noteField.value = "";

/* enable editing */
noteField.readOnly = false;

/* hide copy button */
copyBtn.style.display = "none";

/* reset button icon */
copyBtn.innerText = "📋";

/* clear password field */
document.getElementById("password").value = "";

/* focus for new input */
noteField.focus();

}, 800);

})
.catch(()=>{
alert("Copy failed ❌");
});

}

/* ===== RESET UI ===== */
function resetUI(){

const noteField = document.getElementById("note");
const passwordField = document.getElementById("password");
const copyBtn = document.getElementById("copyBtn");

/* only reset if note is currently locked/unlocked */
if(noteField.readOnly){

/* clear everything */
noteField.value = "";
passwordField.value = "";

/* enable editing */
noteField.readOnly = false;

/* hide copy button */
copyBtn.style.display = "none";

/* focus note for new input */
noteField.focus();

}

}
// DOM elements
const notesContainer = document.getElementById("notes-container");
const addBtn = document.getElementById("addbtn");
const overlay = document.getElementById("noteOverlay");
const cancelBtn = document.getElementById("cancelBtn");
const saveBtn = document.getElementById("saveBtn");
const msg = document.getElementById("msg");
const countSpan = document.getElementById("count");


const noteView = document.getElementById("noteView");
const viewTitle = document.getElementById("viewTitle");
const viewtxt= document.getElementById("viewText");

const Edit = document.getElementById("EditBtn");

const savebtn = document.getElementById("savebtn");  

document.addEventListener("DOMContentLoaded", () => {
  // Show popup on page load
  const popup = document.getElementById("popup");
  const closeBtn = document.getElementById("closePopup");

  popup.style.display = "block";  // show immediately after login

  closeBtn.addEventListener("click", () => {
    popup.style.display = "none"; // hide on close
  });
});

const usrname = localStorage.getItem("usrname");
         const mail = this.localStorage.getItem("email");

    
    window.addEventListener("DOMContentLoaded", function(){
         
    if(usrname && mail){
      document.getElementById("usrname").textContent=`Welcome ${usrname}`;
    }
    else{
      
       window.location.href = "/index.html";
    }
    });



// redirect to index if log out



   document.getElementById("logout").addEventListener("click", function(){
      localStorage.removeItem("user");
      localStorage.removeItem("usrname");
      localStorage.removeItem("email");
      window.location.href="/index.html";
      
      
    })

    let editId = null;






    let currentNote = null;

async function loadNotes() {

    // Clear existing notes
   const noteDivs = notesContainer.querySelectorAll(".NoteDiv:not(.template)");
noteDivs.forEach(div => div.remove()); // clear old notes

    const res = await fetch("/api/notes?email=" + localStorage.getItem("email"));
    const notes = await res.json();

    countSpan.innerText = notes.length === 0 ? "No note found." : `${notes.length} note(s) found.`;

    const template = document.querySelector(".NoteDiv.template");
    

    notes.forEach(note => {
        const noteDiv = template.cloneNode(true);
        noteDiv.classList.remove("template");
        noteDiv.style.display = "block";
        noteDiv.dataset.id = note._id;
        noteDiv.dataset.title = note.title;
        noteDiv.dataset.text = note.content;
        noteDiv.querySelector(".note-title").innerText = note.title;
        noteDiv.querySelector(".note-text").innerText = "Text is hidden.";

        notesContainer.appendChild(noteDiv);

        // Mouse hover
        noteDiv.addEventListener("mouseover", () => noteDiv.style.backgroundColor = "#fb8c92");
        noteDiv.addEventListener("mouseout", () => noteDiv.style.backgroundColor = "#f8bfbfff");

        // Menu toggle
        const menu = noteDiv.querySelector(".menu");
        const options = menu.querySelector(".options");
        const deleteBtn = options.querySelector(".delete");
        menu.querySelector(".dot").addEventListener("click", e => {
            e.stopPropagation();
            options.style.display = options.style.display === "block" ? "none" : "block";
        });

        // Delete note
        deleteBtn.addEventListener("click", async e => {
            e.stopPropagation();
            if(confirm("Delete this note?")){
                await fetch(`/api/notes/${note._id}`, { method: "DELETE" });
                
                loadNotes();
            }
        });

        // Open note view
        noteDiv.addEventListener("click", () => {
            options.style.display = "none";
            overlay.style.display = "none";
            currentNote = noteDiv;
            editId = noteDiv.dataset.id; 
            noteView.style.display = "flex";
            viewTitle.value = note.title;
            viewtxt.value = note.content;
            viewTitle.disabled = true;
            viewtxt.disabled = true;
            savebtn.style.display = "none";
            Edit.style.display = "";
        });
    });
}

// Show overlay for new note
addBtn.addEventListener("click", () => {
    noteView.style.display = "none";
    overlay.style.display = "flex";
    editId = null;
    document.getElementById("noteTitle").value = "";
    document.getElementById("text").value = "";
});

// Cancel overlay
cancelBtn.addEventListener("click", () => {
    overlay.style.display = "none";
    msg.innerText = "";
});

// Save note (create or update)
saveBtn.addEventListener("click", async () => {
    const title = document.getElementById("noteTitle").value.trim();
    const text = document.getElementById("text").value.trim();
    let mail = localStorage.getItem("email");
    if(!title || !text){
        msg.innerText = "Write something before save";
        return;
    }

    if(editId){ // update
        await fetch(`/api/notes/${editId}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ title, content: text,email:mail})
        });
    } else { // create
        await fetch("/api/notes", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ title, content: text , email:mail })
        });
    }

    overlay.style.display = "none";
    document.getElementById("noteTitle").value = "";
    document.getElementById("text").value = "";
    loadNotes();
});

// Note view buttons
document.getElementById("BackBtn").addEventListener("click", () => noteView.style.display = "none");

Edit.addEventListener("click", () => {
    viewTitle.disabled = false;
    viewtxt.disabled = false;
    Edit.style.display = "none";
    savebtn.style.display = "";
});

// Save edit from note view
savebtn.addEventListener("click", async () => {
    if(currentNote){
        const id = currentNote.dataset.id;
        const title = viewTitle.value;
        const text = viewtxt.value;
        await fetch(`/api/notes/${id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ title, content: text })
        });
    }
    viewTitle.disabled = true;
    viewtxt.disabled = true;
    savebtn.style.display = "none";
    Edit.style.display = "";
    loadNotes();
});


loadNotes();
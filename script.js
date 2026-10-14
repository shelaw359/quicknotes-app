
"use strict";

// ===== Select HTML elements =====
const form = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const categorySelect = document.querySelector("#note-category");
const searchInput = document.querySelector("#search-input");
const notesList = document.querySelector("#notes-list");
const noteCount = document.querySelector("#note-count");
const errorMessage = document.querySelector("#error-message");

// ===== Constants =====
const STORAGE_KEY = "quicknotes";
const MAX_LENGTH = 200;

// ===== Load notes from localStorage =====
function loadNotes() {
    try {
        const savedNotes = localStorage.getItem(STORAGE_KEY);

        if (!savedNotes) {
            return [];
        }

        const parsedNotes = JSON.parse(savedNotes);

        return Array.isArray(parsedNotes) ? parsedNotes : [];
    } catch (error) {
        return [];
    }
}

// Each note contains: id, text, category and createdAt.
let notes = loadNotes();

// ===== Save notes to localStorage =====
function saveNotes() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
        console.error("Unable to save notes:", error);
    }
}

// ===== Helper functions =====
function capitalise(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function formatDate(date) {
    return date.toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function showError(message) {
    errorMessage.textContent = message;
}

function clearError() {
    errorMessage.textContent = "";
}

// ===== Update the note count =====
function updateCount() {
    if (notes.length === 0) {
        noteCount.textContent = "You have no notes yet.";
    } else if (notes.length === 1) {
        noteCount.textContent = "You have 1 note.";
    } else {
        noteCount.textContent = `You have ${notes.length} notes.`;
    }
}

// ===== Create one note card =====
function createNoteCard(note) {
    const card = document.createElement("li");
    card.className = `note-card category-${note.category}`;

    const text = document.createElement("p");
    text.className = "note-text";
    text.textContent = note.text;

    const meta = document.createElement("div");
    meta.className = "note-meta";

    const categoryLabel = document.createElement("span");
    categoryLabel.className = "category-label";
    categoryLabel.textContent = capitalise(note.category);

    const date = document.createElement("span");
    date.className = "note-date";
    date.textContent = note.createdAt;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function () {
        deleteNote(note.id);
    });

    meta.append(categoryLabel, date, deleteButton);
    card.append(text, meta);

    return card;
}

// ===== Display notes and search results =====
function render() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    const visibleNotes = notes.filter(function (note) {
        return note.text.toLowerCase().includes(searchTerm);
    });

    // Clear the existing list safely.
    notesList.textContent = "";

    if (searchTerm !== "" && visibleNotes.length === 0) {
        const message = document.createElement("li");
        message.className = "empty-message";
        message.textContent = "No notes match your search.";

        notesList.appendChild(message);
    } else {
        visibleNotes.forEach(function (note) {
            notesList.appendChild(createNoteCard(note));
        });
    }

    updateCount();
}

// ===== Delete a note =====
function deleteNote(id) {
    notes = notes.filter(function (note) {
        return note.id !== id;
    });

    saveNotes();
    render();
}

// ===== Add a note and validate the input =====
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = noteInput.value.trim();

    if (text === "") {
        showError("Please type a note first.");
        return;
    }

    if (text.length > MAX_LENGTH) {
        showError("Notes must be 200 characters or fewer.");
        return;
    }

    clearError();

    const note = {
        id: Date.now(),
        text: text,
        category: categorySelect.value,
        createdAt: formatDate(new Date())
    };

    notes.unshift(note);

    saveNotes();

    noteInput.value = "";
    noteInput.focus();

    render();
});

// ===== Search as the user types =====
searchInput.addEventListener("input", render);

// ===== Display saved notes when the page opens =====
render();

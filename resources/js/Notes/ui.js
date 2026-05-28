import { getNotes, storeNote, updateNote, deleteNote } from './api';
import { initTheme } from './theme';
import { initPomodoro } from './pomodoro';
import { initReminders, checkReminders } from './reminders';
import * as bootstrap from 'bootstrap';

// Application State
let activeView = 'notes'; // 'notes', 'reminders', 'archive', 'trash', 'pomodoro'
let activeLabel = '';
let searchQuery = '';
let layoutMode = 'grid'; // 'grid' or 'list'
let notesList = [];
let editModal = null;
let activeFormColor = '';

// Pastel Colors defined in CSS
const colorPalette = [
    { name: 'white', value: '#ffffff', label: 'Default' },
    { name: 'red', value: '#f28b82', label: 'Merah' },
    { name: 'orange', value: '#fbbc04', label: 'Jingga' },
    { name: 'yellow', value: '#fff475', label: 'Kuning' },
    { name: 'green', value: '#ccff90', label: 'Hijau' },
    { name: 'teal', value: '#a7ffeb', label: 'Toska' },
    { name: 'blue', value: '#cbf0f8', label: 'Biru Muda' },
    { name: 'darkblue', value: '#aecbfa', label: 'Biru' },
    { name: 'purple', value: '#d7aefb', label: 'Ungu' },
    { name: 'pink', value: '#fdcfe8', label: 'Merah Muda' },
    { name: 'brown', value: '#e6c9a8', label: 'Cokelat' },
    { name: 'gray', value: '#e8eaed', label: 'Abu-abu' }
];

export function initUI() {
    // Inisialisasi Modul Lain
    initTheme();
    initPomodoro();
    initReminders(() => refreshNotes());

    // Bootstrap Modal
    editModal = new bootstrap.Modal(document.getElementById('editModal'));

    // Bind event listeners
    setupNavigation();
    setupNoteForm();
    setupSearch();
    setupLayoutToggle();
    setupEditModal();

    // Shadow on scroll
    window.addEventListener('scroll', () => {
        const navTop = document.getElementById('nav-top-side');
        if (window.scrollY > 10) {
            navTop.classList.add('shadow-custom');
        } else {
            navTop.classList.remove('shadow-custom');
        }
    });

    // Initial load
    refreshNotes();
}

// -------------------------------------------------------------
// Navigation & Sidebar
// -------------------------------------------------------------
function setupNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const view = item.dataset.view;
            activeView = view;
            activeLabel = item.dataset.label || '';

            switchView(view);
        });
    });
}

function switchView(view) {
    const notesContainer = document.getElementById('notes-container');
    const pomodoroContainer = document.getElementById('pomodoro-container');
    const formArea = document.getElementById('form-area');

    if (view === 'pomodoro') {
        notesContainer.classList.add('d-none');
        pomodoroContainer.classList.remove('d-none');
    } else {
        notesContainer.classList.remove('d-none');
        pomodoroContainer.classList.add('d-none');

        // Sembunyikan form input jika bukan di halaman utama Catatan
        if (view === 'notes' && !activeLabel) {
            formArea.classList.remove('d-none');
        } else {
            formArea.classList.add('d-none');
        }

        refreshNotes();
    }
}

// Render dynamic label list in sidebar
function renderSidebarLabels(notes) {
    const labelListContainer = document.getElementById('sidebar-labels-list');
    if (!labelListContainer) return;

    // Get unique labels from notes
    const labels = [...new Set(notes.map(n => n.label).filter(l => l && l.trim() !== ''))];
    labelListContainer.innerHTML = '';

    if (labels.length === 0) {
        const title = document.querySelector('.labels-header');
        if (title) title.classList.add('d-none');
        return;
    } else {
        const title = document.querySelector('.labels-header');
        if (title) title.classList.remove('d-none');
    }

    labels.forEach(label => {
        const item = document.createElement('div');
        item.className = `sidebar-item ${activeLabel === label ? 'active' : ''}`;
        item.dataset.view = 'label';
        item.dataset.label = label;
        item.innerHTML = `<i class="bi bi-tag"></i> <span>${escapeHTML(label)}</span>`;
        
        item.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            activeView = 'notes';
            activeLabel = label;
            switchView('notes');
        });
        
        labelListContainer.appendChild(item);
    });
}

// -------------------------------------------------------------
// Note Form (Create Note)
// -------------------------------------------------------------
function setupNoteForm() {
    const formArea = document.getElementById('form-area');
    const triggerForm = document.getElementById('trigger-form');
    const form = document.getElementById('form');
    const closeBtn = document.getElementById('btn-close');
    const fillContent = document.getElementById('fill-content');
    const formPaletteBtn = document.getElementById('form-palette-btn');

    if (!triggerForm) return;
    // Sudah benar
    triggerForm.addEventListener('click', () => {
        triggerForm.classList.add('d-none');
        form.classList.remove('d-none');
        fillContent.focus();
    });

    // Close form and save
    const saveAndCloseForm = async () => {
        triggerForm.classList.remove('d-none');
        form.classList.add('d-none');
        await saveNewNote();
    };
    
    closeBtn.addEventListener('click', (e)=> {
        e.stopPropagation();
        saveAndCloseForm();
    });

    document.addEventListener('click', (e) => {
        // Close if click outside form area and edit modals/color popovers
        if (!formArea.contains(e.target) && 
            !e.target.closest('.color-picker-popover') && 
            !e.target.closest('.modal') && 
            !form.classList.contains('d-none')) {
            saveAndCloseForm();
        }
    });

    // Auto-grow textarea
    fillContent.addEventListener('input', () => {
        fillContent.style.height = 'auto';
        fillContent.style.height = fillContent.scrollHeight + 'px';
    });

    // Color picker for new note form
    formPaletteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleColorPopover(formPaletteBtn, (colorName) => {
            activeFormColor = colorName;
            form.className = 'rounded shadow-sm';
            colorPalette.forEach(c => form.classList.remove(`note-color-${c.name}`));
            if (colorName && colorName !== 'white') {
                form.classList.add(`note-color-${colorName}`);
            }
        });
    });
}

async function saveNewNote() {
    const titleVal = document.getElementById('fill-title').value.trim();
    const contentVal = document.getElementById('fill-content').value.trim();
    const reminderVal = document.getElementById('form-reminder').value;
    const labelVal = document.getElementById('form-label').value.trim();

    if (!titleVal && !contentVal) {
        resetFormInputs();
        return; // don't save empty notes
    }

    const data = {
        title: titleVal || null,
        content: contentVal || null,
        color: activeFormColor || null,
        label: labelVal || null,
        reminder_at: reminderVal ? new Date(reminderVal).toISOString() : null,
        is_pinned: false,
        is_archived: false,
        is_trashed: false
    };

    try {
        await storeNote(data);
        resetFormInputs();
        await refreshNotes();
    } catch (e) {
        console.error('Error saving note:', e);
    }
}

function resetFormInputs() {
    document.getElementById('fill-title').value = '';
    const fillContent = document.getElementById('fill-content');
    fillContent.value = '';
    fillContent.style.height = 'auto';
    document.getElementById('form-reminder').value = '';
    document.getElementById('form-label').value = '';
    activeFormColor = '';
    
    const form = document.getElementById('form');
    form.className = 'rounded shadow-sm d-none';
    colorPalette.forEach(c => form.classList.remove(`note-color-${c.name}`));
}

// -------------------------------------------------------------
// Note Grid & Rendering
// -------------------------------------------------------------
export async function refreshNotes() {
    try {
        const status = activeView === 'archive' ? 'archive' : (activeView === 'trash' ? 'trash' : '');
        const search = searchQuery;
        const label = activeLabel;

        const allNotes = await getNotes({ search, status, label });
        notesList = allNotes;

        // Render dynamic labels list based on active notes
        renderSidebarLabels(allNotes);

        const pinnedArea = document.getElementById('pinned-notes-area');
        const notesArea = document.getElementById('notes-area');
        const pinnedTitle = document.getElementById('pinned-section-title');
        const othersTitle = document.getElementById('others-section-title');

        pinnedArea.innerHTML = '';
        notesArea.innerHTML = '';

        // If filtering by Reminders menu, locally filter notes having reminder_at set
        let filteredNotes = allNotes;
        if (activeView === 'reminders') {
            filteredNotes = allNotes.filter(n => n.reminder_at !== null && !n.is_trashed && !n.is_archived);
        }

        const pinnedNotes = filteredNotes.filter(n => n.is_pinned);
        const otherNotes = filteredNotes.filter(n => !n.is_pinned);

        // Hide/Show Pinned Section Headers
        if (pinnedNotes.length > 0 && activeView !== 'archive' && activeView !== 'trash') {
            pinnedTitle.classList.remove('d-none');
            othersTitle.classList.remove('d-none');
            pinnedNotes.forEach(note => pinnedArea.appendChild(createNoteCard(note)));
        } else {
            pinnedTitle.classList.add('d-none');
            othersTitle.classList.add('d-none');
        }

        // Render others & Empty State handling
        const emptyState = document.getElementById('empty-state');
        if (otherNotes.length > 0 || pinnedNotes.length > 0) {
            if (emptyState) emptyState.classList.add('d-none');
            notesArea.classList.remove('d-none');
            otherNotes.forEach(note => notesArea.appendChild(createNoteCard(note)));
        } else {
            if (emptyState) emptyState.classList.remove('d-none');
            notesArea.classList.add('d-none');
        }

        // Check reminders for alarms
        checkReminders(notesList);

    } catch (e) {
        console.error('Error refreshing notes:', e);
    }
}

function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = 'notes rounded col-3 shadow-sm';
    if (note.color && note.color !== 'white') {
        card.classList.add(`note-color-${note.color}`);
    }

    // Pin Button (top right, hide in archive/trash)
    if (activeView !== 'archive' && activeView !== 'trash') {
        const pinBtn = document.createElement('button');
        pinBtn.className = `pin-btn ${note.is_pinned ? 'pinned' : ''}`;
        pinBtn.innerHTML = `<i class="bi bi-pin-angle${note.is_pinned ? '-fill' : ''}"></i>`;
        pinBtn.title = note.is_pinned ? 'Lepas Sematan' : 'Sematkan Catatan';
        pinBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await updateNote(note.id, { is_pinned: !note.is_pinned });
            refreshNotes();
        });
        card.appendChild(pinBtn);
    }

    // Text content container
    const textContainer = document.createElement('div');
    textContainer.style.flexGrow = '1';

    if (note.title) {
        const titleEl = document.createElement('div');
        titleEl.id = 'note-title';
        titleEl.textContent = note.title;
        textContainer.appendChild(titleEl);
    }

    if (note.content) {
        const contentEl = document.createElement('div');
        contentEl.id = 'note-content';
        contentEl.textContent = note.content;
        textContainer.appendChild(contentEl);
    }
    card.appendChild(textContainer);

    // Footer with Chips & Action Tools
    const footer = document.createElement('div');
    footer.className = 'note-footer';

    // Chips
    const chipsContainer = document.createElement('div');
    chipsContainer.className = 'chip-container';

    if (note.reminder_at) {
        const isPast = new Date(note.reminder_at) <= new Date();
        const alarmChip = document.createElement('span');
        alarmChip.className = `note-chip ${isPast ? 'alarm-active' : ''}`;
        alarmChip.innerHTML = `<i class="bi bi-bell"></i> <span>${formatRelativeTime(note.reminder_at)}</span>`;
        chipsContainer.appendChild(alarmChip);
    }

    if (note.label) {
        const labelChip = document.createElement('span');
        labelChip.className = 'note-chip';
        labelChip.innerHTML = `<i class="bi bi-tag"></i> <span>${escapeHTML(note.label)}</span>`;
        chipsContainer.appendChild(labelChip);
    }
    footer.appendChild(chipsContainer);

    // Card Action Tools
    const tools = document.createElement('div');
    tools.className = 'note-card-tools';

    if (!note.is_trashed) {
        // Palette
        const paletteBtn = document.createElement('button');
        paletteBtn.className = 'tool-btn';
        paletteBtn.innerHTML = '<i class="bi bi-palette"></i>';
        paletteBtn.title = 'Ubah warna';
        paletteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleColorPopover(paletteBtn, async (colorName) => {
                await updateNote(note.id, { color: colorName });
                refreshNotes();
            });
        });
        tools.appendChild(paletteBtn);

        // Label Tag
        const labelBtn = document.createElement('button');
        labelBtn.className = 'tool-btn';
        labelBtn.innerHTML = '<i class="bi bi-tag"></i>';
        labelBtn.title = 'Ubah label';
        labelBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const newLabel = prompt('Masukkan label catatan:', note.label || '');
            if (newLabel !== null) {
                await updateNote(note.id, { label: newLabel.trim() || null });
                refreshNotes();
            }
        });
        tools.appendChild(labelBtn);

        // Archive
        const archiveBtn = document.createElement('button');
        archiveBtn.className = 'tool-btn';
        archiveBtn.innerHTML = `<i class="bi bi-archive${note.is_archived ? '-fill' : ''}"></i>`;
        archiveBtn.title = note.is_archived ? 'Pindahkan ke Catatan' : 'Arsip';
        archiveBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await updateNote(note.id, { is_archived: !note.is_archived });
            refreshNotes();
        });
        tools.appendChild(archiveBtn);

        // Trash
        const trashBtn = document.createElement('button');
        trashBtn.className = 'tool-btn';
        trashBtn.innerHTML = '<i class="bi bi-trash"></i>';
        trashBtn.title = 'Hapus';
        trashBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            // Move to trash
            await updateNote(note.id, { is_trashed: true, is_pinned: false });
            refreshNotes();
        });
        tools.appendChild(trashBtn);
    } else {
        // Restore
        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'btn btn-sm btn-outline-secondary py-1 px-2 border-0';
        restoreBtn.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i> Pulihkan';
        restoreBtn.title = 'Pulihkan Catatan';
        restoreBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await updateNote(note.id, { is_trashed: false });
            refreshNotes();
        });
        tools.appendChild(restoreBtn);

        // Delete Permanently
        const deletePermBtn = document.createElement('button');
        deletePermBtn.className = 'btn btn-sm btn-outline-danger py-1 px-2 border-0 ms-2';
        deletePermBtn.innerHTML = '<i class="bi bi-trash-fill"></i> Hapus';
        deletePermBtn.title = 'Hapus Permanen';
        deletePermBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('Hapus catatan ini secara permanen? Tindakan ini tidak bisa dibatalkan.')) {
                await deleteNote(note.id);
                refreshNotes();
            }
        });
        tools.appendChild(deletePermBtn);
    }

    footer.appendChild(tools);
    card.appendChild(footer);

    // Open Edit Modal on Card Click
    card.addEventListener('click', () => {
        openEditModal(note);
    });

    return card;
}

// -------------------------------------------------------------
// Color Picker Popover
// -------------------------------------------------------------
let activePopover = null;

function toggleColorPopover(triggerBtn, selectCallback) {
    if (activePopover) {
        activePopover.remove();
        if (activePopover.trigger === triggerBtn) {
            activePopover = null;
            return;
        }
    }

    const popover = document.createElement('div');
    popover.className = 'color-picker-popover';
    popover.trigger = triggerBtn;

    colorPalette.forEach(color => {
        const opt = document.createElement('div');
        opt.className = 'color-option';
        opt.style.backgroundColor = color.value;
        opt.title = color.label;
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            selectCallback(color.name);
            popover.remove();
            activePopover = null;
        });
        popover.appendChild(opt);
    });

    // Position popover relative to trigger button
    document.body.appendChild(popover);
    const rect = triggerBtn.getBoundingClientRect();
    popover.style.top = `${rect.top + window.scrollY - popover.offsetHeight - 8}px`;
    popover.style.left = `${rect.left + window.scrollX - (popover.offsetWidth / 2) + (rect.width / 2)}px`;

    activePopover = popover;

    // Close when click elsewhere
    const closeClick = (e) => {
        if (!popover.contains(e.target) && e.target !== triggerBtn && !triggerBtn.contains(e.target)) {
            popover.remove();
            activePopover = null;
            document.removeEventListener('click', closeClick);
        }
    };
    setTimeout(() => document.addEventListener('click', closeClick), 10);
}

// -------------------------------------------------------------
// Search Function
// -------------------------------------------------------------
function setupSearch() {
    let searchTimeout = null;
    const searchInput = document.getElementById('search');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = searchInput.value;
            refreshNotes();
        }, 300);
    });
}

// -------------------------------------------------------------
// Grid vs List Layout Toggle
// -------------------------------------------------------------
function setupLayoutToggle() {
    const btnToggle = document.getElementById('btn-layout-toggle');
    if (!btnToggle) return;

    btnToggle.addEventListener('click', () => {
        const icon = btnToggle.querySelector('i');
        const pinnedArea = document.getElementById('pinned-notes-area');
        const notesArea = document.getElementById('notes-area');

        if (layoutMode === 'grid') {
            layoutMode = 'list';
            icon.className = 'bi bi-grid';
            btnToggle.title = 'Tampilan Grid';
            pinnedArea.classList.add('list-view');
            notesArea.classList.add('list-view');
        } else {
            layoutMode = 'grid';
            icon.className = 'bi bi-view-list';
            btnToggle.title = 'Tampilan Baris';
            pinnedArea.classList.remove('list-view');
            notesArea.classList.remove('list-view');
        }
    });
}

// -------------------------------------------------------------
// Edit Modal (Update / Delete)
// -------------------------------------------------------------
function setupEditModal() {
    const modalEl = document.getElementById('editModal');
    if (!modalEl) return;

    const fillContentEdit = document.getElementById('fill-content-edit');
    const closeBtnUpdate = document.getElementById('btn-close-update');
    const deleteBtn = document.getElementById('btn-delete');
    const archiveBtn = document.getElementById('btn-archive-edit');
    const paletteBtn = document.getElementById('btn-color-edit');
    const reminderTrigger = document.getElementById('btn-reminder-edit-trigger');
    const labelTrigger = document.getElementById('btn-label-edit-trigger');
    const reminderWrapper = document.getElementById('modal-reminder-wrapper');
    const labelWrapper = document.getElementById('modal-label-wrapper');

    // Auto-grow textarea inside modal
    fillContentEdit.addEventListener('input', () => {
        fillContentEdit.style.height = 'auto';
        fillContentEdit.style.height = fillContentEdit.scrollHeight + 'px';
    });

    modalEl.addEventListener('shown.bs.modal', () => {
        fillContentEdit.style.height = 'auto';
        fillContentEdit.style.height = fillContentEdit.scrollHeight + 'px';
        fillContentEdit.focus();
    });

    // Close button
    closeBtnUpdate.addEventListener('click', () => {
        editModal.hide();
    });

    // Handle update when modal closes
    modalEl.addEventListener('hide.bs.modal', async () => {
        const id = modalEl.dataset.activeId;
        const isDeleteAction = modalEl.dataset.isDeleting === 'true';
        if (isDeleteAction) {
            modalEl.removeAttribute('data-is-deleting');
            return;
        }

        // Gather updated values
        const titleVal = document.getElementById('fill-title-edit').value.trim();
        const contentVal = document.getElementById('fill-content-edit').value.trim();
        const reminderVal = document.getElementById('edit-reminder').value;
        const labelVal = document.getElementById('edit-label').value.trim();
        const colorVal = modalEl.dataset.color || null;

        if (!titleVal && !contentVal) {
            // Delete if title & content cleared
            modalEl.setAttribute('data-is-deleting', 'true');
            await updateNote(id, { is_trashed: true, is_pinned: false });
            refreshNotes();
            return;
        }

        const data = {
            title: titleVal || null,
            content: contentVal || null,
            reminder_at: reminderVal ? new Date(reminderVal).toISOString() : null,
            label: labelVal || null,
            color: colorVal
        };

        try {
            await updateNote(id, data);
            refreshNotes();
        } catch (e) {
            console.error('Error updating note:', e);
        }
    });

    // Permanently or Soft Delete inside Modal
    deleteBtn.addEventListener('click', async () => {
        const id = modalEl.dataset.activeId;
        const isTrashedMode = activeView === 'trash';
        
        modalEl.setAttribute('data-is-deleting', 'true');
        
        if (isTrashedMode) {
            if (confirm('Hapus catatan ini secara permanen?')) {
                await deleteNote(id);
            } else {
                modalEl.removeAttribute('data-is-deleting');
                return;
            }
        } else {
            await updateNote(id, { is_trashed: true, is_pinned: false });
        }
        
        editModal.hide();
        refreshNotes();
    });

    // Archive toggle inside Modal
    archiveBtn.addEventListener('click', async () => {
        const id = modalEl.dataset.activeId;
        const isArchived = modalEl.dataset.isArchived === 'true';
        
        modalEl.setAttribute('data-is-deleting', 'true');
        await updateNote(id, { is_archived: !isArchived });
        editModal.hide();
        refreshNotes();
    });

    // Color Palette inside Modal
    paletteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleColorPopover(paletteBtn, (colorName) => {
            modalEl.dataset.color = colorName;
            
            // Set modal body background
            const modalContent = modalEl.querySelector('.modal-content');
            modalContent.className = 'modal-content';
            colorPalette.forEach(c => modalContent.classList.remove(`note-color-${c.name}`));
            if (colorName && colorName !== 'white') {
                modalContent.classList.add(`note-color-${colorName}`);
            }
        });
    });

    // Toggle collapsible reminder
    reminderTrigger.addEventListener('click', () => {
        reminderWrapper.classList.toggle('d-none');
    });

    // Toggle collapsible label
    labelTrigger.addEventListener('click', () => {
        labelWrapper.classList.toggle('d-none');
        if (!labelWrapper.classList.contains('d-none')) {
            document.getElementById('edit-label').focus();
        }
    });
}

function openEditModal(note) {
    const modalEl = document.getElementById('editModal');
    modalEl.dataset.activeId = note.id;
    modalEl.dataset.isArchived = note.is_archived ? 'true' : 'false';
    modalEl.dataset.color = note.color || '';

    // Inputs
    document.getElementById('fill-title-edit').value = note.title || '';
    document.getElementById('fill-content-edit').value = note.content || '';
    document.getElementById('edit-label').value = note.label || '';
    
    // Set reminder
    const reminderInput = document.getElementById('edit-reminder');
    if (note.reminder_at) {
        // Convert to local ISO format for datetime-local input
        const localDate = new Date(note.reminder_at);
        const offset = localDate.getTimezoneOffset();
        const adjustedDate = new Date(localDate.getTime() - (offset * 60 * 1000));
        reminderInput.value = adjustedDate.toISOString().substring(0, 16);
    } else {
        reminderInput.value = '';
    }

    // Toggle visibility of input wrappers depending on note metadata
    const reminderWrapper = document.getElementById('modal-reminder-wrapper');
    const labelWrapper = document.getElementById('modal-label-wrapper');

    if (note.reminder_at) {
        reminderWrapper.classList.remove('d-none');
    } else {
        reminderWrapper.classList.add('d-none');
    }

    if (note.label) {
        labelWrapper.classList.remove('d-none');
    } else {
        labelWrapper.classList.add('d-none');
    }

    // Archive button UI inside modal (icon update)
    const archiveBtn = document.getElementById('btn-archive-edit');
    const archiveIcon = archiveBtn.querySelector('i');
    if (note.is_archived) {
        archiveIcon.className = 'bi bi-archive-fill';
        archiveBtn.title = 'Pindahkan ke Catatan';
    } else {
        archiveIcon.className = 'bi bi-archive';
        archiveBtn.title = 'Arsip';
    }

    // Delete button icon update
    const deleteBtn = document.getElementById('btn-delete');
    const deleteIcon = deleteBtn.querySelector('i');
    if (note.is_trashed) {
        deleteIcon.className = 'bi bi-trash-fill';
        deleteBtn.title = 'Hapus Permanen';
    } else {
        deleteIcon.className = 'bi bi-trash';
        deleteBtn.title = 'Hapus';
    }

    // Hide/Show edit control buttons if in Trash (cannot change properties in trash)
    const formsControls = document.querySelectorAll('.edit-tool-control');
    const isTrashed = note.is_trashed;
    
    formsControls.forEach(el => {
        if (isTrashed) {
            el.classList.add('d-none');
        } else {
            el.classList.remove('d-none');
        }
    });
    
    document.getElementById('fill-title-edit').readOnly = isTrashed;
    document.getElementById('fill-content-edit').readOnly = isTrashed;
    reminderInput.disabled = isTrashed;

    // Apply color to modal background
    const modalContent = modalEl.querySelector('.modal-content');
    modalContent.className = 'modal-content';
    colorPalette.forEach(c => modalContent.classList.remove(`note-color-${c.name}`));
    if (note.color && note.color !== 'white') {
        modalContent.classList.add(`note-color-${note.color}`);
    }

    // Show modal
    editModal.show();
}

// -------------------------------------------------------------
// Utilities
// -------------------------------------------------------------
function formatRelativeTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    const timeString = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) {
        return `Hari ini, ${timeString}`;
    } else if (isTomorrow) {
        return `Besok, ${timeString}`;
    } else {
        return `${date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}, ${timeString}`;
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

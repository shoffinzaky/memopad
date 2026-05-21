import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as bootstrap from 'bootstrap';
import '../../css/Notes/notes.css'
import axios from 'axios';
import { createElement } from './helper';

let editModal = null;
let isDeleting = false;

document.addEventListener('DOMContentLoaded', async()=>{
    fetchNotes();
    const formArea = document.getElementById('form-area');
    const triggerForm = document.getElementById('trigger-form');
    const form = document.getElementById('form');
    editModal = new bootstrap.Modal(document.getElementById('editModal'));

    triggerForm.addEventListener('click',()=>{
        triggerForm.classList.add('d-none');
        form.classList.remove('d-none');
        document.getElementById('fill-content').focus();
    })

    document.addEventListener('click',(e)=>{

        if(!formArea.contains(e.target)) {
            triggerForm.classList.remove('d-none');
            form.classList.add('d-none');
            store();
        }
    })

    const fillContent = document.getElementById('fill-content')
    fillContent.addEventListener('input', () => {
        fillContent.style.height = 'auto';
        fillContent.style.height = fillContent.scrollHeight + 'px';
    })
    const fillContentEdit = document.getElementById('fill-content-edit')
    fillContentEdit.addEventListener('input', () => {
        fillContentEdit.style.height = 'auto';
        fillContentEdit.style.height = fillContentEdit.scrollHeight + 'px';
    })

    const closeBtn = document.getElementById('btn-close');
    closeBtn.addEventListener('click',(e)=>{
        triggerForm.classList.remove('d-none');
        form.classList.add('d-none');
        store()
    })

    const closeBtnUpdate = document.getElementById('btn-close-update');
    closeBtnUpdate.addEventListener('click', () => {
        editModal.hide();
    })

    const delBtn = document.getElementById('btn-delete');
    delBtn.addEventListener('click', () => {
        const id = document.getElementById('editModal').dataset.activeId;
        isDeleting = true;
        destroy(id);
    })    
    document.getElementById('editModal').addEventListener('shown.bs.modal', () => {
        const fillContentEdit = document.getElementById('fill-content-edit');
        setTimeout(() => {
            fillContentEdit.style.height = 'auto';
            fillContentEdit.style.height = fillContentEdit.scrollHeight + 'px';
            console.log('scrollHeight:', fillContentEdit.scrollHeight);
        }, 50);
        fillContentEdit.focus();

    })

    document.getElementById('editModal').addEventListener('hide.bs.modal', () => {
        if(isDeleting) {
            isDeleting = false;
            return;
        }
        const id = document.getElementById('editModal').dataset.activeId;
        update(id);
    })

    //Searching
    let searchTimeout = null;
    const searchInput =  document.getElementById('search');
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            fetchNotes(searchInput.value);
        }, 500);
    })

    window.addEventListener('scroll', () => {
        const navTop = document.getElementById('nav-top-side');
        if(window.scrollY > 10) {
            navTop.classList.add('shadow-custom');
        } else {
            navTop.classList.remove('shadow-custom');
        }
    })
})

async function store(){
    const inputs = document.querySelectorAll('.data-content');
    const data ={};

    inputs.forEach(input => {
        data[input.name] = input.value;
    });
    
    //validasi
    if(!data.title && !data.content){
        return;
    }
    console.log(data);

    try{
    axios.post('api/notes', data)
            console.log('data terkirim')
            inputs.forEach(input => {
                input.value = '';
            });

            await fetchNotes()

        }catch(error) {
            console.log('Error:', error);
        };
}

async function fetchNotes(keyword = '') {
    document.getElementById('notes-area').innerHTML = '';
    const response = await axios.get(`api/notes?search=${keyword}`);
    const notes = response.data;
    notes.forEach(note => renderNotes(note));
}

async function renderNotes(note){
    const titleEl = await createElement({element:'div', id:'note-title', content: note.title})
    const contentEl = await createElement({element:'div', id:'note-content', content: note.content})
    const notesWrapper = await createElement({
        element: 'div',
        elmClass: 'notes rounded shadow-sm p-3',
        content: [titleEl, contentEl],
        dataset: {id: note.id, title: note.title, content: note.content}
    });
    document.getElementById('notes-area').appendChild(notesWrapper);


    notesWrapper.addEventListener('click', () => {
        document.getElementById('fill-title-edit').value = notesWrapper.dataset.title ?? '';
        document.getElementById('fill-content-edit').value = notesWrapper.dataset.content?? '';
        
        const modalEl = document.getElementById('editModal');
        modalEl.dataset.activeId = notesWrapper.dataset.id; // ← simpan id
        editModal.show();
    });
}

async function update(id){
    const inputs = document.querySelectorAll('.edit-content');
    const data ={};
    
    inputs.forEach(input => {
        data[input.name] = input.value || '';
    });
    console.log(data);
    //validasi
    if(!data.title && !data.content){
        return;
    }
    console.log(data);

    try{
        axios.put(`/api/notes/${id}`, data)
            console.log('data terkirim')
            inputs.forEach(input => {
                input.value = '';
            });

            await fetchNotes();

        } catch(error) {
            console.log('Error:', error);
        };
}

async function destroy(id) {
    try{
        axios.delete(`/api/notes/${id}`)
        .then(() => {
            editModal.hide();
            fetchNotes();
        })
        .catch(error => console.log(error));
    } catch (error){
        console.log('Error deleting note', error);
    }
}
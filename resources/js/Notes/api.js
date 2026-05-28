import axios from 'axios';

export async function getNotes({ search = '', status = '', label = '' } = {}) {
    try {
        let url = `/api/notes?search=${encodeURIComponent(search)}`;
        if (status) url += `&status=${encodeURIComponent(status)}`;
        if (label) url += `&label=${encodeURIComponent(label)}`;
        
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching notes:', error);
        throw error;
    }
}

export async function storeNote(data) {
    try {
        const response = await axios.post('/api/notes', data);
        return response.data;
    } catch (error) {
        console.error('Error storing note:', error);
        throw error;
    }
}

export async function updateNote(id, data) {
    try {
        const response = await axios.put(`/api/notes/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error updating note ${id}:`, error);
        throw error;
    }
}

export async function deleteNote(id) {
    try {
        const response = await axios.delete(`/api/notes/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting note ${id}:`, error);
        throw error;
    }
}

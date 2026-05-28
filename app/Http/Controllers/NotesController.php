<?php

namespace App\Http\Controllers;
use App\Models\Note;
use Illuminate\Http\Request;

class NotesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->search;
        $label = $request->label;
        $status = $request->status; // 'archive', 'trash', or null/default

        $query = Note::query();

        // Status filter
        if ($status === 'archive') {
            $query->where('is_archived', true)->where('is_trashed', false);
        } elseif ($status === 'trash') {
            $query->where('is_trashed', true);
        } else {
            $query->where('is_archived', false)->where('is_trashed', false);
        }

        // Label filter
        if ($label) {
            $query->where('label', $label);
        }

        // Search filter
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%$search%")
                  ->orWhere('content', 'like', "%$search%");
            });
        }

        // Sorting: pinned first, then latest updated_at
        $notes = $query->orderBy('is_pinned', 'desc')
                      ->orderBy('updated_at', 'desc')
                      ->get();

        return response()->json($notes);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'nullable|string',
            'content' => 'nullable|string',
            'is_pinned' => 'nullable|boolean',
            'reminder_at' => 'nullable|date',
            'color' => 'nullable|string',
            'label' => 'nullable|string',
            'is_archived' => 'nullable|boolean',
            'is_trashed' => 'nullable|boolean',
        ]);

        $note = Note::create($data); 

        return response()->json($note, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {   
        $data = $request->validate([
            'title' => 'nullable|string',
            'content' => 'nullable|string',
            'is_pinned' => 'nullable|boolean',
            'reminder_at' => 'nullable|date',
            'color' => 'nullable|string',
            'label' => 'nullable|string',
            'is_archived' => 'nullable|boolean',
            'is_trashed' => 'nullable|boolean',
        ]);

        $note = Note::findOrFail($id);
        
        // Handle trashed_at timestamp
        if (isset($data['is_trashed'])) {
            if ($data['is_trashed'] && !$note->is_trashed) {
                $data['trashed_at'] = now();
            } elseif (!$data['is_trashed'] && $note->is_trashed) {
                $data['trashed_at'] = null;
            }
        }

        $note->update($data);
        return response()->json($note);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $note = Note::findOrFail($id);
        $note->delete();
        return response()->json($note);
    }
}

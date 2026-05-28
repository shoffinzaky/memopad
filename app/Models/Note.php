<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use HasFactory;
    protected $table = 'notes';
    protected $primaryKey = 'id';
    protected $fillable = ['title', 'content', 'is_pinned', 'reminder_at', 'color', 'label', 'is_archived', 'is_trashed', 'trashed_at'];
}

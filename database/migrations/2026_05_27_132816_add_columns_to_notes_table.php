<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->boolean('is_pinned')->default(false);
            $table->timestamp('reminder_at')->nullable();
            $table->string('color')->nullable();
            $table->string('label')->nullable();
            $table->boolean('is_archived')->default(false);
            $table->boolean('is_trashed')->default(false);
            $table->timestamp('trashed_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->dropColumn([
                'is_pinned',
                'reminder_at',
                'color',
                'label',
                'is_archived',
                'is_trashed',
                'trashed_at'
            ]);
        });
    }
};

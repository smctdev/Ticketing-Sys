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
        Schema::create('ticket_categories', function (Blueprint $table) {
            $table->id('ticket_category_id');
            $table->string('category_shortcut');
            $table->string('category_name');
            $table->foreignId('group_code')->constrained('group_categories')->onDelete('cascade');
            $table->string('show_hide')->default('show');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_categories');
    }
};

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
        Schema::create('assigned_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('login_id')->constrained('user_logins', 'login_id')->onDelete('cascade');
            $table->foreignId('group_code')->constrained('group_categories')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assigned_categories');
    }
};

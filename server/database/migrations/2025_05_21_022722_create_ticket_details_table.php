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
        Schema::create('ticket_details', function (Blueprint $table) {
            $table->id('ticket_details_id');
            $table->foreignId('ticket_category_id')->constrained('ticket_categories', 'ticket_category_id')->onDelete('cascade')->nullable();
            $table->string('ticket_transaction_date');
            $table->string('td_ref_number');
            $table->string('td_purpose');
            $table->string('td_from');
            $table->string('td_to');
            $table->string('td_note');
            $table->string('td_support')->nullable();
            $table->foreignId('suppliers')->constrained('suppliers')->onDelete('cascade')->nullable();
            $table->string('date_created');
            $table->string('time');
            $table->string('date_completed');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_details');
    }
};

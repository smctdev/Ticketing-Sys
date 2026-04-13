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
            $table->foreignId('ticket_category_id')->constrained('ticket_categories', 'ticket_category_id')->onDelete('cascade');
            $table->foreignId('sub_category_id')->constrained('sub_categories', 'id')->onDelete('cascade');
            $table->string('ticket_transaction_date')->nullable();
            $table->string('ticket_type')->default('netsuite_ticket')->nullable();
            $table->string('td_ref_number')->nullable();
            $table->string('td_purpose')->nullable();
            $table->string('td_from')->nullable();
            $table->string('td_to')->nullable();
            $table->string('td_note')->nullable();
            $table->string('td_note_bh')->nullable();
            $table->string('td_note_accounting')->nullable();
            $table->string('td_support')->nullable();
            $table->foreignId('suppliers')->constrained('suppliers')->onDelete('cascade');
            $table->string('date_created')->nullable();
            $table->string('time')->nullable();
            $table->string('date_completed')->nullable();
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

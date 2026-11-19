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
        Schema::create('assigned_accounting_suppliers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('login_id');
            $table->unsignedBigInteger('supplier_id');
            $table->timestamps();

            $table->unique(['login_id', 'supplier_id']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};

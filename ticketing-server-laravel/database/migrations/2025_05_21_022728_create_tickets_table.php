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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id('ticket_id');
            $table->string('ticket_code', 10);
            $table->foreignId('login_id')->constrained('user_logins', 'login_id')->onDelete('cascade')->nullable();
            $table->foreignId('ticket_details_id')->constrained('ticket_details', 'ticket_details_id')->onDelete('cascade')->nullable();
            $table->foreignId('branch_id')->onDelete('cascade')->nullable();
            $table->string('branch_name', 500);
            $table->string('status', 255);
            $table->boolean('isCounted');
            $table->tinyInteger('isApproved');
            $table->foreignId('assigned_person')->constrained('user_logins', 'login_id')->onDelete('cascade')->nullable();
            $table->foreignId('edited_by')->constrained('user_logins', 'login_id')->onDelete('cascade')->nullable();
            $table->integer('notifStaff');
            $table->integer('notifHead');
            $table->integer('notifAccounting');
            $table->integer('notifAutomation');
            $table->integer('notifAUTM');
            $table->integer('notifAdmin');
            $table->integer('displayTicket');
            $table->foreignId('approveHead')->constrained('user_logins', 'login_id')->onDelete('cascade')->nullable();
            $table->foreignId('approveAcctgStaff')->constrained('user_logins', 'login_id')->onDelete('cascade')->nullable();
            $table->foreignId('approveAcctgSup')->constrained('user_logins', 'login_id')->onDelete('cascade')->nullable();
            $table->foreignId('approveAutm')->constrained('user_logins', 'login_id')->onDelete('cascade')->nullable();
            $table->integer('answer')->nullable();
            $table->string('appTBranchHead', 225)->nullable();
            $table->string('appTAccStaff', 225)->nullable();
            $table->string('appTAccHead', 225)->nullable();
            $table->string('appTAutomationHead', 225)->nullable();
            $table->string('appTEdited', 225)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};

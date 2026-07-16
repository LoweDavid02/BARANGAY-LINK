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
            $table->string('id', 100)->primary(); // e.g. TC-2026-XXXXX
            $table->string('category', 100);
            $table->string('department', 100);
            $table->string('subject', 255);
            $table->text('description');
            $table->string('status', 50)->default('Submitted'); // 'Submitted', 'In Progress', 'Resolved', etc.
            $table->string('priority', 50)->default('Medium'); // 'Low', 'Medium', 'High', 'Urgent'
            $table->integer('progress')->default(10);
            $table->string('asset_id', 100)->nullable();
            $table->string('last_inspection', 100)->nullable();
            $table->string('source', 100)->default('Web Portal');
            $table->string('evidence_photo', 255)->nullable();
            $table->foreignId('resident_id')->nullable()->constrained('residents')->onDelete('cascade');
            $table->foreignId('assigned_personnel_id')->nullable()->constrained('personnels')->nullOnDelete();
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

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
        Schema::create('ticket_locations', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_id', 100);
            $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('cascade');
            $table->double('latitude');
            $table->double('longitude');
            $table->string('address', 255);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_locations');
    }
};

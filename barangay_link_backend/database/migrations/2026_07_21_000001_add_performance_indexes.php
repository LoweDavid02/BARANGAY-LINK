<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Performance optimization: add missing indexes to columns
     * frequently used in WHERE, ORDER BY, and GROUP BY clauses.
     *
     * These indexes are additive-only — no columns are modified or dropped.
     */
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->index('status');
            $table->index('priority');
            $table->index('department');
            $table->index('created_at');
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index('timestamp');
        });

        Schema::table('residents', function (Blueprint $table) {
            $table->index('email');
            $table->index('phone');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('user_type');
            $table->index('google_id');
        });

        Schema::table('ticket_histories', function (Blueprint $table) {
            $table->index('action_date');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index('is_read');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['priority']);
            $table->dropIndex(['department']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex(['timestamp']);
        });

        Schema::table('residents', function (Blueprint $table) {
            $table->dropIndex(['email']);
            $table->dropIndex(['phone']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['user_type']);
            $table->dropIndex(['google_id']);
        });

        Schema::table('ticket_histories', function (Blueprint $table) {
            $table->dropIndex(['action_date']);
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['is_read']);
        });
    }
};

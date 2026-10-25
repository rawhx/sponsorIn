<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sponsorships', function (Blueprint $table) {
            $table->text('cancellation_reason')->nullable()->after('dispute_reason');
            $table->text('admin_resolution_note')->nullable()->after('cancellation_reason');
            $table->timestamp('admin_resolved_at')->nullable()->after('admin_resolution_note');
        });
    }

    public function down(): void
    {
        Schema::table('sponsorships', function (Blueprint $table) {
            $table->dropColumn(['cancellation_reason', 'admin_resolution_note', 'admin_resolved_at']);
        });
    }
};

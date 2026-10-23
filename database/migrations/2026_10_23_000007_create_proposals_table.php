<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sender_org_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('recipient_org_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('proposal_type');
            $table->foreignId('package_id')->nullable()->constrained('sponsorship_packages')->nullOnDelete();
            $table->text('requested_support');
            $table->text('deliverables')->nullable();
            $table->text('terms_summary')->nullable();
            $table->string('status')->default('draft')->index();
            $table->date('valid_until')->nullable();
            $table->timestamp('sponsor_confirmed_at')->nullable();
            $table->timestamp('eo_confirmed_at')->nullable();
            $table->timestamp('last_status_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proposals');
    }
};

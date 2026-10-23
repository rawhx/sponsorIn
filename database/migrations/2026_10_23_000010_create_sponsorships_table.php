<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sponsorships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposal_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('sponsor_org_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('eo_org_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->text('agreed_terms');
            $table->text('deliverables')->nullable();
            $table->string('status')->default('active')->index();
            $table->timestamp('accepted_at')->nullable();
            $table->foreignId('completion_requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('completion_requested_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('dispute_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsorships');
    }
};

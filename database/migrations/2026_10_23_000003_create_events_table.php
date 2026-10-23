<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('eo_organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category');
            $table->string('format');
            $table->date('date_start');
            $table->date('date_end')->nullable();
            $table->string('location');
            $table->text('description');
            $table->text('audience_profile')->nullable();
            $table->unsignedInteger('capacity_estimate')->nullable();
            $table->text('support_needs')->nullable();
            $table->string('status')->default('draft')->index();
            $table->timestamp('published_at')->nullable();
            $table->text('moderation_reason_internal')->nullable();
            $table->text('moderation_reason_public')->nullable();
            $table->timestamps();

            $table->index(['status', 'date_start']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};

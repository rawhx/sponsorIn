<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sponsorship_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('sponsor_org_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('eo_org_id')->constrained('organizations')->cascadeOnDelete();
            $table->unsignedTinyInteger('overall_rating');
            $table->unsignedTinyInteger('communication_rating');
            $table->unsignedTinyInteger('professionalism_rating');
            $table->unsignedTinyInteger('deliverables_rating');
            $table->text('comment')->nullable();
            $table->string('status')->default('published')->index();
            $table->timestamp('submitted_at');
            $table->timestamp('edited_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->text('hidden_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};

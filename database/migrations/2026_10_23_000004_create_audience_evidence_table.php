<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audience_evidence', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('evidence_type');
            $table->decimal('value', 15, 2);
            $table->string('unit');
            $table->string('period');
            $table->text('source_description');
            $table->text('evidence_note')->nullable();
            $table->string('file_path')->nullable();
            $table->string('verification_status')->default('declared');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audience_evidence');
    }
};

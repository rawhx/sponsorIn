<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('audience_evidence', function (Blueprint $table) {
            $table->date('period_start')->nullable()->after('unit');
            $table->date('period_end')->nullable()->after('period_start');
        });

        Schema::table('audience_evidence', function (Blueprint $table) {
            $table->string('period')->nullable()->change();
        });
    }

    public function down(): void
    {
        DB::table('audience_evidence')
            ->whereNull('period')
            ->update(['period' => '']);

        Schema::table('audience_evidence', function (Blueprint $table) {
            $table->string('period')->nullable(false)->change();
        });

        Schema::table('audience_evidence', function (Blueprint $table) {
            $table->dropColumn(['period_start', 'period_end']);
        });
    }
};

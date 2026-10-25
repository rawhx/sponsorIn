<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('proposals', function (Blueprint $table) {
            $table->string('event_title')->nullable()->after('event_id');
            $table->string('event_location')->nullable()->after('event_title');
            $table->date('event_date_start')->nullable()->after('event_location');
            $table->date('event_date_end')->nullable()->after('event_date_start');
            $table->string('event_zone')->default('WIB')->after('event_date_end');
            $table->string('event_time_start')->nullable()->after('event_date_end');
            $table->string('event_time_end')->nullable()->after('event_time_start');
            $table->string('event_potensi_penjualan')->nullable()->after('event_time_end');
            $table->string('event_estimasi_peserta')->nullable()->after('event_potensi_penjualan');
            $table->boolean('event_has_file')->default(false)->after('event_time_end');
            $table->string('event_file_name')->nullable()->after('event_has_file');
            $table->string('event_file_size')->nullable()->after('event_file_name');
            $table->text('event_description')->nullable()->after('event_file_size');
        });
    }

    public function down(): void
    {
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropColumn([
                'event_title',
                'event_location',
                'event_date_start',
                'event_date_end',
                'event_zone',
                'event_time_start',
                'event_time_end',
                'event_potensi_penjualan',
                'event_estimasi_peserta',
                'event_has_file',
                'event_file_name',
                'event_file_size',
                'event_description',
            ]);
        });
    }
};

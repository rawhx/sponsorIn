<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('proposals', function (Blueprint $table) {
            if (! Schema::hasColumn('proposals', 'title')) {
                $table->string('title')->nullable()->after('event_id');
            }
            if (! Schema::hasColumn('proposals', 'event_type')) {
                $table->string('event_type')->nullable()->after('title');
            }
            if (! Schema::hasColumn('proposals', 'location')) {
                $table->string('location')->nullable()->after('event_type');
            }
            if (! Schema::hasColumn('proposals', 'event_date_start')) {
                $table->date('event_date_start')->nullable()->after('location');
            }
            if (! Schema::hasColumn('proposals', 'event_date_end')) {
                $table->date('event_date_end')->nullable()->after('event_date_start');
            }
            if (! Schema::hasColumn('proposals', 'event_time_start')) {
                $table->time('event_time_start')->nullable()->after('event_date_end');
            }
            if (! Schema::hasColumn('proposals', 'event_time_end')) {
                $table->time('event_time_end')->nullable()->after('event_time_start');
            }
            if (! Schema::hasColumn('proposals', 'timezone')) {
                $table->string('timezone')->default('WIB')->after('event_time_end');
            }
            if (! Schema::hasColumn('proposals', 'estimated_attendees')) {
                $table->unsignedInteger('estimated_attendees')->nullable()->after('timezone');
            }
            if (! Schema::hasColumn('proposals', 'sales_potential')) {
                $table->decimal('sales_potential', 15, 2)->nullable()->after('estimated_attendees');
            }
            if (! Schema::hasColumn('proposals', 'description')) {
                $table->longText('description')->nullable()->after('sales_potential');
            }
            if (! Schema::hasColumn('proposals', 'proposal_file_path')) {
                $table->string('proposal_file_path')->nullable()->after('description');
            }
            if (! Schema::hasColumn('proposals', 'proposal_file_name')) {
                $table->string('proposal_file_name')->nullable()->after('proposal_file_path');
            }
            if (! Schema::hasColumn('proposals', 'proposal_file_mime')) {
                $table->string('proposal_file_mime')->nullable()->after('proposal_file_name');
            }
            if (! Schema::hasColumn('proposals', 'proposal_file_size')) {
                $table->unsignedBigInteger('proposal_file_size')->nullable()->after('proposal_file_mime');
            }
            if (! Schema::hasColumn('proposals', 'is_published')) {
                $table->boolean('is_published')->default(false)->after('status');
            }
            if (! Schema::hasColumn('proposals', 'published_at')) {
                $table->timestamp('published_at')->nullable()->after('is_published');
            }
            if (! Schema::hasColumn('proposals', 'sender_org_id')) {
                $table->foreignId('sender_org_id')->nullable()->change();
            }
            if (! Schema::hasColumn('proposals', 'recipient_org_id')) {
                $table->foreignId('recipient_org_id')->nullable()->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropColumn([
                'title',
                'event_type',
                'location',
                'event_date_start',
                'event_date_end',
                'event_time_start',
                'event_time_end',
                'timezone',
                'estimated_attendees',
                'sales_potential',
                'description',
                'proposal_file_path',
                'proposal_file_name',
                'proposal_file_mime',
                'proposal_file_size',
                'is_published',
                'published_at',
            ]);
            $table->foreignId('sender_org_id')->nullable(false)->change();
            $table->foreignId('recipient_org_id')->nullable(false)->change();
        });
    }
};

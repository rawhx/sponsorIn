<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Organization;
use App\Models\SponsorshipPackage;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

final class DemoData
{
    public const PASSWORD = 'sponsorin123';

    public static function user(string $email): User
    {
        return User::query()->where('email', $email)->firstOrFail();
    }

    public static function organization(string $email): Organization
    {
        return Organization::query()
            ->where('owner_user_id', self::user($email)->id)
            ->firstOrFail();
    }

    public static function event(string $slug): Event
    {
        return Event::query()->where('slug', $slug)->firstOrFail();
    }

    public static function package(Event $event, string $name): ?SponsorshipPackage
    {
        return $event->packages()->where('name', $name)->first();
    }

    public static function document(Organization $organization): string
    {
        $path = 'verification-documents/'.$organization->id.'/contoh-dokumen.pdf';

        Storage::disk('local')->put($path, <<<'PDF'
%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 200]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 68>>stream
BT /F1 12 Tf 24 120 Td (Dokumen contoh untuk demonstrasi SponsorIn.) Tj ET
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
trailer<</Root 1 0 R>>
%%EOF
PDF);

        return $path;
    }
}

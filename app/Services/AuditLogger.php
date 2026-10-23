<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class AuditLogger
{
    public function record(
        string $action,
        Model $entity,
        ?User $actor = null,
        array $before = [],
        array $after = [],
        ?string $reason = null,
    ): AuditLog {
        return AuditLog::create([
            'actor_user_id' => $actor?->id,
            'action' => $action,
            'entity_type' => $entity::class,
            'entity_id' => $entity->getKey(),
            'before_summary' => $before ?: null,
            'after_summary' => $after ?: null,
            'reason' => $reason,
        ]);
    }
}

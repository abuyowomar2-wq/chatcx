<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AutoReply extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
        'trigger_type',
        'keywords',
        'response_message',
        'is_active',
        'start_time',
        'end_time',
        'schedule_days',
    ];

    protected function casts(): array
    {
        return [
            'keywords' => 'json',
            'is_active' => 'boolean',
            'start_time' => 'string',
            'end_time' => 'string',
            'schedule_days' => 'json',
        ];
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function isOffHours(): bool
    {
        if ($this->trigger_type !== 'off_hours') {
            return false;
        }

        $now = now();
        $currentDay = $now->dayOfWeek;
        $currentTime = $now->format('H:i');

        if ($this->schedule_days && !in_array((string)$currentDay, $this->schedule_days)) {
            return false;
        }

        if ($this->start_time && $this->end_time) {
            return $currentTime < $this->start_time || $currentTime > $this->end_time;
        }

        return false;
    }

    public function matchesKeyword(string $message): bool
    {
        if ($this->trigger_type !== 'keyword' || !$this->keywords) {
            return false;
        }

        foreach ($this->keywords as $keyword) {
            if (str_contains(mb_strtolower($message), mb_strtolower($keyword))) {
                return true;
            }
        }

        return false;
    }
}

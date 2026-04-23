<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Message extends Model
{
    protected $guarded = [];

    protected $appends = [
        'reply_attachments_count',
        'is_edited'
    ];

    public function sender()
    {
        return $this->belongsTo(UserLogin::class, 'sender_id', 'login_id');
    }

    public function receiver()
    {
        return $this->belongsTo(UserLogin::class, 'receiver_id', 'login_id');
    }

    public function getBodyAttribute($value)
    {
        $text = e($value);

        $pattern = '/(https?:\/\/[\w\-._~:\/?#\[\]@!$&\'()*+,;=%]+|(?:www\.|(\w+\.)+(?:com|net|org|io|dev|app|co|ph|gov|edu|info|me|tv|ai))[\w\-._~:\/?#\[\]@!$&\'()*+,;=%]*)/i';

        return preg_replace_callback($pattern, function ($matches) {
            $url   = $matches[0];
            $href  = preg_match('/^https?:\/\//i', $url) ? $url : 'https://' . $url;
            return '<a href="' . $href . '" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 opacity-90 hover:opacity-100 break-all">' . $url . '</a>';
        }, $text);
    }

    public function attachments()
    {
        return $this->hasMany(MessageAttachment::class);
    }

    public function replyFrom()
    {
        return $this->belongsTo(Message::class, 'parent_id');
    }

    public function parent()
    {
        return $this->hasMany(Message::class, 'parent_id', 'id');
    }

    public function getReplyAttachmentsCountAttribute()
    {
        return $this->replyFrom?->attachments()->count();
    }

    public function getIsEditedAttribute()
    {
        return Carbon::parse($this?->created_at)->lt(Carbon::parse($this?->updated_at));
    }
}

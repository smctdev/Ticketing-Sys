<?php

namespace App\Enums;

enum TicketStatus: string
{
    case PENDING = "PENDING";
    case REJECTED = "REJECTED";
    case EDITED = "EDITED";
}

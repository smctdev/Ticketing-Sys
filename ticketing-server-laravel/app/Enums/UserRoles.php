<?php

namespace App\Enums;

enum UserRoles: string
{
    case ADMIN = 'Admin';
    case AUTOMATION = 'Automation';
    case ACCOUNTING_HEAD = 'Accounting Head';
    case ACCOUNTING_STAFF = 'Accounting Staff';
    case BRANCH_HEAD = 'Branch Head';
    case STAFF = 'Staff';
    case CAS = 'CAS';
    case AREA_MANAGER = 'Area Manager';
    case AUTOMATION_MANAGER = 'Automation Manager';
}

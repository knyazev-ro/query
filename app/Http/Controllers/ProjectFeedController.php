<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectFeedController extends FeedController
{
    protected static $entityModel = Project::class;
}

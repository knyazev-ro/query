<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        // $notifications = $request->user()->notifications()->paginate(10);

        return Inertia::render('Notifications/Notifications');
    }
}

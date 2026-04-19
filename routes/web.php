<?php

use App\Http\Controllers\MessagerController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PipelineController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectFeedController;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Redirect::route('kanban.index');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::prefix('kanban')->name('kanban.')->group(function () {
    Route::get('/', [PipelineController::class, 'kanban'])->name('index');
    Route::post('/drop/{project}/to/{stage}', [ProjectController::class, 'drop'])->name('drop');
});

Route::prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->name('index');
});

Route::prefix('messager')->name('messager.')->group(function () {
    Route::get('/', [MessagerController::class, 'index'])->name('index');
});

Route::prefix('projects')->name('projects.')->group(function () {
    Route::get('/', [ProjectController::class, 'index'])->name('index');
    Route::get('/create', [ProjectController::class, 'create'])->name('create');
    Route::get('/show/{project}', [ProjectController::class, 'show'])->name('show');
    Route::post('/update/{id?}', [ProjectController::class, 'update'])->name('update');
    Route::post('/delete/{project?}', [ProjectController::class, 'destroy'])->name('delete');
    Route::get('/logs/paginated/{project}', [ProjectController::class,'getLogs'])->name('logs.paginated');
    Route::post('/write/{entityId}/feed-comm', [ProjectFeedController::class, 'writeCommentary'])->name('feed.write.commentary');
    Route::post('/write/{entityId}/feed-comm/{commentaryId}', [ProjectFeedController::class, 'editCommentary'])->name('feed.edit.commentary');
    Route::get('/show/{entityId}/feed-comm', [ProjectFeedController::class, 'index'])->name('show.feed');
});

require __DIR__.'/settings.php';

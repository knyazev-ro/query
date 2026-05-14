<?php

use App\Http\Controllers\DatasetController;
use App\Http\Controllers\GraphController;
use App\Http\Controllers\CompressionController;
use App\Http\Controllers\ImgCompressModelController;
use App\Http\Controllers\ImgModelController;
use App\Http\Controllers\MessagerController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PipelineController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectFeedController;
use App\Http\Controllers\StageController;
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

Route::middleware(['auth', 'verified'])->prefix('kanban')->name('kanban.')->group(function () {
    Route::get('/', [PipelineController::class, 'kanban'])->name('index');
    Route::get('/pipeline/{pipeline}', [PipelineController::class, 'kanban'])->name('show');
    Route::post('/pipelines', [PipelineController::class, 'store'])->name('pipelines.store');
    Route::post('/pipelines/{pipeline}', [PipelineController::class, 'update'])->name('pipelines.update');
    Route::post('/pipelines/{pipeline}/stages', [StageController::class, 'store'])->name('stages.store');
    Route::post('/stages/{stage}', [StageController::class, 'update'])->name('stages.update');
    Route::post('/drop/{project}/to/{stage}', [ProjectController::class, 'drop'])->name('drop');
});

Route::prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->name('index');
});

Route::prefix('messager')->name('messager.')->group(function () {
    Route::get('/', [MessagerController::class, 'index'])->name('index');
});

Route::prefix('datasets')->name('datasets.')->group(function () {
    Route::get('/', [DatasetController::class, 'index'])->name('index');
    Route::get('/create', [DatasetController::class, 'create'])->name('create');
    Route::get('/show/{dataset}', [DatasetController::class, 'show'])->name('show');
    Route::post('/store', [DatasetController::class, 'store'])->name('store');
    Route::post('/load', [DatasetController::class, 'loadDataset'])->name('load');
    Route::post('/update/{dataset}', [DatasetController::class, 'update'])->name('update');
    Route::post('/delete/{dataset}', [DatasetController::class, 'destroy'])->name('delete');
});

Route::prefix('img-models')->name('img-models.')->group(function () {
    Route::get('/', [ImgModelController::class, 'index'])->name('index');
});

Route::prefix('img-compress-models')->name('img-compress-models.')->group(function () {
    Route::get('/', [ImgCompressModelController::class, 'index'])->name('index');
    Route::get('/create', [ImgCompressModelController::class, 'createModel'])->name('create');
    Route::get('/show/{imgCompressModel}', [ImgCompressModelController::class, 'show'])->name('show');
    Route::post('/store', [ImgCompressModelController::class, 'storeModel'])->name('store');
    Route::post('/update/{imgCompressModel}', [ImgCompressModelController::class, 'updateModel'])->name('update');
    Route::post('/delete/{imgCompressModel}', [ImgCompressModelController::class, 'deleteModel'])->name('delete');
    Route::get('/versions/{imgCompressModel}/edit', [ImgCompressModelController::class, 'editVersion'])->name('versions.edit');
    Route::post('/versions/from/{modelVersion?}', [ImgCompressModelController::class, 'createNewVersionFrom'])->name('versions.store');
    Route::post('/versions/update/{modelVersion}', [ImgCompressModelController::class, 'updateVersion'])->name('versions.update');
    Route::post('/versions/delete/{modelVersion}', [ImgCompressModelController::class, 'deleteVersion'])->name('versions.delete');
});

Route::middleware(['auth', 'verified'])->prefix('compressions')->name('compressions.')->group(function () {
    Route::get('/', [CompressionController::class, 'index'])->name('index');
    Route::get('/create', [CompressionController::class, 'create'])->name('create');
    Route::get('/show/{imgMedia}', [CompressionController::class, 'show'])->name('show');
    Route::get('/original/{imgMedia}', [CompressionController::class, 'original'])->name('original');
    Route::get('/compressed/{imgMedia}', [CompressionController::class, 'compressed'])->name('compressed');
    Route::post('/store', [CompressionController::class, 'store'])->name('store');
    Route::post('/update/{imgMedia}', [CompressionController::class, 'update'])->name('update');
    Route::post('/delete/{imgMedia}', [CompressionController::class, 'destroy'])->name('delete');
    Route::post('/cancel/{modelVersion}', [CompressionController::class, 'cancel'])->name('cancel');
});

Route::prefix('graph')->name('graph.')->group(function () {
    Route::get('/', [GraphController::class, 'index'])->name('index');
});

Route::middleware(['auth', 'verified'])->get('/users/paginated', [ProjectController::class, 'usersPaginated'])->name('users.paginated');
Route::middleware(['auth', 'verified'])->get('/crm/pipelines', [PipelineController::class, 'paginated'])->name('api.crm.pipelines');

Route::middleware(['auth', 'verified'])->prefix('projects')->name('projects.')->group(function () {
    Route::get('/', [ProjectController::class, 'index'])->name('index');
    Route::get('/create/{stage?}', [ProjectController::class, 'create'])->name('create');
    Route::get('/show/{project}', [ProjectController::class, 'show'])->name('show');
    Route::post('/update/{id?}', [ProjectController::class, 'update'])->name('update');
    Route::post('/delete/{project?}', [ProjectController::class, 'destroy'])->name('delete');
    Route::get('/logs/paginated/{project}', [ProjectController::class,'getLogs'])->name('logs.paginated');
    Route::post('/write/{entityId}/feed-comm', [ProjectFeedController::class, 'writeCommentary'])->name('feed.write.commentary');
    Route::post('/write/{entityId}/feed-comm/{commentaryId}', [ProjectFeedController::class, 'editCommentary'])->name('feed.edit.commentary');
    Route::get('/show/{entityId}/feed-comm', [ProjectFeedController::class, 'index'])->name('show.feed');
});

require __DIR__.'/settings.php';

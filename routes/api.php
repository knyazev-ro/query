<?php

use App\Http\Controllers\CallbackController;
use Illuminate\Support\Facades\Route;

Route::prefix('callbacks')->name('callbacks.')->group(function () {
    Route::post('/compression', [CallbackController::class, 'compressionProcess'])->name('compression');
    Route::post('/train', [CallbackController::class, 'trainProcess'])->name('train');
});

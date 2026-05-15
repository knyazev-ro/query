<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'img_compress_ml' => [
        'url' => env('IMG_COMPRESS_ML_URL', 'http://127.0.0.1:8001'),
        'timeout' => env('IMG_COMPRESS_ML_TIMEOUT', 60),
        'callback_base_url' => env('IMG_COMPRESS_CALLBACK_BASE_URL'),
        'train_epochs' => env('IMG_COMPRESS_TRAIN_EPOCHS', 250),
        'train_batch_size' => env('IMG_COMPRESS_TRAIN_BATCH_SIZE', 32),
    ],

];

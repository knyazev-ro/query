# ABOUT: Image Compression ML Microservice

Этот файл нужен как стартовый контекст для следующей сессии работы над Python/FastAPI микросервисом. Текущий репозиторий - Laravel + React/Inertia приложение, которое выступает центральным координатором, хранит БД, файлы, пользователей, очереди и UI. Микросервис отдельно отвечает только за ML-операции: обучение, сжатие, восстановление и отмену выполняющихся задач.

Важно: Laravel - источник истины. Микросервис не должен напрямую работать с БД Laravel и не должен общаться с фронтендом. Все команды приходят из Laravel, а результаты возвращаются через callback-и в Laravel.

## Текущий Laravel Контекст

Стек основного приложения:

- Backend: PHP 8+, Laravel, Eloquent, Laravel Queues.
- Frontend: React, Inertia.js, TailwindCSS, Vite.
- ML service connector: `app/Services/MLConnector.php`.
- Очереди: `app/Jobs/TrainJob.php`, `app/Jobs/CompressJob.php`.
- Callback-и от микросервиса: `app/Http/Controllers/CallbackController.php`.
- URL микросервиса задается через `IMG_COMPRESS_ML_URL`, дефолт `http://127.0.0.1:8001`.
- Timeout задается через `IMG_COMPRESS_ML_TIMEOUT`, дефолт `60`.
- Base URL для callback-ов задается через `IMG_COMPRESS_CALLBACK_BASE_URL`. Если Laravel запущен на host machine, а микросервис внутри Docker, обычно нужно `http://host.docker.internal:8000`.

Основные Laravel модели для ML-сценариев:

- `Dataset` - zip-архив с обучающим датасетом и настройками препроцессинга.
- `ImgCompressModel` - логическая ML-модель с именем и описанием.
- `ModelVersion` - конкретная версия модели, может иметь parent version и набор датасетов.
- `ImgMedia` - исходное изображение пользователя и результат сжатия.

## Архитектурные Правила

- Frontend -> Laravel -> Python microservice.
- Python microservice -> Laravel callback -> Laravel DB/UI.
- Фронтенд никогда не вызывает Python напрямую.
- Python не пишет в БД Laravel.
- Python не должен считать себя источником истины по статусам: он отправляет callback, Laravel валидирует и сохраняет.
- Обучение и сжатие асинхронные: Laravel отправляет задачу и ждет callback.
- Восстановление (`decompress`) синхронное: Laravel ждет HTTP-ответ с восстановленными файлами/данными.
- Отмена должна быть best-effort: если задача уже завершилась, сервис должен вернуть корректный ответ без падения.

## ML Цель

Проект - интеллектуальная платформа сжатия изображений на базе deep learning autoencoder. GAN/discriminator используется только во время обучения для улучшения качества реконструкции. Для inference, compression и decompression используется autoencoder:

- Encoder превращает изображение в latent representation.
- Latent representation сохраняется как сжатый артефакт.
- Decoder восстанавливает изображение из latent representation.

Желаемый стек микросервиса:

- Python.
- FastAPI.
- PyTorch.
- torchvision.
- Pillow.
- NumPy.
- Pydantic.

## Версионирование Моделей

`ModelVersion` устроен как дерево:

- новая модель создает версию `version_number = 1`;
- продолжение обучения от версии создает новую версию с `parent_version_id`;
- от одной версии можно создать несколько веток;
- каждая версия имеет свои датасеты, статус и настройки разрешения.

Поля `ModelVersion`, важные для микросервиса:

- `id`
- `img_compress_model_id`
- `parent_version_id`
- `author_id`
- `version_number`
- `image_resolution`: одно из `64`, `128`, `256`, `512`
- `status`: `queue`, `run`, `ready`, `cancel`, `error`
- `errors`
- `progress`: JSON/JSONB с текущим прогрессом обучения
- `datasets[]`
- `model`
- `author`

Если `parent_version_id` не `null`, микросервис должен уметь продолжить обучение от артефакта родительской версии. Если родительского артефакта нет, это ошибка обучения.

## Датасеты

Laravel передает датасеты внутри `model_version.datasets`. Каждый dataset содержит обычные поля модели. Главное поле для микросервиса - `file_path`: это путь к ZIP-архиву датасета в Laravel Storage.

Важно: датасеты не передаются через `file_base64`. Микросервис должен работать с ZIP-архивом по `file_path`.

Важные поля:

- `id`
- `name`
- `description`
- `file_path`
- `original_filename`
- `file_size`
- `mime_type`
- `rotation_degree`
- `do_flip`
- `image_resolution`
- `train_split`
- `test_split`
- `images_count`
- `uses_count`

Файл датасета - zip-архив. Микросервис должен:

- получить путь к архиву из `file_path`;
- открыть ZIP-архив из storage, доступного микросервису;
- распаковать ZIP во временную рабочую директорию;
- отфильтровать изображения;
- привести изображения к `image_resolution`;
- применить препроцессинг:
  - resize / center crop;
  - normalization to `[-1, 1]`;
  - train/test split;
  - optional horizontal flip через `do_flip`;
  - optional rotation через `rotation_degree`.

Для Docker-интеграции важно, что Laravel `local` disk хранит такие файлы в `storage/app/private`. Если в Python задан `IMG_COMPRESS_STORAGE_ROOT`, он должен указывать именно на этот корень, например `/web/service/storage/app/private`. Тогда `file_path = datasets/example.zip` резолвится как `/web/service/storage/app/private/datasets/example.zip`.

## Изображения Для Сжатия

Laravel передает изображения в `images[]`. Каждый image содержит обычные поля `ImgMedia` и дополнительное поле `file_base64`.

Важные поля:

- `id`
- `img_path`
- `compressed_img_path`
- `original_name`
- `mime_type`
- `original_size`
- `compressed_size`
- `author_id`
- `model_version_id`
- `status`
- `errors`
- `file_base64`

Для `/compress` `file_base64` содержит исходное изображение из `img_path`.

Для `/decompress` `file_base64` содержит сжатый артефакт из `compressed_img_path`, если он есть. Если Laravel fallback-ом передал исходное изображение, микросервис должен вернуть понятную ошибку валидации.

## Эндпоинты Микросервиса

Микросервис должен иметь следующие HTTP endpoints.

### `GET /healthcheck`

Проверка живости сервиса.

Ожидаемый ответ:

```json
{
  "status": "ok",
  "service": "img-compress-ml",
  "version": "0.1.0"
}
```

Можно дополнительно вернуть:

- `device`: `cpu`, `cuda`, `mps`;
- `torch_version`;
- `active_train_jobs`;
- `active_compression_jobs`.

### `POST /train`

Асинхронный старт обучения версии модели.

Laravel вызывает этот endpoint из `MLConnector::train()`.

Request body:

```json
{
  "model_version": {
    "id": 1,
    "img_compress_model_id": 1,
    "parent_version_id": null,
    "version_number": 1,
    "image_resolution": 256,
    "status": "queue",
    "errors": null,
    "datasets": [
      {
        "id": 1,
        "name": "dataset",
        "file_path": "datasets/example.zip",
        "image_resolution": 256,
        "train_split": 80,
        "test_split": 20,
        "rotation_degree": 0,
        "do_flip": true
      }
    ]
  },
  "callback_url": "https://laravel-app.test/api/callbacks/train"
}
```

Expected immediate response:

```json
{
  "accepted": true,
  "job_id": "train-1",
  "model_version_id": 1,
  "status": "run"
}
```

Behavior:

- Endpoint должен быстро принять задачу и вернуть ответ.
- Для каждого dataset из `model_version.datasets` нужно взять `file_path`, найти ZIP-архив в общем storage/volume, распаковать его во временную директорию и использовать содержимое для обучения.
- Реальное обучение выполняется в background task/process.
- При старте можно отправить callback со статусом `run`.
- При успешном завершении отправить callback со статусом `ready`.
- При ошибке отправить callback со статусом `error` и текстом ошибки.
- При отмене отправить callback со статусом `cancel`.

### `POST /compress`

Асинхронное сжатие одного или нескольких изображений.

Laravel вызывает этот endpoint из `MLConnector::compress()`.

Request body:

```json
{
  "model_version": {
    "id": 1,
    "img_compress_model_id": 1,
    "version_number": 1,
    "image_resolution": 256,
    "status": "ready"
  },
  "images": [
    {
      "id": 10,
      "original_name": "image.png",
      "mime_type": "image/png",
      "original_size": 123456,
      "model_version_id": 1,
      "status": "just created",
      "file_base64": "..."
    }
  ],
  "callback_url": "https://laravel-app.test/api/callbacks/compression"
}
```

Expected immediate response:

```json
{
  "accepted": true,
  "job_id": "compress-1",
  "model_version_id": 1,
  "image_ids": [10],
  "status": "compressing"
}
```

Behavior:

- Endpoint должен быстро принять задачу и вернуть ответ.
- Можно обрабатывать batch последовательно или параллельно.
- Для каждого изображения нужно отправлять отдельный callback в Laravel.
- При успешном сжатии микросервис должен сохранить сжатый артефакт в путь, доступный Laravel Storage, или вернуть путь, который Laravel сможет прочитать.
- Текущий Laravel callback ожидает `compressed_path`, а не сам base64 результата.

Важное место для согласования при реализации: так как микросервис отдельный, нужно решить, как он пишет результат в Laravel Storage. Варианты:

- общий volume между Laravel и Python контейнером;
- S3/minio-like object storage;
- future Laravel endpoint для приема файла результата.

Сейчас контракт Laravel ожидает именно путь в `compressed_path`.

### `POST /decompress`

Синхронное восстановление изображения из сжатого артефакта.

Laravel вызывает этот endpoint из `MLConnector::decompress()`.

Request body:

```json
{
  "model_version": {
    "id": 1,
    "img_compress_model_id": 1,
    "version_number": 1,
    "image_resolution": 256,
    "status": "ready"
  },
  "images": [
    {
      "id": 10,
      "original_name": "image.png",
      "compressed_img_path": "img-media/10/compressed.npz",
      "model_version_id": 1,
      "file_base64": "..."
    }
  ]
}
```

Expected response:

```json
{
  "images": [
    {
      "id": 10,
      "original_name": "image.png",
      "mime_type": "image/png",
      "file_base64": "...",
      "size": 123456
    }
  ]
}
```

Behavior:

- Endpoint может быть blocking.
- Нужно загрузить model artifact по `model_version.id`.
- Нужно декодировать latent/compressed artifact из `file_base64`.
- Нужно восстановить изображение decoder-ом.
- Вернуть результат base64-ом в HTTP response.

### `POST /train/cancel`

Отмена активного обучения.

Laravel вызывает этот endpoint из `MLConnector::cancelTrain()`.

Request body:

```json
{
  "model_version_id": 1
}
```

Expected response:

```json
{
  "cancelled": true,
  "model_version_id": 1,
  "status": "cancel"
}
```

Behavior:

- Если задача активна, выставить cancel flag и остановить обучение на ближайшей безопасной точке.
- Если задачи уже нет, вернуть `cancelled: false` или `already_finished: true`, но без 500.
- Желательно отправить callback в Laravel со статусом `cancel`, если задача реально была остановлена.
- Laravel после успешного HTTP-ответа сам обновляет локальный статус версии на `cancel`.

### `POST /compress/cancel`

Отмена активного сжатия.

Laravel вызывает этот endpoint из `MLConnector::cancelCompression()`.

Request body:

```json
{
  "model_version_id": 1,
  "image_ids": [10, 11]
}
```

Expected response:

```json
{
  "cancelled": true,
  "model_version_id": 1,
  "image_ids": [10, 11],
  "status": "cancel"
}
```

Behavior:

- Отменять только перечисленные `image_ids`.
- Если часть изображений уже обработана, вернуть частичный результат без 500.
- Laravel после успешного HTTP-ответа сам обновляет локальные статусы переданных изображений на `cancel`.

## Callback-и В Laravel

Микросервис должен отправлять callback-и на URL, который Laravel передает в `callback_url`.

Laravel формирует `callback_url` через route name. По умолчанию используется обычный absolute URL из `APP_URL`. Если задан `IMG_COMPRESS_CALLBACK_BASE_URL`, он заменяет только host/scheme/port, а путь остается Laravel route path. Это нужно для Docker-сценария, где микросервис не может достучаться до `localhost` хостовой машины.

### Training Callback

Laravel endpoint:

```http
POST /api/callbacks/train
```

Request body:

```json
{
  "id": 1,
  "status": "ready",
  "errors": null,
  "progress": {
    "percent": 100,
    "current_epoch": 1,
    "total_epochs": 1,
    "current_step": 120,
    "total_steps": 120,
    "completed_steps": 120,
    "remaining_steps": 0,
    "total_iterations": 120,
    "losses": {
      "autoencoder": 0.01,
      "reconstruction": 0.01,
      "adversarial": 0.2,
      "discriminator": 0.5
    },
    "message": "Training completed",
    "updated_at": "2026-05-14T19:40:00+00:00"
  }
}
```

Allowed statuses:

- `queue`
- `run`
- `ready`
- `cancel`
- `error`

Fields:

- `id` - `model_versions.id`.
- `status` - новый статус версии.
- `errors` - nullable string.
- `progress` - nullable object. Python отправляет его во время обучения примерно каждые 20 batch-итераций, Laravel сохраняет в `model_versions.progress`.

Frontend на странице моделей использует polling для версий в статусах `queue` и `run`, чтобы обновлять `progress` без ручной перезагрузки страницы.

### Compression Callback

Laravel endpoint:

```http
POST /api/callbacks/compression
```

Request body:

```json
{
  "id": 10,
  "status": "compressed",
  "errors": null,
  "compressed_path": "img-media/10/compressed.npz",
  "compressed_size": 12345
}
```

Allowed statuses:

- `just created`
- `compressing`
- `compressed`
- `error`
- `cancel`

Fields:

- `id` - `img_media.id`.
- `status` - новый статус изображения.
- `errors` - nullable string.
- `compressed_path` - required only when `status = compressed`.
- `compressed_size` - optional integer.

## Статусы

Training/model version statuses:

- `queue` - Laravel создал версию и поставил задачу в очередь.
- `run` - микросервис принял/выполняет обучение.
- `ready` - модель обучена и готова к compression/decompression.
- `cancel` - обучение отменено.
- `error` - ошибка обучения.

Compression/image statuses:

- `just created` - Laravel сохранил оригинал и поставил задачу.
- `compressing` - микросервис принял/сжимает изображение.
- `compressed` - сжатый артефакт готов.
- `cancel` - сжатие отменено.
- `error` - ошибка сжатия.

## Артефакты

Микросервису нужны стабильные пути/имена для артефактов.

Рекомендуемая структура, если используется общий volume:

```text
storage/app/ml/
  models/
    model-version-{id}/
      autoencoder.pt
      encoder.pt
      decoder.pt
      metadata.json
  compressed/
    img-media-{id}/
      compressed.npz
      metadata.json
  jobs/
    train-{model_version_id}/
    compress-{model_version_id}/
```

В Laravel `compressed_path` должен быть путем относительно Laravel Storage disk, например:

```text
ml/compressed/img-media-10/compressed.npz
```

В `metadata.json` полезно хранить:

- `model_version_id`;
- `parent_version_id`;
- `image_resolution`;
- `latent_shape`;
- `created_at`;
- `torch_version`;
- `normalization`;
- training metrics.

## Ошибки

Для ошибок API использовать JSON:

```json
{
  "detail": "Human-readable error message",
  "code": "MODEL_ARTIFACT_NOT_FOUND"
}
```

Для асинхронных ошибок обязательно отправлять callback:

Training:

```json
{
  "id": 1,
  "status": "error",
  "errors": "Dataset archive is invalid"
}
```

Compression:

```json
{
  "id": 10,
  "status": "error",
  "errors": "Model artifact not found"
}
```

## Минимальная Реализация Для Первого Рабочего Цикла

Первый MVP микросервиса должен:

1. Поднять FastAPI app.
2. Реализовать `GET /healthcheck`.
3. Реализовать Pydantic schemas для всех request/response контрактов.
4. Реализовать `POST /train` как background job.
5. Сохранять dummy или реальный model artifact для `model_version.id`.
6. Реализовать `POST /compress` как background job.
7. Сохранять compressed artifact и отправлять callback в Laravel.
8. Реализовать `POST /decompress` с возвратом base64 изображения.
9. Реализовать `POST /train/cancel`.
10. Реализовать `POST /compress/cancel`.
11. Добавить базовые unit/integration tests для контрактов.

## Что Не Делать В Микросервисе

- Не добавлять авторизацию пользователей Laravel внутри ML-сервиса на первом этапе.
- Не писать напрямую в Laravel DB.
- Не делать frontend.
- Не менять бизнес-логику версий моделей.
- Не создавать новые Laravel endpoints без явного согласования.
- Не менять контракт `MLConnector`, если только это не согласовано отдельно.

## Открытые Решения Для Будущей Сессии

Перед полноценной реализацией нужно согласовать:

- где физически лежат model artifacts;
- как Python сохраняет `compressed_path`, доступный Laravel;
- будет ли общий Docker volume или object storage;
- нужен ли callback auth token;
- формат compressed artifact: `.npz`, `.pt`, custom binary;
- нужно ли хранить training metrics и где их показывать в Laravel.

## Быстрая Карта Laravel Интеграции

Команды Laravel -> микросервис:

- `MLConnector::train()` -> `POST /train`
- `MLConnector::compress()` -> `POST /compress`
- `MLConnector::decompress()` -> `POST /decompress`
- `MLConnector::cancelTrain()` -> `POST /train/cancel`
- `MLConnector::cancelCompression()` -> `POST /compress/cancel`

Callback-и микросервис -> Laravel:

- training -> `POST /api/callbacks/train`
- compression -> `POST /api/callbacks/compression`

Laravel route names:

- `callbacks.train`
- `callbacks.compression`

Laravel validation currently expects exact status strings listed above. Keep spelling exactly the same, including `just created`.

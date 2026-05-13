<?php

namespace App\Services;

use App\Models\ImgMedia;
use App\Models\ModelVersion;
use GuzzleHttp\Client;
use Illuminate\Database\Eloquent\Collection;

class MLConnector
{
    protected Client $client;
    protected string $url;
    public function __construct()
    {
        $this->url = config('services.img_compress_ml.url');
        $this->client = new Client([
            'timeout' => 60,
            'base_uri' => $this->url,
        ]);
    }
    public function train(ModelVersion $modelVersion)
    {
        $model = $modelVersion->load(['datasets', 'author', 'model']);
        $response = $this->client->post('/train', $model->toArray());
        // etc
    }

    /**
     * [Description for compress]\
     * FIRE AND FORGET METHOD - USED IN JOBS!
     *
     * @param ModelVersion $modelVersion
     * @param Collection $imgMedia
     * 
     * @return [type]
     * 
     */
    public function compress(ModelVersion $modelVersion, Collection $imgMedia)
    {
        $model = $modelVersion->load(['datasets', 'author', 'model']);
        $response = $this->client->post('/compress', [
            'model' => $model->toArray(),
            'images' => $imgMedia->toArray(), // base64 array of images
        ]);
        // response return array of paths
        // like, if image was named images/<userID>/img1.jpg
        // then 
    }

    /**
     * [Description for decompress]
     * WAIT UNTILL GET! (NOT FIRE AND FORGET)
     *
     * @param ModelVersion $modelVersion
     * 
     * @return [type]
     * 
     */
    public function decompress(ModelVersion $modelVersion, Collection $imgMedia)
    {
        $model = $modelVersion->load(['datasets', 'author', 'model']);
        $response = $this->client->post('/decompress', [
            'model' => $model->toArray(),
            'images' => $imgMedia->toArray(), // base64 array of images
        ]);
        // in response json 
        // id of img media -> base64 of decompressed image
        // then those images convert to zip
        // then download!
    }
}

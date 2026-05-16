<?php

namespace Tests\Feature;

use App\Models\ImgMedia;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CompressionPaginationTest extends TestCase
{
    use RefreshDatabase;

    public function test_compressions_page_query_renders_inertia_pagination(): void
    {
        $user = User::factory()->create();

        foreach (range(1, 25) as $index) {
            ImgMedia::create([
                'original_name' => "image-{$index}.jpg",
                'mime_type' => 'image/jpeg',
                'original_size' => 1024,
                'author_id' => $user->id,
                'status' => 'compressed',
                'errors' => '',
            ]);
        }

        $this->actingAs($user)
            ->get(route('compressions.index', ['page' => 2]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Compressions/Main')
                ->where('images.current_page', 2)
                ->where('images.last_page', 2)
                ->where('images.total', 25)
                ->has('images.data', 5)
            );
    }
}

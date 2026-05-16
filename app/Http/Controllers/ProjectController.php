<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientCompany;
use App\Models\Contact;
use App\Models\Email;
use App\Models\Phone;
use App\Models\Project;
use App\Models\Stage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class ProjectController extends Controller
{
    public function __construct() {}

    public function drop(Project $project, Stage $stage)
    {
        $project->stage_id = $stage->id;
        $project->stage_changed_at = now();
        $project->save();
        return Redirect::back();
    }

    public function show(Project $project)
    {
        $pipelineId = $project->stage->pipeline_id;
        $stages = Stage::query()
            ->where('pipeline_id', $pipelineId)
            ->orderBy('order', 'asc')
            ->get();
        $project->load([
        'stage.pipeline', 
        'author', 
        'client.entity', 
        'client.contacts',
        'client.contacts.phones',
        'client.contacts.emails',
    ]);

        return Inertia::render('Projects/Project', compact(
            'project',
            'stages',
        ));
    }

    public function index(Request $request)
    {
        if ($request->has("page")) {
            $projects = Project::with([
                'stage',
                'author',
                'client.entity',
            ])->paginate((int) $request->query('perPage', 10))
                ->through(function (Project $project) {
                    $clientEntity = $project->client?->entity;
                    $project->setAttribute('manager', $project->author);
                    $project->setAttribute('date', $project->created_at);
                    $project->setAttribute('project_number', $project->id);
                    $project->setAttribute('inn', $clientEntity?->inn);
                    $project->setAttribute('client_name', $clientEntity?->name
                        ?? trim(($clientEntity?->first_name ?? '').' '.($clientEntity?->last_name ?? '')));

                    return $project;
                });
            return $projects;
        }
        return Inertia::render('Projects/Index');
    }

    public function create(?Stage $stage = null)
    {
        $stage ??= Stage::query()->orderBy('order')->firstOrFail();

        $project = Project::create([
            'name' => 'New project',
            'description' => '',
            'author_id' => Auth::id(),
            'stage_id' => $stage->id,
            'stage_changed_at' => now(),
        ]);
        return Redirect::route('projects.show', $project->id);
    }

    public function update(Request $request, int|null $id = null)
    {
        $project = $id ? Project::with(['stage', 'client.entity'])->findOrFail($id) : new Project();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'author_id' => 'nullable|integer|exists:users,id',
            'pipeline_id' => 'nullable|integer|exists:pipelines,id',
            'stage_id' => 'nullable|integer|exists:stages,id',
            'level' => 'nullable|integer|min:0|max:5',
            'amount' => 'nullable|numeric',
            'client' => 'nullable|array',
            'client.entity' => 'nullable|array',
            'client.entity.name' => 'nullable|string|max:255',
            'client.entity.legal_form' => 'nullable|string|max:255',
            'client.entity.industry' => 'nullable|string|max:255',
            'client.entity.website' => 'nullable|string|max:255',
            'client.entity.inn' => 'nullable|string|max:255',
            'client.entity.kpp' => 'nullable|string|max:255',
            'client.entity.ogrn' => 'nullable|string|max:255',
            'client.entity.director_name' => 'nullable|string|max:255',
            'client.entity.accountant_name' => 'nullable|string|max:255',
            'client.entity.source' => 'nullable|string|max:255',
            'client.entity.notes' => 'nullable|string',
            'client.contacts' => 'nullable|array',
            'client.contacts.*.id' => 'nullable|integer|exists:contacts,id',
            'client.contacts.*.first_name' => 'nullable|string|max:255',
            'client.contacts.*.last_name' => 'nullable|string|max:255',
            'client.contacts.*.position' => 'nullable|string|max:255',
            'client.contacts.*.phones' => 'nullable|array',
            'client.contacts.*.phones.*.id' => 'nullable|integer|exists:phones,id',
            'client.contacts.*.phones.*.phone' => 'nullable|string|max:255',
            'client.contacts.*.phones.*.type' => 'nullable|string|in:work,personal,home',
            'client.contacts.*.emails' => 'nullable|array',
            'client.contacts.*.emails.*.id' => 'nullable|integer|exists:emails,id',
            'client.contacts.*.emails.*.email' => 'nullable|email|max:255',
        ]);

        $projectData = collect($validated)
            ->only(['name', 'description', 'author_id', 'stage_id', 'level', 'amount'])
            ->all();
        $projectData['description'] = $projectData['description'] ?? '';
        $projectData['amount'] = $projectData['amount'] ?? 0;

        $pipelineId = $validated['pipeline_id'] ?? null;
        if ($pipelineId) {
            $stageId = $projectData['stage_id'] ?? $project->stage_id;
            $stage = $stageId ? Stage::find($stageId) : null;

            if (! $stage || (int) $stage->pipeline_id !== (int) $pipelineId) {
                $stage = Stage::query()
                    ->where('pipeline_id', $pipelineId)
                    ->orderBy('order', 'asc')
                    ->firstOrFail();
                $projectData['stage_id'] = $stage->id;
            }
        }

        if (
            array_key_exists('stage_id', $projectData)
            && (int) $projectData['stage_id'] !== (int) $project->stage_id
        ) {
            $projectData['stage_changed_at'] = now();
        }

        $project->fill($projectData);
        $project->save();

        if (array_key_exists('client', $validated)) {
            $this->updateProjectClient($project, $validated['client']);
        }

        return Redirect::back()->with('message', 'Success!');
    }

    private function updateProjectClient(Project $project, ?array $payload): void
    {
        if ($payload === null) {
            return;
        }

        $client = $project->client()->with('entity')->first();
        $entityPayload = $payload['entity'] ?? [];

        if (! $client) {
            $entity = ClientCompany::create($this->companyAttributes($entityPayload));
            $client = Client::create([
                'entity_id' => $entity->id,
                'entity_type' => $entity::class,
            ]);
            $project->update(['client_id' => $client->id]);
        }

        if (is_array($entityPayload) && ! empty($entityPayload)) {
            $entity = $client->entity;

            if (! $entity instanceof ClientCompany) {
                $entity = ClientCompany::create($this->companyAttributes($entityPayload));
                $client->update([
                    'entity_id' => $entity->id,
                    'entity_type' => $entity::class,
                ]);
            } else {
                $entity->fill($this->companyAttributes($entityPayload, $entity));
                $entity->save();
            }
        }

        if (array_key_exists('contacts', $payload) && is_array($payload['contacts'])) {
            $contactIds = [];

            foreach ($payload['contacts'] as $contactPayload) {
                if (! is_array($contactPayload) || $this->blankContact($contactPayload)) {
                    continue;
                }

                $contact = ! empty($contactPayload['id'])
                    ? Contact::find($contactPayload['id'])
                    : new Contact();

                if (! $contact) {
                    continue;
                }

                $contact->fill([
                    'first_name' => $contactPayload['first_name'] ?? '',
                    'last_name' => $contactPayload['last_name'] ?? '',
                    'position' => $contactPayload['position'] ?? '',
                ]);
                $contact->save();
                $contactIds[] = $contact->id;

                if (array_key_exists('phones', $contactPayload) && is_array($contactPayload['phones'])) {
                    $this->syncContactPhones($contact, $contactPayload['phones']);
                }

                if (array_key_exists('emails', $contactPayload) && is_array($contactPayload['emails'])) {
                    $this->syncContactEmails($contact, $contactPayload['emails']);
                }
            }

            $client->contacts()->sync($contactIds);
        }
    }

    private function companyAttributes(array $payload, ?ClientCompany $existing = null): array
    {
        return [
            'name' => $payload['name'] ?? $existing?->name ?? 'Company',
            'legal_form' => $payload['legal_form'] ?? null,
            'industry' => $payload['industry'] ?? null,
            'website' => $payload['website'] ?? null,
            'inn' => $payload['inn'] ?? null,
            'kpp' => $payload['kpp'] ?? null,
            'ogrn' => $payload['ogrn'] ?? null,
            'director_name' => $payload['director_name'] ?? null,
            'accountant_name' => $payload['accountant_name'] ?? null,
            'source' => $payload['source'] ?? null,
            'notes' => $payload['notes'] ?? null,
        ];
    }

    private function blankContact(array $payload): bool
    {
        return empty($payload['id'])
            && trim($payload['first_name'] ?? '') === ''
            && trim($payload['last_name'] ?? '') === ''
            && trim($payload['position'] ?? '') === '';
    }

    private function syncContactPhones(Contact $contact, array $payload): void
    {
        $phoneIds = [];

        foreach ($payload as $phonePayload) {
            if (! is_array($phonePayload) || trim($phonePayload['phone'] ?? '') === '') {
                continue;
            }

            $phone = ! empty($phonePayload['id'])
                ? Phone::find($phonePayload['id'])
                : new Phone();

            if (! $phone) {
                continue;
            }

            $phone->fill([
                'phone' => $phonePayload['phone'],
                'type' => $phonePayload['type'] ?? 'work',
            ]);
            $phone->save();
            $phoneIds[] = $phone->id;
        }

        $contact->phones()->sync($phoneIds);
    }

    private function syncContactEmails(Contact $contact, array $payload): void
    {
        $emailIds = [];

        foreach ($payload as $emailPayload) {
            if (! is_array($emailPayload) || trim($emailPayload['email'] ?? '') === '') {
                continue;
            }

            $email = ! empty($emailPayload['id'])
                ? Email::find($emailPayload['id'])
                : new Email();

            if (! $email) {
                continue;
            }

            $email->fill(['email' => $emailPayload['email']]);
            $email->save();
            $emailIds[] = $email->id;
        }

        $contact->emails()->sync($emailIds);
    }

    public function usersPaginated(Request $request)
    {
        return User::query()
            ->when($request->string('search')->toString(), function ($query, string $search) {
                $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy('last_name')
            ->orderBy('name')
            ->paginate((int) $request->query('per_page', 10));
    }

    public function destroy(Project $project)
    {
        $project->delete();
        return Redirect::back();
    }

    public function getlogs(Project $project)
    {
        $log = Activity::query()
            ->where('subject_type', Project::class)
            ->where('subject_id', $project->id);
        return $log->paginate(10)->through(function ($e) {
            $exp = explode('\\', $e->subject_type);
            $e->subject_type = $exp[count($exp) - 1] ?? null;
            return $e;
        });
    }
}

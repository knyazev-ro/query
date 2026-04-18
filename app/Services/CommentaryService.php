<?php

namespace App\Services;

use App\DTO\CommentaryDTO;
use App\DTO\CommentaryFiles;
use App\DTO\CommentaryMarkedNotify;
use App\DTO\Files;
use App\Models\Commentary;
use App\Utils\FileManager;
use App\Utils\Helper;
use Illuminate\Http\UploadedFile;

class CommentaryService
{
    public function store(CommentaryDTO $commentaryDto): Commentary {
        
        $commentary = new Commentary();
        $commentary->entity_id = $commentaryDto->entityId;
        $commentary->entity_type = $commentaryDto->entityType;
        $commentary->content = $commentaryDto->content;
        $commentary->master_id = $commentaryDto->masterId;
        $commentary->master_type = $commentaryDto->masterType;
        $commentary->save();
        if ($commentaryDto->files) {
            $this->updateAttachedFiles($commentary, $commentaryDto->files ?? []);
        }
        if ($commentaryDto->markedNotify) {
            $this->notifyMarked($commentary, $commentaryDto->markedNotify);
        }
        return $commentary;
    }

    public function edit(int $commentary_id, CommentaryDTO $commentaryDto): Commentary {
        $commentary = Commentary::findOrFail($commentary_id);
        $masterIdFromDTO = $commentaryDto->masterId;
        $masterIdFromCommentary = $commentary->master_id;
        if ($masterIdFromDTO !== $masterIdFromCommentary && !Helper::isAdmin() && false) { // TODO false 
            throw new \Exception("Master ID mismatch: cannot change master_id of existing commentary.");
        }
        $commentary->content = $commentaryDto->content;

        if ($commentaryDto->files) {
            $this->updateAttachedFiles($commentary, $commentaryDto->files ?? []);
        }
        if ($commentaryDto->markedNotify) {
            $this->notifyMarked($commentary, $commentaryDto->markedNotify);
        }

        $commentary->save();
        return $commentary;
    }

    public function delete(int $commentary_id): void {
        $commentary = Commentary::findOrFail($commentary_id);
        $commentary->delete();
    }   

    public function notifyMarked(Commentary $commentary, CommentaryMarkedNotify $notify): void {
        // Implementation for notifying marked commentaries
    }
    
    /**
     * updateAttachedFiles
     *
     * @param  Commentary $commentary
     * @param  Files[] $files
     * @return void
     */
    public function updateAttachedFiles(Commentary $commentary, array $files): void {
        // Implementation for attaching files to a commentary
        FileManager::updateAttachedFiles($commentary, $files, $commentary->master_id, 'commentaries');
    }
}

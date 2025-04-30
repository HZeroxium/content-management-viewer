// /src/modules/content/services/content-processor.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { FilesService } from '@modules/files/files.service';
import { Block } from '../schemas/content.schema';
import { ContentBlockDto } from '../dto/create-content-with-blocks.dto';

@Injectable()
export class ContentProcessorService {
  constructor(private readonly filesService: FilesService) {}

  /**
   * Process and validate content blocks including file references
   */
  async processBlocks(
    blocks: ContentBlockDto[],
    userId: string,
  ): Promise<Block[]> {
    const processedBlocks: Block[] = [];

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const processedBlock: Block = {
        type: block.type,
        metadata: { ...(block.metadata || {}) },
      };

      switch (block.type) {
        case 'text':
          await this.processTextBlock(block, processedBlock, i);
          break;

        case 'image':
          await this.processImageBlock(block, processedBlock, i);
          break;

        case 'video':
          await this.processVideoBlock(block, processedBlock, i);
          break;

        default:
          throw new BadRequestException(
            `Block #${i + 1}: Unsupported block type: ${block.type}`,
          );
      }

      // Track ordering
      processedBlock.metadata!.position = i;
      processedBlocks.push(processedBlock);
    }

    return processedBlocks;
  }

  /**
   * Process text block
   */
  private async processTextBlock(
    block: ContentBlockDto,
    processedBlock: Block,
    index: number,
  ): Promise<void> {
    if (!block.text) {
      throw new BadRequestException(
        `Block #${index + 1}: Text blocks require 'text' property`,
      );
    }
    processedBlock.text = block.text;
    processedBlock.metadata!.textType = block.metadata?.textType || 'paragraph';
  }

  /**
   * Process image block
   */
  private async processImageBlock(
    block: ContentBlockDto,
    processedBlock: Block,
    index: number,
  ): Promise<void> {
    if (block.url) {
      processedBlock.url = block.url;
    } else if (block.fileId) {
      await this.processFileReference(
        block.fileId,
        processedBlock,
        index,
        false,
      );
    } else {
      throw new BadRequestException(
        `Block #${index + 1}: Image blocks require 'url' or 'fileId'`,
      );
    }
  }

  /**
   * Process video block
   */
  private async processVideoBlock(
    block: ContentBlockDto,
    processedBlock: Block,
    index: number,
  ): Promise<void> {
    if (block.url) {
      processedBlock.url = block.url;
    } else if (block.fileId) {
      await this.processFileReference(
        block.fileId,
        processedBlock,
        index,
        true,
      );
      // Add video-specific metadata
      if (block.metadata?.duration) {
        processedBlock.metadata!.duration = block.metadata.duration;
      }
      if (block.metadata?.thumbnail) {
        processedBlock.metadata!.thumbnail = block.metadata.thumbnail;
      }
    } else {
      throw new BadRequestException(
        `Block #${index + 1}: Video blocks require 'url' or 'fileId'`,
      );
    }
  }

  /**
   * Process file reference for blocks
   */
  private async processFileReference(
    fileId: string,
    processedBlock: Block,
    index: number,
    isVideo: boolean,
  ): Promise<void> {
    try {
      const file = await this.filesService.findOne(fileId);
      processedBlock.url = file.url;

      // Ensure metadata object exists
      if (!processedBlock.metadata) {
        processedBlock.metadata = {};
      }

      // Set file metadata
      processedBlock.metadata.fileId = file.id;
      processedBlock.metadata.fileName = file.filename;
      processedBlock.metadata.fileType = file.contentType;
      processedBlock.metadata.fileSize = file.size;
      processedBlock.metadata.uploadedBy = file.createdBy;
    } catch (error) {
      throw new BadRequestException(
        `Block #${index + 1}: File with ID ${fileId} not found`,
      );
    }
  }
}

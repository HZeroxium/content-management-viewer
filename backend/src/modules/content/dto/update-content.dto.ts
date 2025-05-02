// /src/modules/content/dto/update-content.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateContentWithBlocksDto } from './create-content-with-blocks.dto';

export class UpdateContentDto extends PartialType(CreateContentWithBlocksDto) {}

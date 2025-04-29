// /src/modules/content/dto/update-content.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateContentDto } from './create-content.dto';

export class UpdateContentDto extends PartialType(CreateContentDto) {}

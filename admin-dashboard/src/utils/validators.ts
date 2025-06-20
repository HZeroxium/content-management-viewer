// src/utils/validators.ts
import { z } from "zod";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_IMAGE_SIZE, {
    message: `Image must be ≤ ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
  })
  .refine(
    (file) =>
      ALLOWED_IMAGE_TYPES.includes(
        file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
      ),
    {
      message: `Image must be one of: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    }
  );

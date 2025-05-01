// src/app/dashboard/content/blocks/ImageBlock.tsx
"use client";
import React, { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { uploadFile } from "@/lib/api/files";
import { imageFileSchema } from "@/utils/validators";

interface Props {
  name: string;
}

export const ImageBlock: React.FC<Props> = ({ name }) => {
  const { control, setError, clearErrors } = useFormContext();
  const [preview, setPreview] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="flex flex-col space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              clearErrors(name);
              const parse = imageFileSchema.safeParse(file);
              if (!parse.success) {
                setError(name, { message: parse.error.errors[0].message });
                return;
              }
              setUploading(true);
              try {
                const { url } = await uploadFile(file, setProgress);
                setPreview(url);
                field.onChange(url);
              } catch {
                setError(name, { message: "Upload failed" });
              } finally {
                setUploading(false);
              }
            }}
          />
          {uploading && <progress value={progress} max={100} />}
          {preview && (
            <img
              src={preview}
              alt="Uploaded preview"
              className="max-w-full h-auto rounded"
            />
          )}
        </div>
      )}
    />
  );
};

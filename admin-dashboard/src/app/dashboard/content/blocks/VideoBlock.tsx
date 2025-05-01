// src/app/dashboard/content/blocks/VideoBlock.tsx
"use client";
import React from "react";
import { useFormContext, Controller } from "react-hook-form";

interface Props {
  name: string;
}

export const VideoBlock: React.FC<Props> = ({ name }) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field }) => (
        <div className="flex flex-col space-y-2">
          <input
            type="url"
            placeholder="Video URL (YouTube, Vimeo…)"
            className="border px-2 py-1 rounded"
            {...field}
          />
          {field.value && (
            <video
              controls
              src={field.value}
              className="max-w-full h-auto rounded"
            />
          )}
        </div>
      )}
    />
  );
};

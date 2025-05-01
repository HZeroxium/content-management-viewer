// src/app/dashboard/content/blocks/RichTextBlock.tsx
"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Controller, useFormContext } from "react-hook-form";
import "tiptap/dist/tiptap.css"; // make sure CSS is imported

const TipTapEditor = dynamic(
  () => import("@tiptap/react").then((mod) => mod.Editor),
  { ssr: false }
);

interface Props {
  name: string;
}

export const RichTextBlock: React.FC<Props> = ({ name }) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field }) => (
        <>
          <TipTapEditor
            editor={field.value}
            onUpdate={({ editor }) => field.onChange(editor.getHTML())}
            extensions={/* your extensions here */}
          />
          <p className="mt-1 text-sm text-gray-500">
            Rich text content (HTML).
          </p>
        </>
      )}
    />
  );
};

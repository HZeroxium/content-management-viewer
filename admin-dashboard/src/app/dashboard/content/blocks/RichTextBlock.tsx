// src/app/dashboard/content/blocks/RichTextBlock.tsx
"use client";

import React from "react";
import { Box } from "@mui/material";
import { ContentBlockDto as ContentBlockProps } from "@/lib/types/content";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

interface RichTextBlockProps extends Omit<ContentBlockProps, "onChange"> {
  content?: string;
  onChange?: (content: string) => void;
  isEditable?: boolean;
}

export default function RichTextBlock({
  content = "",
  onChange,
  isEditable = false,
}: RichTextBlockProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    editable: isEditable,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  // Define a basic toolbar component
  const EditorToolbar = () => {
    if (!editor) return null;

    return (
      <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
        {/* Your toolbar buttons would go here */}
      </Box>
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      {isEditable && <EditorToolbar />}

      <Box
        sx={{
          border: isEditable ? "1px solid" : "none",
          borderColor: "divider",
          borderRadius: 1,
          p: isEditable ? 2 : 0,
          minHeight: isEditable ? 100 : "auto",
          "& .ProseMirror": {
            outline: "none",
            height: "100%",
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}

"use client";

import React, { useEffect } from "react";
import { Box, Divider, IconButton, Paper, Stack, Tooltip } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import CodeIcon from "@mui/icons-material/Code";
import LinkIcon from "@mui/icons-material/Link";
import FormatClearIcon from "@mui/icons-material/FormatClear";
import TitleIcon from "@mui/icons-material/Title";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

interface MenuBarProps {
  editor: any;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const handleLinkClick = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL:", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url, target: "_blank" })
      .run();
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ mb: 1, p: 1 }}>
      <Stack
        direction="row"
        spacing={0.5}
        divider={<Divider orientation="vertical" flexItem />}
        flexWrap="wrap"
      >
        {/* Heading Controls */}
        <Stack direction="row">
          <Tooltip title="Heading 1">
            <IconButton
              size="small"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              color={
                editor.isActive("heading", { level: 1 }) ? "primary" : "default"
              }
            >
              <TitleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Heading 2">
            <IconButton
              size="small"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              color={
                editor.isActive("heading", { level: 2 }) ? "primary" : "default"
              }
            >
              <TitleIcon sx={{ transform: "scale(0.8)" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Heading 3">
            <IconButton
              size="small"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              color={
                editor.isActive("heading", { level: 3 }) ? "primary" : "default"
              }
            >
              <TitleIcon sx={{ transform: "scale(0.7)" }} />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Text Formatting */}
        <Stack direction="row">
          <Tooltip title="Bold">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBold().run()}
              color={editor.isActive("bold") ? "primary" : "default"}
            >
              <FormatBoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              color={editor.isActive("italic") ? "primary" : "default"}
            >
              <FormatItalicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Underline">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              color={editor.isActive("underline") ? "primary" : "default"}
            >
              <FormatUnderlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Code">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleCode().run()}
              color={editor.isActive("code") ? "primary" : "default"}
            >
              <CodeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Lists */}
        <Stack direction="row">
          <Tooltip title="Bullet List">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              color={editor.isActive("bulletList") ? "primary" : "default"}
            >
              <FormatListBulletedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered List">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              color={editor.isActive("orderedList") ? "primary" : "default"}
            >
              <FormatListNumberedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Blockquote & Link */}
        <Stack direction="row">
          <Tooltip title="Block Quote">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              color={editor.isActive("blockquote") ? "primary" : "default"}
            >
              <FormatQuoteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Link">
            <IconButton
              size="small"
              onClick={handleLinkClick}
              color={editor.isActive("link") ? "primary" : "default"}
            >
              <LinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Clear formatting */}
        <Tooltip title="Clear Formatting">
          <IconButton
            size="small"
            onClick={() => {
              editor.chain().focus().clearNodes().unsetAllMarks().run();
            }}
          >
            <FormatClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
};

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Enter text here...",
  autoFocus = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "rich-text-editor-content",
      },
    },
    autofocus: autoFocus,
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  return (
    <Box>
      <MenuBar editor={editor} />
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          minHeight: "200px",
          "& .ProseMirror": {
            outline: "none",
            height: "100%",
            "&:focus": {
              outline: "none",
            },
            "& p.is-editor-empty:first-child::before": {
              content: `"${placeholder}"`,
              float: "left",
              color: "gray",
              pointerEvents: "none",
              height: 0,
            },
            "& h1": {
              fontSize: "1.8rem",
              fontWeight: "bold",
              marginBottom: "0.5em",
            },
            "& h2": {
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "0.5em",
            },
            "& h3": {
              fontSize: "1.3rem",
              fontWeight: "bold",
              marginBottom: "0.5em",
            },
            "& a": {
              color: "primary.main",
              textDecoration: "underline",
            },
            "& ul": {
              paddingLeft: "1.5em",
              listStyleType: "disc",
            },
            "& ol": {
              paddingLeft: "1.5em",
            },
            "& blockquote": {
              borderLeft: "3px solid #ddd",
              paddingLeft: "1em",
              fontStyle: "italic",
              margin: "1em 0",
            },
            "& code": {
              backgroundColor: "rgba(0, 0, 0, 0.06)",
              padding: "0.2em 0.4em",
              borderRadius: "3px",
              fontFamily: "monospace",
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Paper>
    </Box>
  );
};

export default RichTextEditor;

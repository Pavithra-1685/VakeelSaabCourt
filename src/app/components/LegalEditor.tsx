import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Download,
  History,
  ArrowLeft,
  Minus,
  FileText,
} from 'lucide-react';
import { useEffect } from 'react';

interface LegalEditorProps {
  initialContent: string;
  onContentChange?: (content: string) => void;
  onExport?: (format: 'docx' | 'pdf') => void;
  onShowHistory?: () => void;
  onShowVersions?: () => void;
  onRestore?: (version: any) => void;
  onBack?: () => void;
}

// Font size map using heading levels + paragraph
const TEXT_STYLES = [
  { label: 'Paragraph',    value: 'paragraph' },
  { label: 'Heading 1',    value: 'h1' },
  { label: 'Heading 2',    value: 'h2' },
  { label: 'Heading 3',    value: 'h3' },
];

const FONT_SIZES = [
  { label: '10pt', size: '10pt' },
  { label: '11pt', size: '11pt' },
  { label: '12pt', size: '12pt' },
  { label: '14pt', size: '14pt' },
  { label: '16pt', size: '16pt' },
  { label: '18pt', size: '18pt' },
  { label: '20pt', size: '20pt' },
  { label: '24pt', size: '24pt' },
];

export function LegalEditor({
  initialContent,
  onContentChange,
  onExport,
  onShowHistory,
  onShowVersions,
  onRestore,
  onBack,
}: LegalEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'legal-editor-content focus:outline-none',
        style: [
          'font-family: "Times New Roman", Times, serif',
          'font-size: 12pt',
          'line-height: 1.8',
          'color: #1a1a1a',
          'min-height: 600px',
          'padding: var(--editor-padding, 48px 56px)',
          'max-width: 800px',
          'margin: 0 auto',
        ].join('; '),
      },
    },
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  if (!editor) {
    return null;
  }

  // Determine current text style
  const getCurrentStyle = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    return 'paragraph';
  };

  const applyTextStyle = (value: string) => {
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else if (value === 'h1') {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (value === 'h2') {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (value === 'h3') {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    }
  };

  const applyFontSize = (size: string) => {
    editor.chain().focus().setMark('textStyle', { style: `font-size: ${size}` }).run();
  };

  const toolbarBtn = (active: boolean) =>
    `p-2 border border-[var(--grey-300)] transition-colors text-sm
     ${active ? 'bg-[var(--matte-black)] text-white border-[var(--matte-black)]' : 'hover:bg-[var(--grey-100)]'}`;

  const selectClass =
    'h-9 px-2 border border-[var(--grey-300)] bg-white text-sm text-[var(--matte-black)] ' +
    'focus:outline-none focus:border-[var(--matte-black)] cursor-pointer';

  return (
    <>
      {/* Inject list + editor styles */}
      <style>{`
        .legal-editor-content ul {
          list-style-type: disc !important;
          padding-left: 2em !important;
          margin: 0.5em 0 !important;
        }
        .legal-editor-content ol {
          list-style-type: decimal !important;
          padding-left: 2em !important;
          margin: 0.5em 0 !important;
        }
        .legal-editor-content li {
          margin: 0.25em 0 !important;
          display: list-item !important;
        }
        .legal-editor-content li p {
          margin: 0 !important;
        }
        .legal-editor-content h1 {
          font-size: 18pt !important;
          font-weight: bold !important;
          text-align: center !important;
          text-transform: uppercase !important;
          margin: 1em 0 0.5em !important;
          font-family: "Times New Roman", Times, serif !important;
        }
        .legal-editor-content h2 {
          font-size: 14pt !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          margin: 0.8em 0 0.4em !important;
          font-family: "Times New Roman", Times, serif !important;
        }
        .legal-editor-content h3 {
          font-size: 12pt !important;
          font-weight: bold !important;
          margin: 0.6em 0 0.3em !important;
          font-family: "Times New Roman", Times, serif !important;
        }
        .legal-editor-content p {
          margin: 0.4em 0 !important;
        }
        .legal-editor-content hr {
          border: none !important;
          border-top: 1px solid #1a1a1a !important;
          margin: 1em 0 !important;
        }
        @media (max-width: 768px) {
          .legal-editor-content {
            --editor-padding: 24px 20px !important;
          }
        }
      `}</style>

      <div className="flex flex-col h-full bg-[var(--pure-white)]">
        {/* ── Top Bar ── */}
        <div className="border-b border-[var(--grey-300)] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                id="editor-back-btn"
                onClick={onBack}
                className="p-2 hover:bg-[var(--grey-100)] transition-colors border border-[var(--grey-300)]"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h3
              style={{ fontFamily: 'var(--font-heading)' }}
              className="text-xl text-[var(--matte-black)]"
            >
              Legal Draft Editor
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="editor-copy-btn"
              onClick={() => {
                const text = editor.getText();
                navigator.clipboard.writeText(text);
                alert('Copied to clipboard!');
              }}
              className="flex items-center gap-2 px-3 md:px-4 py-2 border border-[var(--matte-black)] hover:bg-[var(--grey-100)] transition-colors text-sm"
              title="Copy Text"
            >
              <span className="hidden md:inline">Copy Text</span>
              <FileText className="w-4 h-4 md:hidden" />
            </button>
            {onShowVersions && (
              <button
                id="editor-versions-btn"
                onClick={onShowVersions}
                className="flex items-center gap-2 px-3 md:px-4 py-2 border border-[var(--grey-300)] hover:bg-[var(--grey-100)] transition-colors text-sm"
                title="Versions"
              >
                <History className="w-4 h-4" />
                <span className="hidden md:inline">Versions</span>
              </button>
            )}
            {onExport && (
              <button
                id="editor-export-btn"
                onClick={() => onExport('pdf')}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[var(--matte-black)] text-[var(--pure-white)] hover:bg-[var(--grey-900)] transition-colors text-sm"
                title="Export"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Export</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Formatting Toolbar ── */}
        <div className="border-b border-[var(--grey-300)] px-4 py-2 flex items-center gap-1 flex-wrap">

          {/* Text Style dropdown */}
          <select
            id="editor-text-style"
            value={getCurrentStyle()}
            onChange={(e) => applyTextStyle(e.target.value)}
            className={selectClass}
            title="Text Style"
            style={{ width: 120 }}
          >
            {TEXT_STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Font Size dropdown */}
          <select
            id="editor-font-size"
            onChange={(e) => applyFontSize(e.target.value)}
            defaultValue="12pt"
            className={selectClass}
            title="Font Size"
            style={{ width: 80 }}
          >
            {FONT_SIZES.map((f) => (
              <option key={f.size} value={f.size}>
                {f.label}
              </option>
            ))}
          </select>

          <div className="w-px h-6 bg-[var(--grey-300)] mx-1" />

          {/* Bold */}
          <button
            id="editor-bold-btn"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={toolbarBtn(editor.isActive('bold'))}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>

          {/* Italic */}
          <button
            id="editor-italic-btn"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={toolbarBtn(editor.isActive('italic'))}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          {/* Underline */}
          <button
            id="editor-underline-btn"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={toolbarBtn(editor.isActive('underline'))}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-[var(--grey-300)] mx-1" />

          {/* Align Left */}
          <button
            id="editor-align-left-btn"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={toolbarBtn(editor.isActive({ textAlign: 'left' }))}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>

          {/* Align Centre */}
          <button
            id="editor-align-center-btn"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={toolbarBtn(editor.isActive({ textAlign: 'center' }))}
            title="Align Centre"
          >
            <AlignCenter className="w-4 h-4" />
          </button>

          {/* Align Right */}
          <button
            id="editor-align-right-btn"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={toolbarBtn(editor.isActive({ textAlign: 'right' }))}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-[var(--grey-300)] mx-1" />

          {/* Bullet List */}
          <button
            id="editor-bullet-list-btn"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={toolbarBtn(editor.isActive('bulletList'))}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Ordered List */}
          <button
            id="editor-ordered-list-btn"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={toolbarBtn(editor.isActive('orderedList'))}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          {/* Horizontal Rule */}
          <button
            id="editor-hr-btn"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className={toolbarBtn(false)}
            title="Insert Separator"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* ── Editor Canvas ── */}
        <div className="flex-1 overflow-y-auto bg-[var(--grey-50,#f9f9f9)] md:p-6">
          <div
            className="bg-white shadow-sm md:shadow-lg min-h-[840px] mx-auto w-full md:max-w-[860px]"
            style={{
              boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </>
  );
}

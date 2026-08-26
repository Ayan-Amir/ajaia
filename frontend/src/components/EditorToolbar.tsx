import type { Editor } from "@tiptap/react";
import { cn } from "@/utils/cn";

interface EditorToolbarProps {
  editor: Editor;
  disabled: boolean;
}

interface ToolbarButton {
  label: string;
  title: string;
  isActive: () => boolean;
  run: () => void;
}

export function EditorToolbar({ editor, disabled }: EditorToolbarProps) {
  const chain = () => editor.chain().focus();

  const buttons: ToolbarButton[] = [
    {
      label: "B",
      title: "Bold",
      isActive: () => editor.isActive("bold"),
      run: () => chain().toggleBold().run(),
    },
    {
      label: "I",
      title: "Italic",
      isActive: () => editor.isActive("italic"),
      run: () => chain().toggleItalic().run(),
    },
    {
      label: "U",
      title: "Underline",
      isActive: () => editor.isActive("underline"),
      run: () => chain().toggleUnderline().run(),
    },
    {
      label: "• List",
      title: "Bulleted list",
      isActive: () => editor.isActive("bulletList"),
      run: () => chain().toggleBulletList().run(),
    },
    {
      label: "1. List",
      title: "Numbered list",
      isActive: () => editor.isActive("orderedList"),
      run: () => chain().toggleOrderedList().run(),
    },
  ];

  const currentBlock = () => {
    for (const level of [1, 2, 3] as const) {
      if (editor.isActive("heading", { level })) return `h${level}`;
    }
    return "p";
  };

  const handleBlockChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === "p") {
      chain().setParagraph().run();
      return;
    }
    const level = Number(value.replace("h", "")) as 1 | 2 | 3;
    chain().toggleHeading({ level }).run();
  };

  // Without this the button steals focus on mousedown, dropping the editor
  // selection so the format applies to nothing and the next keystrokes are lost.
  const handleMouseDown = (event: React.MouseEvent) => event.preventDefault();

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2"
    >
      <label className="sr-only" htmlFor="block-type">
        Text style
      </label>
      <select
        id="block-type"
        value={currentBlock()}
        onChange={handleBlockChange}
        disabled={disabled}
        className="mr-2 rounded border border-slate-300 bg-white px-2 py-1 text-sm disabled:opacity-50"
      >
        <option value="p">Normal text</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>

      {buttons.map((button) => (
        <button
          key={button.title}
          type="button"
          title={button.title}
          aria-label={button.title}
          aria-pressed={button.isActive()}
          disabled={disabled}
          onMouseDown={handleMouseDown}
          onClick={button.run}
          className={cn(
            "min-w-9 rounded px-2 py-1 text-sm font-medium text-slate-700 transition",
            "hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            button.isActive() && "bg-slate-800 text-white hover:bg-slate-800",
          )}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}

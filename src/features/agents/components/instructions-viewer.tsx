"use client";

import Image from "next/image";
import { useMemo, type HTMLAttributes } from "react";
import { Streamdown } from "streamdown";
import { harden } from "rehype-harden";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { AtSign, ListChecks, CheckSquare, FolderOpen } from "lucide-react";
import type { PluggableList } from "unified";

interface InstructionsViewerProps {
  instructions: string;
}

type DataRefType = "member" | "list" | "task" | "space";

const refRegex = /\{\{(member|list|task|space|tool):([^:}]+):([^}]+)\}\}/g;

const refIcons: Record<DataRefType, typeof AtSign> = {
  member: AtSign,
  list: ListChecks,
  task: CheckSquare,
  space: FolderOpen,
};

const defaultAttributes = defaultSchema.attributes ?? {};

const refSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultAttributes,
    span: [
      ...(defaultAttributes.span || []),
      "dataType",
      "dataRefType",
      "dataId",
      "dataName",
    ],
  },
};

const rehypePlugins: PluggableList = [
  rehypeRaw,
  [rehypeSanitize, refSanitizeSchema],
  [
    harden,
    {
      allowedImagePrefixes: ["*"],
      allowedLinkPrefixes: ["*"],
      allowedProtocols: ["*"],
      defaultOrigin: undefined,
      allowDataImages: true,
    },
  ],
];

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function replaceRefsWithHtml(text: string) {
  return text.replace(refRegex, (_match, type, id, name) => {
    const safeId = escapeHtmlAttribute(String(id));
    const safeName = escapeHtmlAttribute(String(name));

    if (type === "tool") {
      return `<span data-type="toolRef" data-id="${safeId}" data-name="${safeName}"></span>`;
    }

    return `<span data-type="dataRef" data-ref-type="${escapeHtmlAttribute(String(type))}" data-id="${safeId}" data-name="${safeName}"></span>`;
  });
}

type RefSpanProps = HTMLAttributes<HTMLSpanElement> & {
  node?: { properties?: Record<string, unknown> };
};

function DataRefBadge({ type, name }: { type: DataRefType; name: string }) {
  const Icon = refIcons[type] ?? AtSign;
  const isMember = type === "member";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs font-medium ${
        isMember ? "text-primary" : "text-foreground"
      }`}
    >
      <Icon className="size-3" />
      {name}
    </span>
  );
}

function ToolRefBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">
      <Image src="/logo.svg" alt="" width={12} height={12} className="size-3" />
      {name}
    </span>
  );
}

function RefSpan({ node, children, ...props }: RefSpanProps) {
  const dataType =
    typeof node?.properties?.dataType === "string"
      ? node?.properties?.dataType
      : "";

  if (dataType === "dataRef") {
    const refType =
      typeof node?.properties?.dataRefType === "string"
        ? node?.properties?.dataRefType
        : "member";
    const name =
      typeof node?.properties?.dataName === "string"
        ? node?.properties?.dataName
        : "";
    return <DataRefBadge type={refType as DataRefType} name={name} />;
  }

  if (dataType === "toolRef") {
    const name =
      typeof node?.properties?.dataName === "string"
        ? node?.properties?.dataName
        : "";
    return <ToolRefBadge name={name} />;
  }

  return <span {...props}>{children}</span>;
}

export function InstructionsViewer({ instructions }: InstructionsViewerProps) {
  const content = useMemo(
    () => replaceRefsWithHtml(instructions),
    [instructions],
  );

  return (
    <Streamdown
      className="text-sm"
      rehypePlugins={rehypePlugins}
      components={{ span: RefSpan }}
    >
      {content}
    </Streamdown>
  );
}

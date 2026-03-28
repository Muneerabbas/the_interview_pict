"use client";

import { useRef } from "react";
import { NodeViewWrapper } from "@tiptap/react";

const MIN_SIZE = 30;

const pickStyleValue = (styleText, key) => {
  const match = String(styleText || "").match(new RegExp(`${key}\\s*:\\s*([^;]+)`, "i"));
  return match?.[1]?.trim() || null;
};

export function ResizableImageNodeView({ node, selected, updateAttributes }) {
  const startRef = useRef(null);

  const src = node.attrs.src || "";
  const alt = node.attrs.alt || "";
  const title = node.attrs.title || "";

  const width = Number.parseInt(node.attrs.width || "", 10) || null;
  const height = Number.parseInt(node.attrs.height || "", 10) || null;
  const filterValue = pickStyleValue(node.attrs.style, "filter");

  const frameWidth = width || null;
  const frameHeight = height || null;

  const wrapperStyle = {
    maxWidth: "100%",
    width: frameWidth ? `${frameWidth}px` : "auto",
    height: frameHeight ? `${frameHeight}px` : "auto",
  };

  const imgStyle = {
    width: frameWidth ? `${frameWidth}px` : "auto",
    height: frameHeight ? `${frameHeight}px` : "auto",
    objectFit: "contain",
    maxWidth: "100%",
    ...(filterValue ? { filter: filterValue } : {}),
  };

  const onResizeStart = (event, direction) => {
    event.preventDefault();
    event.stopPropagation();

    const imgElement = event.currentTarget
      ?.closest(".tiptap-resizable-image")
      ?.querySelector("img");

    if (!imgElement) return;

    const rect = imgElement.getBoundingClientRect();
    startRef.current = {
      direction,
      startX: event.clientX,
      startY: event.clientY,
      startW: frameWidth || Math.round(rect.width),
      startH: frameHeight || Math.round(rect.height),
    };

    document.body.style.userSelect = "none";

    const onPointerMove = (moveEvent) => {
      if (!startRef.current) return;

      const { direction: dir, startX, startY, startW, startH } = startRef.current;
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let nextW = startW;
      let nextH = startH;

      if (dir === "x" || dir === "xy" || dir === "x-rev" || dir === "xy-tl" || dir === "xy-bl") {
        nextW = Math.max(MIN_SIZE, Math.round(startW + deltaX));
      }
      if (dir === "y" || dir === "xy" || dir === "y-rev" || dir === "xy-tl" || dir === "xy-tr") {
        nextH = Math.max(MIN_SIZE, Math.round(startH + deltaY));
      }

      if (dir === "x-rev" || dir === "xy-tl" || dir === "xy-tr") {
        nextW = Math.max(MIN_SIZE, Math.round(startW - deltaX));
      }
      if (dir === "y-rev" || dir === "xy-tl" || dir === "xy-bl") {
        nextH = Math.max(MIN_SIZE, Math.round(startH - deltaY));
      }

      const targetW = dir === "y" ? startW : nextW;
      const targetH = dir === "x" ? startH : nextH;
      const nextStyle = [
        `width: ${targetW}px`,
        `height: ${targetH}px`,
        "object-fit: contain",
        "max-width: 100%",
        filterValue ? `filter: ${filterValue}` : "",
      ]
        .filter(Boolean)
        .join("; ");

      updateAttributes({
        width: String(targetW),
        height: String(targetH),
        style: nextStyle,
      });
    };

    const onPointerUp = () => {
      startRef.current = null;
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  return (
    <NodeViewWrapper className={`tiptap-resizable-image ${selected ? "is-selected" : ""}`}>
      <div className="tiptap-resizable-image-frame" style={wrapperStyle}>
        <div className="tiptap-resizable-image-cropbox">
          <img src={src} alt={alt} title={title} draggable="false" style={imgStyle} />
        </div>
        {selected && (
          <>
            <button
              type="button"
              aria-label="Resize horizontally from left"
              className="tiptap-image-handle tiptap-image-handle-x-left"
              onPointerDown={(e) => onResizeStart(e, "x-rev")}
            />
            <button
              type="button"
              aria-label="Resize horizontally from right"
              className="tiptap-image-handle tiptap-image-handle-x"
              onPointerDown={(e) => onResizeStart(e, "x")}
            />
            <button
              type="button"
              aria-label="Resize vertically from top"
              className="tiptap-image-handle tiptap-image-handle-y-top"
              onPointerDown={(e) => onResizeStart(e, "y-rev")}
            />
            <button
              type="button"
              aria-label="Resize vertically from bottom"
              className="tiptap-image-handle tiptap-image-handle-y"
              onPointerDown={(e) => onResizeStart(e, "y")}
            />
            <button
              type="button"
              aria-label="Resize diagonally from top left"
              className="tiptap-image-handle tiptap-image-handle-xy-tl"
              onPointerDown={(e) => onResizeStart(e, "xy-tl")}
            />
            <button
              type="button"
              aria-label="Resize diagonally from top right"
              className="tiptap-image-handle tiptap-image-handle-xy-tr"
              onPointerDown={(e) => onResizeStart(e, "xy-tr")}
            />
            <button
              type="button"
              aria-label="Resize diagonally from bottom left"
              className="tiptap-image-handle tiptap-image-handle-xy-bl"
              onPointerDown={(e) => onResizeStart(e, "xy-bl")}
            />
            <button
              type="button"
              aria-label="Resize diagonally from bottom right"
              className="tiptap-image-handle tiptap-image-handle-xy"
              onPointerDown={(e) => onResizeStart(e, "xy")}
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export default ResizableImageNodeView;

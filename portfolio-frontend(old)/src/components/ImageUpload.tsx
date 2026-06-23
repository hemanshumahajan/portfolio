import { useState, useRef } from "react";
import { uploadToCloudinary } from "@/lib/upload";

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
}

export function SingleUpload({ label, value, onChange, accept = "image/*" }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
    } catch {
      alert("Upload failed. Check your Cloudinary config.");
    }
    setUploading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "capitalize" }}>
        {label}
      </label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Paste URL or upload file"
          style={{ flex: 1, padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, color: "#111827", background: "white" }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{ padding: "9px 14px", background: uploading ? "#e5e7eb" : "#6366f1", color: uploading ? "#9ca3af" : "white", border: "none", borderRadius: 6, cursor: uploading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}
        >
          {uploading ? "Uploading..." : "📁 Upload"}
        </button>
        <input ref={inputRef} type="file" accept={accept} onChange={handleFile} style={{ display: "none" }} />
      </div>
      {/* Preview */}
      {value && accept === "image/*" && (
        <img
          src={value}
          alt="preview"
          style={{ height: 80, width: "auto", objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb", marginTop: 4 }}
          onError={e => (e.currentTarget.style.display = "none")}
        />
      )}
    </div>
  );
}

interface MultiProps {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
  accept?: string;
}

export function MultiUpload({ label, values, onChange, accept = "image/*" }: MultiProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadToCloudinary));
      onChange([...values, ...urls]);
    } catch {
      alert("Upload failed. Check your Cloudinary config.");
    }
    setUploading(false);
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const removeItem = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, val: string) => {
    const updated = [...values];
    updated[index] = val;
    onChange(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "capitalize" }}>
        {label}
      </label>

      {/* Existing items */}
      {values.map((val, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={val}
            onChange={e => updateItem(i, e.target.value)}
            style={{ flex: 1, padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, color: "#111827", background: "white" }}
          />
          {accept === "image/*" && val && (
            <img
              src={val}
              alt=""
              style={{ height: 36, width: 36, objectFit: "cover", borderRadius: 4, border: "1px solid #e5e7eb", flexShrink: 0 }}
              onError={e => (e.currentTarget.style.display = "none")}
            />
          )}
          <button
            type="button"
            onClick={() => removeItem(i)}
            style={{ padding: "9px 10px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
          >
            ✕
          </button>
        </div>
      ))}

      {/* Add new */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{ padding: "9px 14px", background: uploading ? "#e5e7eb" : "#6366f1", color: uploading ? "#9ca3af" : "white", border: "none", borderRadius: 6, cursor: uploading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500 }}
        >
          {uploading ? "Uploading..." : `📁 Upload ${accept === "image/*" ? "Images" : "Videos"}`}
        </button>
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          style={{ padding: "9px 14px", background: "white", color: "#374151", border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
        >
          + Add URL manually
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={accept === "image/*"}
          onChange={handleFile}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
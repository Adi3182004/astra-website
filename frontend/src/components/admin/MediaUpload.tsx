import { useRef, useState } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon, Video, RefreshCw, ExternalLink, Layers } from "lucide-react";
import { toast } from "sonner";
import { uploadMedia, isVideoUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (url: string) => void;
  onMultipleUpload?: (urls: string[]) => void;
  label?: string;
  /** what can be uploaded */
  accept?: "image" | "video" | "both";
  folder?: string;
  className?: string;
  hint?: string;
  defaultName?: string;
  multiple?: boolean;
};

export function MediaUpload({
  value,
  onChange,
  onMultipleUpload,
  label,
  accept = "both",
  folder = "uploads",
  className,
  hint,
  defaultName = "",
  multiple = false,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; filename?: string } | null>(null);
  const [over, setOver] = useState(false);
  const [assetName, setAssetName] = useState(defaultName);
  const fileRef = useRef<HTMLInputElement>(null);

  const isMultipleAllowed = multiple || !!onMultipleUpload;
  const acceptAttr = accept === "image" ? "image/*" : accept === "video" ? "video/*" : "image/*,video/*";

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);

    // Validate file types and sizes
    for (const file of fileArray) {
      if (accept === "image" && !file.type.startsWith("image/")) {
        return toast.error(`"${file.name}" is not an image file`);
      }
      if (accept === "video" && !file.type.startsWith("video/")) {
        return toast.error(`"${file.name}" is not a video file`);
      }
      if (file.size > 50 * 1024 * 1024) {
        return toast.error(`"${file.name}" exceeds the 50MB limit`);
      }
    }

    setBusy(true);
    setUploadProgress({ current: 0, total: fileArray.length });

    try {
      const uploadedUrls: string[] = [];
      const baseCustomName = assetName.trim();

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const customFileName = baseCustomName
          ? fileArray.length > 1
            ? `${baseCustomName}-${i + 1}`
            : baseCustomName
          : undefined;

        setUploadProgress({ current: i + 1, total: fileArray.length, filename: file.name });
        const url = await uploadMedia(file, folder, customFileName);
        uploadedUrls.push(url);
      }

      if (uploadedUrls.length > 0) {
        if (onMultipleUpload) {
          onMultipleUpload(uploadedUrls);
        } else {
          onChange(uploadedUrls[0]);
        }

        if (uploadedUrls.length === 1) {
          toast.success("File uploaded successfully");
        } else {
          toast.success(`Successfully uploaded ${uploadedUrls.length} media assets in sequence`);
        }
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      setUploadProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium flex items-center gap-1.5">
            {label}
            {isMultipleAllowed && (
              <span className="text-[10px] text-accent font-normal lowercase tracking-normal bg-accent/10 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <Layers size={10} /> multi-select enabled
              </span>
            )}
          </label>
        )}
        {hint && <span className="text-[10px] text-muted-foreground/70">{hint}</span>}
      </div>

      {/* Optional Custom Asset File Name */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={assetName}
          onChange={(e) => setAssetName(e.target.value)}
          placeholder={isMultipleAllowed ? "Custom prefix (e.g. emerald-ring)..." : "Custom asset name (e.g. emerald-ring-main)..."}
          className="flex-1 bg-secondary/50 rounded-xl px-3 py-1.5 text-xs outline-none border border-border/40 focus:border-accent font-mono"
        />
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">📁 /{folder}/</span>
      </div>

      {/* URL Input */}
      <div className="relative">
        <input
          className="w-full bg-secondary/60 rounded-xl px-3.5 py-2 text-xs outline-none border border-border/40 focus:border-accent"
          placeholder={accept === "video" ? "Paste video URL (.mp4)" : "Paste URL (https://…)"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            title="Clear URL"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileRef.current?.click()}
        className={cn(
          "cursor-pointer rounded-xl border border-dashed px-4 py-4 text-center text-xs transition-all select-none",
          over ? "border-accent bg-accent/10 shadow-xs" : "border-border/80 text-muted-foreground hover:bg-secondary/40 hover:border-accent/40"
        )}
      >
        {busy ? (
          <div className="flex flex-col items-center justify-center gap-1.5 text-accent font-medium">
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              {uploadProgress
                ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}...`
                : "Uploading to cloud storage…"}
            </span>
            {uploadProgress?.filename && (
              <span className="text-[10px] text-muted-foreground truncate max-w-xs font-mono">
                {uploadProgress.filename}
              </span>
            )}
          </div>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <UploadCloud size={16} className="text-accent" />
            <span>
              Drop {isMultipleAllowed ? "multiple files" : accept === "video" ? "a video" : accept === "image" ? "an image" : "an image or video"} here, or click to browse
              {isMultipleAllowed && <span className="font-semibold text-accent ml-1">(multi-select)</span>}
            </span>
          </span>
        )}
        <input
          ref={fileRef}
          type="file"
          accept={acceptAttr}
          multiple={isMultipleAllowed}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Structured Preview Box */}
      {value && (
        <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border/60 bg-secondary/30 shadow-sm mt-2">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0 border border-border/60 flex items-center justify-center">
            {isVideoUrl(value) ? (
              <video src={value} className="w-full h-full object-cover" muted playsInline />
            ) : (
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            )}
            <span className="absolute bottom-1 right-1 bg-background/80 text-[8px] px-1 py-0.5 rounded font-mono uppercase">
              {isVideoUrl(value) ? "Video" : "Image"}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{value.split("/").pop() || "Media file"}</p>
            <p className="text-[10px] text-muted-foreground truncate">{value}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-accent hover:underline"
              >
                <span>View Full</span>
                <ExternalLink size={10} />
              </a>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
              >
                <RefreshCw size={10} />
                <span>Replace</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange("")}
            className="p-1.5 rounded-lg text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            title="Remove media"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}


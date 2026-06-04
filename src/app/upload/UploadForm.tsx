"use client";

import { useState, useRef } from "react";
import DashboardShell from "@/components/DashboardShell";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { uploadResume } from "@/app/actions/upload";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF or DOCX file.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB.");
      return;
    }

    setFile(selectedFile);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      await uploadResume(formData);
      // Success will redirect via server action
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setIsUploading(false);
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-2xl mx-auto space-y-10 py-10">
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Upload your resume
          </h1>
          <p className="text-base md:text-lg text-slate-500 font-medium px-4">
            Start by uploading your base resume in PDF or DOCX format.
          </p>
        </header>

        <div className="space-y-6 px-4 md:px-0">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "resumeii-card p-8 md:p-12 border-2 border-dashed flex flex-col items-center justify-center text-center space-y-6 cursor-pointer transition-all duration-300 group",
              isDragging 
                ? "border-emerald-500 bg-emerald-50/50 scale-[1.02]" 
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx"
              className="hidden"
            />
            
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500",
              file ? "bg-emerald-100 scale-110 rotate-3" : "bg-slate-100 group-hover:scale-110 group-hover:-rotate-3"
            )}>
              {file ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              ) : (
                <Upload className="w-10 h-10 text-slate-400 group-hover:text-slate-600" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">
                {file ? file.name : "Click or drag your file here"}
              </h3>
              <p className="text-sm font-medium text-slate-500">
                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF, DOCX up to 5MB"}
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {file && (
            <div className="flex flex-col gap-4">
               <button
                  disabled={isUploading}
                  onClick={handleUpload}
                  className="resumeii-button w-full py-4 text-base flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      Confirm and Continue
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
                <button
                  disabled={isUploading}
                  onClick={() => setFile(null)}
                  className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
                >
                  Cancel and choose another
                </button>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

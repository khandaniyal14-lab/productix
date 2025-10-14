import React, { useState } from "react";
import api from "../../services/api"; 
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, Loader, File, FileText } from 'lucide-react';

const ExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setError("");
      } else {
        setError("Please select a valid Excel file (.xlsx or .xls)");
        setFile(null);
      }
    }
  };

const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first!");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("file", file);

      await api.post("/api/v1/uploads/excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Excel file uploaded successfully!");
      setFile(null);
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.response?.data?.message || "Failed to upload file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/v1/uploads/template", { responseType: "blob" });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "productix_template.xlsx");
      document.body.appendChild(link);
      link.click();

      link.remove();
      setSuccess("Template downloaded successfully!");
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      console.error("Download error:", error);
      setError("Failed to download template.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 rounded-lg text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center gap-3">
            <FileSpreadsheet className="w-10 h-10 text-purple-400" />
            Data & Excel Upload
          </h1>
          <p className="text-white/40 text-sm">Upload your Excel data for processing or download the required template.</p>
        </div>

        {/* Main Upload Card */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">File Action</h2>
          
          {/* File Input Section */}
          <div className="mb-8">
              
            <div className="relative">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
                disabled={loading}
              />
              
              <label
                htmlFor="file-input"
                className="flex flex-col items-center justify-center w-full p-10 border-2 border-dashed border-white/20 rounded-2xl hover:border-purple-500/50 hover:bg-white/5 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="p-4 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors duration-300 mb-4">
                    <Upload className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-white font-semibold text-xl mb-1">
                    {file ? file.name : "Choose or drag your Excel file"}
                  </p>
                  <p className="text-white/40 text-sm">
                    Supported formats: .xlsx, .xls
                  </p>
                </div>
              </label>

              {file && (
                <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
                  <File className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="text-purple-400 font-medium text-sm">{file.name}</p>
                    <p className="text-purple-400/60 text-xs">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              )}
          </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-300">
              <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-300">
              <CheckCircle className="text-emerald-400 flex-shrink-0" size={20} />
              <span className="text-emerald-400 text-sm">{success}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="w-full px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload File
                </>
              )}
            </button>

            <button
              onClick={handleDownloadTemplate}
              disabled={loading}
              className="w-full px-8 py-3 bg-white/10 border border-white/10 rounded-xl font-semibold text-white hover:bg-white/15 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Template
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {/* Template Info */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-medium text-white/60">Template Guide</h3>
            </div>
            <p className="text-lg font-bold text-white mb-2">Required Structure</p>
            <p className="text-white/40 text-sm leading-relaxed">
              Download our template to ensure your data matches the system's required column names and format. Incorrect structure may cause errors.
            </p>
          </div>

          {/* Supported Formats */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-medium text-white/60">File Compatibility</h3>
            </div>
            <p className="text-lg font-bold text-white mb-2">Supported Formats</p>
            <ul className="space-y-1">
              <li className="text-white/60 text-sm">
                <span className="text-emerald-400 font-bold">✓</span> Excel 2007+ (.xlsx)
              </li>
              <li className="text-white/60 text-sm">
                <span className="text-emerald-400 font-bold">✓</span> Excel 97-2003 (.xls)
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.1); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 10s ease-in-out infinite; }
        .animate-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};


export default ExcelUpload;
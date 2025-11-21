import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Link as LinkIcon, Type, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function CaptureInput({ onCapture }) {
  const [activeTab, setActiveTab] = useState("text");
  const [textContent, setTextContent] = useState("");
  const [urlContent, setUrlContent] = useState("");
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      let captureData = {
        content_type: activeTab,
        raw_content: "",
        status: "processing"
      };

      // Handle different input types
      if (activeTab === "text") {
        if (!textContent.trim()) {
          alert("Please enter some content");
          setIsProcessing(false);
          return;
        }
        captureData.raw_content = textContent;
        captureData.extracted_text = textContent;
      } 
      else if (activeTab === "url") {
        if (!urlContent.trim()) {
          alert("Please enter a URL");
          setIsProcessing(false);
          return;
        }
        captureData.raw_content = urlContent;
        captureData.extracted_text = "Processing URL...";
      }
      else if (activeTab === "file") {
        if (!file) {
          alert("Please select a file");
          setIsProcessing(false);
          return;
        }
        
        // Upload file first
        const uploadResult = await base44.integrations.Core.UploadFile({ file });
        captureData.file_url = uploadResult.file_url;
        captureData.raw_content = `File uploaded: ${file.name}`;
        captureData.extracted_text = "Processing file...";
      }

      // Create initial capture record
      const capture = await base44.entities.Capture.create(captureData);
      
      // Notify parent and trigger AI processing
      onCapture(capture);
      
      // Reset form
      setTextContent("");
      setUrlContent("");
      setFile(null);
      
    } catch (error) {
      console.error("Capture failed:", error);
      alert("Failed to capture content. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              URL
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              File
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <Textarea
              placeholder="Capture anything... thoughts, tasks, ideas, reflections..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="min-h-[200px] text-base"
            />
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <Input
              type="url"
              placeholder="https://example.com or YouTube link..."
              value={urlContent}
              onChange={(e) => setUrlContent(e.target.value)}
              className="text-base"
            />
            <p className="text-sm text-gray-500">
              Paste any URL: articles, YouTube videos, tweets, etc.
            </p>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
                accept="image/*,.pdf,.txt,.doc,.docx"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Images, PDFs, documents
                </p>
              </label>
            </div>
          </TabsContent>
        </Tabs>

        <Button 
          onClick={handleCapture} 
          disabled={isProcessing}
          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Capture"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
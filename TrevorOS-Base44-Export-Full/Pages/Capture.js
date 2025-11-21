import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CaptureInput from "../components/capture/CaptureInput";
import AIClassification from "../components/capture/AIClassification";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Zap, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function CapturePage() {
  const [currentCapture, setCurrentCapture] = useState(null);
  const queryClient = useQueryClient();

  // Process capture with AI
  const processCaptureWithAI = async (capture) => {
    try {
      // Extract content based on type
      let contentToAnalyze = capture.extracted_text;
      
      if (capture.content_type === "url") {
        // Fetch URL content
        try {
          const urlData = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(capture.raw_content)}`);
          const urlJson = await urlData.json();
          contentToAnalyze = urlJson.contents || capture.raw_content;
        } catch (e) {
          contentToAnalyze = capture.raw_content;
        }
      } else if (capture.content_type === "file" && capture.file_url) {
        // For images/PDFs, attempt OCR/extraction
        if (capture.file_url.match(/\.(jpg|jpeg|png|gif|pdf)$/i)) {
          try {
            const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
              file_url: capture.file_url,
              json_schema: {
                type: "object",
                properties: {
                  text_content: { type: "string" }
                }
              }
            });
            if (extractResult.status === "success" && extractResult.output?.text_content) {
              contentToAnalyze = extractResult.output.text_content;
            }
          } catch (e) {
            console.log("OCR failed, using filename");
          }
        }
      }

      // AI Classification
      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are TrevorOS v2's AI routing engine. Analyze this captured content and classify it.

CONTENT:
${contentToAnalyze}

Your job:
1. Classify the content type (Task, Project, Resource, Idea, Reflection, Meeting, Transcript, Journal, Reference, PKM, or Inbox if unclear)
2. Generate a concise summary (1-2 sentences)
3. Extract 3-5 key points as bullet items
4. Suggest 3-5 relevant tags
5. Recommend routing destination (AM_PM_Log, Work_Log, Personal_Log, EDGE_Coach_Log, PKM_Note, Task_List, or Inbox)
6. Assess confidence (0-100)

Classification types:
- Task: actionable items, todos
- Project: multi-step initiatives
- Resource: articles, tools, references
- Idea: creative concepts, brainstorms
- Reflection: personal insights, feelings
- Meeting: meeting notes, discussions
- Transcript: video/audio transcripts
- Journal: diary-like entries
- Reference: factual information
- PKM: evergreen knowledge
- Inbox: unclear/needs review

Routing destinations:
- AM_PM_Log: daily check-ins
- Work_Log: work-related activities
- Personal_Log: personal matters
- EDGE_Coach_Log: coaching/growth
- PKM_Note: knowledge worth keeping
- Task_List: immediate actions
- Inbox: needs manual review

Be direct and structured. Output clean JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            classification: {
              type: "string",
              enum: ["Task", "Project", "Resource", "Idea", "Reflection", "Meeting", "Transcript", "Journal", "Reference", "PKM", "Inbox"]
            },
            summary: { type: "string" },
            key_points: {
              type: "array",
              items: { type: "string" }
            },
            tags: {
              type: "array",
              items: { type: "string" }
            },
            suggested_route: {
              type: "string",
              enum: ["AM_PM_Log", "Work_Log", "Personal_Log", "EDGE_Coach_Log", "PKM_Note", "Task_List", "Inbox"]
            },
            confidence_score: { type: "number" }
          }
        }
      });

      // Update capture with AI results
      const updatedCapture = await base44.entities.Capture.update(capture.id, {
        extracted_text: contentToAnalyze,
        ai_classification: aiResult.classification,
        ai_summary: aiResult.summary,
        ai_key_points: aiResult.key_points,
        ai_tags: aiResult.tags,
        suggested_route: aiResult.suggested_route,
        confidence_score: aiResult.confidence_score,
        status: "classified"
      });

      return updatedCapture;
    } catch (error) {
      console.error("AI processing failed:", error);
      // Mark as failed but keep in inbox
      await base44.entities.Capture.update(capture.id, {
        status: "classified",
        ai_classification: "Inbox",
        suggested_route: "Inbox",
        ai_summary: "AI processing failed - please review manually"
      });
      throw error;
    }
  };

  const handleCapture = async (capture) => {
    setCurrentCapture(capture);
    toast.success("Capture received! AI is analyzing...");
    
    try {
      const processedCapture = await processCaptureWithAI(capture);
      setCurrentCapture(processedCapture);
      toast.success("AI classification complete!");
    } catch (error) {
      toast.error("AI processing failed - saved to Inbox for review");
    }
  };

  const handleRoute = async (capture, destination, confirmed) => {
    try {
      // Update capture status
      await base44.entities.Capture.update(capture.id, {
        status: "routed",
        suggested_route: destination
      });

      // Route to appropriate destination
      if (destination === "Task_List" || capture.ai_classification === "Task") {
        // Extract tasks and create them
        const taskTitles = capture.ai_key_points || [capture.ai_summary];
        for (const title of taskTitles) {
          await base44.entities.Task.create({
            title: title,
            description: capture.ai_summary,
            tags: capture.ai_tags,
            source_capture_id: capture.id,
            status: "todo"
          });
        }
        toast.success("Tasks created!");
      } else if (destination === "PKM_Note") {
        // Create PKM note
        await base44.entities.Note.create({
          title: capture.ai_summary?.substring(0, 100) || "Untitled Note",
          content: `${capture.extracted_text}\n\n## Key Points\n${capture.ai_key_points?.map(p => `- ${p}`).join('\n') || ''}`,
          tags: capture.ai_tags,
          source_capture_id: capture.id,
          note_type: "fleeting"
        });
        toast.success("PKM note created!");
      } else if (destination.includes("Log")) {
        // Create log entry
        await base44.entities.Log.create({
          date: new Date().toISOString().split('T')[0],
          log_type: destination.replace("_Log", "").replace("AM_PM", "AM_PM"),
          work_summary: capture.ai_summary,
          insights: capture.ai_key_points,
          markdown_content: capture.extracted_text
        });
        toast.success("Log entry created!");
      }

      // Reset for next capture
      setCurrentCapture(null);
      toast.success(`Routed to ${destination.replace(/_/g, ' ')}!`);
    } catch (error) {
      console.error("Routing failed:", error);
      toast.error("Failed to route capture");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Brain className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Quick Capture</h1>
          </div>
          <p className="text-gray-600 text-lg">
            AI-powered routing • Zero friction • Just capture
          </p>
        </div>

        {/* How it works */}
        {!currentCapture && (
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                    <Zap className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold">1. Capture</h3>
                  <p className="text-sm text-gray-600">Text, URLs, or files</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">2. AI Analyzes</h3>
                  <p className="text-sm text-gray-600">Classifies & routes</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold">3. Confirm</h3>
                  <p className="text-sm text-gray-600">Review & save</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Capture Input */}
        {!currentCapture && (
          <CaptureInput onCapture={handleCapture} />
        )}

        {/* AI Classification Results */}
        {currentCapture && (
          <AIClassification 
            capture={currentCapture} 
            onRoute={handleRoute}
          />
        )}

      </div>
    </div>
  );
}
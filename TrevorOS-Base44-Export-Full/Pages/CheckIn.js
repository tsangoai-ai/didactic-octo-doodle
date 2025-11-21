import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sunrise, Sunset, Loader2, Sparkles } from "lucide-react";
import CheckInDraft from "../components/checkin/CheckInDraft";
import CheckInHistory from "../components/checkin/CheckInHistory";
import { toast } from "sonner";

export default function CheckInPage() {
  const [session, setSession] = useState(getCurrentSession());
  const [draft, setDraft] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  function getCurrentSession() {
    const hour = new Date().getHours();
    return hour < 12 ? 'AM' : 'PM';
  }

  // Fetch recent data for AI analysis
  const { data: recentTasks = [] } = useQuery({
    queryKey: ['recent-tasks'],
    queryFn: () => base44.entities.Task.list('-updated_date', 20)
  });

  const { data: recentCaptures = [] } = useQuery({
    queryKey: ['recent-captures'],
    queryFn: () => base44.entities.Capture.list('-created_date', 10)
  });

  const { data: recentNotes = [] } = useQuery({
    queryKey: ['recent-notes'],
    queryFn: () => base44.entities.Note.list('-created_date', 5)
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['logs'],
    queryFn: () => base44.entities.Log.list('-created_date', 10)
  });

  const { data: todaysLog } = useQuery({
    queryKey: ['todays-log', session],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const logs = await base44.entities.Log.filter({ 
        date: today, 
        session: session 
      }, '-created_date', 1);
      return logs[0] || null;
    }
  });

  const generateCheckInDraft = async () => {
    setIsGenerating(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Prepare context for AI
      const tasksCompleted = recentTasks.filter(t => t.status === 'done' && 
        new Date(t.updated_date).toDateString() === new Date().toDateString()
      );
      
      const tasksPending = recentTasks.filter(t => 
        t.status === 'todo' || t.status === 'in_progress'
      ).slice(0, 10);

      const recentCapturesSummary = recentCaptures
        .filter(c => new Date(c.created_date).toDateString() === new Date().toDateString())
        .map(c => c.ai_summary || c.raw_content?.substring(0, 100))
        .filter(Boolean);

      // Get last log for context
      const lastLog = logs[0];

      const aiPrompt = session === 'AM' 
        ? `You are TrevorOS v2. Generate an AM check-in for Trevor.

TODAY'S DATE: ${today}

CONTEXT:
- Pending tasks: ${tasksPending.length}
  ${tasksPending.slice(0, 5).map(t => `  • ${t.title}`).join('\n')}

- Yesterday's PM summary: ${lastLog?.session === 'PM' ? lastLog.work_summary : 'Not available'}

- Recent captures today: ${recentCapturesSummary.length}
  ${recentCapturesSummary.slice(0, 3).join('\n  ')}

Generate an AM check-in that:
1. Suggests how Trevor might be feeling (energized, focused, etc.)
2. Recommends a primary focus for today based on pending tasks
3. Creates a brief work summary/plan for the day
4. Lists 3-5 key tasks to tackle today (prioritize by urgency/importance)
5. Provides 1-2 coaching insights (EDGE model: Explore, Develop, Grow, Execute)

Be direct, actionable, and motivating. Trevor values clarity over fluff.`
        : `You are TrevorOS v2. Generate a PM check-in for Trevor.

TODAY'S DATE: ${today}

CONTEXT:
- Tasks completed today: ${tasksCompleted.length}
  ${tasksCompleted.map(t => `  • ${t.title}`).join('\n')}

- Tasks still pending: ${tasksPending.length}
  ${tasksPending.slice(0, 5).map(t => `  • ${t.title}`).join('\n')}

- Today's AM summary: ${lastLog?.session === 'AM' ? lastLog.work_summary : 'Not available'}

- Captures today: ${recentCapturesSummary.length}
  ${recentCapturesSummary.join('\n  ')}

Generate a PM check-in that:
1. Reflects on Trevor's current state (tired, satisfied, overwhelmed, etc.)
2. Identifies what the primary focus was today
3. Summarizes what was accomplished vs. planned
4. Lists any critical carryover tasks for tomorrow
5. Provides 1-2 reflective insights (what went well, what to improve)

Be honest, reflective, and constructive. Help Trevor close the day with clarity.`;

      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt: aiPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            user_feeling: { type: "string" },
            focus_area: { type: "string" },
            work_summary: { type: "string" },
            tasks: {
              type: "array",
              items: { type: "string" }
            },
            insights: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      const generatedDraft = {
        date: today,
        session: session,
        user_feeling: aiResult.user_feeling,
        focus_area: aiResult.focus_area,
        work_summary: aiResult.work_summary,
        tasks: aiResult.tasks || [],
        insights: aiResult.insights || []
      };

      setDraft(generatedDraft);
      toast.success(`${session} check-in draft generated!`);
    } catch (error) {
      console.error("Failed to generate check-in:", error);
      toast.error("Failed to generate check-in. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveCheckIn = async (finalDraft) => {
    try {
      // Generate markdown content
      const markdownContent = `---
🗓️ Date: ${finalDraft.date}
${finalDraft.session === 'AM' ? '🌅' : '🌆'} Session: ${finalDraft.session}
💭 Feeling: ${finalDraft.user_feeling || 'N/A'}
🎯 Focus: ${finalDraft.focus_area || 'N/A'}

📝 Summary:
${finalDraft.work_summary}

✅ Tasks:
${finalDraft.tasks?.map(t => `- ${t}`).join('\n') || '- None listed'}

${finalDraft.insights && finalDraft.insights.length > 0 ? `
💡 Insights:
${finalDraft.insights.map(i => `- ${i}`).join('\n')}
` : ''}
---`;

      // Save to database
      await base44.entities.Log.create({
        date: finalDraft.date,
        session: finalDraft.session,
        log_type: 'AM_PM',
        user_feeling: finalDraft.user_feeling,
        focus_area: finalDraft.focus_area,
        work_summary: finalDraft.work_summary,
        tasks: finalDraft.tasks,
        insights: finalDraft.insights,
        markdown_content: markdownContent
      });

      toast.success(`${finalDraft.session} check-in saved!`);
      
      // Reset and refresh
      setDraft(null);
      queryClient.invalidateQueries(['logs']);
      queryClient.invalidateQueries(['todays-log']);
      
    } catch (error) {
      console.error("Failed to save check-in:", error);
      toast.error("Failed to save check-in.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            {session === 'AM' ? (
              <Sunrise className="w-10 h-10 text-amber-600" />
            ) : (
              <Sunset className="w-10 h-10 text-indigo-600" />
            )}
            <h1 className="text-4xl font-bold text-gray-900">
              {session} Check-In
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            AI-powered daily logging • Automated drafts • Zero friction
          </p>
        </div>

        {/* Session Toggle */}
        <div className="flex justify-center">
          <Tabs value={session} onValueChange={setSession}>
            <TabsList className="grid w-64 grid-cols-2">
              <TabsTrigger value="AM" className="flex items-center gap-2">
                <Sunrise className="w-4 h-4" />
                Morning
              </TabsTrigger>
              <TabsTrigger value="PM" className="flex items-center gap-2">
                <Sunset className="w-4 h-4" />
                Evening
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

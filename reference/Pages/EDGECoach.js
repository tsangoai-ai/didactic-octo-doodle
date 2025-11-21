import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Loader2, Sparkles, Target, TrendingUp, Eye, Zap } from "lucide-react";
import CoachingInsight from "../components/edge/CoachingInsight";
import { toast } from "sonner";

export default function EDGECoachPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [insights, setInsights] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch all data for analysis
  const { data: logs = [] } = useQuery({
    queryKey: ['all-logs'],
    queryFn: () => base44.entities.Log.list('-created_date', 50)
  });

  const { data: captures = [] } = useQuery({
    queryKey: ['all-captures'],
    queryFn: () => base44.entities.Capture.filter({ 
      ai_classification: { $in: ['Reflection', 'Journal', 'Idea'] }
    }, '-created_date', 50)
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['all-notes'],
    queryFn: () => base44.entities.Note.list('-created_date', 50)
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: () => base44.entities.Task.list('-updated_date', 100)
  });

  const runEDGEAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Prepare data for AI analysis
      const logsSummary = logs.slice(0, 20).map(log => ({
        date: log.date,
        session: log.session,
        feeling: log.user_feeling,
        focus: log.focus_area,
        summary: log.work_summary,
        insights: log.insights
      }));

      const reflectionCaptures = captures.slice(0, 15).map(c => ({
        type: c.ai_classification,
        summary: c.ai_summary,
        content: c.extracted_text?.substring(0, 500),
        tags: c.ai_tags
      }));

      const notesSummary = notes.slice(0, 15).map(n => ({
        title: n.title,
        type: n.note_type,
        essence: n.essence,
        tags: n.tags
      }));

      const taskPatterns = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'done').length,
        blocked: tasks.filter(t => t.status === 'blocked').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        by_category: tasks.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + 1;
          return acc;
        }, {})
      };

      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Trevor's EDGE Coach (Explore, Develop, Grow, Execute). Analyze his Second Brain data to identify patterns, strengths, blind spots, and growth opportunities.

**EDGE FRAMEWORK:**
- **Explore**: Discovery, curiosity, new ideas, experimentation
- **Develop**: Skill-building, learning, refining processes
- **Grow**: Self-awareness, mindset shifts, personal evolution
- **Execute**: Action, delivery, results, consistency

**TREVOR'S DATA:**

Recent Logs (${logs.length}):
${JSON.stringify(logsSummary, null, 2)}

Reflections/Ideas (${captures.length}):
${JSON.stringify(reflectionCaptures, null, 2)}

PKM Notes (${notes.length}):
${JSON.stringify(notesSummary, null, 2)}

Task Patterns:
${JSON.stringify(taskPatterns, null, 2)}

**YOUR JOB:**
Generate 4-6 coaching insights. Each insight should:

1. **Identify patterns** across the data (recurring themes, behaviors, focus areas)
2. **Surface blind spots** (what Trevor might be missing or avoiding)
3. **Highlight strengths** (what's working well)
4. **Suggest actions** (concrete next steps)

For each insight:
- Assign to ONE EDGE category (Explore/Develop/Grow/Execute)
- Choose type: "pattern", "blind_spot", "strength", or "action"
- Write 2-3 sentences in **direct, clear markdown** (use bold for emphasis)
- Add 2-3 coaching questions to provoke reflection
- Suggest 1-3 actionable next steps

Be honest, specific, and constructive. Reference actual data points. Challenge gently but clearly. No fluff.`,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  edge_category: { 
                    type: "string",
                    enum: ["Explore", "Develop", "Grow", "Execute"]
                  },
                  type: {
                    type: "string",
                    enum: ["pattern", "blind_spot", "strength", "action"]
                  },
                  content: { type: "string" },
                  coaching_questions: {
                    type: "array",
                    items: { type: "string" }
                  },
                  action_items: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            }
          }
        }
      });

      setInsights(aiResult.insights || []);

      // Save insights to database
      const today = new Date().toISOString().split('T')[0];
      for (const insight of aiResult.insights || []) {
        await base44.entities.EdgeInsight.create({
          ...insight,
          analysis_date: today
        });
      }

      toast.success("EDGE analysis complete!");
      } catch (error) {
      console.error("EDGE analysis failed:", error);
      toast.error("Analysis failed. Please try again.");
      } finally {
      setIsAnalyzing(false);
      }
      };

  const filteredInsights = activeFilter === 'all' 
    ? insights 
    : insights.filter(i => i.edge_category === activeFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Brain className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">EDGE Coach</h1>
          </div>
          <p className="text-gray-600 text-lg">
            AI-powered pattern recognition • Growth insights • Blind spot detection
          </p>
        </div>

        {/* EDGE Framework Explainer */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Explore</h3>
                <p className="text-xs text-gray-600 mt-1">Curiosity, discovery, new ideas</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Develop</h3>
                <p className="text-xs text-gray-600 mt-1">Skills, learning, refinement</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Grow</h3>
                <p className="text-xs text-gray-600 mt-1">Mindset, awareness, evolution</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold">Execute</h3>
                <p className="text-xs text-gray-600 mt-1">Action, delivery, results</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Trigger */}
        {insights.length === 0 && (
          <Card className="border-2 border-indigo-200">
            <CardContent className="pt-6 text-center space-y-4">
              <Brain className="w-16 h-16 text-indigo-600 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Ready for deep analysis?</h3>
                <p className="text-gray-600">
                  AI will analyze {logs.length} logs, {captures.length} reflections, {notes.length} notes, and {tasks.length} tasks
                </p>
              </div>
              <Button
                onClick={runEDGEAnalysis}
                disabled={isAnalyzing}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing patterns...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Run EDGE Analysis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Insights Display */}
        {insights.length > 0 && (
          <>
            {/* Filters */}
            <div className="flex justify-between items-center">
              <Tabs value={activeFilter} onValueChange={setActiveFilter}>
                <TabsList>
                  <TabsTrigger value="all">All Insights</TabsTrigger>
                  <TabsTrigger value="Explore">Explore</TabsTrigger>
                  <TabsTrigger value="Develop">Develop</TabsTrigger>
                  <TabsTrigger value="Grow">Grow</TabsTrigger>
                  <TabsTrigger value="Execute">Execute</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                onClick={runEDGEAnalysis}
                disabled={isAnalyzing}
                variant="outline"
                size="sm"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Re-analyze
              </Button>
            </div>

            {/* Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredInsights.map((insight, idx) => (
                <CoachingInsight key={idx} insight={insight} />
              ))}
            </div>

            {filteredInsights.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No insights in this category</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

      </div>
    </div>
  );
}
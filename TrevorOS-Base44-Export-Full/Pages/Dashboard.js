import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Zap, CheckSquare, BookOpen, Inbox, Calendar, TrendingUp, Sunrise, Target } from "lucide-react";
import ActivityTrendsChart from "../components/dashboard/ActivityTrendsChart";
import ThemeSummary from "../components/dashboard/ThemeSummary";
import TaskOverview from "../components/dashboard/TaskOverview";
import EdgeInsightsFeed from "../components/dashboard/EdgeInsightsFeed";
import TaskDependencyGraph from "../components/dashboard/TaskDependencyGraph";

export default function Dashboard() {
  const { data: captures = [] } = useQuery({
    queryKey: ['captures'],
    queryFn: () => base44.entities.Capture.list('-created_date', 100)
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: () => base44.entities.Task.list('-created_date', 200)
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['notes'],
    queryFn: () => base44.entities.Note.list('-created_date', 50)
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['logs'],
    queryFn: () => base44.entities.Log.list('-created_date', 100)
  });

  const { data: edgeInsights = [] } = useQuery({
    queryKey: ['edge-insights'],
    queryFn: () => base44.entities.EdgeInsight.list('-created_date', 20)
  });

  const pendingCaptures = captures.filter(c => c.status === 'pending' || c.status === 'classified');
  const todoTasks = allTasks.filter(t => t.status === 'todo');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">TrevorOS v2</h1>
          <p className="text-gray-600 text-lg">Your AI-powered Second Brain</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to={createPageUrl('CheckIn')}>
            <Card className="cursor-pointer hover:shadow-lg transition-all border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center mx-auto">
                  <Sunrise className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg">AM/PM Check-In</h3>
                <p className="text-sm text-gray-600">AI-generated logs</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('Capture')}>
            <Card className="cursor-pointer hover:shadow-lg transition-all border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg">Quick Capture</h3>
                <p className="text-sm text-gray-600">AI routing enabled</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('Inbox')}>
            <Card className="cursor-pointer hover:shadow-lg transition-all border-2">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <Inbox className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-bold text-lg">Inbox</h3>
                <p className="text-sm text-gray-600">{pendingCaptures.length} pending</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('Tasks')}>
            <Card className="cursor-pointer hover:shadow-lg transition-all border-2">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckSquare className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg">Tasks</h3>
                <p className="text-sm text-gray-600">{todoTasks.length} active</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={createPageUrl('Notes')}>
            <Card className="cursor-pointer hover:shadow-lg transition-all border-2">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-lg">PKM Notes</h3>
                <p className="text-sm text-gray-600">{notes.length} notes</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('CheckIn')}>
            <Card className="cursor-pointer hover:shadow-lg transition-all border-2 border-amber-200">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-bold text-lg">Log History</h3>
                <p className="text-sm text-gray-600">View all check-ins</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('EDGECoach')}>
            <Card className="cursor-pointer hover:shadow-lg transition-all border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg">EDGE Coach</h3>
                <p className="text-sm text-gray-600">Growth insights</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Analytics Section */}
        <div className="space-y-6">
          <ActivityTrendsChart captures={captures} logs={logs} tasks={allTasks} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TaskOverview tasks={allTasks} />
            <EdgeInsightsFeed insights={edgeInsights} />
          </div>
          
          <TaskDependencyGraph tasks={allTasks} />
          
          <ThemeSummary captures={captures} logs={logs} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Recent Captures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {captures.slice(0, 3).map(capture => (
                  <div key={capture.id} className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-medium truncate">
                      {capture.ai_summary || capture.raw_content?.substring(0, 60)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {capture.ai_classification || 'Processing...'}
                    </p>
                  </div>
                ))}
                {captures.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No captures yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                Today's Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todoTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border-2 border-blue-600 mt-1 flex-shrink-0" />
                    <p className="text-sm">{task.title}</p>
                  </div>
                ))}
                {todoTasks.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No tasks today</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                Recent Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notes.slice(0, 3).map(note => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-medium truncate">{note.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{note.note_type}</p>
                  </div>
                ))}
                {notes.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-4">
              <Brain className="w-12 h-12" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Welcome to TrevorOS v2</h2>
                <p className="text-indigo-100">
                  Your AI-powered Second Brain is ready. Capture anything, AI routes it automatically. Zero friction, maximum clarity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
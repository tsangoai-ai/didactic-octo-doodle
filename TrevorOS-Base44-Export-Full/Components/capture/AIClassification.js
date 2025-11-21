import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ArrowRight, Tag, Lightbulb, Target } from "lucide-react";

const classificationColors = {
  Task: "bg-blue-100 text-blue-800 border-blue-200",
  Project: "bg-purple-100 text-purple-800 border-purple-200",
  Resource: "bg-green-100 text-green-800 border-green-200",
  Idea: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Reflection: "bg-pink-100 text-pink-800 border-pink-200",
  Meeting: "bg-indigo-100 text-indigo-800 border-indigo-200",
  Transcript: "bg-orange-100 text-orange-800 border-orange-200",
  Journal: "bg-rose-100 text-rose-800 border-rose-200",
  Reference: "bg-teal-100 text-teal-800 border-teal-200",
  PKM: "bg-cyan-100 text-cyan-800 border-cyan-200",
  Inbox: "bg-gray-100 text-gray-800 border-gray-200"
};

const routeColors = {
  AM_PM_Log: "bg-amber-50 border-amber-200",
  Work_Log: "bg-blue-50 border-blue-200",
  Personal_Log: "bg-pink-50 border-pink-200",
  EDGE_Coach_Log: "bg-purple-50 border-purple-200",
  PKM_Note: "bg-green-50 border-green-200",
  Task_List: "bg-red-50 border-red-200",
  Inbox: "bg-gray-50 border-gray-200"
};

export default function AIClassification({ capture, onRoute }) {
  if (capture.status === "processing") {
    return (
      <Card className="w-full border-2 border-indigo-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="text-lg text-gray-700">AI analyzing your capture...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (capture.status !== "classified") {
    return null;
  }

  return (
    <Card className="w-full border-2 border-green-200 shadow-lg">
      <CardHeader className="bg-green-50">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <CardTitle className="text-lg">AI Classification Complete</CardTitle>
          {capture.confidence_score && (
            <Badge variant="outline" className="ml-auto">
              {capture.confidence_score}% confidence
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        
        {/* Classification Type */}
        <div>
          <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
            <Target className="w-4 h-4" />
            Content Type
          </label>
          <Badge className={`${classificationColors[capture.ai_classification]} border text-base px-4 py-1`}>
            {capture.ai_classification}
          </Badge>
        </div>

        {/* Summary */}
        {capture.ai_summary && (
          <div>
            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4" />
              Summary
            </label>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border">
              {capture.ai_summary}
            </p>
          </div>
        )}

        {/* Key Points */}
        {capture.ai_key_points && capture.ai_key_points.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-500 mb-2 block">
              Key Points
            </label>
            <ul className="space-y-2">
              {capture.ai_key_points.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {capture.ai_tags && capture.ai_tags.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {capture.ai_tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Route */}
        <div className="border-t pt-6">
          <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-3">
            <ArrowRight className="w-4 h-4" />
            Suggested Destination
          </label>
          <div className={`${routeColors[capture.suggested_route]} border-2 rounded-lg p-4 mb-4`}>
            <p className="font-semibold text-gray-900">
              {capture.suggested_route.replace(/_/g, ' ')}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => onRoute(capture, capture.suggested_route, true)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirm & Route
            </Button>
            <Button 
              onClick={() => onRoute(capture, "Inbox", false)}
              variant="outline"
              className="flex-1"
            >
              Send to Inbox
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, AlertTriangle, Target, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from 'react-markdown';

const edgeColors = {
  Explore: "bg-purple-100 text-purple-800 border-purple-200",
  Develop: "bg-blue-100 text-blue-800 border-blue-200",
  Grow: "bg-green-100 text-green-800 border-green-200",
  Execute: "bg-orange-100 text-orange-800 border-orange-200"
};

const insightTypeIcons = {
  pattern: TrendingUp,
  blind_spot: AlertTriangle,
  strength: Lightbulb,
  action: Target
};

export default function CoachingInsight({ insight }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = insightTypeIcons[insight.type] || Lightbulb;

  return (
    <Card className="hover:shadow-lg transition-all border-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Icon className={`w-5 h-5 ${
                insight.type === 'blind_spot' ? 'text-red-600' : 
                insight.type === 'strength' ? 'text-green-600' :
                insight.type === 'action' ? 'text-orange-600' :
                'text-blue-600'
              }`} />
              <CardTitle className="text-lg">{insight.title}</CardTitle>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge className={edgeColors[insight.edge_category]}>
                {insight.edge_category}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {insight.type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              p: ({children}) => <p className="text-gray-700 leading-relaxed mb-3">{children}</p>,
              ul: ({children}) => <ul className="list-disc list-inside space-y-1 text-gray-700">{children}</ul>,
              strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
              em: ({children}) => <em className="italic text-gray-600">{children}</em>
            }}
          >
            {insight.content}
          </ReactMarkdown>
        </div>

        {insight.coaching_questions && insight.coaching_questions.length > 0 && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-indigo-600 hover:text-indigo-700 p-0 h-auto font-semibold"
            >
              Coaching Questions
              {expanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </Button>
            
            {expanded && (
              <ul className="mt-3 space-y-2 pl-4 border-l-2 border-indigo-200">
                {insight.coaching_questions.map((q, idx) => (
                  <li key={idx} className="text-sm text-gray-700">
                    <span className="text-indigo-600 font-bold">→</span> {q}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {insight.action_items && insight.action_items.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-orange-900 text-sm">Next Steps:</p>
            <ul className="space-y-1">
              {insight.action_items.map((action, idx) => (
                <li key={idx} className="text-sm text-orange-800 flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
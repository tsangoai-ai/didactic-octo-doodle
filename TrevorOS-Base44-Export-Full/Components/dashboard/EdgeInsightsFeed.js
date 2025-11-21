import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Eye, Sparkles, Zap } from 'lucide-react';
import { format } from 'date-fns';

const edgeIcons = {
  Explore: Eye,
  Develop: TrendingUp,
  Grow: Sparkles,
  Execute: Zap
};

const edgeColors = {
  Explore: "bg-purple-100 text-purple-800 border-purple-200",
  Develop: "bg-blue-100 text-blue-800 border-blue-200",
  Grow: "bg-green-100 text-green-800 border-green-200",
  Execute: "bg-orange-100 text-orange-800 border-orange-200"
};

export default function EdgeInsightsFeed({ insights }) {
  const recentInsights = insights.slice(0, 5);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Recent EDGE Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentInsights.map((insight, idx) => {
            const EdgeIcon = edgeIcons[insight.edge_category];
            return (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <EdgeIcon className="w-4 h-4 text-purple-600" />
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {insight.content.replace(/[*#]/g, '').substring(0, 120)}...
                    </p>
                  </div>
                  <Badge className={edgeColors[insight.edge_category]}>
                    {insight.edge_category}
                  </Badge>
                </div>
                {insight.analysis_date && (
                  <p className="text-xs text-gray-400 mt-2">
                    {format(new Date(insight.analysis_date), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            );
          })}
          {recentInsights.length === 0 && (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No insights yet</p>
              <p className="text-xs text-gray-400 mt-1">Run EDGE Coach analysis to generate insights</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
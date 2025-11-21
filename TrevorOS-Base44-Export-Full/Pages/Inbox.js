import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Inbox as InboxIcon, Clock } from "lucide-react";
import { format } from "date-fns";

export default function InboxPage() {
  const { data: captures = [], isLoading } = useQuery({
    queryKey: ['inbox-captures'],
    queryFn: () => base44.entities.Capture.filter(
      { status: { $in: ['pending', 'classified'] } }, 
      '-created_date', 
      50
    )
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
            <p className="text-gray-600">{captures.length} items awaiting review</p>
          </div>
          <InboxIcon className="w-8 h-8 text-yellow-600" />
        </div>

        {/* Capture List */}
        <div className="space-y-4">
          {captures.map(capture => (
            <Card key={capture.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {capture.ai_summary || capture.raw_content?.substring(0, 100)}
                    </CardTitle>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {capture.ai_classification && (
                        <Badge>{capture.ai_classification}</Badge>
                      )}
                      <Badge variant="outline">{capture.content_type}</Badge>
                      {capture.status === 'processing' && (
                        <Badge variant="secondary" className="animate-pulse">Processing...</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(capture.created_date), 'MMM d, HH:mm')}
                  </div>
                </div>
              </CardHeader>
              
              {capture.ai_key_points && capture.ai_key_points.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Key Points:</p>
                    <ul className="space-y-1">
                      {capture.ai_key_points.map((point, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex gap-2">
                          <span>•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {capture.ai_tags && capture.ai_tags.length > 0 && (
                    <div className="mt-4 flex gap-2 flex-wrap">
                      {capture.ai_tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  
                  {capture.suggested_route && (
                    <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Suggested:</span> {capture.suggested_route.replace(/_/g, ' ')}
                        {capture.confidence_score && (
                          <span className="ml-2 text-gray-500">({capture.confidence_score}% confidence)</span>
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
          
          {captures.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <InboxIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Inbox is empty</p>
                <p className="text-sm text-gray-400 mt-2">All captures have been processed</p>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
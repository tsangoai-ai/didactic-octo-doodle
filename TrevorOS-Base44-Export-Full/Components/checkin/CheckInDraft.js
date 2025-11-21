import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Sunrise, Sunset } from "lucide-react";
import { format } from "date-fns";

export default function CheckInHistory({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No check-in history yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Recent Check-Ins</h3>
      {logs.map(log => (
        <Card key={log.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                {log.session === 'AM' ? (
                  <Sunrise className="w-4 h-4 text-amber-600" />
                ) : (
                  <Sunset className="w-4 h-4 text-indigo-600" />
                )}
                {format(new Date(log.date), 'MMM d, yyyy')}
              </CardTitle>
              <Badge variant={log.session === 'AM' ? 'default' : 'secondary'}>
                {log.session}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {log.focus_area && (
              <div>
                <p className="text-xs text-gray-500">Focus:</p>
                <p className="text-sm text-gray-700">{log.focus_area}</p>
              </div>
            )}
            {log.work_summary && (
              <div>
                <p className="text-xs text-gray-500">Summary:</p>
                <p className="text-sm text-gray-700 line-clamp-2">{log.work_summary}</p>
              </div>
            )}
            {log.tasks && log.tasks.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Tasks: {log.tasks.length}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
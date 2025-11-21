import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

export default function ActivityTrendsChart({ captures, logs, tasks }) {
  // Generate last 14 days of data
  const days = 14;
  const chartData = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = startOfDay(subDays(new Date(), i));
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const capturesCount = captures.filter(c => 
      c.created_date && c.created_date.startsWith(dateStr)
    ).length;
    
    const logsCount = logs.filter(l => 
      l.created_date && l.created_date.startsWith(dateStr)
    ).length;
    
    const tasksCount = tasks.filter(t => 
      t.created_date && t.created_date.startsWith(dateStr)
    ).length;
    
    chartData.push({
      date: format(date, 'MMM d'),
      Captures: capturesCount,
      Logs: logsCount,
      Tasks: tasksCount
    });
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Activity Trends (Last 14 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Captures" stroke="#6366f1" strokeWidth={2} />
            <Line type="monotone" dataKey="Logs" stroke="#f59e0b" strokeWidth={2} />
            <Line type="monotone" dataKey="Tasks" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
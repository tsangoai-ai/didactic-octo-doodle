import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CheckSquare } from 'lucide-react';

export default function TaskOverview({ tasks }) {
  const statusCounts = {
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    blocked: tasks.filter(t => t.status === 'blocked').length
  };
  
  const chartData = [
    { name: 'To Do', count: statusCounts.todo, color: '#94a3b8' },
    { name: 'In Progress', count: statusCounts.in_progress, color: '#3b82f6' },
    { name: 'Done', count: statusCounts.done, color: '#22c55e' },
    { name: 'Blocked', count: statusCounts.blocked, color: '#ef4444' }
  ];
  
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((statusCounts.done / total) * 100) : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            Task Overview
          </span>
          <span className="text-sm font-normal text-gray-600">
            {completionRate}% Complete
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 grid grid-cols-4 gap-4 text-center">
          {chartData.map(item => (
            <div key={item.name}>
              <div className="text-2xl font-bold" style={{ color: item.color }}>
                {item.count}
              </div>
              <div className="text-xs text-gray-500">{item.name}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
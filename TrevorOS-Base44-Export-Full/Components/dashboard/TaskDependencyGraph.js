import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, ArrowRight } from 'lucide-react';

export default function TaskDependencyGraph({ tasks }) {
  // Find tasks with dependencies
  const tasksWithDeps = tasks.filter(t => t.dependencies && t.dependencies.length > 0);
  
  if (tasksWithDeps.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="w-5 h-5 text-indigo-600" />
          Task Dependencies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasksWithDeps.slice(0, 5).map(task => {
            const depTasks = task.dependencies
              .map(id => tasks.find(t => t.id === id))
              .filter(Boolean);
            
            return (
              <div key={task.id} className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      {depTasks.map((dep, idx) => (
                        <React.Fragment key={dep.id}>
                          <Badge variant={dep.status === 'done' ? 'default' : 'secondary'}>
                            {dep.title.substring(0, 30)}{dep.title.length > 30 ? '...' : ''}
                          </Badge>
                          {idx < depTasks.length - 1 && <span className="text-gray-400">+</span>}
                        </React.Fragment>
                      ))}
                      <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
                      <Badge variant="outline" className="font-semibold">
                        {task.title.substring(0, 40)}{task.title.length > 40 ? '...' : ''}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
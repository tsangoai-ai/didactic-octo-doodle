import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, Circle, Clock, AlertCircle, Link2 } from "lucide-react";

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800"
};

const statusIcons = {
  todo: Circle,
  in_progress: Clock,
  done: CheckSquare,
  blocked: AlertCircle
};

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('todo');

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', filter],
    queryFn: () => filter === 'all' 
      ? base44.entities.Task.list('-created_date', 50)
      : base44.entities.Task.filter({ status: filter }, '-created_date', 50)
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['all-tasks-list'],
    queryFn: () => base44.entities.Task.list('-created_date', 200)
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['tasks'])
  });

  const toggleTaskStatus = (task) => {
    // Check if dependencies are met
    if (task.status !== 'done' && task.dependencies && task.dependencies.length > 0) {
      const incompleteDeps = task.dependencies.filter(depId => {
        const depTask = allTasks.find(t => t.id === depId);
        return depTask && depTask.status !== 'done';
      });
      
      if (incompleteDeps.length > 0) {
        alert('Cannot complete this task until all dependencies are completed.');
        return;
      }
    }
    
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    updateTaskMutation.mutate({ id: task.id, data: { status: newStatus } });
  };

  const getDependentTasks = (taskId) => {
    return allTasks.filter(t => t.dependencies && t.dependencies.includes(taskId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600">AI-extracted & manual tasks</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {['todo', 'in_progress', 'done', 'blocked', 'all'].map(status => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              size="sm"
            >
              {status.replace('_', ' ')}
            </Button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {tasks.map(task => {
            const StatusIcon = statusIcons[task.status];
            const dependencyTasks = task.dependencies ? 
              task.dependencies.map(id => allTasks.find(t => t.id === id)).filter(Boolean) : [];
            const dependentTasks = getDependentTasks(task.id);
            const hasIncompleteDeps = dependencyTasks.some(t => t.status !== 'done');
            
            return (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => toggleTaskStatus(task)}
                      className="mt-1"
                      disabled={hasIncompleteDeps && task.status !== 'done'}
                    >
                      <StatusIcon className={`w-5 h-5 ${task.status === 'done' ? 'text-green-600' : hasIncompleteDeps ? 'text-gray-300' : 'text-gray-400'}`} />
                    </button>
                    
                    <div className="flex-1">
                      <h3 className={`font-semibold ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </h3>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                      
                      {/* Dependencies Section */}
                      {dependencyTasks.length > 0 && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Link2 className="w-4 h-4 text-amber-600" />
                            <p className="text-sm font-medium text-amber-900">Depends on:</p>
                          </div>
                          <div className="space-y-1">
                            {dependencyTasks.map(depTask => (
                              <div key={depTask.id} className="flex items-center gap-2 text-sm">
                                {depTask.status === 'done' ? (
                                  <CheckSquare className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Circle className="w-4 h-4 text-amber-600" />
                                )}
                                <span className={depTask.status === 'done' ? 'line-through text-gray-500' : 'text-gray-700'}>
                                  {depTask.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Dependent Tasks Section */}
                      {dependentTasks.length > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Link2 className="w-4 h-4 text-blue-600" />
                            <p className="text-sm font-medium text-blue-900">Blocking:</p>
                          </div>
                          <div className="space-y-1">
                            {dependentTasks.map(depTask => (
                              <div key={depTask.id} className="text-sm text-gray-700">
                                • {depTask.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <Badge className={priorityColors[task.priority]}>
                          {task.priority}
                        </Badge>
                        {task.category && (
                          <Badge variant="outline">{task.category}</Badge>
                        )}
                        {task.tags?.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                        {task.due_date && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {tasks.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No tasks found</p>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Edit2, Save, Loader2, Sparkles } from "lucide-react";

export default function CheckInDraft({ draft, onSave, isSaving }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDraft, setEditedDraft] = useState(draft);

  const handleSave = () => {
    onSave(editedDraft);
  };

  if (!draft) return null;

  return (
    <Card className="border-2 border-indigo-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI-Generated {draft.session} Check-In Draft
          </CardTitle>
          <Badge className="bg-indigo-600 text-white">
            {draft.session}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        
        {/* Date */}
        <div>
          <Label className="text-sm font-medium text-gray-500">Date</Label>
          <p className="text-lg font-semibold mt-1">{draft.date}</p>
        </div>

        {/* User Feeling */}
        <div>
          <Label className="text-sm font-medium text-gray-500">How are you feeling?</Label>
          {isEditing ? (
            <Input
              value={editedDraft.user_feeling || ''}
              onChange={(e) => setEditedDraft({...editedDraft, user_feeling: e.target.value})}
              placeholder="energized, focused, tired, overwhelmed..."
              className="mt-1"
            />
          ) : (
            <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded-lg">
              {draft.user_feeling || 'Not specified'}
            </p>
          )}
        </div>

        {/* Focus Area */}
        <div>
          <Label className="text-sm font-medium text-gray-500">Primary Focus</Label>
          {isEditing ? (
            <Input
              value={editedDraft.focus_area || ''}
              onChange={(e) => setEditedDraft({...editedDraft, focus_area: e.target.value})}
              placeholder="What's the main focus?"
              className="mt-1"
            />
          ) : (
            <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded-lg">
              {draft.focus_area || 'Not specified'}
            </p>
          )}
        </div>

        {/* Work Summary */}
        <div>
          <Label className="text-sm font-medium text-gray-500">Summary</Label>
          {isEditing ? (
            <Textarea
              value={editedDraft.work_summary || ''}
              onChange={(e) => setEditedDraft({...editedDraft, work_summary: e.target.value})}
              placeholder="What did you accomplish? What's planned?"
              className="mt-1 min-h-[120px]"
            />
          ) : (
            <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
              {draft.work_summary}
            </p>
          )}
        </div>

        {/* Tasks */}
        <div>
          <Label className="text-sm font-medium text-gray-500">Key Tasks</Label>
          {isEditing ? (
            <Textarea
              value={editedDraft.tasks?.join('\n') || ''}
              onChange={(e) => setEditedDraft({
                ...editedDraft, 
                tasks: e.target.value.split('\n').filter(t => t.trim())
              })}
              placeholder="One task per line..."
              className="mt-1 min-h-[100px]"
            />
          ) : (
            <ul className="mt-2 space-y-2">
              {draft.tasks?.map((task, idx) => (
                <li key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{task}</span>
                </li>
              )) || <p className="text-gray-500 italic">No tasks listed</p>}
            </ul>
          )}
        </div>

        {/* Insights */}
        {draft.insights && draft.insights.length > 0 && (
          <div>
            <Label className="text-sm font-medium text-gray-500">AI Insights</Label>
            <ul className="mt-2 space-y-2">
              {draft.insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-blue-600 font-bold">💡</span>
                  <span className="text-gray-700">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          {!isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="flex-1"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Draft
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Confirm & Save
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => {
                  setEditedDraft(draft);
                  setIsEditing(false);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Done Editing
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}// Placeholder file. Paste Base44 code here.

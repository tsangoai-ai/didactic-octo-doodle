import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Tag } from "lucide-react";
import { format } from "date-fns";

const noteTypeColors = {
  atomic: "bg-purple-100 text-purple-800",
  evergreen: "bg-green-100 text-green-800",
  fleeting: "bg-yellow-100 text-yellow-800",
  literature: "bg-blue-100 text-blue-800",
  project: "bg-orange-100 text-orange-800",
  area: "bg-pink-100 text-pink-800",
  resource: "bg-teal-100 text-teal-800"
};

export default function NotesPage() {
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: () => base44.entities.Note.list('-created_date', 50)
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">PKM Notes</h1>
            <p className="text-gray-600">Your Second Brain knowledge base</p>
          </div>
          <BookOpen className="w-8 h-8 text-green-600" />
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map(note => (
            <Card key={note.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="space-y-3">
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={noteTypeColors[note.note_type]}>
                      {note.note_type}
                    </Badge>
                    {note.tags?.map(tag => (
                      <Badge key={tag} variant="outline" className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {note.essence && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-3">
                    <p className="text-sm italic text-gray-700">{note.essence}</p>
                  </div>
                )}
                
                <p className="text-sm text-gray-600 line-clamp-3">
                  {note.content?.substring(0, 150)}...
                </p>
                
                <p className="text-xs text-gray-400 mt-3">
                  {format(new Date(note.created_date), 'MMM d, yyyy')}
                </p>
              </CardContent>
            </Card>
          ))}
          
          {notes.length === 0 && (
            <Card className="col-span-2">
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No notes yet</p>
                <p className="text-sm text-gray-400 mt-2">Start capturing to build your knowledge base</p>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
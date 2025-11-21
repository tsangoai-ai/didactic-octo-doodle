import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Heart } from 'lucide-react';

export default function ThemeSummary({ captures, logs }) {
  // Extract and count tags from captures
  const tagCounts = {};
  captures.forEach(c => {
    if (c.ai_tags) {
      c.ai_tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  
  // Get top 10 tags
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));
  
  // Extract emotional states from logs
  const emotionCounts = {};
  logs.forEach(log => {
    if (log.user_feeling) {
      const feeling = log.user_feeling.toLowerCase();
      emotionCounts[feeling] = (emotionCounts[feeling] || 0) + 1;
    }
  });
  
  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([emotion, count]) => ({ emotion, count }));
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Recurring Themes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {topTags.map(({ tag, count }) => (
              <Badge key={tag} variant="secondary" className="text-sm">
                {tag} <span className="ml-1 text-xs text-gray-500">({count})</span>
              </Badge>
            ))}
            {topTags.length === 0 && (
              <p className="text-sm text-gray-500">No themes detected yet</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            Emotional Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {topEmotions.map(({ emotion, count }) => (
              <Badge key={emotion} variant="outline" className="text-sm">
                {emotion} <span className="ml-1 text-xs text-gray-500">({count})</span>
              </Badge>
            ))}
            {topEmotions.length === 0 && (
              <p className="text-sm text-gray-500">No emotional data yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
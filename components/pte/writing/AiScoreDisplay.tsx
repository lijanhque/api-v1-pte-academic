'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// A simple diff component to highlight changes
const Diff = ({ original, corrected }: { original: string; corrected: string }) => (
  <div className="text-sm">
    <span className="text-red-600 line-through">{original}</span>
    <span className="text-green-600 ml-2">{corrected}</span>
  </div>
);

export default function AiScoreDisplay({ scoreData, userText }: { scoreData: any, userText: string }) {
  if (!scoreData) return null;

  const { overallScore, grammar, vocabulary, coherence, modelAnswer } = scoreData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="score">
          <TabsList>
            <TabsTrigger value="score">AI Score</TabsTrigger>
            <TabsTrigger value="model">Model Answer</TabsTrigger>
          </TabsList>
          <TabsContent value="score" className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-semibold">Overall Score</p>
              <p className="text-5xl font-bold text-blue-600">{overallScore}/90</p>
            </div>
            
            <Card>
              <CardHeader><CardTitle>Grammar</CardTitle></CardHeader>
              <CardContent>
                <p className="font-semibold">Score: {grammar.score}/90</p>
                <p className="mt-2 text-sm">{grammar.feedback}</p>
                <div className="mt-4 space-y-2">
                  {grammar.corrections.map((c, i) => (
                    <div key={i} className="p-2 bg-gray-50 rounded">
                      <Diff original={c.original} corrected={c.corrected} />
                      <p className="text-xs text-gray-500 mt-1">{c.explanation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Vocabulary</CardTitle></CardHeader>
              <CardContent>
                <p className="font-semibold">Score: {vocabulary.score}/90</p>
                <p className="mt-2 text-sm">{vocabulary.feedback}</p>
                <div className="mt-4 space-y-2">
                  {vocabulary.suggestions.map((s, i) => (
                    <div key={i} className="p-2 bg-gray-50 rounded">
                       <Diff original={s.original} corrected={s.suggested} />
                       <p className="text-xs text-gray-500 mt-1">{s.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Coherence & Structure</CardTitle></CardHeader>
              <CardContent>
                <p className="font-semibold">Score: {coherence.score}/90</p>
                <p className="mt-2 text-sm">{coherence.feedback}</p>
              </CardContent>
            </Card>

          </TabsContent>
          <TabsContent value="model">
            <div className="prose prose-sm max-w-none">
              <p>{modelAnswer}</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

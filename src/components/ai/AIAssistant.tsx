
import React, { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Bot } from 'lucide-react';

interface AIAssistantProps {
  simplified?: boolean;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ simplified = false }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAIEnabled, generateAIResponse } = useAI();
  const { translations } = useLanguage();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !isAIEnabled) return;
    
    setIsLoading(true);
    try {
      const result = await generateAIResponse(prompt);
      setResponse(result.text);
    } catch (error) {
      setResponse(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isAIEnabled) {
    return simplified ? null : (
      <div className="p-4 bg-slate-800 rounded-lg text-center">
        <p>{translations.aiDescription}</p>
      </div>
    );
  }
  
  return (
    <div className={`${simplified ? 'p-2' : 'p-4'} bg-slate-800 rounded-lg`}>
      <div className="flex items-center gap-2 mb-4">
        <Bot className="h-5 w-5 text-pozo-orange" />
        <h3 className="text-lg font-medium">AI Assistant</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={translations.aiFeatures}
            className="bg-slate-700"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !prompt.trim()} 
            className="bg-pozo-orange hover:bg-opacity-90"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
          </Button>
        </div>
        
        {response && (
          <div className="p-3 bg-slate-700 rounded-lg mt-2">
            <p className="text-sm">{response}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default AIAssistant;

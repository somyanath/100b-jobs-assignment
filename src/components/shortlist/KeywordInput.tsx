import { memo, useCallback, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XIcon } from "lucide-react";

interface I_KeywordInputProps {
  label: string;
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  placeholder: string;
  inputClassName?: string;
}

/**
 * Reusable keyword input component
 * Allows adding and removing keywords with visual feedback
 */
const KeywordInput = memo(({ 
  label, 
  keywords, 
  onKeywordsChange, 
  placeholder,
  inputClassName = ""
}: I_KeywordInputProps) => {
  const [inputValue, setInputValue] = useState<string>('');

  // Add new keyword
  const addKeyword = useCallback((keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword && !keywords.includes(trimmedKeyword)) {
      const updatedKeywords = [...keywords, trimmedKeyword];
      onKeywordsChange(updatedKeywords);
    }
  }, [keywords, onKeywordsChange]);

  // Remove keyword
  const removeKeyword = useCallback((keywordToRemove: string) => {
    const updatedKeywords = keywords.filter(keyword => keyword !== keywordToRemove);
    onKeywordsChange(updatedKeywords);
  }, [keywords, onKeywordsChange]);

  // Handle Enter key press
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addKeyword(inputValue);
      setInputValue('');
    }
  }, [inputValue, addKeyword]);

  // Handle input blur
  const handleBlur = useCallback(() => {
    if (inputValue.trim()) {
      addKeyword(inputValue);
      setInputValue('');
    }
  }, [inputValue, addKeyword]);

  // Handle input change
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  return (
    <div className="w-full mb-4">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {keywords.length > 0 && `(${keywords.length})`}
      </label>
      
      {/* Input Field */}
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full ${inputClassName}`}
      />
      
      {/* Keywords/Badges */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {keywords.map((keyword, index) => (
            <Badge 
              key={`${keyword}-${index}`} 
              variant="secondary" 
              className="flex items-center gap-1"
            >
              <span>{keyword}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-red-100"
                onClick={() => removeKeyword(keyword)}
              >
                <XIcon className="h-3 w-3 text-gray-500 hover:text-red-500" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      {/* Helper Text */}
      <div 
        id={`${label.toLowerCase()}-help`}
        className="text-xs text-gray-500 mt-2"
      >
        Type and press Enter or click outside to add keywords
      </div>
    </div>
  );
});

KeywordInput.displayName = 'KeywordInput';

export default KeywordInput;
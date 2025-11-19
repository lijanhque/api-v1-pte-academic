import { countWords } from '@/lib/pte/utils'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type WritingType = 'summarize_written_text' | 'write_essay'

type Props = {
  questionType: WritingType
  value: string
  onChange: (text: string) => void
  disabled?: boolean
}

function guidanceFor(type: WritingType) {
  if (type === 'summarize_written_text') {
    return {
      label: 'One-sentence summary',
      min: 5,
      max: 75,
      placeholder:
        'Write a single sentence that summarizes the main idea. Keep it concise (5–75 words).',
    }
  }
  return {
    label: 'Essay response',
    min: 150,
    max: 450,
    placeholder:
      'Write your essay here. Aim for clear structure (introduction, body, conclusion) and stay within 150–450 words.',
  }
}

export default function WritingInput({
  questionType,
  value,
  onChange,
  disabled,
}: Props) {
  const wc = countWords(value || '')
  const { label, min, max, placeholder } = guidanceFor(questionType)

  const within = wc >= min && wc <= max
  const warnLow = wc > 0 && wc < min
  const warnHigh = wc > max

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label className="font-medium">{label}</Label>
        <div className="flex items-center gap-2 text-xs">
          <Badge variant={within ? 'default' : 'secondary'}>{wc} words</Badge>
          <span className="text-muted-foreground">
            Target: {min}-{max}
          </span>
        </div>
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={questionType === 'summarize_written_text' ? 6 : 14}
        className="min-h-[160px]"
      />

      {(warnLow || warnHigh) && (
        <div role="alert" className="text-xs">
          {warnLow ? (
            <span className="text-yellow-700">
              Below recommended length. Add more details to reach at least {min}{' '}
              words.
            </span>
          ) : null}
          {warnHigh ? (
            <span className="text-red-700">
              Above recommended length. Consider tightening to under {max}{' '}
              words.
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}

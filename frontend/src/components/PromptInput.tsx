import { useState } from 'react'

interface Props {
    value: string
    onChange: (v: string) => void
    disabled?: boolean
}

export default function PromptInput({ value, onChange, disabled }: Props) {
    const [charCount, setCharCount] = useState(value.length)
    const maxChars = 2000

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const v = e.target.value
        if (v.length <= maxChars) {
            onChange(v)
            setCharCount(v.length)
        }
    }

    const examples = [
        'A lone astronaut walks across Mars at golden hour, red dust swirling around her boots. She kneels down to examine a glowing crystal formation. Mission control crackles in her earpiece.',
        'A cyberpunk city at night — neon reflections on wet streets, flying vehicles weaving between skyscrapers. A detective in a trench coat reads a holographic case file.',
        'Deep ocean documentary: bioluminescent jellyfish drift past a sunken ship. A school of silver fish parts around the camera. Ancient coral formations glow in the dark water.',
    ]

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Story / Scene Prompt
                </label>
                <span className={`text-xs ${charCount > maxChars * 0.9 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {charCount}/{maxChars}
                </span>
            </div>

            <textarea
                value={value}
                onChange={handleChange}
                disabled={disabled}
                rows={7}
                placeholder="Describe your video story here. Separate scenes with blank lines, or write a continuous narrative and we'll auto-detect scenes.

Example: A lone astronaut walks across Mars at golden hour..."
                className="w-full bg-surface-700 border border-white/[0.06] rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all disabled:opacity-50"
            />

            {/* Example prompts */}
            <div className="space-y-1.5">
                <p className="text-xs text-slate-600 font-medium">✨ Try an example:</p>
                <div className="flex flex-wrap gap-2">
                    {examples.map((ex, i) => (
                        <button
                            key={i}
                            onClick={() => { onChange(ex); setCharCount(ex.length) }}
                            disabled={disabled}
                            className="text-xs px-3 py-1.5 rounded-lg bg-surface-600 hover:bg-brand-500/20 hover:border-brand-500/50 border border-white/[0.05] text-slate-400 hover:text-brand-300 transition-all disabled:opacity-40 truncate max-w-[200px]"
                        >
                            {['🚀 Sci-Fi', '🌆 Cyberpunk', '🌊 Ocean Doc'][i]}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

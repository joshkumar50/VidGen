interface Props {
    value: string
    onChange: (v: string) => void
    disabled?: boolean
}

const voices = [
    { id: 'Narrator', emoji: '🎙️', desc: 'Clear & neutral' },
    { id: 'Dramatic', emoji: '🎭', desc: 'Theatrical intensity' },
    { id: 'Calm', emoji: '🌊', desc: 'Gentle & soothing' },
    { id: 'Energetic', emoji: '⚡', desc: 'Upbeat & dynamic' },
    { id: 'Whisper', emoji: '🤫', desc: 'Intimate & hushed' },
    { id: 'News Anchor', emoji: '📺', desc: 'Professional tone' },
]

export default function VoiceStyleSelector({ value, onChange, disabled }: Props) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Voice Style
            </label>
            <div className="grid grid-cols-2 gap-2">
                {voices.map(v => {
                    const active = value === v.id
                    return (
                        <button
                            key={v.id}
                            onClick={() => onChange(v.id)}
                            disabled={disabled}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all disabled:opacity-40 ${active
                                ? 'bg-brand-500/20 border-brand-500/60 text-brand-300'
                                : 'bg-surface-700 border-white/[0.06] text-slate-400 hover:border-brand-500/30 hover:text-slate-200'
                                }`}
                        >
                            <span className="text-lg leading-none">{v.emoji}</span>
                            <div>
                                <div className="text-xs font-semibold leading-tight">{v.id}</div>
                                <div className="text-[10px] opacity-60 leading-tight">{v.desc}</div>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

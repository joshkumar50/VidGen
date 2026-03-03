type AspectRatio = '16:9' | '9:16'

interface Props {
    value: AspectRatio
    onChange: (v: AspectRatio) => void
    disabled?: boolean
}

interface Option {
    value: AspectRatio
    label: string
    sub: string
    icon: any
}

const options: Option[] = [
    {
        value: '16:9',
        label: 'Landscape',
        sub: 'YouTube / TV',
        icon: (
            <div className="w-10 h-[22px] rounded border-2 border-current flex items-center justify-center text-[8px] font-bold">16:9</div>
        ),
    },
    {
        value: '9:16',
        label: 'Portrait',
        sub: 'Reels / TikTok',
        icon: (
            <div className="w-[22px] h-10 rounded border-2 border-current flex items-center justify-center text-[8px] font-bold" style={{ writingMode: 'vertical-rl' }}>9:16</div>
        ),
    },
]

export default function AspectRatioSelector({ value, onChange, disabled }: Props) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                </svg>
                Aspect Ratio
            </label>
            <div className="grid grid-cols-2 gap-3">
                {options.map(opt => {
                    const active = value === opt.value
                    return (
                        <button
                            key={opt.value}
                            onClick={() => onChange(opt.value)}
                            disabled={disabled}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all disabled:opacity-40 ${active
                                ? 'bg-brand-500/20 border-brand-500/60 text-brand-300 glow'
                                : 'bg-surface-700 border-white/[0.06] text-slate-400 hover:border-brand-500/30 hover:text-slate-200'
                                }`}
                        >
                            <span className={active ? 'text-brand-400' : 'text-slate-500'}>{opt.icon}</span>
                            <div className="text-left">
                                <div className="text-sm font-semibold">{opt.label}</div>
                                <div className="text-xs opacity-60">{opt.sub}</div>
                            </div>
                            {active && (
                                <svg className="w-4 h-4 ml-auto text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

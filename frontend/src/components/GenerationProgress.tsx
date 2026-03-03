interface Props {
    status: 'idle' | 'queued' | 'running' | 'done' | 'error'
    stage: string
    message: string
    onCancel?: () => void
}

const STAGES = ['parsing', 'images', 'audio', 'subtitles', 'video', 'done']

const stageLabels: Record<string, string> = {
    parsing: '📋 Parsing scenes',
    images: '🎨 Generating images',
    audio: '🎙️ Synthesizing voice',
    subtitles: '📝 Creating subtitles',
    video: '🎬 Composing video',
    done: '✅ Complete',
}

export default function GenerationProgress({ status, stage, message, onCancel }: Props) {
    if (status === 'idle') return null

    const currentIndex = STAGES.indexOf(stage)

    return (
        <div className="glass rounded-2xl p-6 space-y-5 animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                    {status === 'running' && (
                        <span className="inline-flex w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse2" />
                    )}
                    {status === 'queued' && '⏳ '}
                    {status === 'error' && '❌ '}
                    {status === 'done' ? '🎉 Video Ready!' : 'Generating Video'}
                </h3>
                {status === 'running' && onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 px-3 py-1 rounded-lg transition-all"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Stage pipeline */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {STAGES.filter(s => s !== 'done').map((s, i) => {
                    const isPast = currentIndex > i
                    const isCurrent = currentIndex === i
                    return (
                        <div key={s} className="flex items-center gap-1 flex-shrink-0">
                            <div
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${isCurrent
                                    ? 'bg-brand-500/30 border border-brand-500/50 text-brand-300'
                                    : isPast
                                        ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                                        : 'bg-surface-600 border border-white/[0.05] text-slate-600'
                                    }`}
                            >
                                {isPast ? '✓' : (i + 1) + '.'} {stageLabels[s]?.split(' ')[1] ?? s}
                            </div>
                            {i < STAGES.length - 2 && (
                                <div className={`w-3 h-px ${isPast ? 'bg-green-500/40' : 'bg-white/[0.06]'}`} />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Current message */}
            <div className="flex items-center gap-3">
                {status === 'running' && (
                    <div className="flex-shrink-0 w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                )}
                <p className="text-sm text-slate-400">{message || 'Initializing...'}</p>
            </div>

            {/* Shimmer progress bar */}
            {status === 'running' && (
                <div className="h-1.5 rounded-full bg-surface-600 overflow-hidden">
                    <div
                        className="h-full rounded-full shimmer"
                        style={{
                            width: `${Math.max(8, ((currentIndex + 1) / (STAGES.length - 1)) * 100)}%`,
                            background: 'linear-gradient(90deg, #3b5bdb, #7c9dff, #3b5bdb)',
                            backgroundSize: '700px 100%',
                            transition: 'width 0.8s ease',
                            animation: 'shimmer 2s linear infinite',
                        }}
                    />
                </div>
            )}

            {status === 'error' && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    ⚠️ {message}
                </p>
            )}
        </div>
    )
}

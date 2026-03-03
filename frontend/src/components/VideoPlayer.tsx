import { useState } from 'react'

interface Metadata {
    duration?: number
    resolution?: string
    fileSize?: number
    generationTime?: number
}

interface Props {
    videoUrl: string | null
    metadata?: Metadata
    onRegenerate?: () => void
}

function formatBytes(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function VideoPlayer({ videoUrl, metadata, onRegenerate }: Props) {
    const [isLoading, setIsLoading] = useState(true)

    if (!videoUrl) return null

    const fullUrl = `http://localhost:8000${videoUrl}`

    return (
        <div className="glass rounded-2xl overflow-hidden animate-fade-in">
            {/* Video */}
            <div className="relative bg-black">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-900">
                        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <video
                    src={fullUrl}
                    controls
                    className="w-full max-h-[480px] object-contain"
                    onCanPlay={() => setIsLoading(false)}
                />
            </div>

            {/* Footer */}
            <div className="p-4 space-y-4">
                {/* Metadata bar */}
                {metadata && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
                        {metadata.resolution && (
                            <span className="flex items-center gap-1">
                                <span className="text-slate-600">📐</span> {metadata.resolution}
                            </span>
                        )}
                        {metadata.duration && (
                            <span className="flex items-center gap-1">
                                <span className="text-slate-600">⏱️</span> {metadata.duration.toFixed(1)}s
                            </span>
                        )}
                        {metadata.fileSize && (
                            <span className="flex items-center gap-1">
                                <span className="text-slate-600">💾</span> {formatBytes(metadata.fileSize)}
                            </span>
                        )}
                        {metadata.generationTime && (
                            <span className="flex items-center gap-1">
                                <span className="text-slate-600">⚡</span> {metadata.generationTime.toFixed(0)}s generation
                            </span>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <a
                        href={fullUrl}
                        download="visionflow_output.mp4"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-all glow hover:glow"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download MP4
                    </a>
                    {onRegenerate && (
                        <button
                            onClick={onRegenerate}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] hover:border-brand-500/40 bg-surface-700 hover:bg-surface-600 text-slate-300 text-sm font-medium transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Regenerate
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

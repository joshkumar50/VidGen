import * as React from 'react'
import PromptInput from '../components/PromptInput'
import AspectRatioSelector from '../components/AspectRatioSelector'
import VoiceStyleSelector from '../components/VoiceStyleSelector'
import GenerationProgress from '../components/GenerationProgress'
import VideoPlayer from '../components/VideoPlayer'

type AspectRatio = '16:9' | '9:16'
type Status = 'idle' | 'queued' | 'running' | 'done' | 'error'

const API = 'http://localhost:8000'

export default function Studio() {
    // ── Form state ──────────────────────────────────────────────────────────────
    const [prompt, setPrompt] = React.useState('')
    const [aspectRatio, setAspectRatio] = React.useState<AspectRatio>('16:9')
    const [resolution, setResolution] = React.useState('1080p')
    const [voiceStyle, setVoiceStyle] = React.useState('Narrator')
    const [totalDuration, setTotalDuration] = React.useState(60)
    const [inferenceSteps, setInferenceSteps] = React.useState(25)
    const [cfgScale, setCfgScale] = React.useState(7.5)
    const [kenBurnsIntensity, setKenBurnsIntensity] = React.useState('subtle')
    const [transitionType, setTransitionType] = React.useState('crossfade')
    const [addSubtitles, setAddSubtitles] = React.useState(true)
    const [showAdvanced, setShowAdvanced] = React.useState(false)

    // ── Generation state ────────────────────────────────────────────────────────
    const [jobId, setJobId] = React.useState<string | null>(null)
    const [status, setStatus] = React.useState<Status>('idle')
    const [stage, setStage] = React.useState('')
    const [message, setMessage] = React.useState('')
    const [videoUrl, setVideoUrl] = React.useState<string | null>(null)
    const [fileSize, setFileSize] = React.useState<number | undefined>()
    const [startTime, setStartTime] = React.useState<number | null>(null)
    const [genTime, setGenTime] = React.useState<number | undefined>()

    // ── Health check ─────────────────────────────────────────────────────────────
    const [health, setHealth] = React.useState<{ cuda_available: boolean; gpu: string; vram_free_gb: number } | null>(null)

    const wsRef = React.useRef<WebSocket | null>(null)

    React.useEffect(() => {
        fetch(`${API}/api/health`)
            .then(r => r.json())
            .then(setHealth)
            .catch(() => setHealth(null))
    }, [])

    // ── WebSocket listener ───────────────────────────────────────────────────────
    const connectWs = React.useCallback((jid: string) => {
        if (wsRef.current) wsRef.current.close()
        const ws = new WebSocket(`ws://localhost:8000/ws/${jid}`)
        wsRef.current = ws

        ws.onmessage = (evt) => {
            const data = JSON.parse(evt.data)
            if (data.event === 'progress') {
                setStage(data.stage ?? '')
                setMessage(data.message ?? '')
                setStatus('running')
            } else if (data.event === 'done') {
                setStatus('done')
                setStage('done')
                setMessage('Your video is ready!')
                setVideoUrl(data.video_url)
                setFileSize(data.file_size)
                if (startTime) setGenTime((Date.now() - startTime) / 1000)
                ws.close()
            } else if (data.event === 'error') {
                setStatus('error')
                setMessage(data.message)
                ws.close()
            }
        }
        ws.onerror = () => {
            setStatus('error')
            setMessage('WebSocket connection failed. Is the backend running?')
        }
    }, [startTime])

    // ── Generate ────────────────────────────────────────────────────────────────
    const handleGenerate = async () => {
        if (!prompt.trim()) return
        setStatus('queued')
        setStage('parsing')
        setMessage('Sending request to backend...')
        setVideoUrl(null)
        setStartTime(Date.now())

        try {
            const res = await fetch(`${API}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    aspect_ratio: aspectRatio,
                    resolution,
                    voice_style: voiceStyle,
                    total_duration: totalDuration,
                    inference_steps: inferenceSteps,
                    cfg_scale: cfgScale,
                    ken_burns_intensity: kenBurnsIntensity,
                    transition_type: transitionType,
                    add_subtitles: addSubtitles,
                }),
            })
            const { job_id } = await res.json()
            setJobId(job_id)
            connectWs(job_id)
        } catch (e: unknown) {
            setStatus('error')
            setMessage(`Failed to reach backend: ${e instanceof Error ? e.message : e}`)
        }
    }

    const handleCancel = async () => {
        if (jobId) {
            await fetch(`${API}/api/jobs/${jobId}`, { method: 'DELETE' })
        }
        wsRef.current?.close()
        setStatus('idle')
        setStage('')
        setMessage('')
    }

    const handleRegenerate = () => {
        setStatus('idle')
        setVideoUrl(null)
        setJobId(null)
        handleGenerate()
    }

    const isGenerating = status === 'queued' || status === 'running'

    return (
        <div className="min-h-screen bg-surface-900" style={{ backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(59,91,219,0.18) 0%, transparent 70%)' }}>
            <header className="border-b border-white/[0.05] bg-surface-800/80 backdrop-blur sticky top-0 z-50">
                <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
                            VF
                        </div>
                        <div>
                            <h1 className="text-base font-bold gradient-text leading-none">VisionFlow Studio</h1>
                            <p className="text-[10px] text-slate-600 leading-none mt-0.5">Local AI Video Generator</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        {health ? (
                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${health.cuda_available ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" style={{ animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                                {health.cuda_available ? `GPU: ${health.gpu} (${health.vram_free_gb}GB free)` : 'CPU Mode'}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                Backend offline
                            </span>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
                    <div className="space-y-5">
                        <div className="glass rounded-2xl p-6">
                            <PromptInput value={prompt} onChange={setPrompt} disabled={isGenerating} />
                        </div>

                        <div className="glass rounded-2xl p-6 space-y-6">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Settings</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} disabled={isGenerating} />
                                <VoiceStyleSelector value={voiceStyle} onChange={setVoiceStyle} disabled={isGenerating} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Output Resolution</label>
                                <div className="flex gap-2">
                                    {['720p', '1080p', '1440p'].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setResolution(r)}
                                            disabled={isGenerating}
                                            className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-40 ${resolution === r
                                                ? 'bg-brand-500/20 border-brand-500/60 text-brand-300'
                                                : 'bg-surface-700 border-white/[0.06] text-slate-500 hover:text-slate-300'
                                                }`}
                                        >{r}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-slate-300">Target Duration</label>
                                    <span className="text-sm font-bold text-brand-400">{totalDuration}s</span>
                                </div>
                                <input
                                    type="range" min={30} max={180} step={10}
                                    value={totalDuration}
                                    onChange={e => setTotalDuration(Number(e.target.value))}
                                    disabled={isGenerating}
                                    className="w-full disabled:opacity-40"
                                />
                                <div className="flex justify-between text-xs text-slate-600">
                                    <span>30s</span><span>1m</span><span>1.5m</span><span>2m</span><span>3m</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass rounded-2xl overflow-hidden">
                            <button
                                onClick={() => setShowAdvanced(v => !v)}
                                className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                    Advanced Options
                                </span>
                                <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showAdvanced && (
                                <div className="px-6 pb-6 space-y-5 border-t border-white/[0.05] pt-5">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-sm text-slate-300 font-medium">Inference Steps</label>
                                            <span className="text-sm font-bold text-brand-400">{inferenceSteps}</span>
                                        </div>
                                        <input type="range" min={15} max={50} value={inferenceSteps} onChange={e => setInferenceSteps(Number(e.target.value))} disabled={isGenerating} className="w-full disabled:opacity-40" />
                                        <div className="flex justify-between text-xs text-slate-600"><span>Fast (15)</span><span>Quality (50)</span></div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-sm text-slate-300 font-medium">CFG Scale</label>
                                            <span className="text-sm font-bold text-brand-400">{cfgScale}</span>
                                        </div>
                                        <input type="range" min={5} max={15} step={0.5} value={cfgScale} onChange={e => setCfgScale(Number(e.target.value))} disabled={isGenerating} className="w-full disabled:opacity-40" />
                                        <div className="flex justify-between text-xs text-slate-600"><span>Creative (5)</span><span>Precise (15)</span></div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Ken Burns Intensity</label>
                                        <div className="flex gap-2">
                                            {['subtle', 'moderate', 'dramatic'].map(k => (
                                                <button key={k} onClick={() => setKenBurnsIntensity(k)} disabled={isGenerating}
                                                    className={`flex-1 py-2 rounded-xl text-xs font-medium border capitalize transition-all disabled:opacity-40 ${kenBurnsIntensity === k ? 'bg-brand-500/20 border-brand-500/60 text-brand-300' : 'bg-surface-700 border-white/[0.06] text-slate-500 hover:text-slate-300'}`}
                                                >{k}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Scene Transition</label>
                                        <div className="flex gap-2">
                                            {[['crossfade', 'Crossfade'], ['dip_to_black', 'Dip to Black'], ['cut', 'Hard Cut']].map(([val, lbl]) => (
                                                <button key={val} onClick={() => setTransitionType(val)} disabled={isGenerating}
                                                    className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all disabled:opacity-40 ${transitionType === val ? 'bg-brand-500/20 border-brand-500/60 text-brand-300' : 'bg-surface-700 border-white/[0.06] text-slate-500 hover:text-slate-300'}`}
                                                >{lbl}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-slate-300">Burn-in Subtitles</label>
                                        <button
                                            onClick={() => setAddSubtitles(v => !v)}
                                            disabled={isGenerating}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-all disabled:opacity-40 ${addSubtitles ? 'bg-brand-500 border-brand-400' : 'bg-surface-600 border-white/[0.06]'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${addSubtitles ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={isGenerating ? handleCancel : handleGenerate}
                            disabled={!prompt.trim() && !isGenerating}
                            className={`w-full py-4 rounded-2xl text-base font-bold tracking-wide transition-all duration-200 ${isGenerating
                                ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
                                : 'bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-400 hover:to-violet-500 text-white shadow-lg hover:shadow-brand-500/30 glow disabled:opacity-40 disabled:cursor-not-allowed'
                                }`}
                        >
                            {isGenerating
                                ? '⛔ Cancel Generation'
                                : status === 'done'
                                    ? '🔄 Generate New Video'
                                    : '🎬 Generate Video'}
                        </button>
                    </div>

                    <div className="space-y-5">
                        {status !== 'idle' && (
                            <GenerationProgress
                                status={status}
                                stage={stage}
                                message={message}
                                onCancel={handleCancel}
                            />
                        )}

                        {status === 'done' && videoUrl && (
                            <VideoPlayer
                                videoUrl={videoUrl}
                                metadata={{
                                    resolution: `${aspectRatio === '16:9' ? '1920×1080' : '1080×1920'} (${resolution})`,
                                    fileSize,
                                    generationTime: genTime,
                                }}
                                onRegenerate={handleRegenerate}
                            />
                        )}

                        {status === 'idle' && (
                            <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center min-h-[300px]">
                                <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-3xl">
                                    🎬
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-slate-300 mb-1">Your video will appear here</h3>
                                    <p className="text-sm text-slate-600 max-w-[260px]">
                                        Write a story prompt on the left and hit Generate to create your AI video.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

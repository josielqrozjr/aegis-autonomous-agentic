"""
Gera a narração perfeitamente sincronizada com a gravação de tela do Cainã e renderiza o vídeo final com áudio.
"""

import asyncio
import os
import edge_tts
from moviepy import VideoFileClip, AudioFileClip, CompositeAudioClip

SEGMENTS = [
    {
        "start_sec": 1.0,
        "text": "Welcome to AEGIS — an autonomous compliance intelligence platform built on Google Cloud. Today, corporate compliance is often treated like a static snapshot. You review a policy once, generate findings, and assume evidence remains valid. But in fast-moving regulated environments, that assumption breaks quickly.",
    },
    {
        "start_sec": 26.0,
        "text": "Here, we launch an automated investigation on a corporate policy. First, Gemma 2 on Vertex AI executes a zero-trust PII scan, redacting sensitive identifiers before model exposure. Then, our Planner Agent dynamically routes work across specialized agents for LGPD, GDPR, and ISO 27001.",
    },
    {
        "start_sec": 52.0,
        "text": "Each specialist agent evaluates specific regulatory mandates. Crucially, every finding is anchored to a cryptographic SHA-256 evidence hash in our Trust Graph. Then, our Evidence Critic powered by Gemini 2.5 Pro acts as an adversarial red team, cross-examining findings to eliminate false positives.",
    },
    {
        "start_sec": 88.0,
        "text": "We also provide actionable remediation. AEGIS generates side-by-side policy amendments, allowing compliance teams to review exact diffs, approve remediation patches, and maintain auditable document versions with one click.",
    },
    {
        "start_sec": 125.0,
        "text": "Now, let's look at the heart of AEGIS: the Trust Graph and Continuous Monitoring. What happens when a legal baseline shifts? For example, when the European Union revises GDPR Article 5, reducing data retention from 5 years to 2 years.",
    },
    {
        "start_sec": 160.0,
        "text": "When we simulate this regulatory drift, AEGIS traces the dependency graph. It calculates the blast radius, invalidates only the affected evidence nodes in red, and transitions the finding to reopened. Then, through Selective Recovery, it re-runs only the impacted specialist without reprocessing the whole document, saving 65% in token costs.",
    },
    {
        "start_sec": 215.0,
        "text": "The entire investigation lifecycle is cryptographically sealed, auditable, and ready for board-level reporting. That is AEGIS: autonomous, evidence-backed governance for the modern enterprise.",
    }
]

async def generate_segment_audios(voice="en-US-ChristopherNeural"):
    os.makedirs("scratch/audio_segments", exist_ok=True)
    audio_files = []
    for i, seg in enumerate(SEGMENTS):
        out_path = f"scratch/audio_segments/seg_{i:02d}.mp3"
        print(f"Gerando segmento {i+1}/{len(SEGMENTS)}: {seg['text'][:40]}...")
        comm = edge_tts.Communicate(seg["text"], voice, rate="+4%")
        await comm.save(out_path)
        audio_files.append((seg["start_sec"], out_path))
    return audio_files

def merge_video_and_audio(audio_segments, input_video="video_recording.mp4", output_video="aegis_pitch_demo_final.mp4"):
    print("Carregando vídeo original...")
    video = VideoFileClip(input_video)
    
    clips = []
    for start_t, audio_path in audio_segments:
        aclip = AudioFileClip(audio_path).with_start(start_t)
        clips.append(aclip)
    
    print("Compondo trilha de áudio...")
    final_audio = CompositeAudioClip(clips)
    
    final_video = video.with_audio(final_audio)
    
    print(f"Renderizando vídeo final com áudio para {output_video}...")
    final_video.write_videofile(
        output_video,
        codec="libx264",
        audio_codec="aac",
        fps=video.fps,
        preset="fast"
    )
    print("Renderização concluída com sucesso!")

async def main():
    audio_segments = await generate_segment_audios()
    merge_video_and_audio(audio_segments)

if __name__ == "__main__":
    asyncio.run(main())

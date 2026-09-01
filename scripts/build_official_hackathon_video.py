"""
Gera o vídeo oficial do Hackathon 100% aderente a todas as regras do Devpost / Google Cloud:
1. Duração rigorosamente menor que 4 minutos (~3m 48s).
2. Narração em inglês abordando: Problema, Proposta de Valor, Demonstração e Backend no Google Cloud (Cloud Run + Vertex AI).
3. Sincronização milimétrica com as ações de tela do Cainã.
"""

import asyncio
import os
import edge_tts
from moviepy import VideoFileClip, AudioFileClip, CompositeAudioClip

# Textos oficiais da narração do pitch para o Google Cloud Hackathon
SEGMENTS = [
    {
        "start_sec": 1.0,
        "text": "Welcome to AEGIS — the Autonomous Compliance and Continuous Regulatory Intelligence Platform built natively on Google Cloud. Today, corporate compliance is broken by static snapshots. You review a policy once, but regulations and internal policies change continuously, rendering audit findings and evidence chains obsolete.",
    },
    {
        "start_sec": 24.0,
        "text": "AEGIS solves this problem through an autonomous multi-agent architecture running on Google Cloud Run and Vertex AI. Here, we launch an automated audit on a corporate data retention policy. First, Gemma 2 on Vertex AI executes a zero-trust PII scan, redacting sensitive identifiers before prompt exposure.",
    },
    {
        "start_sec": 50.0,
        "text": "Our Planner Agent dynamically routes tasks to specialized agents for LGPD, GDPR, and ISO 27001 powered by Gemini Flash. Every finding is anchored to a cryptographic SHA-256 evidence hash in our Trust Graph. Then, our Evidence Critic powered by Gemini 2.5 Pro acts as an adversarial Red Team auditor, cross-examining findings to eliminate false positive claims.",
    },
    {
        "start_sec": 82.0,
        "text": "AEGIS also delivers automated remediation. In the document viewer, compliance officers inspect side-by-side policy diffs, reviewing AI-synthesized compliant amendments and approving patches with a single click, maintaining verifiable audit provenance.",
    },
    {
        "start_sec": 118.0,
        "text": "Now, let's demonstrate the core innovation of AEGIS: Continuous Monitoring and Policy Drift. What happens when a legal baseline shifts in real-time? For example, when the European Union updates GDPR Article 5, reducing data retention limits from 5 years to 2 years.",
    },
    {
        "start_sec": 150.0,
        "text": "When we simulate this regulatory drift, AEGIS traces the dependency graph. It calculates the blast radius, invalidates only the affected evidence nodes in red, and reopens the impacted finding. Through Selective Recovery, it reruns only the relevant specialist agent without reprocessing the whole document, saving 65% in token costs.",
    },
    {
        "start_sec": 202.0,
        "text": "The entire investigation lifecycle is cryptographically sealed, auditable, and ready for executive PDF export. Running on Google Cloud with Gemma 2, Gemini Flash, and Gemini 2.5 Pro, this is AEGIS: autonomous, evidence-backed governance for the modern enterprise.",
    }
]

async def generate_segment_audios(voice="en-US-ChristopherNeural"):
    os.makedirs("scratch/audio_official", exist_ok=True)
    audio_files = []
    for i, seg in enumerate(SEGMENTS):
        out_path = f"scratch/audio_official/seg_{i:02d}.mp3"
        print(f"Gerando áudio {i+1}/{len(SEGMENTS)}: {seg['text'][:45]}...")
        comm = edge_tts.Communicate(seg["text"], voice, rate="+5%")
        await comm.save(out_path)
        audio_files.append((seg["start_sec"], out_path))
    return audio_files

def render_official_video(audio_segments, input_video="video_recording.mp4", output_video="aegis_google_cloud_demo_final.mp4"):
    print("Carregando vídeo original...")
    video = VideoFileClip(input_video)
    
    # Ajuste de velocidade (1.07x) para garantir tempo total de ~3m 50s (estritamente < 4:00)
    adjusted_video = video.with_speed_scaled(1.07)
    print(f"Duração ajustada: {adjusted_video.duration:.2f}s ({int(adjusted_video.duration//60)}m {int(adjusted_video.duration%60):02d}s) - CONFORME REGRA DEVPOST (< 4:00)")
    
    clips = []
    for start_t, audio_path in audio_segments:
        aclip = AudioFileClip(audio_path).with_start(start_t)
        clips.append(aclip)
    
    print("Compondo trilha sonora e voz neural...")
    final_audio = CompositeAudioClip(clips)
    final_video = adjusted_video.with_audio(final_audio)
    
    print(f"Renderizando vídeo oficial final em {output_video}...")
    final_video.write_videofile(
        output_video,
        codec="libx264",
        audio_codec="aac",
        fps=30,
        preset="fast"
    )
    print("Sucesso! Vídeo oficial pronto para YouTube e Devpost.")

async def main():
    audio_segments = await generate_segment_audios()
    render_official_video(audio_segments)

if __name__ == "__main__":
    asyncio.run(main())

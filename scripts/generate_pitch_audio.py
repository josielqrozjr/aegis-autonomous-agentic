"""
Gera o arquivo de áudio da narração do Pitch em inglês com voz neural de estúdio.
"""

import asyncio
import edge_tts
import os

SCRIPT_TEXT = """
Today, compliance is often treated like a snapshot. You review a policy once, generate findings, and assume the evidence will remain valid until the next audit. But in real-world regulated environments, that assumption breaks quickly.

A new regulation appears. An old policy clause is revised. A retention rule changes from 10 years to 5. Suddenly, the findings that were once valid are no longer reliable.

AEGIS addresses that problem.

We built an autonomous compliance intelligence platform that ingests policy documents, identifies relevant obligations across LGPD, GDPR, and ISO 27001, and routes work to specialized agents for privacy, security, and governance. Each finding is anchored to a verified evidence source, with provenance and a cryptographic content hash in our Trust Graph.

Then, when a legal baseline shifts, AEGIS traces the dependency graph. It finds which evidence nodes were influenced by the change, invalidates only the affected part of the graph, reopens the impacted findings, and selectively reruns just the relevant specialist path. That means the system reacts autonomously to regulatory drift without redoing the entire analysis.

We don’t just detect non-compliance. We detect when the underlying assumptions of the compliance decision have changed, and we recover the impacted decision path automatically. That is AEGIS: autonomous, evidence-backed governance for the modern enterprise.
"""

async def main():
    voice = "en-US-ChristopherNeural"
    output_file = os.path.join(os.path.dirname(__file__), "..", "pitch_narration.mp3")
    print(f"Gerando áudio com a voz {voice}...")
    communicate = edge_tts.Communicate(SCRIPT_TEXT, voice, rate="+2%")
    await communicate.save(output_file)
    print(f"Áudio gerado com sucesso: {output_file}")

if __name__ == "__main__":
    asyncio.run(main())

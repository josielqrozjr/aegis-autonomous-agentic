"""
Testes unitários para o CLI Demo Runner do AEGIS.
"""

import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from demo_runner import run_live_demo

@pytest.mark.asyncio
async def test_demo_runner_execution():
    result = await run_live_demo(auto_mode=True, step_delay=0.0)
    assert result["investigation_id"] == "inv-demo-2026"
    assert result["final_status"] == "reopened"
    assert result["drift_handled"] is True
    assert result["invalidated_nodes_count"] >= 1
    assert result["new_findings_count"] >= 1

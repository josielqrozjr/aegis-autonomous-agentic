"""Tests for regulatory change impact analysis."""

import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from aegis.schemas.contracts import (
    Investigation, Document, Finding, Evidence, RegulatoryChange,
)
from aegis.schemas.enums import InvestigationStatus, FindingSeverity, FindingStatus
from apps.api.app.application.regulatory.impact_analysis import analyze_impact


def _make_investigation(status=InvestigationStatus.COMPLETED):
    doc = Document(
        id="doc-1", filename="policy.txt", content_type="text/plain",
        storage_path="/tmp/policy.txt",
    )
    evidence = Evidence(
        id="ev-1", document_id="doc-1", page_number=3,
        quote="Data retained for 10 years", provenance="policy.txt p.3",
        confidence_score=0.9,
    )
    finding = Finding(
        id="f-1", investigation_id="inv-1", requirement_id="GDPR-ART-5-1-E",
        agent_id="agent-security-specialist", title="Retention exceeds limit",
        description="Policy retains data for 10 years",
        severity=FindingSeverity.HIGH, status=FindingStatus.CONFIRMED,
        evidences=[evidence],
    )
    return Investigation(
        id="inv-1", title="Retention Analysis", document=doc,
        status=status, findings=[finding],
    )


def _make_change():
    return RegulatoryChange(
        id="rc-1", framework="GDPR", version="2.0",
        change_description="Retention max reduced from 10 to 5 years",
        affected_requirements=["GDPR-ART-5-1-E"],
    )


@pytest.mark.anyio
async def test_impact_analysis_finds_affected():
    inv = _make_investigation()
    change = _make_change()
    result = await analyze_impact(change, [inv])

    assert "inv-1" in result.affected_investigations
    assert "f-1" in result.affected_findings
    assert "ev-1" in result.affected_evidence_ids
    assert result.invalidated_count == 1


@pytest.mark.anyio
async def test_impact_analysis_reopens_completed():
    inv = _make_investigation(InvestigationStatus.COMPLETED)
    change = _make_change()
    result = await analyze_impact(change, [inv])

    assert inv.status == InvestigationStatus.REOPENED
    assert "inv-1" in result.reopened_investigations


@pytest.mark.anyio
async def test_impact_analysis_reopens_findings():
    inv = _make_investigation()
    change = _make_change()
    await analyze_impact(change, [inv])

    assert inv.findings[0].status == FindingStatus.OPEN


@pytest.mark.anyio
async def test_impact_analysis_no_match():
    inv = _make_investigation()
    change = RegulatoryChange(
        id="rc-2", framework="LGPD", version="1.1",
        change_description="Unrelated change",
        affected_requirements=["LGPD-ART-99"],
    )
    result = await analyze_impact(change, [inv])
    assert len(result.affected_investigations) == 0
    assert inv.status == InvestigationStatus.COMPLETED  # unchanged


@pytest.mark.anyio
async def test_impact_analysis_running_not_reopened():
    inv = _make_investigation(InvestigationStatus.ANALYZING)
    change = _make_change()
    result = await analyze_impact(change, [inv])

    # Investigation is affected but not reopened (already active)
    assert "inv-1" in result.affected_investigations
    assert inv.status == InvestigationStatus.ANALYZING  # unchanged

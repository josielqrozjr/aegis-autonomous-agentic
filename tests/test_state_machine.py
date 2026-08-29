"""Tests for Investigation State Machine."""

import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from aegis.schemas.enums import InvestigationStatus
from apps.api.app.domain.investigation.state_machine import (
    can_transition,
    validate_transition,
    get_allowed_transitions,
    InvalidTransitionError,
)


# --- Valid transitions ---

def test_queued_to_understanding():
    assert can_transition(InvestigationStatus.QUEUED, InvestigationStatus.UNDERSTANDING)

def test_understanding_to_planning():
    assert can_transition(InvestigationStatus.UNDERSTANDING, InvestigationStatus.PLANNING)

def test_planning_to_routing():
    assert can_transition(InvestigationStatus.PLANNING, InvestigationStatus.ROUTING)

def test_routing_to_analyzing():
    assert can_transition(InvestigationStatus.ROUTING, InvestigationStatus.ANALYZING)

def test_analyzing_to_reviewing():
    assert can_transition(InvestigationStatus.ANALYZING, InvestigationStatus.REVIEWING)

def test_analyzing_to_completed():
    assert can_transition(InvestigationStatus.ANALYZING, InvestigationStatus.COMPLETED)

def test_reviewing_to_completed():
    assert can_transition(InvestigationStatus.REVIEWING, InvestigationStatus.COMPLETED)

def test_completed_to_reopened():
    assert can_transition(InvestigationStatus.COMPLETED, InvestigationStatus.REOPENED)

def test_reopened_to_analyzing():
    assert can_transition(InvestigationStatus.REOPENED, InvestigationStatus.ANALYZING)

def test_failed_to_queued():
    assert can_transition(InvestigationStatus.FAILED, InvestigationStatus.QUEUED)

# All states can go to FAILED except COMPLETED
def test_any_active_to_failed():
    active = [
        InvestigationStatus.QUEUED,
        InvestigationStatus.UNDERSTANDING,
        InvestigationStatus.PLANNING,
        InvestigationStatus.ROUTING,
        InvestigationStatus.ANALYZING,
        InvestigationStatus.REVIEWING,
        InvestigationStatus.REOPENED,
    ]
    for s in active:
        assert can_transition(s, InvestigationStatus.FAILED), f"{s} should be able to fail"


# --- Invalid transitions ---

def test_cannot_skip_understanding():
    assert not can_transition(InvestigationStatus.QUEUED, InvestigationStatus.PLANNING)

def test_cannot_go_back():
    assert not can_transition(InvestigationStatus.ANALYZING, InvestigationStatus.QUEUED)

def test_completed_cannot_go_to_analyzing():
    assert not can_transition(InvestigationStatus.COMPLETED, InvestigationStatus.ANALYZING)

def test_validate_raises():
    with pytest.raises(InvalidTransitionError):
        validate_transition(InvestigationStatus.QUEUED, InvestigationStatus.COMPLETED)


# --- Helper ---

def test_get_allowed_transitions():
    allowed = get_allowed_transitions(InvestigationStatus.QUEUED)
    assert InvestigationStatus.UNDERSTANDING in allowed
    assert InvestigationStatus.FAILED in allowed
    assert len(allowed) == 2

"""Investigation State Machine — explicit state transitions with failure states."""

from aegis.schemas.enums import InvestigationStatus


# Valid transitions: current_state -> set of allowed next states
VALID_TRANSITIONS: dict[InvestigationStatus, set[InvestigationStatus]] = {
    InvestigationStatus.QUEUED: {
        InvestigationStatus.UNDERSTANDING,
        InvestigationStatus.FAILED,
    },
    InvestigationStatus.UNDERSTANDING: {
        InvestigationStatus.PLANNING,
        InvestigationStatus.FAILED,
    },
    InvestigationStatus.PLANNING: {
        InvestigationStatus.ROUTING,
        InvestigationStatus.FAILED,
    },
    InvestigationStatus.ROUTING: {
        InvestigationStatus.ANALYZING,
        InvestigationStatus.FAILED,
    },
    InvestigationStatus.ANALYZING: {
        InvestigationStatus.REVIEWING,
        InvestigationStatus.COMPLETED,
        InvestigationStatus.FAILED,
    },
    InvestigationStatus.REVIEWING: {
        InvestigationStatus.COMPLETED,
        InvestigationStatus.FAILED,
    },
    InvestigationStatus.COMPLETED: {
        InvestigationStatus.REOPENED,
    },
    InvestigationStatus.FAILED: {
        InvestigationStatus.QUEUED,  # allow retry from scratch
    },
    InvestigationStatus.REOPENED: {
        InvestigationStatus.ANALYZING,
        InvestigationStatus.FAILED,
    },
}


class InvalidTransitionError(Exception):
    def __init__(self, current: InvestigationStatus, target: InvestigationStatus):
        self.current = current
        self.target = target
        super().__init__(f"Invalid transition: {current.value} → {target.value}")


def can_transition(current: InvestigationStatus, target: InvestigationStatus) -> bool:
    allowed = VALID_TRANSITIONS.get(current, set())
    return target in allowed


def validate_transition(current: InvestigationStatus, target: InvestigationStatus) -> None:
    if not can_transition(current, target):
        raise InvalidTransitionError(current, target)


def get_allowed_transitions(current: InvestigationStatus) -> list[InvestigationStatus]:
    return list(VALID_TRANSITIONS.get(current, set()))

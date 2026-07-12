from .cover import GoalCoverView
from .goals import GoalDetailView, GoalDiscoverView, GoalListCreateView
from .membership import GoalAcceptView, GoalDeclineView
from .proofs import GoalProofView, ProofReviewView

__all__ = [
    'GoalDetailView',
    'GoalDiscoverView',
    'GoalListCreateView',
    'GoalProofView',
    'ProofReviewView',
    'GoalAcceptView',
    'GoalDeclineView',
    'GoalCoverView',
]

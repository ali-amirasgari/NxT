from __future__ import annotations

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import GoalProof
from ..serializers import (
    GoalProofSerializer,
    ProofSubmitSerializer,
    ReviewInputSerializer,
)
from ..services import record_review, submit_proof
from .goals import goal_queryset_for


class GoalProofView(APIView):
    permission_classes = (IsAuthenticated,)

    def _goal_or_404(self, request, goal_id):
        return goal_queryset_for(request.user).filter(pk=goal_id).first()

    @extend_schema(tags=['Goals'], operation_id='goal_proof_list', summary='List proofs for a goal')
    def get(self, request, goal_id):
        goal = self._goal_or_404(request, goal_id)
        if goal is None:
            return Response({'detail': 'Goal not found.'}, status=status.HTTP_404_NOT_FOUND)
        proofs = goal.proofs.select_related('author').prefetch_related('reviews')
        return Response(
            {'proofs': GoalProofSerializer(proofs, many=True, context={'request': request}).data}
        )

    @extend_schema(
        tags=['Goals'],
        operation_id='goal_proof_submit',
        summary='Submit proof for a group goal',
        request=ProofSubmitSerializer,
        responses={201: GoalProofSerializer},
    )
    def post(self, request, goal_id):
        goal = self._goal_or_404(request, goal_id)
        if goal is None:
            return Response({'detail': 'Goal not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProofSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        proof = submit_proof(
            goal,
            request.user,
            media=serializer.validated_data['media'],
            note=serializer.validated_data.get('note', ''),
        )
        return Response(
            GoalProofSerializer(proof, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class ProofReviewView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=['Goals'],
        operation_id='goal_proof_review',
        summary='Vote on a group-goal proof',
        request=ReviewInputSerializer,
        responses={200: GoalProofSerializer},
    )
    def post(self, request, proof_id):
        proof = (
            GoalProof.objects.select_related('goal', 'author')
            .filter(pk=proof_id)
            .first()
        )
        if proof is None:
            return Response({'detail': 'Proof not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReviewInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = record_review(proof, request.user, serializer.validated_data['vote'])
        proof.refresh_from_db()
        return Response(
            {
                'proof': GoalProofSerializer(proof, context={'request': request}).data,
                'settled': result['settled'],
            }
        )

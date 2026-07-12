from __future__ import annotations

from rest_framework import serializers

from conf.media import public_media_url
from users.serializers import UserSerializer

from ..models import GoalProof, ProofReview


class ProofSubmitSerializer(serializers.Serializer):
    media = serializers.FileField()
    note = serializers.CharField(required=False, allow_blank=True, max_length=1000)


class ReviewInputSerializer(serializers.Serializer):
    vote = serializers.ChoiceField(choices=(ProofReview.Vote.APPROVE, ProofReview.Vote.REJECT))


class GoalProofSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    media_url = serializers.SerializerMethodField()
    approvals = serializers.SerializerMethodField()
    rejections = serializers.SerializerMethodField()

    class Meta:
        model = GoalProof
        fields = (
            'id',
            'goal_id',
            'author',
            'media_url',
            'note',
            'status',
            'approvals',
            'rejections',
            'created_at',
        )
        read_only_fields = fields

    def get_media_url(self, obj) -> str | None:
        return public_media_url(obj.media, self.context.get('request'))

    def get_approvals(self, obj) -> int:
        return obj.reviews.filter(vote=ProofReview.Vote.APPROVE).count()

    def get_rejections(self, obj) -> int:
        return obj.reviews.filter(vote=ProofReview.Vote.REJECT).count()

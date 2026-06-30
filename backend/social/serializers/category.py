from __future__ import annotations

from rest_framework import serializers

from social.models import Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            'id',
            'name',
            'slug',
            'description',
            'icon',
            'color',
            'order',
        )
        read_only_fields = fields


class CategoryListEnvelopeSerializer(serializers.Serializer):
    categories = CategorySerializer(many=True)

from __future__ import annotations

from rest_framework import serializers

from users.serializers import UserSerializer

from ..models import Event


class EventSerializer(serializers.ModelSerializer):
    host = UserSerializer(read_only=True)
    host_id = serializers.IntegerField(source='host.id', read_only=True)
    tag_label = serializers.CharField(source='get_tag_display', read_only=True)
    attendee_count = serializers.SerializerMethodField()
    is_attending = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = (
            'id',
            'host_id',
            'host',
            'title',
            'description',
            'tag',
            'tag_label',
            'status',
            'cover_color',
            'cover_image',
            'location',
            'starts_at',
            'ends_at',
            'attendee_count',
            'is_attending',
            'created_at',
            'updated_at',
        )
        read_only_fields = fields

    def get_attendee_count(self, obj) -> int:
        annotated = getattr(obj, 'attendee_count', None)
        if annotated is not None:
            return annotated
        return obj.attendees.count()

    def get_is_attending(self, obj) -> bool:
        annotated = getattr(obj, 'is_attending', None)
        if annotated is not None:
            return bool(annotated)
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return obj.attendees.filter(user_id=user.id).exists()


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = (
            'title',
            'description',
            'tag',
            'status',
            'cover_color',
            'cover_image',
            'location',
            'starts_at',
            'ends_at',
        )
        extra_kwargs = {
            'title': {'required': False},
            'starts_at': {'required': False},
        }

    def validate(self, attrs):
        if self.instance is None:
            if not attrs.get('title'):
                raise serializers.ValidationError({'title': 'This field is required.'})
            if not attrs.get('starts_at'):
                raise serializers.ValidationError({'starts_at': 'This field is required.'})

        ends_at = attrs.get('ends_at', getattr(self.instance, 'ends_at', None))
        starts_at = attrs.get('starts_at', getattr(self.instance, 'starts_at', None))
        if ends_at and starts_at and ends_at < starts_at:
            raise serializers.ValidationError({'ends_at': 'Must be after the start time.'})

        return attrs


class EventEnvelopeSerializer(serializers.Serializer):
    event = EventSerializer()


class EventListEnvelopeSerializer(serializers.Serializer):
    events = EventSerializer(many=True)


class EventRsvpResultSerializer(serializers.Serializer):
    created = serializers.BooleanField(required=False)
    removed = serializers.BooleanField(required=False)
    event = EventSerializer()

from django.contrib.auth.models import User
from django.db import transaction
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Check, CheckItem, Place


# User
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages) from exc
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        return user


# CheckItem
class CheckItemSerializer(serializers.ModelSerializer):
    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Цена не может быть отрицательной.")
        return value

    class Meta:
        model = CheckItem
        fields = ["id", "check_ref", "item_name", "price", "rating"]
        read_only_fields = ["check_ref"]


# Check
class CheckSerializer(serializers.ModelSerializer):
    items = CheckItemSerializer(many=True)
    total = serializers.ReadOnlyField()
    avg_rating = serializers.ReadOnlyField()

    class Meta:
        model = Check
        fields = ["id", "place", "user", "visited_at", "created_at", "comment", "total", "avg_rating", "items"]
        read_only_fields = ["user", "created_at"]

    def validate_place(self, place):
        request = self.context.get("request")
        if request is None or not request.user.is_authenticated or place.user_id != request.user.id:
            raise serializers.ValidationError("Место не найдено или недоступно.")
        return place

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        check = Check.objects.create(**validated_data)
        CheckItem.objects.bulk_create([CheckItem(check_ref=check, **item) for item in items_data])
        return check

    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        instance = super().update(instance, validated_data)
        if items_data is not None:
            instance.items.all().delete()
            CheckItem.objects.bulk_create([CheckItem(check_ref=instance, **item) for item in items_data])
        return instance


# Place
class PlaceSerializer(serializers.ModelSerializer):
    def validate_latitude(self, value):
        if not -90 <= value <= 90:
            raise serializers.ValidationError("Широта должна находиться в диапазоне от -90 до 90.")
        return value

    def validate_longitude(self, value):
        if not -180 <= value <= 180:
            raise serializers.ValidationError("Долгота должна находиться в диапазоне от -180 до 180.")
        return value

    avg_rating = serializers.ReadOnlyField()
    avg_price = serializers.ReadOnlyField()
    total_checks = serializers.ReadOnlyField()
    checks = CheckSerializer(many=True, read_only=True)

    class Meta:
        model = Place
        fields = [
            "id",
            "name",
            "address",
            "latitude",
            "longitude",
            "avg_rating",
            "avg_price",
            "total_checks",
            "checks",
            "user",
            "created_at",
        ]
        read_only_fields = ["user", "created_at"]

from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Check, CheckItem, Place


# User
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=4)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        return user


# CheckItem
class CheckItemSerializer(serializers.ModelSerializer):
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

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        check = Check.objects.create(**validated_data)
        for item_data in items_data:
            CheckItem.objects.create(check_ref=check, **item_data)
        return check


# Place
class PlaceSerializer(serializers.ModelSerializer):
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

from django.contrib.auth.models import User
from django.db import models
from django.db.models import QuerySet
from django.utils import timezone


class Place(models.Model):
    name: models.CharField = models.CharField(max_length=200)
    address: models.TextField = models.TextField(blank=True)
    latitude: models.FloatField = models.FloatField()
    longitude: models.FloatField = models.FloatField()
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    user: models.ForeignKey = models.ForeignKey(User, on_delete=models.CASCADE, related_name="places")
    checks: "QuerySet[Check]"

    @property
    def avg_rating(self):
        from django.db.models import Avg

        avg = CheckItem.objects.filter(check_ref__place=self).aggregate(Avg("rating"))["rating__avg"]
        return round(avg, 1) if avg is not None else None

    @property
    def avg_price(self):
        from django.db.models import Avg

        avg = CheckItem.objects.filter(check_ref__place=self).aggregate(Avg("price"))["price__avg"]
        return round(avg, 2) if avg is not None else None

    @property
    def total_checks(self) -> int:
        return self.checks.count()

    def __str__(self) -> str:
        return self.name


class Check(models.Model):
    place: models.ForeignKey = models.ForeignKey(Place, on_delete=models.CASCADE, related_name="checks")
    user: models.ForeignKey = models.ForeignKey(User, on_delete=models.CASCADE, related_name="checks")
    visited_at: models.DateField = models.DateField(default=timezone.now)
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    comment: models.TextField = models.TextField(blank=True)
    items: "QuerySet[CheckItem]"

    @property
    def total(self) -> float:
        return sum(item.price for item in self.items.all())

    @property
    def avg_rating(self) -> float | None:
        from django.db.models import Avg

        avg = self.items.aggregate(Avg("rating"))["rating__avg"]
        return round(avg, 1) if avg else None

    def __str__(self) -> str:
        return f"Check #{self.id} - {self.place.name} ({self.visited_at})"  # type: ignore[attr-defined]


class CheckItem(models.Model):
    check_ref: models.ForeignKey = models.ForeignKey(Check, on_delete=models.CASCADE, related_name="items")
    item_name: models.CharField = models.CharField(max_length=200)
    price: models.DecimalField = models.DecimalField(max_digits=10, decimal_places=2)
    rating: models.PositiveSmallIntegerField = models.PositiveSmallIntegerField(
        choices=[(i, i) for i in range(1, 6)], blank=True, null=True
    )

    def __str__(self):
        return f"{self.item_name} ({self.price:.2f} ₽)"

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Check, CheckItem, Place

# ============================================================
# МОДЕЛИ
# ============================================================


class PlaceModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.place = Place.objects.create(
            name="Test Place", address="123 Test St", latitude=55.7558, longitude=37.6173, user=self.user
        )

    def test_place_str(self):
        self.assertEqual(str(self.place), "Test Place")

    def test_avg_rating_empty(self):
        self.assertIsNone(self.place.avg_rating)

    def test_avg_price_empty(self):
        self.assertIsNone(self.place.avg_price)

    def test_total_checks_empty(self):
        self.assertEqual(self.place.total_checks, 0)

    def test_avg_rating_with_checks(self):
        check = Check.objects.create(place=self.place, user=self.user, visited_at="2026-08-27")
        CheckItem.objects.create(check_ref=check, item_name="Coffee", price=150, rating=5)
        CheckItem.objects.create(check_ref=check, item_name="Cake", price=200, rating=4)

        self.assertEqual(self.place.avg_rating, 4.5)
        self.assertEqual(self.place.avg_price, 175.0)

    def test_total_checks_with_checks(self):
        Check.objects.create(place=self.place, user=self.user, visited_at="2026-08-27")
        Check.objects.create(place=self.place, user=self.user, visited_at="2026-08-28")
        self.assertEqual(self.place.total_checks, 2)


class CheckModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.place = Place.objects.create(name="Test Place", latitude=55.7558, longitude=37.6173, user=self.user)
        self.check = Check.objects.create(
            place=self.place, user=self.user, visited_at="2026-08-27", comment="Great place!"
        )

    def test_check_str(self):
        expected = f"Check #{self.check.id} - Test Place (2026-08-27)"
        self.assertEqual(str(self.check), expected)

    def test_check_total_empty(self):
        self.assertEqual(self.check.total, 0)

    def test_check_avg_rating_empty(self):
        self.assertIsNone(self.check.avg_rating)

    def test_check_total_with_items(self):
        CheckItem.objects.create(check_ref=self.check, item_name="Coffee", price=150, rating=5)
        CheckItem.objects.create(check_ref=self.check, item_name="Cake", price=200, rating=4)
        self.assertEqual(self.check.total, 350.0)

    def test_check_avg_rating_with_items(self):
        CheckItem.objects.create(check_ref=self.check, item_name="Coffee", price=150, rating=5)
        CheckItem.objects.create(check_ref=self.check, item_name="Cake", price=200, rating=4)
        self.assertEqual(self.check.avg_rating, 4.5)


class CheckItemModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.place = Place.objects.create(name="Test Place", latitude=55.7558, longitude=37.6173, user=self.user)
        self.check = Check.objects.create(place=self.place, user=self.user, visited_at="2026-08-27")
        self.item = CheckItem.objects.create(check_ref=self.check, item_name="Coffee", price=150.00, rating=5)

    def test_check_item_str(self):
        self.assertEqual(str(self.item), "Coffee (150.00 ₽)")


# ============================================================
# API — МЕСТА (PLACE)
# ============================================================


class PlaceAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client.force_authenticate(user=self.user)
        self.place_data = {"name": "New Place", "address": "456 Test Ave", "latitude": 55.7558, "longitude": 37.6173}
        self.place = Place.objects.create(name="Existing Place", latitude=55.7558, longitude=37.6173, user=self.user)

    def test_create_place_authenticated(self):
        response = self.client.post("/api/places/", self.place_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "New Place")
        self.assertEqual(response.data["user"], self.user.id)

    def test_create_place_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post("/api/places/", self.place_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_places(self):
        response = self.client.get("/api/places/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Existing Place")

    def test_list_places_another_user(self):
        other_user = User.objects.create_user(username="other", password="testpass")
        Place.objects.create(name="Other Place", latitude=55.7558, longitude=37.6173, user=other_user)
        response = self.client.get("/api/places/")
        self.assertEqual(len(response.data), 1)  # Только своё место

    def test_retrieve_place(self):
        response = self.client.get(f"/api/places/{self.place.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Existing Place")

    def test_update_place(self):
        response = self.client.patch(f"/api/places/{self.place.id}/", {"name": "Updated Name"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.place.refresh_from_db()
        self.assertEqual(self.place.name, "Updated Name")

    def test_delete_place(self):
        response = self.client.delete(f"/api/places/{self.place.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Place.objects.count(), 0)

    def test_delete_place_another_user(self):
        other_user = User.objects.create_user(username="other", password="testpass")
        other_place = Place.objects.create(name="Other Place", latitude=55.7558, longitude=37.6173, user=other_user)
        response = self.client.delete(f"/api/places/{other_place.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# ============================================================
# API — ЧЕКИ (CHECK)
# ============================================================


class CheckAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client.force_authenticate(user=self.user)
        self.place = Place.objects.create(name="Test Place", latitude=55.7558, longitude=37.6173, user=self.user)
        self.check_data = {
            "place": self.place.id,
            "visited_at": "2026-08-27",
            "comment": "Great place!",
            "items": [{"item_name": "Coffee", "price": 150, "rating": 5}],
        }

    def test_create_check(self):
        response = self.client.post("/api/checks/", self.check_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Check.objects.count(), 1)
        self.assertEqual(CheckItem.objects.count(), 1)

    def test_create_check_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post("/api/checks/", self.check_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_check_without_items(self):
        data = {"place": self.place.id, "visited_at": "2026-08-27"}
        response = self.client.post("/api/checks/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_checks(self):
        Check.objects.create(place=self.place, user=self.user, visited_at="2026-08-27")
        response = self.client.get(f"/api/checks/?place={self.place.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_filter_checks_by_place(self):
        place2 = Place.objects.create(name="Place 2", latitude=55.7558, longitude=37.6173, user=self.user)
        Check.objects.create(place=self.place, user=self.user, visited_at="2026-08-27")
        Check.objects.create(place=place2, user=self.user, visited_at="2026-08-28")
        response = self.client.get(f"/api/checks/?place={self.place.id}")
        self.assertEqual(len(response.data), 1)

    def test_update_check(self):
        check = Check.objects.create(place=self.place, user=self.user, visited_at="2026-08-27")
        response = self.client.patch(f"/api/checks/{check.id}/", {"comment": "Updated comment"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        check.refresh_from_db()
        self.assertEqual(check.comment, "Updated comment")

    def test_delete_check(self):
        check = Check.objects.create(place=self.place, user=self.user, visited_at="2026-08-27")
        response = self.client.delete(f"/api/checks/{check.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Check.objects.count(), 0)


# ============================================================
# API — ПОЗИЦИИ ЧЕКА (CHECK ITEM)
# ============================================================


class CheckItemAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client.force_authenticate(user=self.user)
        self.place = Place.objects.create(name="Test Place", latitude=55.7558, longitude=37.6173, user=self.user)
        self.check = Check.objects.create(place=self.place, user=self.user, visited_at="2026-08-27")

    def test_add_item_to_check(self):
        data = {"item_name": "Tea", "price": 100, "rating": 5}
        response = self.client.post(f"/api/checks/{self.check.id}/add_item/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CheckItem.objects.count(), 1)

    def test_add_item_invalid_data(self):
        data = {"price": 100}  # Без item_name
        response = self.client.post(f"/api/checks/{self.check.id}/add_item/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_item(self):
        item = CheckItem.objects.create(check_ref=self.check, item_name="Coffee", price=150, rating=5)
        response = self.client.delete(f"/api/check-items/{item.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CheckItem.objects.count(), 0)

    def test_update_item(self):
        item = CheckItem.objects.create(check_ref=self.check, item_name="Coffee", price=150, rating=5)
        response = self.client.patch(f"/api/check-items/{item.id}/", {"price": 200})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item.refresh_from_db()
        self.assertEqual(item.price, 200)


# ============================================================
# АВТОРИЗАЦИЯ
# ============================================================


class AuthAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.place = Place.objects.create(name="Test Place", latitude=55.7558, longitude=37.6173, user=self.user)

    def test_login(self):
        response = self.client.post("/api/token/", {"username": "testuser", "password": "testpass"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_invalid_password(self):
        response = self.client.post("/api/token/", {"username": "testuser", "password": "wrongpass"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_current_user(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/user/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "testuser")

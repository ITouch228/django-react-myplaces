from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from places.views import CheckItemViewSet, CheckViewSet, CurrentUserView, PlaceViewSet, RegisterUserView

router = DefaultRouter()
router.register(r"places", PlaceViewSet, basename="place")
router.register(r"checks", CheckViewSet, basename="check")
router.register(r"check-items", CheckItemViewSet, basename="checkitem")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/user/", CurrentUserView.as_view(), name="current_user"),
    path("api/register/", RegisterUserView.as_view(), name="register"),
    path("api/", include(router.urls)),
]

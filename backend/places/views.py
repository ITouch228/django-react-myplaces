from django_filters.rest_framework import DjangoFilterBackend
from geopy.distance import distance
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import APIView, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Check, CheckItem, Place
from .serializers import CheckItemSerializer, CheckSerializer, PlaceSerializer, UserSerializer


# Users
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }
        )


class RegisterUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


# Places
class PlaceViewSet(viewsets.ModelViewSet):
    serializer_class = PlaceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "address"]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Place.objects.filter(user=self.request.user)
        return Place.objects.none()

    @action(detail=False, methods=["get"])
    def nearby(self, request):
        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")
        radius = request.query_params.get("radius", 5)

        if not lat or not lng:
            return Response({"error": "lat и lng обязательны"}, status=400)

        try:
            lat, lng, radius = float(lat), float(lng), float(radius)
        except ValueError:
            return Response({"error": "Неверный формат координат"}, status=400)

        user_loc = (lat, lng)
        places = self.get_queryset()

        result = []
        for place in places:
            place_loc = (place.latitude, place.longitude)
            dist = distance(user_loc, place_loc).km
            if dist <= radius:
                place.distance = round(dist, 2)
                result.append(place)

        result.sort(key=lambda p: p.distance)
        serializer = self.get_serializer(result, many=True)
        data = serializer.data
        for item, place in zip(data, result, strict=True):
            item["distance"] = place.distance

        return Response(data)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Checks
class CheckViewSet(viewsets.ModelViewSet):
    serializer_class = CheckSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["place"]

    def get_queryset(self):
        return Check.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def add_item(self, request, pk=None):
        check = self.get_object()
        serializer = CheckItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(check_ref=check)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# CheckItem
class CheckItemViewSet(viewsets.ModelViewSet):
    serializer_class = CheckItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CheckItem.objects.filter(check_ref__user=self.request.user)

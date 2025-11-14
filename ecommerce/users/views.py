from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .serializers import CustomTokenObtainPairSerializer, RegisterSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from products.models import Carts
from products.serializers import CartSerializer

User = get_user_model()

class UsersViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing users.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
    @action(detail=True, methods=['get'])
    def cart(self, request, pk=None):
        """Get or create user's cart"""
        user = self.get_object()
        cart, created = Carts.objects.get_or_create(user=user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
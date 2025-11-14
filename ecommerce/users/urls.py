# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import UsersViewSet

# router = DefaultRouter()
# router.register(r'', UsersViewSet, basename='users')

# urlpatterns = [
#     path('', include(router.urls)),
# ]
from django.urls import path
from .views import UsersViewSet, CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', UsersViewSet.as_view({'post': 'create'}), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
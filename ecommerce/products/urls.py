from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductsViewSet, CartsViewSet, CartItemsViewSet, CheckoutsViewSet, CheckoutItemsViewSet

router = DefaultRouter()
router.register(r'products', ProductsViewSet, basename='products')
router.register(r'carts', CartsViewSet, basename='carts')
router.register(r'cart-items', CartItemsViewSet, basename='cart-items')
router.register(r'checkouts', CheckoutsViewSet, basename='checkouts')
router.register(r'checkout-items', CheckoutItemsViewSet, basename='checkout-items')

urlpatterns = [
    path('', include(router.urls)),
]

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Products, Carts, CartItems, Checkouts, CheckoutItems
from .serializers import (
    ProductsSerializer,
    CartSerializer,
    CartItemSerializer,
    CheckoutSerializer,
    CheckoutItemSerializer
)


class ProductsViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing products.
    """
    queryset = Products.objects.all()
    serializer_class = ProductsSerializer
    permission_classes = [AllowAny]


class CartsViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing carts.
    """
    queryset = Carts.objects.all()
    serializer_class = CartSerializer
    permission_classes = [AllowAny]
    
    def retrieve(self, request, pk=None):
        """Override retrieve to search by user_id instead of cart id"""
        try:
            carts = Carts.objects.filter(user_id=pk).order_by('-created_at')
            cart = None
            for existing_cart in carts:
                if not Checkouts.objects.filter(cart=existing_cart).exists():
                    cart = existing_cart
                    break

            if not cart:
                cart = Carts.objects.create(user_id=pk)

            serializer = self.get_serializer(cart)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        """Add item to cart"""
        cart = self.get_object()
        product_id = request.data.get('product')
        quantity = request.data.get('quantity', 1)
        
        if not product_id:
            return Response(
                {'error': 'Product ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cart_item, created = CartItems.objects.get_or_create(
            cart=cart,
            product_id=product_id,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += int(quantity)
            cart_item.save()
        
        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'])
    def clear(self, request, pk=None):
        """Clear all items from cart"""
        cart = self.get_object()
        cart.cartitems_set.all().delete()
        return Response(
            {'message': 'Cart cleared successfully'},
            status=status.HTTP_204_NO_CONTENT
        )


class CartItemsViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing cart items.
    """
    queryset = CartItems.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        """Add item to cart, create cart if not exists"""
        # Get user_id from request data, or try to get from authenticated user
        user_id = request.data.get('user_id')
        
        # If no user_id provided and user is authenticated, use authenticated user's ID
        if not user_id and request.user and request.user.is_authenticated:
            user_id = request.user.id
        
        product_id = request.data.get('product')
        quantity = request.data.get('quantity', 1)
        
        if not user_id:
            return Response(
                {'error': 'User ID is required. Please provide user_id in request or login first.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not product_id:
            return Response(
                {'error': 'Product ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate that user exists
        from users.models import CustomUser
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response(
                {'error': f'User with ID {user_id} does not exist. Please check the user ID.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate that product exists
        try:
            product = Products.objects.get(id=product_id)
        except Products.DoesNotExist:
            return Response(
                {'error': f'Product with ID {product_id} does not exist. Please check the product ID.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create the latest cart without checkout for this user
        carts = Carts.objects.filter(user_id=user_id).order_by('-created_at')
        cart = None
        for existing_cart in carts:
            if not Checkouts.objects.filter(cart=existing_cart).exists():
                cart = existing_cart
                break

        if not cart:
            cart = Carts.objects.create(user_id=user_id)
            created = True
        else:
            created = False
        
        # Get or create cart item
        cart_item, item_created = CartItems.objects.get_or_create(
            cart=cart,
            product_id=product_id,
            defaults={'quantity': quantity}
        )
        
        # If item already exists, update quantity
        if not item_created:
            cart_item.quantity += int(quantity)
            cart_item.save()
        
        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CheckoutsViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing checkouts.
    """
    queryset = Checkouts.objects.all()
    serializer_class = CheckoutSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        """Override create to auto-calculate total and copy cart items"""
        cart_id = request.data.get('cart')
        
        if not cart_id:
            return Response(
                {'error': 'Cart ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cart = Carts.objects.get(id=cart_id)
        except Carts.DoesNotExist:
            return Response(
                {'error': 'Cart not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        if Checkouts.objects.filter(cart=cart).exists():
            return Response(
                {'error': 'This cart has already been checked out. Please use a fresh cart.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate total amount automatically
        total_amount = sum(
            item.product.price * item.quantity 
            for item in cart.cartitems_set.all()
        )
        
        # Create checkout
        checkout = Checkouts.objects.create(
            cart=cart,
            total_amount=total_amount
        )
        
        # Copy cart items to checkout items
        for cart_item in cart.cartitems_set.all():
            CheckoutItems.objects.create(
                checkout=checkout,
                product=cart_item.product,
                quantity=cart_item.quantity
            )

        # Clear cart items after checkout
        cart.cartitems_set.all().delete()

        # Ensure user has a fresh cart available for next purchase
        Carts.objects.create(user=cart.user)
        
        serializer = self.get_serializer(checkout)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def history(self, request, user_id=None):
        """Return all checkouts for a specific user"""
        if not user_id:
            return Response(
                {'error': 'User ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        checkouts = self.queryset.filter(
            cart__user_id=user_id
        ).order_by('-checkout_date')

        serializer = self.get_serializer(checkouts, many=True)
        return Response(serializer.data)


class CheckoutItemsViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing checkout items.
    """
    queryset = CheckoutItems.objects.all()
    serializer_class = CheckoutItemSerializer
    permission_classes = [AllowAny]
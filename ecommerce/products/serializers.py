from rest_framework import serializers
from .models import Products, Carts, CartItems, Checkouts, CheckoutItems


class ProductsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Products
        fields = ['id', 'product_name', 'description', 'price', 'stock', 'created_at', 'seller']
        read_only_fields = ['created_at']

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Product stock cannot be negative")
        return value


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    total_price = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(write_only=True, required=False, help_text="User ID (check /api/users/ for valid IDs)")

    class Meta:
        model = CartItems
        fields = ['id', 'cart', 'product', 'product_name', 'product_price', 'quantity', 'total_price', 'user_id']
        extra_kwargs = {
            'cart': {'required': False, 'read_only': True}
        }

    def get_total_price(self, obj):
        return obj.product.price * obj.quantity

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True, source='cartitems_set')
    total_items = serializers.SerializerMethodField()
    cart_total = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Carts
        fields = ['id', 'user', 'username', 'created_at', 'items', 'total_items', 'cart_total']
        read_only_fields = ['created_at']

    def get_total_items(self, obj):
        return obj.cartitems_set.count()

    def get_cart_total(self, obj):
        total = sum(item.product.price * item.quantity for item in obj.cartitems_set.all())
        return total


class CheckoutItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CheckoutItems
        fields = ['id', 'checkout', 'product', 'product_name', 'product_price', 'quantity', 'total_price']

    def get_total_price(self, obj):
        return obj.product.price * obj.quantity


class CheckoutSerializer(serializers.ModelSerializer):
    items = CheckoutItemSerializer(many=True, read_only=True, source='checkoutitems_set')
    username = serializers.CharField(source='cart.user.username', read_only=True)
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Checkouts
        fields = ['id', 'cart', 'username', 'total_amount', 'checkout_date', 'items', 'total_items']
        read_only_fields = ['checkout_date']

    def get_total_items(self, obj):
        return obj.checkoutitems_set.count()

    def validate_total_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Total amount must be greater than 0")
        return value

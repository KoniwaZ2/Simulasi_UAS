from django.contrib import admin
from .models import Products, Carts, CartItems, Checkouts, CheckoutItems


class ProductsAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'price', 'stock', 'created_at', 'seller')
    search_fields = ('product_name', 'description')
    list_filter = ('created_at',)
    ordering = ('-created_at',)


class CartItemsInline(admin.TabularInline):
    model = CartItems
    extra = 1


class CartsAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created_at')
    search_fields = ('user__email', 'user__username')
    list_filter = ('created_at',)
    inlines = [CartItemsInline]


class CartItemsAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product', 'quantity')
    search_fields = ('cart__user__email', 'product__product_name')
    list_filter = ('cart',)


class CheckoutItemsInline(admin.TabularInline):
    model = CheckoutItems
    extra = 0


class CheckoutsAdmin(admin.ModelAdmin):
    list_display = ('id', 'cart', 'total_amount', 'checkout_date')
    search_fields = ('cart__user__email',)
    list_filter = ('checkout_date',)
    inlines = [CheckoutItemsInline]


class CheckoutItemsAdmin(admin.ModelAdmin):
    list_display = ('checkout_id', 'product', 'quantity')
    search_fields = ('checkout_id__id', 'product__product_name')


admin.site.register(Products, ProductsAdmin)
admin.site.register(Carts, CartsAdmin)
admin.site.register(CartItems, CartItemsAdmin)
admin.site.register(Checkouts, CheckoutsAdmin)
admin.site.register(CheckoutItems, CheckoutItemsAdmin)
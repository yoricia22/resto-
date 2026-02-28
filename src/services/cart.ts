import { reactive, computed } from 'vue';
import { MenuItem } from './admin';

export interface CartItem extends MenuItem {
    quantity: number;
    notes?: string;
}

const state = reactive({
    items: [] as CartItem[],
});

const cartService = {
    items: computed(() => state.items),

    totalItems: computed(() => state.items.reduce((sum, item) => sum + item.quantity, 0)),

    totalPrice: computed(() => state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)),

    addToCart(product: MenuItem, quantity = 1, notes = '') {
        const existingItem = state.items.find(item => item.id === product.id && item.notes === notes);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            state.items.push({ ...product, quantity, notes });
        }
    },

    removeFromCart(productId: number, notes = '') {
        const index = state.items.findIndex(item => item.id === productId && item.notes === notes);
        if (index > -1) {
            state.items.splice(index, 1);
        }
    },

    updateQuantity(productId: number, quantity: number, notes = '') {
        const item = state.items.find(item => item.id === productId && item.notes === notes);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId, notes);
            } else {
                item.quantity = quantity;
            }
        }
    },

    clearCart() {
        state.items = [];
    }
};

export default cartService;

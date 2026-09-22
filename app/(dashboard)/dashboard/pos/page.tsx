"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Cart, CartItem } from "@/components/pos/Cart";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const [{ data: productRows }, { data: categoryRows }] = await Promise.all([
        supabase.from("products").select("id, category_id, name, price, stock, image_url").eq("is_active", true).order("name"),
        supabase.from("product_categories").select("id, name").order("name"),
      ]);
      setProducts(productRows || []);
      setCategories([{ id: "all", name: "Semua" }, ...(categoryRows || [])]);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory;
    const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: any) => {
    setCartItems((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) return items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...items, { id: product.id, name: product.name, price: Number(product.price), quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return setCartItems((items) => items.filter((item) => item.id !== id));
    setCartItems((items) => items.map((item) => item.id === id ? { ...item, quantity } : item));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" /></div>;
  }

  return (
    <>
      <div className="flex h-[calc(100vh-8rem)] gap-6">
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg border-2 border-slate-200 bg-white shadow-md">
          <div className="border-b border-slate-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari produk..." className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${selectedCategory === category.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700"}`}>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <button key={product.id} onClick={() => handleAddToCart(product)} className="group rounded-lg border-2 border-slate-200 p-4 text-left transition-all hover:border-blue-500 hover:shadow-md">
                  <div className="mb-3 aspect-square w-full rounded-lg bg-gray-100" />
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600">{product.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-blue-600">{formatCurrency(product.price)}</p>
                  <p className="mt-1 text-xs text-gray-500">Stock: {product.stock}</p>
                </button>
              ))}
            </div>
            {filteredProducts.length === 0 && <div className="flex h-full items-center justify-center text-gray-500">Produk tidak ditemukan</div>}
          </div>
        </div>

        <div className="w-96 overflow-hidden rounded-lg border-2 border-black bg-white shadow-md">
          <Cart items={cartItems} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={(id) => setCartItems((items) => items.filter((item) => item.id !== id))} onCheckout={() => setIsPaymentOpen(true)} />
        </div>
      </div>

      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} items={cartItems} total={total} />
    </>
  );
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Package, ShoppingCart, Loader2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string; name: string; sku: string; price: number; unit: string
  image: string | null; category: string; totalStock: number; uom: string
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [cart, setCart] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(json => {
      if (json.data) setProducts(json.data)
    }).finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem("b2b_cart")
      if (saved) setCart(JSON.parse(saved))
    } catch {}
  }, [])

  const addToCart = (productId: string) => {
    const newCart = { ...cart, [productId]: (cart[productId] || 0) + 1 }
    setCart(newCart)
    localStorage.setItem("b2b_cart", JSON.stringify(newCart))
  }

  const filtered = products.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  })

  const categories = [...new Set(products.map(p => p.category))]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 mb-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">B2B Wholesale Store</h1>
        <p className="text-blue-100 text-lg mb-6 max-w-2xl">
          Pesan produk grosir untuk bisnis Anda. Harga kompetitif dengan fasilitas tempo pembayaran.
        </p>
        <div className="flex items-center gap-2 text-blue-100 text-sm">
          <Star className="h-4 w-4 fill-current" />
          <span>B2B pricing · Net payment terms · Fast delivery</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 text-blue-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">Produk tidak ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200 group">
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="h-16 w-16 text-gray-300" />
                )}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <Badge variant="outline" className="text-[10px] mb-1">{product.category}</Badge>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{product.sku}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}<span className="text-xs font-normal text-gray-400">/{product.uom}</span></p>
                  <p className={`text-xs font-medium ${product.totalStock > 0 ? "text-green-600" : "text-red-600"}`}>
                    {product.totalStock > 0 ? `${product.totalStock} tersedia` : "Habis"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/products/${product.sku}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">Detail</Button>
                  </Link>
                  <Button size="sm" className="flex items-center gap-1 text-xs" onClick={() => addToCart(product.id)} disabled={product.totalStock <= 0}>
                    <ShoppingCart className="h-3 w-3" /> +Keranjang
                  </Button>
                </div>
                {cart[product.id] && (
                  <div className="bg-blue-50 rounded-lg p-2 text-center text-xs font-medium text-blue-700">{cart[product.id]} di keranjang</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

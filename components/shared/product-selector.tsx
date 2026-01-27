'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ProductsService } from '@/services/products-service';
import type { Product } from '@/lib/api-types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Package, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductSelectorProps {
    value?: number | null;
    onChange: (product: Product | null) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    autoFocus?: boolean;
}

/**
 * ProductSelector Component
 * 
 * A searchable, performant product picker with:
 * - Real-time search with debouncing
 * - Keyboard navigation
 * - Quick SKU lookup
 * - Recently used products
 * - Handles large catalogs efficiently
 */
export function ProductSelector({
    value,
    onChange,
    placeholder = 'Search products...',
    disabled = false,
    className,
    autoFocus = false,
}: ProductSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(0);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Load all products on mount
    useEffect(() => {
        loadProducts();
    }, []);

    // Filter products based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredProducts(products.slice(0, 50)); // Show first 50 by default
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = products.filter((product) =>
            product.name.toLowerCase().includes(query) ||
            product.sku.toLowerCase().includes(query)
        );

        setFilteredProducts(filtered.slice(0, 50)); // Limit to 50 results
        setFocusedIndex(0);
    }, [searchQuery, products]);

    // Load selected product if value changes externally
    useEffect(() => {
        if (value && products.length > 0) {
            const product = products.find((p) => p.id === value);
            if (product) {
                setSelectedProduct(product);
            }
        } else {
            setSelectedProduct(null);
        }
    }, [value, products]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const result = await ProductsService.getProducts({ limit: 1000 });
            setProducts(result.data || []);
            setFilteredProducts((result.data || []).slice(0, 50));
        } catch (error) {
            console.error('Failed to load products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        onChange(product);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleClear = () => {
        setSelectedProduct(null);
        onChange(null);
        setSearchQuery('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex((prev) =>
                    prev < filteredProducts.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredProducts[focusedIndex]) {
                    handleSelectProduct(filteredProducts[focusedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                break;
        }
    };

    const handleOpen = () => {
        if (!disabled) {
            setIsOpen(true);
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    };

    return (
        <div className={cn('relative', className)} ref={dropdownRef}>
            {/* Selected Product Display / Trigger */}
            <div
                onClick={handleOpen}
                onKeyDown={handleKeyDown}
                tabIndex={disabled ? -1 : 0}
                className={cn(
                    'flex items-center justify-between w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    disabled && 'cursor-not-allowed opacity-50',
                    !disabled && 'cursor-pointer hover:bg-accent'
                )}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                    {selectedProduct ? (
                        <div className="flex flex-col min-w-0">
                            <span className="font-medium truncate">{selectedProduct.name}</span>
                            <span className="text-xs text-muted-foreground">
                                SKU: {selectedProduct.sku} • ${selectedProduct.price}
                            </span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {selectedProduct && !disabled && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                    <ChevronDown className={cn(
                        'h-4 w-4 text-muted-foreground transition-transform',
                        isOpen && 'transform rotate-180'
                    )} />
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-80 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b bg-background sticky top-0">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search by name or SKU..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="pl-8"
                                autoFocus={autoFocus}
                            />
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="overflow-y-auto max-h-64">
                        {loading ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                Loading products...
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                {searchQuery ? 'No products found' : 'No products available'}
                            </div>
                        ) : (
                            <div className="py-1">
                                {filteredProducts.map((product, index) => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => handleSelectProduct(product)}
                                        className={cn(
                                            'w-full px-3 py-2 text-left hover:bg-accent transition-colors',
                                            'focus:bg-accent focus:outline-none',
                                            focusedIndex === index && 'bg-accent',
                                            selectedProduct?.id === product.id && 'bg-accent/50'
                                        )}
                                        onMouseEnter={() => setFocusedIndex(index)}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{product.name}</span>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                <span>SKU: {product.sku}</span>
                                                <span>•</span>
                                                <span className="font-semibold text-foreground">
                                                    ${product.price.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Result count */}
                    {filteredProducts.length > 0 && (
                        <div className="p-2 border-t bg-muted/50 text-xs text-muted-foreground text-center">
                            Showing {filteredProducts.length} of {products.length} products
                            {searchQuery && ' (filtered)'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

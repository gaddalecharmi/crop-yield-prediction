import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './ShopDashboard.css';

function ShopDashboard() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('categories'); // categories, products, product-detail, cart, checkout
  const [userDetails, setUserDetails] = useState({
    name: '',
    phone: '',
    aadharNumber: '',
    state: ''
  });
  const [subsidyInfo, setSubsidyInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // NEW: For form validation errors

  // NEW: Validation functions
  const validatePhone = (phone) => {
    // Remove any spaces or dashes
    const cleanPhone = phone.replace(/[\s-]/g, '');
    // Check if it's exactly 10 digits and starts with 6, 7, 8, or 9
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(cleanPhone);
  };

  const validateAadhar = (aadhar) => {
    // Remove any spaces
    const cleanAadhar = aadhar.replace(/\s/g, '');
    // Check if it's exactly 12 digits
    const aadharRegex = /^\d{12}$/;
    return aadharRegex.test(cleanAadhar);
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!userDetails.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (userDetails.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    // Phone validation
    if (!userDetails.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(userDetails.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number (starting with 6, 7, 8, or 9)';
    }

    // State validation
    if (!userDetails.state) {
      newErrors.state = 'Please select a state';
    }

    // Aadhar validation (optional but if provided must be valid)
    if (userDetails.aadharNumber && !validateAadhar(userDetails.aadharNumber)) {
      newErrors.aadharNumber = 'Aadhar must be exactly 12 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    fetchCategories();
    loadCart();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/shop/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async (category) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/shop/products', {
        params: { category }
      });
      setProducts(response.data);
      setSelectedCategory(category);
      setView('products');
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewProductDetail = async (productId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/shop/products/${productId}`);
      setSelectedProduct(response.data);
      setView('product-detail');
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.product._id === product._id);
    let newCart;
    
    if (existingItem) {
      newCart = cart.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [...cart, { product, quantity }];
    }
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    alert('✅ Added to cart successfully!');
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.product._id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const totalSubsidy = cart.reduce((sum, item) => {
      if (item.product.governmentSubsidyEligible && userDetails.aadharNumber) {
        return sum + ((item.product.price * item.quantity * item.product.subsidyPercentage) / 100);
      }
      return sum;
    }, 0);
    const shippingCharges = subtotal > 1000 ? 0 : 50;
    const totalAmount = subtotal - totalSubsidy + shippingCharges;
    
    return { subtotal, totalSubsidy, shippingCharges, totalAmount };
  };

  const checkSubsidyEligibility = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/subsidy/check-eligibility', userDetails);
      setSubsidyInfo(response.data);
    } catch (error) {
      console.error('Error checking eligibility:', error);
    }
  };

  const proceedToPayment = async () => {
    // Validate form before proceeding
    if (!validateForm()) {
      alert('❌ Please fix the errors in the form before proceeding');
      return;
    }

    const totals = calculateTotals();
    
    try {
      // Create order
      const orderData = {
        userDetails,
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        })),
        shippingCharges: totals.shippingCharges,
        shippingAddress: {
          state: userDetails.state
        },
        paymentMethod: 'RAZORPAY'
      };

      const orderResponse = await axios.post('http://localhost:5000/api/payment/orders', orderData);
      const order = orderResponse.data;

      // Create Razorpay order
      const razorpayResponse = await axios.post('http://localhost:5000/api/payment/create-order', {
        amount: totals.totalAmount,
        receipt: order.orderNumber
      });

      const options = {
        key: 'your_razorpay_key_id', // Replace with actual key from backend
        amount: razorpayResponse.data.amount,
        currency: 'INR',
        name: 'Crop Yield Prediction',
        description: 'Purchase of agricultural products',
        order_id: razorpayResponse.data.id,
        handler: async function (response) {
          // Verify payment
          await axios.post('http://localhost:5000/api/payment/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: order._id
          });
          
          alert('✅ Payment successful! Your order has been placed.');
          setCart([]);
          localStorage.removeItem('cart');
          setView('categories');
        },
        prefill: {
          name: userDetails.name,
          contact: userDetails.phone
        },
        theme: {
          color: '#2c5f2d'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('❌ Payment failed');
    }
  };

  if (view === 'cart') {
    const totals = calculateTotals();
    
    return (
      <div className="shop-dashboard">
        <button className="back-button" onClick={() => setView('categories')}>
          ← {t('learning.goBack')}
        </button>
        <div className="cart-container">
          <h2>🛒 {t('shop.cart')}</h2>
          
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>😔 {t('shop.emptyCart')}</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.product._id} className="cart-item">
                    <div className="cart-item-details">
                      <h3>{item.product.name}</h3>
                      <p>₹{item.product.price} × {item.quantity} = ₹{item.product.price * item.quantity}</p>
                      {item.product.governmentSubsidyEligible && userDetails.aadharNumber && (
                        <p className="subsidy-text">
                          🎁 Subsidy: {item.product.subsidyPercentage}% (₹{((item.product.price * item.quantity * item.product.subsidyPercentage) / 100).toFixed(2)})
                        </p>
                      )}
                    </div>
                    <button className="remove-button" onClick={() => removeFromCart(item.product._id)}>
                      🗑️ {t('shop.removeFromCart')}
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <h3>Bill Summary</h3>
                <div className="summary-row">
                  <span>{t('shop.subtotal')}:</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row subsidy-row">
                  <span>{t('shop.subsidy')}:</span>
                  <span>- ₹{totals.totalSubsidy.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>{t('shop.shipping')}:</span>
                  <span>₹{totals.shippingCharges}</span>
                </div>
                <div className="summary-row total-row">
                  <span>{t('shop.total')}:</span>
                  <span>₹{totals.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button className="checkout-button" onClick={() => setView('checkout')}>
                {t('shop.proceedToCheckout')}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (view === 'checkout') {
    const totals = calculateTotals();
    
    return (
      <div className="shop-dashboard">
        <button className="back-button" onClick={() => setView('cart')}>
          ← {t('learning.goBack')}
        </button>
        <div className="checkout-container">
          <h2>💳 {t('shop.checkout')}</h2>
          
          <div className="checkout-form">
            <h3>{t('shop.userDetails')}</h3>
            
            {/* Name Input */}
            <div className="form-group">
              <input
                type="text"
                placeholder={`${t('shop.name')} *`}
                value={userDetails.name}
                onChange={(e) => {
                  setUserDetails({...userDetails, name: e.target.value});
                  // Clear error when user types
                  if (errors.name) {
                    setErrors({...errors, name: ''});
                  }
                }}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">❌ {errors.name}</span>}
            </div>

            {/* Phone Input */}
            <div className="form-group">
              <input
                type="tel"
                placeholder={`${t('shop.phone')} * (10 digits)`}
                value={userDetails.phone}
                maxLength="10"
                onChange={(e) => {
                  // Only allow digits
                  const phone = e.target.value.replace(/\D/g, '');
                  setUserDetails({...userDetails, phone});
                  // Clear error when user types
                  if (errors.phone) {
                    setErrors({...errors, phone: ''});
                  }
                }}
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-message">❌ {errors.phone}</span>}
              {userDetails.phone && validatePhone(userDetails.phone) && (
                <span className="success-message">✅ Valid phone number</span>
              )}
            </div>

            {/* Aadhar Input */}
            <div className="form-group">
              <input
                type="text"
                placeholder={`${t('shop.aadharNumber')} (optional, for subsidy)`}
                value={userDetails.aadharNumber}
                maxLength="12"
                onChange={(e) => {
                  // Only allow digits
                  const aadhar = e.target.value.replace(/\D/g, '');
                  setUserDetails({...userDetails, aadharNumber: aadhar});
                  // Clear error when user types
                  if (errors.aadharNumber) {
                    setErrors({...errors, aadharNumber: ''});
                  }
                }}
                className={errors.aadharNumber ? 'error' : ''}
              />
              {errors.aadharNumber && <span className="error-message">❌ {errors.aadharNumber}</span>}
              {userDetails.aadharNumber && validateAadhar(userDetails.aadharNumber) && (
                <span className="success-message">✅ Valid Aadhar number</span>
              )}
            </div>

            {/* State Selector */}
            <div className="form-group">
              <select
                value={userDetails.state}
                onChange={(e) => {
                  setUserDetails({...userDetails, state: e.target.value});
                  // Clear error when user selects
                  if (errors.state) {
                    setErrors({...errors, state: ''});
                  }
                }}
                className={errors.state ? 'error' : ''}
              >
                <option value="">{t('shop.selectState')} *</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Bihar">Bihar</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="West Bengal">West Bengal</option>
              </select>
              {errors.state && <span className="error-message">❌ {errors.state}</span>}
            </div>

            {userDetails.aadharNumber && (
              <button className="check-subsidy-button" onClick={checkSubsidyEligibility}>
                Check Subsidy Eligibility
              </button>
            )}

            {subsidyInfo && (
              <div className="subsidy-info">
                <h4>🎁 Subsidy Information</h4>
                <p>Eligibility: {subsidyInfo.isEligible ? '✅ Eligible' : '❌ Not Eligible'}</p>
                {subsidyInfo.isEligible && (
                  <>
                    <p>Subsidy Rate: {subsidyInfo.subsidyPercentage}%</p>
                    <ul>
                      {subsidyInfo.eligibilityReasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>{t('shop.subtotal')}:</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row subsidy-row">
              <span>{t('shop.subsidy')}:</span>
              <span>- ₹{totals.totalSubsidy.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>{t('shop.shipping')}:</span>
              <span>₹{totals.shippingCharges}</span>
            </div>
            <div className="summary-row total-row">
              <span>{t('shop.totalAmount')}:</span>
              <span>₹{totals.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button 
            className="payment-button" 
            onClick={proceedToPayment}
            disabled={!userDetails.name || !userDetails.phone || !userDetails.state}
          >
            💳 {t('shop.pay')} ₹{totals.totalAmount.toFixed(2)}
          </button>
        </div>
      </div>
    );
  }

  if (view === 'product-detail' && selectedProduct) {
    return (
      <div className="shop-dashboard">
        <button className="back-button" onClick={() => setView('products')}>
          ← {t('learning.goBack')}
        </button>
        <div className="product-detail">
          <div className="product-images">
            {selectedProduct.images && selectedProduct.images.length > 0 ? (
              <img src={selectedProduct.images[0].url} alt={selectedProduct.name} />
            ) : (
              <div className="no-image">📦 No Image</div>
            )}
          </div>
          
          <div className="product-info">
            <h2>{selectedProduct.name}</h2>
            <div className="product-meta">
              <span className="badge">{selectedProduct.category.replace(/_/g, ' ')}</span>
              {selectedProduct.isOrganic && <span className="organic-badge">🌿 Organic</span>}
              {selectedProduct.isCertified && <span className="certified-badge">✓ Certified</span>}
            </div>

            <div className="price-section">
              <div className="price">₹{selectedProduct.price} / {selectedProduct.unit}</div>
              {selectedProduct.mrp > selectedProduct.price && (
                <div className="mrp">MRP: ₹{selectedProduct.mrp}</div>
              )}
              {selectedProduct.governmentSubsidyEligible && (
                <div className="subsidy-badge">
                  🎁 {selectedProduct.subsidyPercentage}% Government Subsidy Available
                </div>
              )}
            </div>

            <p className="description">{selectedProduct.description}</p>

            {selectedProduct.composition && (
              <div className="product-section">
                <h3>Composition</h3>
                <p>{selectedProduct.composition}</p>
              </div>
            )}

            {selectedProduct.suitableFor && selectedProduct.suitableFor.length > 0 && (
              <div className="product-section">
                <h3>Suitable For</h3>
                <div className="crops-list">
                  {selectedProduct.suitableFor.map((crop, index) => (
                    <span key={index} className="crop-tag">🌾 {crop}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedProduct.applicationMethod && (
              <div className="product-section">
                <h3>Application Method</h3>
                <p>{selectedProduct.applicationMethod}</p>
              </div>
            )}

            <div className="stock-info">
              {selectedProduct.stock > 0 ? (
                <span className="in-stock">✅ {t('shop.inStock')} ({selectedProduct.stock} available)</span>
              ) : (
                <span className="out-of-stock">❌ {t('shop.outOfStock')}</span>
              )}
            </div>

            <button 
              className="add-to-cart-button"
              onClick={() => addToCart(selectedProduct)}
              disabled={selectedProduct.stock === 0}
            >
              🛒 {t('shop.addToCart')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'products') {
    return (
      <div className="shop-dashboard">
        <div className="shop-header">
          <button className="back-button" onClick={() => setView('categories')}>
            ← {t('learning.goBack')}
          </button>
          <button className="cart-icon-button" onClick={() => setView('cart')}>
            🛒 {t('shop.cart')} ({cart.length})
          </button>
        </div>

        {loading ? (
          <div className="loading">{t('learning.loading')}</div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <p>😔 {t('shop.noProducts')}</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product._id} className="product-card">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0].url} alt={product.name} className="product-image" />
                ) : (
                  <div className="product-no-image">📦</div>
                )}
                
                <div className="product-card-body">
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description.substring(0, 100)}...</p>
                  
                  <div className="product-price">
                    <span className="price">₹{product.price}</span>
                    {product.mrp > product.price && (
                      <span className="mrp">₹{product.mrp}</span>
                    )}
                  </div>

                  {product.governmentSubsidyEligible && (
                    <div className="subsidy-tag">🎁 {product.subsidyPercentage}% Subsidy</div>
                  )}

                  <div className="product-actions">
                    <button className="view-button" onClick={() => viewProductDetail(product._id)}>
                      {t('shop.viewDetails')}
                    </button>
                    <button 
                      className="quick-add-button" 
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      🛒 {t('shop.add')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="shop-dashboard">
      <div className="dashboard-header">
        <h2>🛒 {t('shop.title')}</h2>
        <p>{t('shop.subtitle')}</p>
        <button className="cart-icon-button" onClick={() => setView('cart')}>
          🛒 {t('shop.viewCart')} ({cart.length})
        </button>
      </div>

      <div className="categories-grid">
        {categories.map(category => (
          <div
            key={category.value}
            className="category-card"
            onClick={() => fetchProducts(category.value)}
          >
            <div className="category-icon">{category.icon}</div>
            <h3>{category.label}</h3>
            <p>{t('shop.exploreProducts')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShopDashboard;

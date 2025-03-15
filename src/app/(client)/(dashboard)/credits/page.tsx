"use client";

import React, { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";

// 替换为您的Stripe发布密钥
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

type PlanType = {
  id: number;
  name: string;
  points: number;
  price: number;
  popular?: boolean;
  stripePriceId: string; // Stripe价格ID
};

// 支付表单组件
const CheckoutForm = ({ selectedPlan, onSuccess, onError }: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useUserStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!stripe || !elements || !selectedPlan) {
      return;
    }

    setIsProcessing(true);
    setPaymentError("");

    try {
      // 1. 创建支付意向
      const { data: clientSecret } = await axios.post(
        "/api/create-payment-intent",
        {
          priceId: selectedPlan.stripePriceId,
          userId: user?.id,
          points: selectedPlan.points,
        }
      );

      // 2. 确认支付
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement as any,
            billing_details: {
              email: user?.email || "",
            },
          },
        }
      );

      if (error) {
        setPaymentError(error.message as any);
        onError(error.message);
      } else if (paymentIntent.status === "succeeded") {
        // 支付成功
        onSuccess(paymentIntent);
      }
    } catch (err: any) {
      setPaymentError(err.message || "支付处理过程中出现错误");
      onError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">卡信息</label>
        <div className="border rounded-md p-4 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      {paymentError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {paymentError}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full py-4 px-6 text-white font-medium rounded-xl ${
          !stripe || isProcessing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>处理中...</span>
          </div>
        ) : (
          `支付 ¥${selectedPlan?.price || 0}`
        )}
      </button>
    </form>
  );
};

// 主页面组件
const PointsRechargePage = () => {
  const { user } = useUserStore();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [showCardPayment, setShowCardPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");

  const plans: PlanType[] = [
    {
      id: 1,
      name: "基础套餐",
      points: 100,
      price: 10,
      stripePriceId: "price_1Nxxx...", // 替换为实际的Stripe价格ID
    },
    {
      id: 2,
      name: "标准套餐",
      points: 300,
      price: 25,
      popular: true,
      stripePriceId: "price_2Nxxx...", // 替换为实际的Stripe价格ID
    },
    {
      id: 3,
      name: "高级套餐",
      points: 800,
      price: 60,
      stripePriceId: "price_3Nxxx...", // 替换为实际的Stripe价格ID
    },
    {
      id: 4,
      name: "专业套餐",
      points: 2000,
      price: 120,
      stripePriceId: "price_4Nxxx...", // 替换为实际的Stripe价格ID
    },
  ];

  const handlePaymentSuccess = async (paymentIntent: any) => {
    setPaymentIntentId(paymentIntent.id);
    setPaymentSuccess(true);

    // 在用户购买积分后调用API更新用户积分
    try {
      await axios.post("/api/update-user-points", {
        userId: user?.id,
        points: selectedPlan?.points,
        paymentIntentId: paymentIntent.id,
      });

      // 刷新用户数据（假设您的useUserStore有一个刷新用户的方法）
      // await refreshUserData();
    } catch (error) {
      console.error("更新用户积分失败:", error);
    }
  };

  const handlePaymentError = (errorMessage: any) => {
    console.error("支付失败:", errorMessage);
  };

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setPaymentSuccess(false);
  };

  const handleProceedToPayment = () => {
    if (selectedPlan) {
      setShowCardPayment(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-2">积分充值</h1>
      <p className="text-gray-500 text-center mb-10">
        充值账户积分以创建高级Logo并访问更多功能
      </p>

      {/* 当前积分显示 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500">当前余额</p>
            <h2 className="text-4xl font-bold">{user?.credits || 0} 积分</h2>
          </div>
          <div className="bg-blue-500 rounded-full p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="white"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {paymentSuccess ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-10">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-700">支付成功！</h2>
          </div>
          <p className="mt-2 text-green-600">
            您已成功购买 {selectedPlan?.points} 积分。您的积分余额已更新。
          </p>
          <p className="mt-1 text-gray-500">交易ID: {paymentIntentId}</p>
          <button
            onClick={() => setPaymentSuccess(false)}
            className="mt-4 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
          >
            继续购买
          </button>
        </div>
      ) : showCardPayment ? (
        <div className="bg-white border rounded-xl p-6 mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">支付详情</h2>
            <button
              onClick={() => setShowCardPayment(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              返回
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">套餐</span>
              <span className="font-medium">{selectedPlan?.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">积分</span>
              <span className="font-medium">{selectedPlan?.points}</span>
            </div>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="flex justify-between">
              <span className="text-gray-800 font-semibold">总计</span>
              <span className="font-bold">¥{selectedPlan?.price}</span>
            </div>
          </div>

          <Elements stripe={stripePromise}>
            <CheckoutForm
              selectedPlan={selectedPlan}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </Elements>
        </div>
      ) : (
        <>
          {/* 套餐选择 */}
          <h2 className="text-xl font-semibold mb-4">选择套餐</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-xl p-6 cursor-pointer relative transition-all ${
                  selectedPlan?.id === plan.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-200"
                }`}
                onClick={() => handleSelectPlan(plan)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    最受欢迎
                  </div>
                )}
                <h3 className="text-lg font-medium mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold">¥{plan.price}</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-600 mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{plan.points} 积分</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>可创建 {Math.floor(plan.points / 25)} 个高级Logo</span>
                </div>
              </div>
            ))}
          </div>

          {/* 支付方式（此处简化为仅Stripe卡支付，但UI保留其他支付方式） */}
          <h2 className="text-xl font-semibold mb-4">支付方式</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div
              className={`border rounded-xl p-4 cursor-pointer flex items-center space-x-3 ${
                paymentMethod === "card"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
              onClick={() => setPaymentMethod("card")}
            >
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-500 font-bold">卡</span>
              </div>
              <span className="font-medium">信用卡支付</span>
            </div>

            <div
              className={`border rounded-xl p-4 cursor-pointer flex items-center space-x-3 opacity-50`}
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-500 font-bold">支</span>
              </div>
              <span className="font-medium">支付宝（即将推出）</span>
            </div>

            <div
              className={`border rounded-xl p-4 cursor-pointer flex items-center space-x-3 opacity-50`}
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-500 font-bold">微</span>
              </div>
              <span className="font-medium">微信支付（即将推出）</span>
            </div>
          </div>

          {/* 订单汇总 */}
          {selectedPlan && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">订单汇总</h2>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">套餐</span>
                <span className="font-medium">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">积分</span>
                <span className="font-medium">{selectedPlan.points}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">支付方式</span>
                <span className="font-medium">信用卡支付</span>
              </div>
              <div className="border-t border-gray-200 my-4"></div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-800 font-semibold">总计</span>
                <span className="font-bold text-xl">¥{selectedPlan.price}</span>
              </div>
            </div>
          )}

          {/* 继续按钮 */}
          <button
            onClick={handleProceedToPayment}
            disabled={!selectedPlan}
            className={`w-full py-4 px-6 text-white font-medium rounded-xl ${
              !selectedPlan
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            继续支付
          </button>
        </>
      )}
    </div>
  );
};

export default PointsRechargePage;

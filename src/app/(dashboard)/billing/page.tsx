import { getCreditsAction } from "@/app/actions/credits-action";
import PlanSummarry from "@/components/billing/plan-summary";
import Pricing from "@/components/billing/pricing";
import { getProducts, getSubscription, getUser } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

const BillingPage = async () => {
  const supabase = await createClient();
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase),
  ]);
  if (!user) {
    return redirect("/login");
  }
  const { data: credits } = await getCreditsAction();
  return (
    <section className="container mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Plans & Billing
      </h1>
      <p className="text-muted-foreground mb-6">
        Manage your subscription and billing information.
      </p>
      <div className="grid gap-10">
        <PlanSummarry
          credits={credits}
          subscription={subscription}
          user={user}
          products={products || []}
        />
        {subscription.status === "active" && (
          <Pricing
            user={user}
            products={products ?? []}
            subscription={subscription}
            showInterval={false}
            className={"!p-0 max-w-full"}
            activeProduct={
              subscription?.prices?.products?.name.toLowerCase() || "pro"
            }
          />
        )}
      </div>
    </section>
  );
};

export default BillingPage;

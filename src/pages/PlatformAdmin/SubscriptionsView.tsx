import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    name: "Basic",
    price: "₹0",
    description: "Essential tools for small clinics.",
    features: ["1 Clinic Location", "Default Themes", "Self-service Support"],
    popular: false
  },
  {
    name: "Standard",
    price: "₹599",
    description: "Production grade platform access.",
    features: ["Full Queue Management", "Real-time Updates", "QR Customization", "Priority Support", "Razorpay Integrated"],
    popular: true
  },
  {
    name: "Growth",
    price: "Custom",
    description: "For multi-chain hospitals.",
    features: ["White-label Branding", "Dedicated Server", "Custom Features", "API Access"],
    popular: false
  }
];

export default function SubscriptionsView() {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Subscription Plans</h2>
        <p className="text-gray-500 text-lg">Manage platform pricing and feature tiers for your tenants.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={`relative border-2 ${plan.popular ? 'border-blue-600 shadow-lg' : 'border-gray-100 shadow-sm'}`}>
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="mt-2">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600">
                    <Check className="w-5 h-5 text-blue-600 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                Edit Plan
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

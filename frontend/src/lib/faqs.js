// Static FAQs - Hardcoded for simplicity
// Update this file when FAQs change (2-minute code change)

export const faqs = [
  {
    id: 'what-is-100cr',
    question: "What is 100Cr Engine?",
    answer: "100Cr Engine is a revenue milestone prediction platform designed for Indian founders. It answers the crucial question: 'When will my business reach ₹100 Crore in annual revenue?' using data-driven projections and AI-powered insights.",
    category: 'general'
  },
  {
    id: 'how-projections-work',
    question: "How accurate are the projections?",
    answer: "Projections are based on your current growth rate, historical data, and industry benchmarks. Regular monthly check-ins significantly improve accuracy. The more data you provide, the more reliable your projections become.",
    category: 'projections'
  },
  {
    id: 'update-revenue',
    question: "How do I update my monthly revenue?",
    answer: "Go to the Command Centre in your dashboard and click 'Monthly Check-in'. Enter your actual revenue for the month along with any notes. Consistent check-ins improve your projection accuracy and maintain your streak.",
    category: 'usage'
  },
  {
    id: 'health-score',
    question: "What does the Health Score mean?",
    answer: "Your Health Score (0-100) is calculated from growth consistency, revenue quality, check-in frequency, and benchmark performance. A higher score indicates healthier business growth patterns.",
    category: 'metrics'
  },
  {
    id: 'connect-payments',
    question: "How do I connect my payment provider?",
    answer: "Navigate to API Connectors in the sidebar. Click 'Connect' on your preferred provider (Razorpay, Stripe, or Cashfree) and enter your API keys. Your revenue will then sync automatically.",
    category: 'integrations'
  },
  {
    id: 'export-data',
    question: "Can I export my data?",
    answer: "Yes! Go to Reporting Engine to generate board reports, investor updates, or data room exports. You can download these as PDF documents for sharing with stakeholders.",
    category: 'usage'
  },
  {
    id: 'free-vs-paid',
    question: "What's the difference between Free and Founder plans?",
    answer: "Free plan includes 3 projections/month, limited AI coaching, and 1 connector. Founder Plan (₹899/year) unlocks unlimited projections, full AI coach access, 2 board reports/month, and unlimited connectors.",
    category: 'billing'
  },
  {
    id: 'ai-coach',
    question: "What can the AI Growth Coach do?",
    answer: "The AI Growth Coach provides personalized insights, answers strategic questions about your business, generates weekly growth recommendations, and helps you understand anomalies in your revenue patterns.",
    category: 'features'
  },
  {
    id: 'data-security',
    question: "Is my financial data secure?",
    answer: "Yes, absolutely. We use Supabase (built on PostgreSQL) with enterprise-grade security. All API keys are encrypted using Fernet encryption. We are DPDP 2023 compliant and never share your data with third parties.",
    category: 'security'
  },
  {
    id: 'cancel-subscription',
    question: "How do I cancel my subscription?",
    answer: "Go to Settings → Billing & Subscription. You can cancel anytime and retain access until the end of your billing period. Your data remains available on the free plan.",
    category: 'billing'
  }
];

// Get FAQs by category
export const getFaqsByCategory = (category) => {
  if (!category || category === 'all') return faqs;
  return faqs.filter(faq => faq.category === category);
};

// Search FAQs
export const searchFaqs = (query) => {
  if (!query) return faqs;
  const lowerQuery = query.toLowerCase();
  return faqs.filter(faq => 
    faq.question.toLowerCase().includes(lowerQuery) ||
    faq.answer.toLowerCase().includes(lowerQuery)
  );
};

// FAQ categories for filtering
export const faqCategories = [
  { id: 'all', label: 'All Questions' },
  { id: 'general', label: 'General' },
  { id: 'usage', label: 'How to Use' },
  { id: 'billing', label: 'Billing' },
  { id: 'features', label: 'Features' },
  { id: 'security', label: 'Security' }
];

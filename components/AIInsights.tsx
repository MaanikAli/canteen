import React, { useState, useEffect } from 'react';
import { getAiRecommendation, isApiKeyAvailable } from '../services/geminiService';
import { MenuItem } from '../types';

interface AIInsightsProps {
  menuItems: MenuItem[];
  userOrders?: any[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ menuItems, userOrders = [] }) => {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'trends' | 'health'>('recommendations');

  const generateInsights = async (type: string) => {
    if (!isApiKeyAvailable()) {
      setApiAvailable(false);
      let fallbackContent = '';

      switch (type) {
        case 'recommendations':
          fallbackContent = `🍽️ **Meal Recommendations**\n\nBased on our popular menu items:\n\n1. **Rice Bowl Combo** - A balanced meal with rice, vegetables, and protein\n2. **Sandwich Special** - Fresh ingredients with healthy options\n3. **Salad Bowl** - Light and nutritious choice for students\n\nThese recommendations consider nutrition, value, and student preferences.`;
          break;
        case 'trends':
          fallbackContent = `📈 **Food Trends**\n\nPopular combinations among students:\n\n1. **Rice + Curry + Drink** - Classic balanced meal\n2. **Sandwich + Juice** - Quick and convenient option\n3. **Salad + Tea** - Health-conscious choice\n\nThese combinations are popular for their taste and nutritional balance.`;
          break;
        case 'health':
          fallbackContent = `🥗 **Healthy Eating Tips**\n\n1. **Balance your plate** - Include rice/grains, protein, and vegetables\n2. **Portion control** - Start with smaller portions and adjust as needed\n3. **Stay hydrated** - Drink water or fresh juices throughout the day\n\nEating a variety of foods ensures you get all necessary nutrients for studying and staying active.`;
          break;
      }

      setInsights(fallbackContent);
      return;
    }

    setLoading(true);
    try {
      let prompt = '';

      switch (type) {
        case 'recommendations':
          prompt = `Based on the following menu items, provide 3 personalized meal recommendations for a university student. Consider nutrition, value, and popularity. Menu: ${JSON.stringify(menuItems.slice(0, 10))}`;
          break;
        case 'trends':
          prompt = `Analyze these menu items and suggest 2-3 trending food combinations or meal ideas that would appeal to students. Menu: ${JSON.stringify(menuItems.slice(0, 10))}`;
          break;
        case 'health':
          prompt = `Provide 2-3 healthy eating tips based on this canteen menu. Focus on balanced nutrition and portion control. Menu: ${JSON.stringify(menuItems.slice(0, 10))}`;
          break;
      }

      const recommendation = await getAiRecommendation(prompt);
      setInsights(recommendation);
      setApiAvailable(true);
    } catch (error) {
      console.error('Error getting AI insights:', error);
      setInsights('Sorry, I couldn\'t generate insights right now. Please try again later.');
      setApiAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInsights(activeTab);
  }, [activeTab, menuItems]);

  const tabs = [
    { id: 'recommendations', label: 'Meal Recommendations', icon: '🍽️' },
    { id: 'trends', label: 'Food Trends', icon: '📈' },
    { id: 'health', label: 'Health Tips', icon: '🥗' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">AI Insights</h2>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600">Generating insights...</span>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {insights || 'Click on a tab to get AI-powered insights!'}
            </div>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => generateInsights(activeTab)}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Generating...' : 'Refresh Insights'}
        </button>
      </div>
    </div>
  );
};

export default AIInsights;

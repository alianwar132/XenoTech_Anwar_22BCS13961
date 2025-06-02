import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function generateSegmentRules(description: string): Promise<{
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  operator: 'AND' | 'OR';
}> {
  try {
    const prompt = `Convert this natural language description into structured segment rules for a CRM system.

Description: "${description}"

Available fields:
- totalSpent (decimal amount in rupees)
- visitCount (integer number of visits)
- lastPurchaseDate (days ago as integer)
- customerSince (days ago as integer)

Available operators: >, >=, <, <=, =

Return JSON in this format:
{
  "conditions": [
    {
      "field": "totalSpent",
      "operator": ">",
      "value": "10000"
    }
  ],
  "operator": "AND"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a CRM expert that converts natural language into structured database queries. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error generating segment rules:", error);
    throw new Error("Failed to generate segment rules");
  }
}

export async function generateCampaignMessages(objective: string, audience: string): Promise<{
  messages: Array<{
    variant: string;
    tone: string;
    content: string;
  }>;
}> {
  try {
    const prompt = `Generate 3 different marketing message variants for a campaign.

Campaign Objective: ${objective}
Target Audience: ${audience}

Create messages that are:
1. Personalized (use {name} placeholder)
2. Engaging and relevant
3. Include a clear call-to-action
4. Appropriate for the Indian market (use ₹ for currency)

Return JSON in this format:
{
  "messages": [
    {
      "variant": "Emotional",
      "tone": "warm and personal",
      "content": "Message content here with {name} placeholder"
    },
    {
      "variant": "Urgency",
      "tone": "urgent and compelling",
      "content": "Message content here with {name} placeholder"
    },
    {
      "variant": "Value-focused",
      "tone": "professional and benefit-driven",
      "content": "Message content here with {name} placeholder"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a marketing expert specializing in personalized customer communication for Indian e-commerce businesses."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error generating campaign messages:", error);
    throw new Error("Failed to generate campaign messages");
  }
}

export async function generateCampaignInsights(campaignData: {
  audienceSize: number;
  deliveredCount: number;
  failedCount: number;
  successRate: number;
  segmentDescription: string;
}): Promise<{
  summary: string;
  insights: string[];
  recommendations: string[];
}> {
  try {
    const prompt = `Analyze this campaign performance data and provide insights:

Campaign Data:
- Audience Size: ${campaignData.audienceSize}
- Delivered: ${campaignData.deliveredCount}
- Failed: ${campaignData.failedCount}
- Success Rate: ${campaignData.successRate}%
- Segment: ${campaignData.segmentDescription}

Provide a human-readable analysis with:
1. A summary paragraph
2. Key insights (3-4 bullet points)
3. Actionable recommendations (2-3 bullet points)

Return JSON in this format:
{
  "summary": "Your campaign reached X users with Y% delivery rate...",
  "insights": [
    "Insight 1",
    "Insight 2"
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a CRM analytics expert who provides actionable insights from campaign performance data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error generating campaign insights:", error);
    throw new Error("Failed to generate campaign insights");
  }
}

export async function generateLookalikeAudience(sourceCustomers: Array<{
  totalSpent: number;
  visitCount: number;
  daysSinceLastPurchase: number;
}>): Promise<{
  characteristics: {
    avgSpent: number;
    avgVisits: number;
    spendRange: { min: number; max: number };
    visitRange: { min: number; max: number };
  };
  rules: {
    conditions: Array<{
      field: string;
      operator: string;
      value: string;
    }>;
    operator: 'AND' | 'OR';
  };
}> {
  try {
    const prompt = `Analyze these high-performing customers and generate lookalike audience rules:

Source Customers Data:
${sourceCustomers.map((c, i) => `Customer ${i + 1}: Spent ₹${c.totalSpent}, ${c.visitCount} visits, ${c.daysSinceLastPurchase} days since last purchase`).join('\n')}

Generate lookalike audience criteria based on patterns in this data.

Return JSON in this format:
{
  "characteristics": {
    "avgSpent": 15000,
    "avgVisits": 8,
    "spendRange": { "min": 10000, "max": 25000 },
    "visitRange": { "min": 5, "max": 15 }
  },
  "rules": {
    "conditions": [
      {
        "field": "totalSpent",
        "operator": ">=",
        "value": "10000"
      },
      {
        "field": "visitCount",
        "operator": ">=",
        "value": "5"
      }
    ],
    "operator": "AND"
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a data scientist specializing in customer segmentation and lookalike modeling for e-commerce."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error generating lookalike audience:", error);
    throw new Error("Failed to generate lookalike audience");
  }
}

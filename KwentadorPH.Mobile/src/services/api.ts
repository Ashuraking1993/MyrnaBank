import * as FileSystem from "expo-file-system/legacy";

const API_URL = "http://192.168.0.219:5070/api";

export async function getTransactions() {
  const response = await fetch(`${API_URL}/Transactions`);

  if (!response.ok) {
    throw new Error("Failed to load transactions");
  }

  return await response.json();
}

export async function getExpenseCategories() {
  const response = await fetch(`${API_URL}/ExpenseCategories`);

  if (!response.ok) {
    throw new Error("Failed to load expense categories");
  }

  return await response.json();
}

export async function analyzeReceipt(imageUri: string) {
  const uploadResult = await FileSystem.uploadAsync(
    `${API_URL}/ReceiptAnalyzer/analyze`,
    imageUri,
    {
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: "image",
      mimeType: "image/jpeg",
      parameters: {},
    }
  );

  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error(
      uploadResult.body || "Failed to analyze receipt"
    );
  }

  const cleanBody = uploadResult.body
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  console.log("RAW Receipt Response:", cleanBody);

  try {
    return JSON.parse(cleanBody);
  } catch (error) {
    console.error("Invalid Receipt JSON:", cleanBody);

    throw new Error(
      "Receipt AI returned an invalid response. Please scan again."
    );
  }
}

export async function saveReceiptExpense(
  analysis: any,
  financialAccountId: string
) {
  const response = await fetch(`${API_URL}/Transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      financialAccountId,
      description: analysis.description,
      merchantName: analysis.merchantName,
      amount: Number(analysis.amount),
      transactionType: "Expense",
      category: analysis.category,
      transactionDate: analysis.transactionDate,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to save expense");
  }

  return await response.json();
}

export async function getFinancialAccounts() {
  const response = await fetch(`${API_URL}/FinancialAccounts`);

  if (!response.ok) {
    throw new Error("Failed to load financial accounts");
  }

  return await response.json();
}

export async function analyzeVoiceExpense(audioUri: string) {
  const uploadResult = await FileSystem.uploadAsync(
    `${API_URL}/VoiceExpense/analyze`,
    audioUri,
    {
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: "audio",
      mimeType: "audio/mp4",
      parameters: {},
    }
  );

  console.log("RAW Voice Response:", uploadResult.body);

  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error(
      uploadResult.body || "Failed to analyze voice expense"
    );
  }

  const cleanBody = uploadResult.body
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleanBody);
}

export async function getAIInsights() {
  const response = await fetch(`${API_URL}/AIInsights`);

  if (!response.ok) {
    throw new Error("Failed to load AI insights");
  }

  return await response.json();
}

export async function sendAIChat(message: string) {
  const response = await fetch(`${API_URL}/AIChat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to contact AI Coach");
  }

  return await response.json();
}

export async function getGoals() {
  const response = await fetch(`${API_URL}/FinancialGoals`);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to load financial goals");
  }

  return await response.json();
}


export async function getDebtAccounts() {
  const response = await fetch(`${API_URL}/DebtAccounts`);

  if (!response.ok) {
    throw new Error("Failed to load debt accounts");
  }

  return await response.json();
}

export async function getDebtStrategyComparison(
  extraMonthlyPayment: number = 3000
) {
  const response = await fetch(
    `${API_URL}/DebtStrategies/compare?extraMonthlyPayment=${extraMonthlyPayment}`
  );

  if (!response.ok) {
    throw new Error("Failed to load debt strategies");
  }

  return await response.json();
}

export async function getDebtRecommendation(
  extraMonthlyPayment: number = 3000
) {
  const response = await fetch(
    `${API_URL}/DebtStrategies/recommend?extraMonthlyPayment=${extraMonthlyPayment}`
  );

  if (!response.ok) {
    throw new Error("Failed to load debt recommendation");
  }

  return await response.json();
}

export async function getDebtWhatIf(
  extraMonthlyPayment: number
) {
  const response = await fetch(
    `${API_URL}/DebtStrategies/what-if?extraMonthlyPayment=${extraMonthlyPayment}`
  );

  if (!response.ok) {
    throw new Error("Failed to calculate debt scenario");
  }

  return await response.json();
}

export async function createDebtAccount(data: {
  name: string;
  debtType: string;
  originalBalance: number;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate?: string | null;
}) {
  const response = await fetch(`${API_URL}/DebtAccounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to create debt account");
  }

  return await response.json();
}

export async function addDebtPayment(
  debtId: string,
  data: {
    amount: number;
    notes?: string;
  }
) {
  const response = await fetch(
    `${API_URL}/DebtAccounts/${debtId}/payments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to record payment");
  }

  return await response.json();
}

export async function getDebtAccountById(debtId: string) {
  const response = await fetch(
    `${API_URL}/DebtAccounts/${debtId}`
  );

  if (!response.ok) {
    throw new Error("Failed to load debt account");
  }

  return await response.json();
}

export async function getDebtAICoach(
  extraMonthlyPayment: number = 3000
) {
  const response = await fetch(
    `${API_URL}/DebtStrategies/ai-coach?extraMonthlyPayment=${extraMonthlyPayment}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to load AI Debt Coach");
  }

  return await response.json();
}


export async function createFinancialAccount(data: {
  financialInstitutionId: string;
  accountName: string;
  maskedAccountNumber: string;
  accountType: string;
  currentBalance: number;
  connectionType: string;
}) {
  const response = await fetch(`${API_URL}/FinancialAccounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || "Failed to create financial account."
    );
  }

  return response.json();
}

export async function getFinancialHealth() {
  const response = await fetch(
    `${API_URL}/FinancialHealth`
  );

  if (!response.ok) {
    throw new Error("Failed to load financial health");
  }

  return await response.json();
}

export async function getForexRate(
  from: string,
  to: string
) {
  const response = await fetch(
    `${API_URL}/Forex/rate?from=${encodeURIComponent(
      from
    )}&to=${encodeURIComponent(to)}`
  );

  if (!response.ok) {
    throw new Error("Failed to load forex rate");
  }

  return await response.json();
}

export async function getForexTrend(
  from: string,
  to: string,
  period: string
) {
  const response = await fetch(
    `${API_URL}/Forex/trend` +
      `?from=${encodeURIComponent(from)}` +
      `&to=${encodeURIComponent(to)}` +
      `&period=${encodeURIComponent(period)}`
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Failed to load forex trend: ${errorText}`
    );
  }

  return await response.json();
}

export async function createFinancialGoal(data: {
  name: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}) {
  const response = await fetch(`${API_URL}/FinancialGoals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create financial goal");
  }

  return await response.json();
}

// ================================
// REGULATORY INTELLIGENCE
// ================================

export async function getRegulatoryUpdates() {
  const response = await fetch(
    `${API_URL}/RegulatoryIntelligence`
  );

  if (!response.ok) {
    throw new Error("Failed to load regulatory updates");
  }

  return await response.json();
}

export async function simulateRegulatoryImpact(
  regulatoryUpdateId: string
) {
  const response = await fetch(
    `${API_URL}/RegulatoryIntelligence/${regulatoryUpdateId}/simulate`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      error || "Failed to simulate regulatory impact"
    );
  }

  return await response.json();
}

export async function generateRegulatoryPolicy(
  regulatoryUpdateId: string
) {
  const response = await fetch(
    `${API_URL}/RegulatoryIntelligence/${regulatoryUpdateId}/generate-policy`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      error || "Failed to generate regulatory policy"
    );
  }

  return await response.json();
}


export async function previewTransfer(payload: {
  fromFinancialAccountId: string;
  toFinancialAccountId?: string;
  recipientName: string;
  recipientInstitution: string;
  recipientAccountNumber: string;
  amount: number;
  channel: string;
  note?: string;
  isNewDevice?: boolean;
  hasIdentityMismatch?: boolean;
}) {
  const response = await fetch(
    `${API_URL}/Transfers/preview`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to preview transfer");
  }

  return await response.json();
}

export async function createTransfer(payload: {
  fromFinancialAccountId: string;
  toFinancialAccountId?: string;
  recipientName: string;
  recipientInstitution: string;
  recipientAccountNumber: string;
  amount: number;
  channel: string;
  note?: string;
}) {
  const response = await fetch(`${API_URL}/Transfers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to create transfer");
  }

  return await response.json();
}
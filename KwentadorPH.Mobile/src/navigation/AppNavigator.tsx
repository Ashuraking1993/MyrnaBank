import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ExpensesScreen from "../screens/ExpensesScreen";
import ScanReceiptScreen from "../screens/ScanReceiptScreen";
import InsightsScreen from "../screens/InsightsScreen";
import AIChatScreen from "../screens/AIChatScreen";
import GoalDetailScreen from "../screens/GoalDetailScreen";
import DebtPlannerScreen from "../screens/DebtPlannerScreen";
import DebtStrategiesScreen from "../screens/DebtStrategiesScreen";
import DebtWhatIfScreen from "../screens/DebtWhatIfScreen";
import AddDebtScreen from "../screens/AddDebtScreen";
import DebtDetailScreen from "../screens/DebtDetailScreen";
import DebtStrategyDetailScreen from "../screens/DebtStrategyDetailScreen";
import AccountsScreen from "../screens/AccountsScreen";
import ForexScreen from "../screens/ForexScreen";
import IntroVideoScreen from "../screens/IntroVideoScreen";
import FinancialCheckupScreen from "../screens/FinancialCheckupScreen";
import AddGoalScreen from "../screens/AddGoalScreen";
import RegulatoryIntelligenceScreen from "../screens/RegulatoryIntelligenceScreen";
import TransferScreen from "../screens/TransferScreen";
import QRScannerScreen from "../screens/QRScannerScreen";
import AddAccountScreen from "../screens/AddAccountScreen";


export type RootStackParamList = {
  Login: undefined;
  IntroVideo: undefined;
  Dashboard: undefined;
  Expenses: undefined;
  ScanReceipt: undefined;
  AIChat: undefined;
  GoalDetail: undefined;
  DebtPlanner: undefined;
  DebtStrategies: undefined;
  DebtWhatIf: undefined;
  AddDebt: undefined;
  DebtDetail: {
    debtId: string;
  };
    DebtStrategyDetail: undefined;
    Accounts: undefined;
    AddAccount: undefined;
    Forex: undefined;
    FinancialCheckup: undefined;
    AddGoal: undefined;
    RegulatoryIntelligence: undefined;
    Transfer:
      | {
          qrRecipient?: {
            accountId?: string;
            accountName?: string;
            institution?: string;
            accountNumber?: string;
          };
        }
      | undefined;
    QRScanner: undefined;

};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
       <Stack.Screen name="Login">
         {({ navigation }) => (
           <LoginScreen
             onLogin={() => navigation.replace("IntroVideo")}
           />
         )}
       </Stack.Screen>

       <Stack.Screen name="IntroVideo">
         {({ navigation }) => (
           <IntroVideoScreen
             onFinish={() => navigation.replace("Dashboard")}
           />
         )}
       </Stack.Screen>

        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
        />

        <Stack.Screen
          name="Expenses"
          component={ExpensesScreen}
        />

        <Stack.Screen
          name="ScanReceipt"
          component={ScanReceiptScreen}
        />

        <Stack.Screen
          name="Insights"
          component={InsightsScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="AIChat"
          component={AIChatScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="GoalDetail"
          component={GoalDetailScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="DebtPlanner"
          component={DebtPlannerScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="DebtStrategies"
          component={DebtStrategiesScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="DebtWhatIf"
          component={DebtWhatIfScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="AddDebt"
          component={AddDebtScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="DebtDetail"
          component={DebtDetailScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="DebtStrategyDetail"
          component={DebtStrategyDetailScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Accounts"
          component={AccountsScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Forex"
          component={ForexScreen}
        />

        <Stack.Screen
          name="FinancialCheckup"
          component={FinancialCheckupScreen}
        />

        <Stack.Screen
          name="AddGoal"
          component={AddGoalScreen}
        />

        <Stack.Screen
          name="RegulatoryIntelligence"
          component={RegulatoryIntelligenceScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Transfer"
          component={TransferScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="QRScanner"
          component={QRScannerScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="AddAccount"
          component={AddAccountScreen}
          options={{ headerShown: false }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
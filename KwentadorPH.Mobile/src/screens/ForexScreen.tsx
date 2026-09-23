import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LineChart } from "react-native-gifted-charts";
import {
  getForexRate,
  getForexTrend,
} from "../services/api";

const currencies = [
  { code: "PHP", flag: "🇵🇭", name: "Philippine Peso" },
  { code: "USD", flag: "🇺🇸", name: "US Dollar" },
  { code: "JPY", flag: "🇯🇵", name: "Japanese Yen" },
  { code: "EUR", flag: "🇪🇺", name: "Euro" },
  { code: "KRW", flag: "🇰🇷", name: "Korean Won" },
  { code: "SGD", flag: "🇸🇬", name: "Singapore Dollar" },
  { code: "GBP", flag: "🇬🇧", name: "British Pound" },
];

export default function ForexScreen() {
  const navigation = useNavigation<any>();

  const [fromCurrency, setFromCurrency] = useState(currencies[0]);
  const [toCurrency, setToCurrency] = useState(currencies[2]);
  const [amount, setAmount] = useState("10000");
  const [period, setPeriod] = useState("7D");
  const [trend, setTrend] = useState<any>(null);
  const [trendLoading, setTrendLoading] = useState(false);
  const [isChartTouching, setIsChartTouching] =  useState(false);


  // TEMPORARY RATE - connect to API later
  const [rate, setRate] = useState<number | null>(null);
  const [rateDate, setRateDate] = useState<string | null>(null);
  const [rateLoading, setRateLoading] = useState(false);

  useEffect(() => {
    const loadRate = async () => {
      try {
        setRateLoading(true);

        const data = await getForexRate(
          fromCurrency.code,
          toCurrency.code
        );

        setRate(Number(data.rate));
        setRateDate(data.rateDate ?? null);
      } catch (error) {
        console.log("Forex Rate Error:", error);
        setRate(null);
        setRateDate(null);
      } finally {
        setRateLoading(false);
      }
    };

    loadRate();
  }, [fromCurrency.code, toCurrency.code]);

useEffect(() => {
  const loadTrend = async () => {
    try {
      setTrendLoading(true);

      const data = await getForexTrend(
        fromCurrency.code,
        toCurrency.code,
        period
      );

      setTrend(data);
    } catch (error) {
      console.log("Forex Trend Error:", error);
      setTrend(null);
    } finally {
      setTrendLoading(false);
    }
  };

  loadTrend();
}, [fromCurrency.code, toCurrency.code, period]);

 const convertedAmount =
   rate !== null
     ? Number(amount.replace(/,/g, "")) * rate
     : 0;

  const swapCurrencies = () => {
    const oldFrom = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(oldFrom);
  };

  const selectQuickCurrency = (code: string) => {
    const selected = currencies.find(
      (currency) => currency.code === code
    );

    if (selected) {
      setToCurrency(selected);
    }
  };

const trendRates =
  trend?.points?.map((point: any) =>
    Number(point.rate)
  ) ?? [];

const minTrendRate =
  trendRates.length > 0
    ? Math.min(...trendRates)
    : 0;

const maxTrendRate =
  trendRates.length > 0
    ? Math.max(...trendRates)
    : 0;

const trendRange =
  maxTrendRate - minTrendRate;

const chartData =
  trend?.points?.map(
    (point: any, index: number) => ({
      // Normalize only for chart visualization.
      // Actual rate remains available in originalRate.
      value:
        trendRange > 0
          ? Number(point.rate) - minTrendRate
          : 0,

      originalRate: Number(point.rate),

      label: "",

      date: point.date,
    })
  ) ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View>
          <Text style={styles.title}>Forex Converter</Text>
          <Text style={styles.subtitle}>
            Live exchange rates
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        scrollEnabled={!isChartTouching}
      >
        {/* CONVERTER */}
        <View style={styles.converterCard}>
          <Text style={styles.fieldLabel}>FROM</Text>

          <View style={styles.currencyRow}>
            <View style={styles.currencyInfo}>
              <Text style={styles.flag}>
                {fromCurrency.flag}
              </Text>

              <View>
                <Text style={styles.currencyCode}>
                  {fromCurrency.code}
                </Text>

                <Text style={styles.currencyName}>
                  {fromCurrency.name}
                </Text>
              </View>
            </View>

            <Text style={styles.chevron}></Text>
          </View>

          <View style={styles.amountBox}>
            <Text style={styles.amountSymbol}>
              {fromCurrency.code}
            </Text>

            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              style={styles.amountInput}
              placeholder="0.00"
            />
          </View>

          <View style={styles.swapRow}>
            <View style={styles.divider} />

            <Pressable
              style={styles.swapButton}
              onPress={swapCurrencies}
            >
              <Text style={styles.swapIcon}>⇅</Text>
            </Pressable>

            <View style={styles.divider} />
          </View>

          <Text style={styles.fieldLabel}>TO</Text>

          <View style={styles.currencyRow}>
            <View style={styles.currencyInfo}>
              <Text style={styles.flag}>
                {toCurrency.flag}
              </Text>

              <View>
                <Text style={styles.currencyCode}>
                  {toCurrency.code}
                </Text>

                <Text style={styles.currencyName}>
                  {toCurrency.name}
                </Text>
              </View>
            </View>

            <Text style={styles.chevron}></Text>
          </View>

         <Text style={styles.convertedAmount}>
           {rateLoading
             ? "Loading..."
             : rate !== null
             ? `${toCurrency.code} ${convertedAmount.toLocaleString(
                 "en-PH",
                 {
                   minimumFractionDigits: 2,
                   maximumFractionDigits: 2,
                 }
               )}`
             : "Rate unavailable"}
         </Text>

          <Text style={styles.rateText}>
            1 {fromCurrency.code} = {rate}{" "}
            {toCurrency.code}
          </Text>

          <Text style={styles.updatedText}>
            Demo exchange rate
          </Text>
        </View>

        {/* QUICK CURRENCIES */}
        <Text style={styles.sectionTitle}>
          Quick Currencies
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRow}
        >
          {currencies.slice(1).map((currency) => (
            <Pressable
              key={currency.code}
              style={[
                styles.currencyChip,
                toCurrency.code === currency.code &&
                  styles.currencyChipActive,
              ]}
              onPress={() =>
                selectQuickCurrency(currency.code)
              }
            >
              <Text style={styles.chipFlag}>
                {currency.flag}
              </Text>

              <Text
                style={[
                  styles.chipText,
                  toCurrency.code === currency.code &&
                    styles.chipTextActive,
                ]}
              >
                {currency.code}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* RATE BREAKDOWN */}
        <View style={styles.rateCard}>
          <Text style={styles.cardTitle}>
            Exchange Rate
          </Text>

          <Text style={styles.pairText}>
            {fromCurrency.code} → {toCurrency.code}
          </Text>

          {[1, 100, 1000, 10000].map((value) => (
            <View
              key={value}
              style={styles.rateRow}
            >
              <Text style={styles.rateLeft}>
                {value.toLocaleString()}{" "}
                {fromCurrency.code}
              </Text>

              <Text style={styles.rateRight}>
                {rate !== null
                  ? (value * rate).toLocaleString("en-PH", {
                      maximumFractionDigits: 2,
                    })
                  : "--"}{" "}
                {toCurrency.code}
              </Text>
            </View>
          ))}
        </View>

        {/* RATE TREND */}
        <View style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <View>
              <Text style={styles.cardTitle}>
                Rate Trend
              </Text>

              <Text style={styles.pairText}>
                {fromCurrency.code}/{toCurrency.code}
              </Text>
            </View>

            <View style={styles.periodRow}>
              {["7D", "30D", "3M", "1Y"].map(
                (item) => (
                  <Pressable
                    key={item}
                    style={[
                      styles.periodButton,
                      period === item &&
                        styles.periodButtonActive,
                    ]}
                    onPress={() => setPeriod(item)}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        period === item &&
                          styles.periodTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                )
              )}
            </View>
          </View>

          {/* TEMP GRAPH PLACEHOLDER */}
         <View
           style={styles.graph}
           onTouchStart={() => setIsChartTouching(true)}
           onTouchEnd={() => setIsChartTouching(false)}
           onTouchCancel={() => setIsChartTouching(false)}
         >
           {trendLoading ? (
             <Text style={styles.chartMessage}>
               Loading chart...
             </Text>
           ) : chartData.length > 0 ? (
               <>
             <LineChart
                data={chartData}
                height={100}
                xAxisLabelsHeight={25}
                thickness={2}
                curved
                areaChart
                startFillColor="rgba(23, 105, 232, 0.18)"
                endFillColor="rgba(23, 105, 232, 0.01)"
                startOpacity={0.8}
                endOpacity={0.1}
                hideRules
                hideYAxisText
                yAxisColor="transparent"
                xAxisColor="#DCE6F5"
                color="#1769E8"
                dataPointsColor="#1769E8"
                dataPointsRadius={2}
                initialSpacing={0}
                endSpacing={0}
                noOfSections={4}
               pointerConfig={{
                 pointerStripHeight: 100,
                 pointerStripColor: "#94A3B8",
                 pointerStripWidth: 1,
                 pointerColor: "#075FEA",
                 radius: 5,

                 activatePointersOnLongPress: false,
                 activatePointersDelay: 0,

                 persistPointer: true,
                 resetPointerIndexOnRelease: false,


                 pointerLabelWidth: 100,
                 pointerLabelHeight: 55,

                 autoAdjustPointerLabelPosition: true,

                 pointerLabelComponent: (items: any[]) => {
                   const item = items?.[0];

                   if (!item) return null;

                   return (
                     <View style={styles.tooltip}>
                       <Text style={styles.tooltipRate}>
                         {Number(item.originalRate).toFixed(6)}
                       </Text>

                       <Text style={styles.tooltipDate}>
                         {new Date(
                           item.date
                         ).toLocaleDateString()}
                       </Text>
                     </View>
                   );
                 },
               }}
             />
                     {trend?.points?.length > 0 && (
                       <Text style={styles.chartDate}>
                         {new Date(
                           trend.points[0].date
                         ).toLocaleDateString("en-US", {
                           month: "short",
                           day: "numeric",
                         })}
                         {"  —  "}
                         {new Date(
                           trend.points[
                             trend.points.length - 1
                           ].date
                         ).toLocaleDateString("en-US", {
                           month: "short",
                           day: "numeric",
                         })}
                       </Text>
                     )}
                </>
           ) : (
             <Text style={styles.chartMessage}>
               No trend data available
             </Text>
           )}
         </View>

         <View style={styles.trendStats}>
           <View>
             <Text style={styles.trendLabel}>Low</Text>
             <Text style={styles.trendValue}>
               {trend
                 ? Number(trend.lowRate).toFixed(4)
                 : "--"}
             </Text>
           </View>

           <View>
             <Text style={styles.trendLabel}>Current</Text>
             <Text style={styles.currentValue}>
               {trend
                 ? Number(trend.currentRate).toFixed(4)
                 : "--"}
             </Text>
           </View>

           <View>
             <Text style={styles.trendLabel}>High</Text>
             <Text style={styles.trendValue}>
               {trend
                 ? Number(trend.highRate).toFixed(4)
                 : "--"}
             </Text>
           </View>
         </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4F8FF",
  },

  header: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    color: "#0646B8",
    fontSize: 28,
    lineHeight: 30,
  },

  title: {
    color: "#063B8F",
    fontSize: 18,
    fontWeight: "900",
  },

  subtitle: {
    color: "#64748B",
    fontSize: 10,
    marginTop: 1,
  },

  content: {
    padding: 10,
    paddingBottom: 30,
  },

  converterCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },

  fieldLabel: {
    color: "#94A3B8",
    fontSize: 8,
    fontWeight: "800",
    marginBottom: 3,
  },

  currencyInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  flag: {
    fontSize: 21,
  },

  currencyCode: {
    color: "#063B8F",
    fontSize: 12,
    fontWeight: "900",
  },

  currencyName: {
    color: "#64748B",
    fontSize: 8,
  },

  amountBox: {
    backgroundColor: "#F4F8FF",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },

  amountSymbol: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "700",
    marginRight: 6,
  },

  amountInput: {
    flex: 1,
    color: "#063B8F",
    fontSize: 18,
    fontWeight: "900",
    paddingVertical: 6,
  },

  swapRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },

  swapButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#075FEA",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },

  swapIcon: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  convertedAmount: {
    color: "#063B8F",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 7,
  },

  rateText: {
    color: "#1769E8",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 3,
  },

  updatedText: {
    color: "#94A3B8",
    fontSize: 7,
    marginTop: 2,
  },

  sectionTitle: {
    color: "#063B8F",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },

  quickRow: {
    gap: 7,
    paddingRight: 10,
    marginBottom: 15,
  },

  currencyChip: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  currencyChipActive: {
    backgroundColor: "#075FEA",
  },

  chipFlag: {
    fontSize: 16,
  },

  chipText: {
    color: "#475569",
    fontSize: 10,
    fontWeight: "800",
  },

  chipTextActive: {
    color: "#FFFFFF",
  },

  rateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },

  cardTitle: {
    color: "#063B8F",
    fontSize: 13,
    fontWeight: "800",
  },

  pairText: {
    color: "#64748B",
    fontSize: 9,
    marginTop: 2,
    marginBottom: 8,
  },

  rateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },

  rateLeft: {
    color: "#64748B",
    fontSize: 10,
  },

  rateRight: {
    color: "#063B8F",
    fontSize: 10,
    fontWeight: "800",
  },

  trendCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
  },

  trendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  periodRow: {
    flexDirection: "row",
    gap: 3,
  },

  periodButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },

  periodButtonActive: {
    backgroundColor: "#075FEA",
  },

  periodText: {
    color: "#64748B",
    fontSize: 7,
    fontWeight: "700",
  },

  periodTextActive: {
    color: "#FFFFFF",
  },

graph: {
  height: 155,
  backgroundColor: "#F5F9FF",
  borderRadius: 10,
  justifyContent: "flex-start",
  paddingTop: 8,
  paddingHorizontal: 4,
  paddingBottom: 8,
  marginBottom: 8,
  overflow: "hidden",
},

periodRow: {
  flexDirection: "row",
  gap: 3,
  alignItems: "flex-start",
},

  graphLine: {
    color: "#1769E8",
    fontSize: 18,
    fontWeight: "800",
  },

  trendStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

  trendLabel: {
    color: "#94A3B8",
    fontSize: 8,
  },

  trendValue: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },

  currentValue: {
    color: "#1769E8",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 2,
  },

chartMessage: {
  color: "#64748B",
  fontSize: 10,
  textAlign: "center",
},

changeText: {
  fontSize: 9,
  fontWeight: "800",
  marginTop: -5,
  marginBottom: 8,
},

tooltip: {
  backgroundColor: "#063B8F",
  paddingHorizontal: 8,
  paddingVertical: 5,
  borderRadius: 7,
  minWidth: 72,
},

tooltipRate: {
  color: "#FFFFFF",
  fontSize: 10,
  fontWeight: "900",
},

tooltipDate: {
  color: "#DCEAFF",
  fontSize: 7,
  marginTop: 2,
},
chartDate: {
  textAlign: "center",
  color: "#64748B",
  fontSize: 10,
  fontWeight: "600",
  marginTop: 0,
},

});
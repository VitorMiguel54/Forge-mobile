import { useMemo, useState } from 'react';
import { useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, ForgeSymbol, SimpleLineChart, type LineChartPoint } from '@/components';
import { useProfile } from '@/hooks/useProfile';
import type { ProfileData } from '@/services/profileService';
import { borders, colors, componentSizes, radius, spacing, typography } from '@/theme';

type PeriodFilter = '7d' | '30d' | '3m' | '1y' | 'all';
type MetricFilter = 'weight' | 'volume' | 'workouts' | 'water' | 'sleep';

type MetricConfig = {
  readonly accent: string;
  readonly emptyText: string;
  readonly icon: Parameters<typeof ForgeSymbol>[0]['name'];
  readonly label: string;
  readonly subtitle: string;
  readonly title: string;
  readonly unit?: string;
};

const webContentMaxWidth = spacing[10] * spacing[5];

const periods: readonly { readonly label: string; readonly value: PeriodFilter }[] = [
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: '3 meses', value: '3m' },
  { label: '1 ano', value: '1y' },
  { label: 'Tudo', value: 'all' },
];

const metricConfigs: Record<MetricFilter, MetricConfig> = {
  weight: {
    accent: colors.gamification.xp,
    emptyText: 'Registre mais pesos para visualizar a evolução.',
    icon: { ios: 'chart.line.uptrend.xyaxis', android: 'monitoring', web: 'monitoring' },
    label: 'Peso',
    subtitle: 'Peso atual',
    title: 'Peso',
    unit: 'kg',
  },
  volume: {
    accent: colors.brand.primary,
    emptyText: 'Finalize treinos para visualizar volume por período.',
    icon: { ios: 'dumbbell', android: 'fitness_center', web: 'fitness_center' },
    label: 'Volume',
    subtitle: 'Volume total',
    title: 'Volume',
    unit: 'kg',
  },
  workouts: {
    accent: colors.brand.primary,
    emptyText: 'Finalize treinos para visualizar frequência.',
    icon: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
    label: 'Treinos',
    subtitle: 'Treinos no período',
    title: 'Treinos',
  },
  water: {
    accent: colors.metric.water,
    emptyText: 'Registre água em mais dias para visualizar o gráfico.',
    icon: { ios: 'drop', android: 'water_drop', web: 'water_drop' },
    label: 'Água',
    subtitle: 'Consumo total',
    title: 'Água',
    unit: 'L',
  },
  sleep: {
    accent: colors.metric.sleep,
    emptyText: 'Registre sono em mais noites para visualizar o gráfico.',
    icon: { ios: 'moon', android: 'dark_mode', web: 'dark_mode' },
    label: 'Sono',
    subtitle: 'Média de sono',
    title: 'Sono',
    unit: 'h',
  },
};

export default function ProfileChartsScreen() {
  const router = useRouter();
  const { profile, error, isLoading, refetch } = useProfile();
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [metric, setMetric] = useState<MetricFilter>('weight');
  const config = metricConfigs[metric];
  const metricData = useMemo(
    () => (profile ? buildMetricData(profile, metric, period) : undefined),
    [metric, period, profile],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
              <ForgeSymbol
                color={colors.text.primary}
                fallback="<"
                name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
                size={30}
                weight="semibold"
              />
            </Pressable>
            <Text style={styles.title}>Gráficos</Text>
          </View>

          {isLoading ? (
            <Card padding={5} style={styles.stateCard}>
              <ActivityIndicator color={colors.brand.primary} />
              <Text style={styles.stateTitle}>Carregando gráficos</Text>
              <Text style={styles.stateText}>Buscando seus registros reais.</Text>
            </Card>
          ) : null}

          {!isLoading && error ? (
            <Card padding={5} style={styles.stateCard}>
              <Text style={styles.stateTitle}>Não foi possível carregar</Text>
              <Text style={styles.stateText}>{error}</Text>
              <Button title="Tentar novamente" variant="secondary" onPress={() => void refetch()} />
            </Card>
          ) : null}

          {!isLoading && !error && profile && metricData ? (
            <>
              <DataQualityNotice profile={profile} />

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.periodFilter}>
                  {periods.map((item) => {
                    const isActive = period === item.value;

                    return (
                      <Pressable
                        key={item.value}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isActive }}
                        onPress={() => setPeriod(item.value)}
                        style={[styles.periodChip, isActive && styles.activePeriodChip]}
                      >
                        <Text style={[styles.periodText, isActive && styles.activePeriodText]}>{item.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.metricFilter}>
                  {(Object.keys(metricConfigs) as MetricFilter[]).map((item) => {
                    const itemConfig = metricConfigs[item];
                    const isActive = metric === item;

                    return (
                      <Pressable
                        key={item}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isActive }}
                        onPress={() => setMetric(item)}
                        style={styles.metricOption}
                      >
                        <View
                          style={[
                            styles.metricIcon,
                            { borderColor: isActive ? colors.brand.primary : colors.border.default },
                          ]}
                        >
                          <ForgeSymbol
                            color={isActive ? colors.brand.primary : colors.text.secondary}
                            fallback={itemConfig.label[0]}
                            name={itemConfig.icon}
                            size={28}
                          />
                        </View>
                        <Text style={[styles.metricLabel, isActive && styles.activeMetricLabel]}>
                          {itemConfig.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>

              <Card padding={5} style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <View>
                    <Text style={styles.chartTitle}>{config.title}</Text>
                    <Text style={styles.chartSubtitle}>{getPeriodLabel(period)}</Text>
                  </View>
                  <View style={styles.deltaBlock}>
                    <Text style={[styles.deltaValue, getDeltaStyle(metricData.delta)]}>
                      {formatSigned(metricData.delta, config.unit)}
                    </Text>
                    <Text style={styles.stateText}>de evolução</Text>
                  </View>
                </View>

                <View>
                  <Text style={styles.heroValue}>{formatValue(metricData.currentValue, config.unit)}</Text>
                  <Text style={styles.stateText}>{config.subtitle}</Text>
                </View>

                <SimpleLineChart
                  color={config.accent}
                  emptyText={config.emptyText}
                  height={280}
                  points={metricData.points}
                  unit={config.unit}
                />

                <View style={styles.metricSummary}>
                  <SummaryItem label={metricData.summaryLabels.first} value={formatValue(metricData.firstValue, config.unit)} />
                  <SummaryItem label={metricData.summaryLabels.max} value={formatValue(metricData.maxValue, config.unit)} />
                  <SummaryItem
                    label={metricData.summaryLabels.delta}
                    value={formatSigned(metricData.totalDelta, config.unit)}
                    valueStyle={getDeltaStyle(metricData.totalDelta)}
                  />
                </View>

                <Pressable
                  accessibilityRole="button"
                  disabled={!metricData.historyHref}
                  onPress={() => metricData.historyHref && router.push(metricData.historyHref)}
                  style={[styles.historyButton, !metricData.historyHref && styles.disabledHistoryButton]}
                >
                  <View style={styles.historyButtonCopy}>
                    <ForgeSymbol
                      color={metricData.historyHref ? colors.text.primary : colors.text.disabled}
                      fallback="H"
                      name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
                      size={24}
                    />
                    <Text style={[styles.historyButtonText, !metricData.historyHref && styles.disabledText]}>
                      Ver histórico completo
                    </Text>
                  </View>
                  <ForgeSymbol
                    color={metricData.historyHref ? colors.text.primary : colors.text.disabled}
                    fallback=">"
                    name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                    size={24}
                  />
                </Pressable>
              </Card>
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DataQualityNotice({ profile }: { readonly profile: ProfileData }) {
  const message = getDataQualityMessage(profile);

  if (!message) {
    return null;
  }

  return (
    <Card padding={4} style={styles.warningCard}>
      <Text style={styles.warningText}>{message}</Text>
    </Card>
  );
}

function SummaryItem({
  label,
  value,
  valueStyle,
}: {
  readonly label: string;
  readonly value: string;
  readonly valueStyle?: object;
}) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, valueStyle]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function getDataQualityMessage(profile: ProfileData): string | undefined {
  if (profile.dataQuality.status === 'complete') {
    return undefined;
  }

  if (profile.dataQuality.isHistoryTruncated) {
    return 'Volume e treinos usam os 50 registros concluídos mais recentes. Períodos antigos podem estar incompletos.';
  }

  return 'Algumas fontes auxiliares não foram carregadas. Os gráficos disponíveis continuam usando os dados recebidos.';
}

function buildMetricData(profile: ProfileData, metric: MetricFilter, period: PeriodFilter) {
  const rangeStart = getRangeStart(period);
  const allPoints = getMetricPoints(profile, metric);
  const points = allPoints.filter((point) => isInsideRange(point.date, rangeStart));
  const fallbackPoints = points.length > 0 ? points : allPoints;
  const values = fallbackPoints.map((point) => point.value);
  const firstValue = values[0];
  const currentValue = values.at(-1);
  const maxValue = values.length > 0 ? Math.max(...values) : undefined;
  const allValues = allPoints.map((point) => point.value);
  const totalDelta =
    allValues.length >= 2 ? allValues[allValues.length - 1] - allValues[0] : undefined;
  const delta = values.length >= 2 ? values[values.length - 1] - values[0] : undefined;

  return {
    currentValue,
    delta,
    firstValue,
    historyHref: metric === 'volume' || metric === 'workouts' ? ('/history' as Href) : undefined,
    maxValue,
    points,
    summaryLabels: getSummaryLabels(metric),
    totalDelta,
  };
}

function getMetricPoints(profile: ProfileData, metric: MetricFilter): readonly LineChartPoint[] {
  if (metric === 'weight') {
    return profile.records.weights.map((record) => ({
      date: record.date,
      id: record.id,
      value: record.weight,
    }));
  }

  if (metric === 'volume') {
    return aggregateByDate(
      profile.records.workouts.map((workout) => ({
        date: workout.date,
        value: workout.volume,
      })),
      'volume',
    );
  }

  if (metric === 'workouts') {
    return aggregateByDate(
      profile.records.workouts.map((workout) => ({
        date: workout.date,
        value: 1,
      })),
      'workouts',
    );
  }

  if (metric === 'water') {
    return aggregateByDate(
      profile.records.waterIntakes.map((record) => ({
        date: record.date,
        value: record.liters,
      })),
      'water',
    );
  }

  return profile.records.sleepRecords.map((record) => ({
    date: record.date,
    id: record.id,
    value: record.hoursSlept,
  }));
}

function aggregateByDate(
  entries: readonly { readonly date: string; readonly value: number }[],
  prefix: string,
): readonly LineChartPoint[] {
  const grouped = new Map<string, number>();

  entries.forEach((entry) => {
    const dateKey = getDateKey(entry.date);
    grouped.set(dateKey, (grouped.get(dateKey) ?? 0) + entry.value);
  });

  return Array.from(grouped.entries())
    .map(([date, value]) => ({
      date,
      id: `${prefix}-${date}`,
      value,
    }))
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
}

function getSummaryLabels(metric: MetricFilter) {
  if (metric === 'weight') {
    return { delta: 'Evolução total', first: 'Peso inicial', max: 'Maior peso' };
  }

  if (metric === 'sleep') {
    return { delta: 'Variação total', first: 'Primeiro registro', max: 'Maior sono' };
  }

  return { delta: 'Evolução total', first: 'Primeiro período', max: 'Maior valor' };
}

function getRangeStart(period: PeriodFilter): Date | undefined {
  if (period === 'all') {
    return undefined;
  }

  const now = new Date();
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '3m' ? 90 : 365;
  now.setDate(now.getDate() - days);
  return now;
}

function isInsideRange(date: string, rangeStart?: Date): boolean {
  if (!rangeStart) {
    return true;
  }

  return new Date(date).getTime() >= rangeStart.getTime();
}

function getDateKey(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toISOString().slice(0, 10);
}

function getPeriodLabel(period: PeriodFilter): string {
  const label = periods.find((item) => item.value === period)?.label ?? 'período';
  return period === 'all' ? 'Todo o período' : `Últimos ${label}`;
}

function getDeltaStyle(value?: number) {
  if (value === undefined || value === 0) {
    return styles.neutralDelta;
  }

  return value > 0 ? styles.positiveDelta : styles.negativeDelta;
}

function formatSigned(value?: number, unit?: string): string {
  if (value === undefined) {
    return '—';
  }

  const prefix = value > 0 ? '+' : '';
  return `${prefix}${formatValue(value, unit)}`;
}

function formatValue(value?: number, unit?: string): string {
  if (value === undefined) {
    return '—';
  }

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);

  return unit ? `${formattedValue} ${unit}` : formattedValue;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
  },
  page: {
    width: '100%',
    maxWidth: Platform.select({
      web: webContentMaxWidth,
      default: undefined,
    }),
    gap: spacing[5],
  },
  header: {
    minHeight: componentSizes.touchTarget.global,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  backButton: {
    width: componentSizes.touchTarget.global,
    height: componentSizes.touchTarget.global,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.screenTitle,
    color: colors.text.primary,
  },
  periodFilter: {
    minWidth: '100%',
    flexDirection: 'row',
    gap: spacing[2],
    padding: spacing[1],
    borderRadius: radius.lg,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.card,
  },
  periodChip: {
    minHeight: componentSizes.buttonHeight.md,
    minWidth: 104,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
    borderRadius: radius.md,
    borderWidth: borders.width.default,
    borderColor: 'transparent',
  },
  activePeriodChip: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.background.secondary,
  },
  periodText: {
    ...typography.button,
    color: colors.text.secondary,
  },
  activePeriodText: {
    color: colors.brand.primary,
  },
  metricFilter: {
    flexDirection: 'row',
    gap: spacing[4],
    paddingVertical: spacing[2],
  },
  metricOption: {
    minWidth: 88,
    alignItems: 'center',
    gap: spacing[2],
  },
  metricIcon: {
    width: componentSizes.avatar.xl,
    height: componentSizes.avatar.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    backgroundColor: colors.background.secondary,
  },
  metricLabel: {
    ...typography.button,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  activeMetricLabel: {
    color: colors.brand.primary,
  },
  chartCard: {
    gap: spacing[5],
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  chartTitle: {
    ...typography.screenTitle,
    color: colors.text.primary,
  },
  chartSubtitle: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  deltaBlock: {
    alignItems: 'flex-end',
  },
  deltaValue: {
    ...typography.metric.compact,
  },
  positiveDelta: {
    color: colors.semantic.success,
  },
  negativeDelta: {
    color: colors.semantic.error,
  },
  neutralDelta: {
    color: colors.text.secondary,
  },
  heroValue: {
    ...typography.display,
    color: colors.text.primary,
  },
  metricSummary: {
    flexDirection: 'row',
    borderTopWidth: borders.width.default,
    borderTopColor: colors.border.default,
    paddingTop: spacing[4],
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    borderRightWidth: borders.width.default,
    borderRightColor: colors.border.default,
  },
  summaryValue: {
    ...typography.cardTitle,
    color: colors.text.primary,
    textAlign: 'center',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  historyButton: {
    minHeight: componentSizes.buttonHeight.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[4],
    borderTopWidth: borders.width.default,
    borderTopColor: colors.border.default,
  },
  disabledHistoryButton: {
    opacity: 0.6,
  },
  historyButtonCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  historyButtonText: {
    ...typography.cardTitle,
    color: colors.text.primary,
  },
  disabledText: {
    color: colors.text.disabled,
  },
  stateCard: {
    alignItems: 'center',
    gap: spacing[3],
  },
  stateTitle: {
    ...typography.cardTitle,
    color: colors.text.primary,
    textAlign: 'center',
  },
  stateText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
  },
  warningCard: {
    borderColor: colors.semantic.warning,
    backgroundColor: colors.background.secondary,
  },
  warningText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

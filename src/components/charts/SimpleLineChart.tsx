import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { borders, colors, radius, spacing, typography } from '@/theme';

export type LineChartPoint = {
  readonly id: string;
  readonly date: string;
  readonly value: number;
};

export type SimpleLineChartProps = {
  readonly color?: string;
  readonly emptyText?: string;
  readonly height?: number;
  readonly points: readonly LineChartPoint[];
  readonly unit?: string;
};

const chartPadding = {
  bottom: 28,
  left: 8,
  right: 8,
  top: 16,
};

export function SimpleLineChart({
  color = colors.gamification.xp,
  emptyText = 'Dados ainda não disponíveis.',
  height = 160,
  points,
  unit,
}: SimpleLineChartProps) {
  const [width, setWidth] = useState(0);
  const [selectedPointId, setSelectedPointId] = useState<string>();
  const sortedPoints = useMemo(
    () =>
      [...points]
        .filter((point) => Number.isFinite(point.value) && !Number.isNaN(new Date(point.date).getTime()))
        .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()),
    [points],
  );
  const selectedPoint = sortedPoints.find((point) => point.id === selectedPointId);

  if (sortedPoints.length < 2) {
    return (
      <View style={[styles.emptyChart, { height }]}>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  const plotWidth = Math.max(width - chartPadding.left - chartPadding.right, 0);
  const plotHeight = height - chartPadding.top - chartPadding.bottom;
  const values = sortedPoints.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;
  const coordinates = sortedPoints.map((point, index) => ({
    ...point,
    x: chartPadding.left + (plotWidth * index) / Math.max(sortedPoints.length - 1, 1),
    y: chartPadding.top + plotHeight - ((point.value - minValue) / valueRange) * plotHeight,
  }));

  return (
    <View
      style={[styles.chart, { height }]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <View style={styles.gridLine} />
      <View style={[styles.gridLine, styles.gridLineMiddle]} />
      <View style={[styles.gridLine, styles.gridLineBottom]} />

      {width > 0
        ? coordinates.slice(1).map((point, index) => {
            const previousPoint = coordinates[index];
            const deltaX = point.x - previousPoint.x;
            const deltaY = point.y - previousPoint.y;
            const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const angle = Math.atan2(deltaY, deltaX);

            return (
              <View
                key={`${previousPoint.id}-${point.id}`}
                style={[
                  styles.lineSegment,
                  {
                    backgroundColor: color,
                    left: previousPoint.x,
                    top: previousPoint.y,
                    transform: [{ rotateZ: `${angle}rad` }],
                    width: length,
                  },
                ]}
              />
            );
          })
        : null}

      {width > 0
        ? coordinates.map((point) => (
            <Pressable
              key={point.id}
              accessibilityLabel={`${formatValue(point.value, unit)} em ${formatShortDate(point.date)}`}
              accessibilityRole="button"
              onPress={() => setSelectedPointId((currentId) => (currentId === point.id ? undefined : point.id))}
              style={[
                styles.pointButton,
                {
                  borderColor: color,
                  left: point.x - spacing[3],
                  top: point.y - spacing[3],
                },
              ]}
            >
              <View style={[styles.point, { backgroundColor: color }]} />
            </Pressable>
          ))
        : null}

      {selectedPoint && width > 0 ? (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipValue}>{formatValue(selectedPoint.value, unit)}</Text>
          <Text style={styles.tooltipDate}>{formatShortDate(selectedPoint.date)}</Text>
        </View>
      ) : null}

      <View style={styles.axisLabels}>
        <Text style={styles.axisText}>{formatShortDate(coordinates[0]?.date)}</Text>
        <Text style={styles.axisText}>{formatShortDate(coordinates[coordinates.length - 1]?.date)}</Text>
      </View>
    </View>
  );
}

function formatValue(value: number, unit?: string): string {
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);

  return unit ? `${formattedValue} ${unit}` : formattedValue;
}

function formatShortDate(date?: string): string {
  if (!date) {
    return '';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(parsedDate);
}

const styles = StyleSheet.create({
  chart: {
    position: 'relative',
    overflow: 'hidden',
  },
  emptyChart: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.background.secondary,
  },
  emptyText: {
    ...typography.body.secondary,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '22%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.default,
    opacity: 0.6,
  },
  gridLineMiddle: {
    top: '48%',
  },
  gridLineBottom: {
    top: '74%',
  },
  lineSegment: {
    position: 'absolute',
    height: 3,
    borderRadius: radius.circular,
    transformOrigin: 'left center',
  },
  pointButton: {
    position: 'absolute',
    width: spacing[6],
    height: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circular,
    borderWidth: borders.width.default,
    backgroundColor: colors.background.secondary,
  },
  point: {
    width: spacing[2],
    height: spacing[2],
    borderRadius: radius.circular,
  },
  tooltip: {
    position: 'absolute',
    top: spacing[2],
    alignSelf: 'center',
    minWidth: 92,
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    borderWidth: borders.width.default,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.cardElevated,
  },
  tooltipValue: {
    ...typography.cardTitle,
    color: colors.text.primary,
  },
  tooltipDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  axisLabels: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axisText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});

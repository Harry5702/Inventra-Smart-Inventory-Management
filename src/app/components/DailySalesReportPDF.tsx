'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const colors = {
  black: "#000000",
  white: "#FFFFFF",
  gray: "#CCCCCC",
  lightGray: "#EFEFEF",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    fontFamily: "Helvetica",
    padding: 48,
  },
  header: {
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
    borderBottomStyle: 'solid',
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
  },
  headerText: {
    flex: 1,
  },
  companyName: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  companyTagline: {
    fontSize: 10,
    color: colors.black,
    letterSpacing: 1,
    marginTop: 6,
    textTransform: "uppercase",
  },
  companyPhone: {
    fontSize: 10,
    color: colors.black,
    letterSpacing: 1,
    marginTop: 4,
  },
  titleSection: {
    marginBottom: 24,
  },
  reportTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
    color: colors.black,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: colors.black,
    borderStyle: 'solid',
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.lightGray,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
    borderBottomStyle: 'solid',
  },
  tableHeaderCell: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
    borderBottomStyle: 'solid',
  },
  cellType: { width: "15%" },
  cellDetail: { width: "40%" },
  cellQty: { width: "15%", textAlign: "center" as const },
  cellTotal: { width: "30%", textAlign: "right" as const },
  cellText: {
    fontSize: 10,
    color: colors.black,
  },
  cellTextBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
  },
  cellTextRightBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    textAlign: "right" as const,
  },
  totalsSection: {
    alignItems: "flex-end",
  },
  totalsCard: {
    width: 250,
  },
  totalsRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.black,
    borderBottomStyle: 'solid',
    marginTop: 4,
  },
  totalsFinalLabel: {
    fontSize: 12,
    color: colors.black,
    fontFamily: "Helvetica-Bold",
  },
  totalsFinalValue: {
    fontSize: 12,
    color: colors.black,
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.black,
    borderTopStyle: 'solid',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 9,
    color: colors.black,
  },
});

const formatCurrency = (amount: number) =>
  `Rs. ${Number(amount).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export type DailyReportItem = {
  id: string;
  type: 'Retail' | 'Shop Order';
  detail: string;
  qty: number;
  total: number;
  profit: number;
};

type DailySalesReportPDFProps = {
  date: string; // YYYY-MM-DD
  items: DailyReportItem[];
};

export default function DailySalesReportPDF({ date, items }: DailySalesReportPDFProps) {
  const displayDate = new Date(date).toLocaleDateString("en-PK", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalRevenue = items.reduce((sum, item) => sum + item.total, 0);
  const totalProfit = items.reduce((sum, item) => sum + item.profit, 0);

  return (
    <Document title={`Daily Sales Report - ${date}`} author="Khalil Traders">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src="/logo.png" style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.companyName}>Khalil Traders</Text>
            <Text style={styles.companyTagline}>Daily Sales Report</Text>
            <Text style={styles.companyPhone}>Ph: 03337464886, 03296986696</Text>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.reportTitle}>Sales & Orders Summary</Text>
          <Text style={styles.reportDate}>{displayDate}</Text>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.cellType]}>Type</Text>
            <Text style={[styles.tableHeaderCell, styles.cellDetail]}>Detail</Text>
            <Text style={[styles.tableHeaderCell, styles.cellQty]}>Items/Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.cellTotal]}>Amount</Text>
          </View>

          {items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.cellText, styles.cellType]}>{item.type}</Text>
              <Text style={[styles.cellTextBold, styles.cellDetail]}>{item.detail}</Text>
              <Text style={[styles.cellText, styles.cellQty]}>{item.qty}</Text>
              <Text style={[styles.cellTextRightBold, styles.cellTotal]}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
          {items.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.cellText, { flex: 1, textAlign: 'center' }]}>No sales recorded for this date.</Text>
            </View>
          )}
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalsCard}>
            <View style={styles.totalsRowFinal}>
              <Text style={styles.totalsFinalLabel}>Total Revenue</Text>
              <Text style={styles.totalsFinalValue}>{formatCurrency(totalRevenue)}</Text>
            </View>
            <View style={[styles.totalsRowFinal, { borderBottomWidth: 0, marginTop: 0 }]}>
              <Text style={styles.totalsFinalLabel}>Total Profit</Text>
              <Text style={styles.totalsFinalValue}>{formatCurrency(totalProfit)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated on {new Date().toLocaleDateString('en-PK')}</Text>
        </View>
      </Page>
    </Document>
  );
}

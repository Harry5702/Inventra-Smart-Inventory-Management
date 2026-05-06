'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// ─── Styles ──────────────────────────────────────────────────────────────────

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

  // ── Header ──
  header: {
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
    borderBottomStyle: 'solid',
    marginBottom: 24,
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

  // ── Bill Meta ──
  metaSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 24,
  },
  metaBlock: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    color: colors.black,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  metaValue: {
    fontSize: 12,
    color: colors.black,
  },

  // ── Table ──
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
  cellIndex: { width: "8%" },
  cellProduct: { width: "42%" },
  cellQty: { width: "15%", textAlign: "center" as const },
  cellPrice: { width: "15%", textAlign: "right" as const },
  cellTotal: { width: "20%", textAlign: "right" as const },
  cellText: {
    fontSize: 10,
    color: colors.black,
  },
  cellTextBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
  },
  cellTextRight: {
    fontSize: 10,
    color: colors.black,
    textAlign: "right" as const,
  },
  cellTextRightBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    textAlign: "right" as const,
  },

  // ── Totals ──
  totalsSection: {
    alignItems: "flex-end",
  },
  totalsCard: {
    width: 250,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
    borderBottomStyle: 'solid',
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
  totalsLabel: {
    fontSize: 10,
    color: colors.black,
  },
  totalsValue: {
    fontSize: 10,
    color: colors.black,
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

  // ── Notes ──
  notesSection: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.black,
    borderTopStyle: 'solid',
  },
  notesLabel: {
    fontSize: 10,
    color: colors.black,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 10,
    color: colors.black,
    lineHeight: 1.5,
  },

  // ── Footer ──
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
  footerLeft: {
    fontSize: 9,
    color: colors.black,
  },
  footerRight: {
    fontSize: 9,
    color: colors.black,
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  `Rs. ${Number(amount).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const formatFullDate = (isoString: string) => {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

// ─── Component ───────────────────────────────────────────────────────────────

type BillItem = {
  name: string;
  qty: number;
  price: number;
};

type BillPDFProps = {
  shopName: string;
  date: string;
  items: BillItem[];
  discount?: number;
  notes?: string;
};

export default function BillPDF({
  shopName,
  date,
  items,
  discount = 0,
  notes,
}: BillPDFProps) {
  const billDate = formatFullDate(date);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.qty || 1),
    0
  );
  const discountAmount = Number(discount) || 0;
  const grandTotal = subtotal - discountAmount;

  return (
    <Document
      title={`Bill - ${shopName}`}
      author="Khalil Traders"
      subject="Sales Invoice"
    >
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.companyName}>Khalil Traders</Text>
          <Text style={styles.companyTagline}>
            Quality Products · Trusted Service
          </Text>
        </View>

        {/* ── Bill Meta ── */}
        <View style={styles.metaSection}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Bill To</Text>
            <Text style={styles.metaValue}>{shopName}</Text>
          </View>

          <View style={[styles.metaBlock, { alignItems: "flex-end" }]}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{billDate}</Text>
          </View>
        </View>

        {/* ── Items Table ── */}
        <View style={styles.tableContainer}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.cellIndex]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.cellProduct]}>
              Product
            </Text>
            <Text
              style={[
                styles.tableHeaderCell,
                styles.cellQty,
                { textAlign: "center" },
              ]}
            >
              Qty
            </Text>
            <Text
              style={[
                styles.tableHeaderCell,
                styles.cellPrice,
                { textAlign: "right" },
              ]}
            >
              Unit Price
            </Text>
            <Text
              style={[
                styles.tableHeaderCell,
                styles.cellTotal,
                { textAlign: "right" },
              ]}
            >
              Amount
            </Text>
          </View>

          {/* Rows */}
          {items.map((item, i) => {
            const lineTotal = Number(item.price) * Number(item.qty || 1);
            return (
              <View
                key={i}
                style={styles.tableRow}
              >
                <Text style={[styles.cellText, styles.cellIndex]}>
                  {i + 1}
                </Text>
                <Text style={[styles.cellTextBold, styles.cellProduct]}>
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.cellText,
                    styles.cellQty,
                    { textAlign: "center" },
                  ]}
                >
                  {item.qty || 1}
                </Text>
                <Text style={[styles.cellTextRight, styles.cellPrice]}>
                  {formatCurrency(item.price)}
                </Text>
                <Text style={[styles.cellTextRightBold, styles.cellTotal]}>
                  {formatCurrency(lineTotal)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ── Totals ── */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsCard}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>
                {formatCurrency(subtotal)}
              </Text>
            </View>

            {discountAmount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Discount</Text>
                <Text style={styles.totalsValue}>
                  - {formatCurrency(discountAmount)}
                </Text>
              </View>
            )}

            <View style={styles.totalsRowFinal}>
              <Text style={styles.totalsFinalLabel}>Total Due</Text>
              <Text style={styles.totalsFinalValue}>
                {formatCurrency(grandTotal)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Notes ── */}
        {notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Note</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerLeft}>
            Khalil Traders · Generated on {billDate}
          </Text>
          <Text style={styles.footerRight}>Authorized Signature ___________</Text>
        </View>
      </Page>
    </Document>
  );
}

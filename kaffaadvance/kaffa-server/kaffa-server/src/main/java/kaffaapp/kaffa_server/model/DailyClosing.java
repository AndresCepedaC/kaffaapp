package kaffaapp.kaffa_server.model;

/**
 * POJO for daily cash register summary.
 * Calculated in real-time from orders (no separate table).
 */
public class DailyClosing {

    private String date;            // "2026-04-05"
    private double totalCash;       // Sum of cash payments
    private double totalBank;       // Sum of bank/transfer payments
    private int orderCount;         // Number of PAID orders
    private double grandTotal;      // totalCash + totalBank

    public DailyClosing() {
    }

    public DailyClosing(String date, double totalCash, double totalBank, int orderCount, double grandTotal) {
        this.date = date;
        this.totalCash = totalCash;
        this.totalBank = totalBank;
        this.orderCount = orderCount;
        this.grandTotal = grandTotal;
    }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public double getTotalCash() { return totalCash; }
    public void setTotalCash(double totalCash) { this.totalCash = totalCash; }

    public double getTotalBank() { return totalBank; }
    public void setTotalBank(double totalBank) { this.totalBank = totalBank; }

    public int getOrderCount() { return orderCount; }
    public void setOrderCount(int orderCount) { this.orderCount = orderCount; }

    public double getGrandTotal() { return grandTotal; }
    public void setGrandTotal(double grandTotal) { this.grandTotal = grandTotal; }
}

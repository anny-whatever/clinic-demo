import { createContext, useState, useEffect, useContext } from "react";

const InvoiceContext = createContext();

export const useInvoice = () => useContext(InvoiceContext);

export const InvoiceProvider = ({ children }) => {
  // Initialize state for invoices and payment plans
  const [invoices, setInvoices] = useState([]);
  const [paymentPlans, setPaymentPlans] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedInvoices = localStorage.getItem("cms_invoices");
    const storedPaymentPlans = localStorage.getItem("cms_paymentPlans");

    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices));
    }

    if (storedPaymentPlans) {
      setPaymentPlans(JSON.parse(storedPaymentPlans));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cms_invoices", JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem("cms_paymentPlans", JSON.stringify(paymentPlans));
  }, [paymentPlans]);

  // Generate a new invoice
  const generateInvoice = (appointmentId, patientId, items, totalAmount) => {
    const newInvoice = {
      id: `inv-${Date.now()}`,
      appointmentId,
      patientId,
      date: new Date().toISOString(),
      items,
      totalAmount,
      paymentStatus: "pending", // pending, paid, partial
      paymentMethod: null, // cash, card, online
      isPaymentPlan: false,
      paymentPlanDetails: null,
    };

    setInvoices((prev) => [...prev, newInvoice]);

    return { ...newInvoice };
  };

  // Update an existing invoice
  const updateInvoice = (invoiceId, updates) => {
    setInvoices((prev) => {
      return prev.map((invoice) => {
        if (invoice.id === invoiceId) {
          return { ...invoice, ...updates };
        }
        return invoice;
      });
    });
  };

  // Record payment for an invoice
  const recordPayment = (invoiceId, amount, paymentMethod) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);

    if (!invoice) return false;

    let newStatus = "pending";

    if (amount >= invoice.totalAmount) {
      newStatus = "paid";
    } else if (amount > 0) {
      newStatus = "partial";
    }

    updateInvoice(invoiceId, {
      paymentStatus: newStatus,
      paymentMethod,
      paidAmount: amount,
    });

    return true;
  };

  // Create a payment plan for an invoice
  const createPaymentPlan = (
    invoiceId,
    patientId,
    totalAmount,
    installments,
    notes = ""
  ) => {
    const newPaymentPlan = {
      id: `plan-${Date.now()}`,
      invoiceId,
      patientId,
      totalAmount,
      installments,
      createdAt: new Date().toISOString(),
      notes,
    };

    setPaymentPlans((prev) => [...prev, newPaymentPlan]);

    // Update the invoice to mark it as having a payment plan
    updateInvoice(invoiceId, {
      isPaymentPlan: true,
      paymentPlanDetails: newPaymentPlan.id,
    });

    return { ...newPaymentPlan };
  };

  // Record a payment for an installment in a payment plan
  const recordInstallmentPayment = (
    paymentPlanId,
    installmentIndex,
    paymentMethod
  ) => {
    const paymentPlan = paymentPlans.find((plan) => plan.id === paymentPlanId);

    if (!paymentPlan || installmentIndex >= paymentPlan.installments.length) {
      return false;
    }

    const updatedInstallments = [...paymentPlan.installments];
    updatedInstallments[installmentIndex] = {
      ...updatedInstallments[installmentIndex],
      status: "paid",
      paymentDate: new Date().toISOString(),
      paymentMethod,
    };

    // Check if all installments are paid
    const allPaid = updatedInstallments.every((inst) => inst.status === "paid");

    setPaymentPlans((prev) => {
      return prev.map((plan) => {
        if (plan.id === paymentPlanId) {
          return { ...plan, installments: updatedInstallments };
        }
        return plan;
      });
    });

    // If all installments are paid, update the invoice status
    if (allPaid) {
      const invoice = invoices.find((inv) => inv.id === paymentPlan.invoiceId);
      if (invoice) {
        updateInvoice(invoice.id, { paymentStatus: "paid" });
      }
    } else {
      // Otherwise, mark as partial payment
      const invoice = invoices.find((inv) => inv.id === paymentPlan.invoiceId);
      if (invoice && invoice.paymentStatus !== "partial") {
        updateInvoice(invoice.id, { paymentStatus: "partial" });
      }
    }

    return true;
  };

  // Get invoice for a specific appointment
  const getInvoiceByAppointmentId = (appointmentId) => {
    return invoices.find((invoice) => invoice.appointmentId === appointmentId);
  };

  // Get all invoices for a patient
  const getInvoicesByPatientId = (patientId) => {
    return invoices.filter((invoice) => invoice.patientId === patientId);
  };

  // Get payment plan for an invoice
  const getPaymentPlanByInvoiceId = (invoiceId) => {
    return paymentPlans.find((plan) => plan.invoiceId === invoiceId);
  };

  // Get all payment plans for a patient
  const getPaymentPlansByPatientId = (patientId) => {
    return paymentPlans.filter((plan) => plan.patientId === patientId);
  };

  // Get total revenue
  const getTotalRevenue = () => {
    return invoices.reduce((total, invoice) => {
      if (invoice.paymentStatus === "paid") {
        return total + invoice.totalAmount;
      } else if (invoice.paymentStatus === "partial" && invoice.paidAmount) {
        return total + invoice.paidAmount;
      }
      return total;
    }, 0);
  };

  // Get total pending amount
  const getTotalPendingAmount = () => {
    return invoices.reduce((total, invoice) => {
      if (invoice.paymentStatus === "pending") {
        return total + invoice.totalAmount;
      } else if (invoice.paymentStatus === "partial" && invoice.paidAmount) {
        return total + (invoice.totalAmount - invoice.paidAmount);
      }
      return total;
    }, 0);
  };

  // Get overdue payments (for payment plans)
  const getOverduePayments = () => {
    const today = new Date();

    return paymentPlans.flatMap((plan) => {
      const overdueInstallments = plan.installments
        .map((installment, index) => ({
          ...installment,
          index,
          planId: plan.id,
        }))
        .filter(
          (installment) =>
            installment.status !== "paid" &&
            new Date(installment.dueDate) < today
        );

      return overdueInstallments;
    });
  };

  // Get financial summary for analytics
  const getFinancialSummary = (period = "daily") => {
    let summaryData = [];
    const today = new Date();

    if (period === "daily") {
      // Get data for the last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split("T")[0];

        const dailyInvoices = invoices.filter(
          (invoice) => invoice.date.split("T")[0] === dateString
        );

        const revenue = dailyInvoices.reduce((total, invoice) => {
          if (invoice.paymentStatus === "paid") {
            return total + invoice.totalAmount;
          } else if (
            invoice.paymentStatus === "partial" &&
            invoice.paidAmount
          ) {
            return total + invoice.paidAmount;
          }
          return total;
        }, 0);

        const pending = dailyInvoices.reduce((total, invoice) => {
          if (invoice.paymentStatus === "pending") {
            return total + invoice.totalAmount;
          } else if (
            invoice.paymentStatus === "partial" &&
            invoice.paidAmount
          ) {
            return total + (invoice.totalAmount - invoice.paidAmount);
          }
          return total;
        }, 0);

        const overdueAmount = getOverduePayments()
          .filter(
            (installment) => installment.dueDate.split("T")[0] === dateString
          )
          .reduce((total, installment) => total + installment.amount, 0);

        summaryData.push({
          date: dateString,
          revenue,
          pending,
          overdue: overdueAmount,
        });
      }
    } else if (period === "weekly") {
      // Logic for weekly data
      // Simplified for the demo
      summaryData = [
        { week: "2025-W15", revenue: 6000, pending: 1500, overdue: 500 },
        { week: "2025-W16", revenue: 7200, pending: 1200, overdue: 300 },
      ];
    } else if (period === "monthly") {
      // Logic for monthly data
      // Simplified for the demo
      summaryData = [
        { month: "2025-04", revenue: 24000, pending: 6000, overdue: 2000 },
        { month: "2025-05", revenue: 28000, pending: 5000, overdue: 1500 },
      ];
    }

    return summaryData;
  };

  const value = {
    invoices,
    paymentPlans,
    generateInvoice,
    updateInvoice,
    recordPayment,
    createPaymentPlan,
    recordInstallmentPayment,
    getInvoiceByAppointmentId,
    getInvoicesByPatientId,
    getPaymentPlanByInvoiceId,
    getPaymentPlansByPatientId,
    getTotalRevenue,
    getTotalPendingAmount,
    getOverduePayments,
    getFinancialSummary,
  };

  return (
    <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>
  );
};

export default InvoiceContext;

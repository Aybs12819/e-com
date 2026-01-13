import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { registerRobotoFont } from "../../src/lib/fonts/Roboto-Regular-normal.js";

interface ExportButtonsProps {
  orders: any[];
  chartData: any[];
  metrics: {
    totalGross: number;
    totalOrders: number;
    avgOrderValueWithoutShipping: number;
    totalNet: number;
  };
}

export function ExportButtons({ orders, chartData, metrics }: ExportButtonsProps) {
  
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return "N/A";
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (value: number): string => {
    return `P${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    registerRobotoFont(jsPDF.API);
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor: [number, number, number] = [41, 98, 255];
    const darkText: [number, number, number] = [33, 37, 41];
    const grayText: [number, number, number] = [108, 117, 125];
    
    // ===== PAGE 1: COVER & METRICS =====
    
    // Header bar
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("Roboto-Regular", "bold");
    doc.text("Sales Report", 14, 26);
    
    // Report date
    doc.setFontSize(10);
    doc.setFont("Roboto-Regular", "normal");
    doc.text(`Generated: ${formatDate(new Date())}`, pageWidth - 14, 26, { align: 'right' });
    
    // Metrics Section Title
    doc.setTextColor(...darkText);
    doc.setFontSize(16);
    doc.setFont("Roboto-Regular", "bold");
    doc.text("Summary Metrics", 14, 58);
    
    // Divider line
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, 62, pageWidth - 14, 62);
    
    // Metrics table with styled cards
    autoTable(doc, {
      startY: 70,
      head: [['Metric', 'Value']],
      body: [
        ['Total Gross Sales', formatCurrency(metrics.totalGross)],
        ['Total Orders', metrics.totalOrders.toString()],
        ['Average Order Value', formatCurrency(metrics.avgOrderValueWithoutShipping)],
        ['Total Net Sales', formatCurrency(metrics.totalNet)],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 8,
      },
      bodyStyles: {
        fontSize: 11,
        cellPadding: 8,
        textColor: darkText,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { halign: 'right', cellWidth: 80 },
      },
      margin: { left: 14, right: 14 },
      tableWidth: 'auto',
    });
    
    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(9);
    doc.setTextColor(...grayText);
    doc.text("Page 1", pageWidth / 2, footerY, { align: 'center' });
    
    // ===== PAGE 2: CHART DATA =====
    if (chartData.length > 0) {
      doc.addPage();
      
      // Header bar
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont("Roboto-Regular", "bold");
      doc.text("Revenue Trends", 14, 26);
      
      // Section content
      doc.setTextColor(...darkText);
      doc.setFontSize(16);
      doc.setFont("Roboto-Regular", "bold");
      doc.text("Daily Revenue Data", 14, 58);
      
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(14, 62, pageWidth - 14, 62);
      
      // Get chart headers dynamically
      const chartHeaders = Object.keys(chartData[0]);
      const formattedHeaders = chartHeaders.map(h => 
        h.charAt(0).toUpperCase() + h.slice(1).replace(/([A-Z])/g, ' $1')
      );
      
      autoTable(doc, {
        startY: 70,
        head: [formattedHeaders],
        body: chartData.map((data) => 
          chartHeaders.map(key => {
            const value = data[key];
            // Format dates
            if (key.toLowerCase().includes('date')) {
              return formatDate(value);
            }
            // Format currency values
            if (typeof value === 'number' && key.toLowerCase().includes('revenue')) {
              return formatCurrency(value);
            }
            return value?.toString() || 'N/A';
          })
        ),
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 6,
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 6,
          textColor: darkText,
          halign: 'center',
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250],
        },
        margin: { left: 14, right: 14 },
      });
      
      // Footer
      doc.setFontSize(9);
      doc.setTextColor(...grayText);
      doc.text("Page 2", pageWidth / 2, footerY, { align: 'center' });
    }
    
    // ===== PAGE 3: ORDER DETAILS =====
    // if (orders.length > 0) {
    //   doc.addPage();
      
    //   // Header bar
    //   doc.setFillColor(...primaryColor);
    //   doc.rect(0, 0, pageWidth, 40, 'F');
      
    //   doc.setTextColor(255, 255, 255);
    //   doc.setFontSize(28);
    //   doc.setFont("Roboto-Regular", "bold");
    //   doc.text("Order Details", 14, 26);
      
    //   doc.setFontSize(10);
    //   doc.setFont("Roboto-Regular", "normal");
    //   doc.text(`Total: ${orders.length} orders`, pageWidth - 14, 26, { align: 'right' });
      
    //   // Section content
    //   doc.setTextColor(...darkText);
    //   doc.setFontSize(16);
    //   doc.setFont("Roboto-Regular", "bold");
    //   doc.text("All Transactions", 14, 58);
      
    //   doc.setDrawColor(...primaryColor);
    //   doc.setLineWidth(0.5);
    //   doc.line(14, 62, pageWidth - 14, 62);
      
    //   autoTable(doc, {
    //     startY: 70,
    //     head: [["Order ID", "Customer", "Amount", "Status", "Date"]],
    //     body: orders.map((order) => [
    //       order.id?.toString() || 'N/A',
    //       order.customer_accounts?.full_name || 'N/A',
    //       parseFloat(order.total_amount) ? formatCurrency(parseFloat(order.total_amount)) : 'N/A',
    //       order.status || 'N/A',
    //       formatDate(order.created_at || order.date),
    //     ]),
    //     theme: 'grid',
    //     headStyles: {
    //       fillColor: primaryColor,
    //       textColor: [255, 255, 255],
    //       fontSize: 10,
    //       fontStyle: 'bold',
    //       halign: 'center',
    //       cellPadding: 6,
    //     },
    //     bodyStyles: {
    //       fontSize: 9,
    //       cellPadding: 5,
    //       textColor: darkText,
    //     },
    //     alternateRowStyles: {
    //       fillColor: [248, 249, 250],
    //     },
    //     columnStyles: {
    //       0: { halign: 'center', cellWidth: 30 },
    //       1: { halign: 'left', cellWidth: 50 },
    //       2: { halign: 'right', cellWidth: 35 },
    //       3: { halign: 'center', cellWidth: 30 },
    //       4: { halign: 'center', cellWidth: 35 },
    //     },
    //     margin: { left: 14, right: 14 },
    //     didDrawPage: function (data) {
    //       // Footer on each page
    //       doc.setFontSize(9);
    //       doc.setTextColor(...grayText);
    //       const pageNumber = doc.getCurrentPageInfo().pageNumber;
    //       doc.text(`Page ${pageNumber}`, pageWidth / 2, footerY, { align: 'center' });
    //     },
    //   });
    // }

    doc.save("sales_report.pdf");
  };

  const handleExportExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Add Metrics Sheet with better formatting
    const metricsData = [
      ["Sales Report - Summary Metrics"],
      [""],
      ["Metric", "Value"],
      ["Total Gross Sales", formatCurrency(metrics.totalGross)],
      ["Total Orders", metrics.totalOrders],
      ["Average Order Value", formatCurrency(metrics.avgOrderValueWithoutShipping)],
      ["Total Net Sales", formatCurrency(metrics.totalNet)],
      [""],
      ["Report Generated", formatDate(new Date())],
    ];
    const metricsSheet = XLSX.utils.aoa_to_sheet(metricsData);
    metricsSheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, metricsSheet, "Summary");

    // Add Chart Data Sheet
    if (chartData.length > 0) {
      const chartHeaders = Object.keys(chartData[0]);
      const formattedHeaders = chartHeaders.map(h => 
        h.charAt(0).toUpperCase() + h.slice(1).replace(/([A-Z])/g, ' $1')
      );
      const chartRows = chartData.map((data) => 
        chartHeaders.map(key => {
          const value = data[key];
          if (key.toLowerCase().includes('date')) {
            return formatDate(value);
          }
          if (typeof value === 'number' && key.toLowerCase().includes('revenue')) {
            return formatCurrency(value);
          }
          return value;
        })
      );
      const chartSheet = XLSX.utils.aoa_to_sheet([["Revenue Trends"], [""], formattedHeaders, ...chartRows]);
      chartSheet['!cols'] = formattedHeaders.map(() => ({ wch: 18 }));
      XLSX.utils.book_append_sheet(workbook, chartSheet, "Revenue Data");
    }

    // Add Orders Sheet
    // if (orders.length > 0) {
    //   const orderHeaders = ["Order ID", "Customer", "Amount", "Status", "Date"];
    //   const orderRows = orders.map((order) => [
    //     order.id?.toString() || 'N/A',
    //     order.customerName || order.customer_name || order.customer || 'N/A',
    //     typeof order.amount === 'number' ? formatCurrency(order.amount) : (order.amount || 'N/A'),
    //     order.status || 'N/A',
    //     formatDate(order.createdAt || order.created_at || order.date),
    //   ]);
    //   const orderSheet = XLSX.utils.aoa_to_sheet([["Order Details"], [""], orderHeaders, ...orderRows]);
    //   orderSheet['!cols'] = [{ wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];
    //   XLSX.utils.book_append_sheet(workbook, orderSheet, "Orders");
    // }

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(data, "sales_report.xlsx");
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExportPdf}>
        <Download className="mr-2 h-4 w-4" />
        Export PDF
      </Button>
      <Button variant="outline" onClick={handleExportExcel}>
        <Download className="mr-2 h-4 w-4" />
        Export Excel
      </Button>
    </div>
  );
}
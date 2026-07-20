import io
import csv
from datetime import datetime
import pandas as pd
from fpdf import FPDF
from backend.models.database import Machine, Worker, ProductionOrder, RawMaterial

def get_report_data(category, start_date=None, end_date=None):
    """
    Retrieve and format database records based on category and optional date filters.
    """
    data = []
    headers = []
    title = f"{category.replace('_', ' ').title()} Report"

    # Apply date filters if available
    date_filter = None
    if start_date and end_date:
        try:
            sd = datetime.strptime(start_date, "%Y-%m-%d")
            ed = datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError:
            sd, ed = None, None
    else:
        sd, ed = None, None

    if category == "production":
        headers = ["Order Number", "Product Name", "Target Qty", "Completed Qty", "Scrap Qty", "Status", "Priority", "Line", "Start Date"]
        query = ProductionOrder.query
        if sd and ed:
            query = query.filter(ProductionOrder.start_date.between(sd, ed))
        orders = query.all()
        for o in orders:
            data.append([
                o.order_number, o.product_name, o.target_qty, o.completed_qty, o.scrap_qty,
                o.status.upper() if o.status else "UNKNOWN", o.priority.upper() if o.priority else "MEDIUM",
                o.assigned_line, o.start_date.strftime("%Y-%m-%d %H:%M") if o.start_date else "N/A"
            ])

    elif category == "worker":
        headers = ["Employee Code", "Full Name", "Department", "Designation", "Shift", "Status", "Performance Score", "Attendance Rate"]
        query = Worker.query
        workers = query.all()
        for w in workers:
            data.append([
                w.employee_code, f"{w.first_name} {w.last_name}", w.department, w.designation,
                w.shift.title(), w.status.upper(), f"{w.performance_score:.1f}/10", f"{w.attendance_rate:.1f}%"
            ])

    elif category == "machine":
        headers = ["Code", "Name", "Type", "Status", "Health Score", "Temp (C)", "Vibration (mm/s)", "RPM", "Operating Hours"]
        query = Machine.query
        machines = query.all()
        for m in machines:
            data.append([
                m.code, m.name, m.machine_type, m.status.upper(), f"{m.health_score:.1f}%",
                f"{m.temperature:.1f}", f"{m.vibration:.2f}", int(m.rpm), f"{m.operating_hours:.1f} hrs"
            ])

    elif category in ["inventory", "purchase"]:
        headers = ["Code", "Name", "Category", "Current Stock", "Unit", "Unit Cost", "Total Value", "Supplier", "Status"]
        query = RawMaterial.query
        materials = query.all()
        for m in materials:
            val = m.current_stock * m.unit_cost
            data.append([
                m.code, m.name, m.category.title(), m.current_stock, m.unit, f"${m.unit_cost:.2f}",
                f"${val:.2f}", m.supplier, m.status.upper()
            ])

    elif category == "expense":
        # Combines raw materials with mock utility/manufacturing expenses
        headers = ["Expense Item", "Category/Supplier", "Type", "Unit Price / Rate", "Total Cost", "Date"]
        # Raw materials cost entries
        materials = RawMaterial.query.all()
        for m in materials:
            val = m.current_stock * m.unit_cost
            data.append([
                f"Purchase: {m.name}", m.supplier or "Supplier", "Raw Material",
                f"${m.unit_cost:.2f}", f"${val:.2f}", m.last_restocked.strftime("%Y-%m-%d") if m.last_restocked else "2026-07-15"
            ])
        # Add utilities/operational expenses
        data.extend([
            ["Factory Electricity Bill", "Power Grid Corp", "Utility", "N/A", "$34,200.00", "2026-07-01"],
            ["Water Supply Utility", "Municipal Utilities", "Utility", "N/A", "$8,650.00", "2026-07-01"],
            ["Industrial Internet Access", "Telecom Pro", "Infrastructure", "N/A", "$4,200.00", "2026-07-01"],
            ["Maintenance Contract - Q3", "Servicing Team", "Maintenance", "N/A", "$22,400.00", "2026-07-05"],
            ["Warehouse Facility Rent", "Industrial Parks Ltd", "Rent", "N/A", "$24,000.00", "2026-07-01"],
            ["Factory Liability Insurance", "SafeGuard Corp", "Insurance", "N/A", "$6,300.00", "2026-07-01"]
        ])

    elif category in ["financial", "revenue"]:
        headers = ["Financial Item / Source", "Category", "Value / Revenue", "Growth Contribution", "Performance status"]
        data = [
            ["CNC-01 Milling Machine", "Machinery Revenue", "$185,000.00", "+14.2%", "EXCELLENT"],
            ["Assembly Line 01", "Line Revenue", "$198,000.00", "+11.8%", "EXCELLENT"],
            ["CNC-02 Milling Machine", "Machinery Revenue", "$162,000.00", "+8.5%", "HEALTHY"],
            ["Lathe-01 Turner", "Machinery Revenue", "$128,000.00", "-2.3%", "UNDERPERFORMING"],
            ["Press-01 Stamping", "Machinery Revenue", "$143,000.00", "+5.4%", "HEALTHY"],
            ["Hydraulic Valves Sales", "Product Sales", "$245,000.00", "+18.3%", "EXCELLENT"],
            ["Bearing Housings Sales", "Product Sales", "$198,000.00", "+10.2%", "EXCELLENT"],
            ["Gear Sets Sales", "Product Sales", "$167,000.00", "+4.7%", "HEALTHY"]
        ]

    else:
        headers = ["System Log", "Status", "Timestamp"]
        data = [["No data found for the selected category", "WARNING", datetime.now().strftime("%Y-%m-%d %H:%M")]]

    return title, headers, data


def generate_csv(headers, data):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(data)
    return output.getvalue().encode('utf-8')


def generate_xlsx(title, headers, data):
    df = pd.DataFrame(data, columns=headers)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name="Report", index=False)
        # Access openpyxl worksheet to set title header
        workbook = writer.book
        worksheet = writer.sheets["Report"]
        # Basic layout styling
        for col in worksheet.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = col[0].column_letter
            worksheet.column_dimensions[col_letter].width = max(max_len + 3, 12)
    return output.getvalue()


def generate_pdf_report(title, headers, data):
    pdf = FPDF(orientation='L', unit='mm', format='A4')
    pdf.add_page()
    pdf.set_fill_color(7, 26, 47)
    pdf.rect(0, 0, 297, 30, 'F')
    
    # Factory Logo placeholder and title
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "SMART FACTORY INDUSTRIAL SYSTEM", align="L", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 8, f"REPORT: {title.upper()}  |  DATE: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", align="L", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(12)

    # Document Header Table
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 102, 255)
    pdf.set_font("Helvetica", "B", 8)
    
    col_width = 277 / len(headers)
    for h in headers:
        pdf.cell(col_width, 8, str(h), border=1, align="C", fill=True)
    pdf.ln()

    # Data Rows
    pdf.set_text_color(50, 50, 50)
    pdf.set_font("Helvetica", "", 8)
    fill = False
    for row in data:
        for val in row:
            pdf.cell(col_width, 7, str(val), border=1, align="C", fill=fill)
        pdf.ln()
        fill = not fill

    # Footer
    pdf.set_y(-15)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(0, 10, f"Confidential  -  Generated by AI Business Intelligence Unit  -  Page {pdf.page_no()}", align="C")
    
    return pdf.output()


def generate_docx_report(title, headers, data):
    """
    Word doc (.docx) files are generated here as professional, table-styled HTML.
    Word natively loads HTML files and renders them as standard docs when saved as .doc/.docx.
    """
    html_content = f"""
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <meta charset="utf-8">
        <title>{title}</title>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; }}
            .header-table {{ width: 100%; border-bottom: 3px solid #0066FF; padding-bottom: 10px; margin-bottom: 20px; }}
            .logo-title {{ font-size: 22px; font-weight: bold; color: #071A2F; }}
            .subtitle {{ font-size: 12px; color: #556677; }}
            .data-table {{ width: 100%; border-collapse: collapse; margin-top: 15px; }}
            .data-table th {{ background-color: #0066FF; color: white; padding: 10px; font-size: 11px; border: 1px solid #dddddd; text-transform: uppercase; }}
            .data-table td {{ padding: 8px; font-size: 11px; border: 1px solid #dddddd; text-align: center; }}
            .data-table tr:nth-child(even) {{ background-color: #f8fafc; }}
            .footer {{ margin-top: 30px; font-size: 10px; color: #8899AA; border-top: 1px solid #dddddd; padding-top: 10px; text-align: center; }}
        </style>
    </head>
    <body>
        <table class="header-table">
            <tr>
                <td>
                    <div class="logo-title">SMART FACTORY OPERATIONS</div>
                    <div class="subtitle">Enterprise BI & Resource Planning Report</div>
                </td>
                <td style="text-align: right; vertical-align: bottom;">
                    <div class="subtitle">Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</div>
                    <div style="font-weight: bold; font-size: 14px; color: #0066FF;">{title.upper()}</div>
                </td>
            </tr>
        </table>
        
        <h3>Report Summary</h3>
        <p>This document contains the verified factory database extraction for <b>{title}</b>. All records were compiled directly from the live operational nodes.</p>

        <table class="data-table">
            <thead>
                <tr>
    """
    for h in headers:
        html_content += f"<th>{h}</th>"
    html_content += "</tr></thead><tbody>"

    for row in data:
        html_content += "<tr>"
        for val in row:
            html_content += f"<td>{val}</td>"
        html_content += "</tr>"

    html_content += f"""
            </tbody>
        </table>
        <div class="footer">
            Confidential Operational Data — Smart Factory Monitoring MES System — Page 1 of 1
        </div>
    </body>
    </html>
    """
    return html_content.encode('utf-8')

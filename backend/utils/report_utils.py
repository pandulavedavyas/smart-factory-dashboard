import os
import json
from datetime import datetime

REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "static", "reports")


def generate_pdf(report_type, db, Machine, Prediction, Dataset):
    """Generate a PDF report using fpdf2."""
    from fpdf import FPDF
    ensure_dir()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{report_type}_report_{timestamp}.pdf"
    filepath = os.path.join(REPORTS_DIR, filename)

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 12, f"AI Manufacturing Analytics", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 10, f"{report_type.upper()} Report", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(0, 8, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(5)

    machines = Machine.query.all()
    predictions = Prediction.query.all()
    datasets = Dataset.query.all()

    pdf.set_font("Helvetica", "B", 11)
    if report_type == "daily":
        total_output = sum(int(p.predicted_value * 100) for p in predictions[:10]) if predictions else 0
        failures = sum(1 for p in predictions if p.predicted_value > 0.5)
        avg_health = sum(m.health_score for m in machines) / len(machines) if machines else 0
        pdf.cell(0, 8, "Daily Summary", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 10)
        for label, val in [("Total Machines", len(machines)),
                           ("Running", sum(1 for m in machines if m.status == "running")),
                           ("Down", sum(1 for m in machines if m.status == "down")),
                           ("Production Output", f"{total_output:,} units"),
                           ("Machine Failures", failures),
                           ("Avg Health Score", f"{avg_health:.1f}%")]:
            pdf.cell(0, 7, f"{label}: {val}", new_x="LMARGIN", new_y="NEXT")
    elif report_type == "machine":
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 8, "Machine Report", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 9)
        for m in machines:
            preds = [p for p in predictions if p.machine_id == m.id]
            fails = sum(1 for p in preds if p.predicted_value > 0.5)
            pdf.set_font("Helvetica", "B", 10)
            pdf.cell(0, 7, f"{m.name} ({m.code})", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("Helvetica", "", 9)
            for label, val in [("Status", m.status), ("Health", f"{m.health_score}%"),
                               ("Temperature", f"{m.temperature}C"), ("Vibration", f"{m.vibration} mm/s"),
                               ("Torque", f"{m.torque} Nm"), ("Tool Wear", m.tool_wear),
                               ("Predictions", f"{len(preds)} ({fails} failures)")]:
                pdf.cell(0, 6, f"  {label}: {val}", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(2)
    elif report_type == "prediction":
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 8, "Prediction Report", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 10)
        total_pred = len(predictions)
        failures = sum(1 for p in predictions if p.predicted_value > 0.5)
        avg_conf = round(sum(p.confidence for p in predictions) / total_pred * 100, 1) if predictions else 0
        for label, val in [("Total Predictions", total_pred), ("Failures Predicted", failures),
                           ("Avg Confidence", f"{avg_conf}%")]:
            pdf.cell(0, 7, f"{label}: {val}", new_x="LMARGIN", new_y="NEXT")
    else:
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 8, "Report generated successfully.", new_x="LMARGIN", new_y="NEXT")

    pdf.output(filepath)
    return filename


def ensure_dir():
    os.makedirs(REPORTS_DIR, exist_ok=True)


def generate_report(report_type, db, Machine, Prediction, Dataset):
    ensure_dir()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{report_type}_report_{timestamp}.txt"
    filepath = os.path.join(REPORTS_DIR, filename)

    machines = Machine.query.all()
    predictions = Prediction.query.all()
    datasets = Dataset.query.all()
    total_records = sum(d.row_count for d in datasets) if datasets else 0

    header = f"""
{'='*60}
AI MANUFACTURING ANALYTICS - {report_type.upper()} REPORT
{'='*60}
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
{'='*60}
"""

    if report_type == "daily":
        total_output = sum(int(p.predicted_value * 100) for p in predictions[:10]) if predictions else 0
        failures = sum(1 for p in predictions if p.predicted_value > 0.5)
        avg_health = sum(m.health_score for m in machines) / len(machines) if machines else 0
        content = f"""
{header}
DAILY SUMMARY
Total Machines:     {len(machines)}
Running:            {sum(1 for m in machines if m.status == 'running')}
Down:               {sum(1 for m in machines if m.status == 'down')}
Production Output:  {total_output:,} units
Machine Failures:   {failures}
Avg Health Score:   {avg_health:.1f}%
"""
    elif report_type == "monthly":
        content = f"""
{header}
MONTHLY SUMMARY
Total Records:      {total_records:,}
Datasets:           {len(datasets)}
Machines:           {len(machines)}
Predictions:        {len(predictions)}
"""
    elif report_type == "machine":
        content = f"""
{header}
MACHINE REPORT
{'='*60}
"""
        for m in machines:
            preds = [p for p in predictions if p.machine_id == m.id]
            fails = sum(1 for p in preds if p.predicted_value > 0.5)
            content += f"""
{m.name} ({m.code})
  Status:          {m.status}
  Health Score:    {m.health_score}%
  Temperature:     {m.temperature}°C
  Vibration:       {m.vibration} mm/s
  Torque:          {m.torque} Nm
  Tool Wear:       {m.tool_wear}
  Predictions:     {len(preds)} (Failures: {fails})
{'-'*40}
"""
    elif report_type == "prediction":
        content = f"""
{header}
PREDICTION REPORT
Total Predictions:  {len(predictions)}
Failure Predicted:  {sum(1 for p in predictions if p.predicted_value > 0.5)}
Avg Confidence:     {round(sum(p.confidence for p in predictions)/len(predictions)*100, 1) if predictions else 0}%
"""
    else:
        content = f"{header}\nAnalytics report generated successfully.\n"

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    return filename


def export_csv(db, Machine, Prediction):
    import csv
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"export_{timestamp}.csv"
    filepath = os.path.join(REPORTS_DIR, filename)
    ensure_dir()

    machines = Machine.query.all()
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Name", "Code", "Type", "Status", "Health", "Temp", "Vibration", "Torque", "Tool Wear"])
        for m in machines:
            writer.writerow([m.name, m.code, m.machine_type, m.status, m.health_score,
                           m.temperature, m.vibration, m.torque, m.tool_wear])
    return filename
